"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Package, Search, ChevronLeft, ChevronRight,
  Loader2, Shield, Clock, XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface Subscription {
  _id: string;
  userId?: { name: string; email: string };
  moduleName: string;
  moduleType: string;
  planType: string;
  status: string;
  billingAmount: number;
  apiKeyMode: string;
  trialStartDate?: string;
  trialEndDate?: string;
  trialReminderSent?: boolean;
  isFreeForever?: boolean;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  active:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  trial:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  expired:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  cancelled: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  paused:    { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
};

const PLAN_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  free_trial:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Free Trial" },
  monthly:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Monthly" },
  annual:       { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  label: "Annual" },
  free_forever: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", label: "Free Forever" },
  trial:        { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Free Trial" },
};

// ── Manage Modal ──────────────────────────────────────────────
function ManageModal({ sub, onClose, onRefresh }: {
  sub: Subscription; onClose: () => void; onRefresh: () => void;
}) {
  const [extendDays, setExtendDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleExtend = async () => {
    setSaving(true); setAction("extend");
    try {
      await api.patch(`/usermodules/${sub._id}/extend-trial`, { days: extendDays });
      toast.success("Subscription updated.");
      onRefresh(); onClose();
    } catch {
      toast.error("Failed to extend trial");
    }
    setSaving(false); setAction(null);
  };

  const handleFreeForever = async () => {
    setSaving(true); setAction("free");
    try {
      await api.patch(`/usermodules/${sub._id}/free-forever`);
      toast.success("Updated successfully.");
      onRefresh(); onClose();
    } catch {
      toast.error("Failed to update");
    }
    setSaving(false); setAction(null);
  };

  const handleCancel = async () => {
    setSaving(true); setAction("cancel");
    try {
      await api.patch(`/usermodules/${sub._id}/cancel`);
      toast.success("Subscription updated");
      onRefresh(); onClose();
    } catch {
      toast.error("Failed to cancel subscription");
    }
    setSaving(false); setAction(null);
    setConfirmCancel(false);
  };

  return (
    <>
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Subscription</DialogTitle>
        </DialogHeader>
        <p className="-mt-3 text-xs text-muted-foreground">
          {(sub.userId as any)?.name || "Unknown"} · {sub.moduleName}
        </p>

        {/* Current status */}
        <div className="flex flex-wrap gap-2.5 border-t border-b py-3">
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: STATUS_CONFIG[sub.status]?.bg || "rgba(107,114,128,0.1)", color: STATUS_CONFIG[sub.status]?.color || "#6b7280" }}
          >
            {sub.status}
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: PLAN_CONFIG[sub.planType]?.bg || "rgba(107,114,128,0.1)", color: PLAN_CONFIG[sub.planType]?.color || "#6b7280" }}
          >
            {PLAN_CONFIG[sub.planType]?.label || sub.planType}
          </span>
          {sub.trialEndDate && (
            <span className="text-xs text-muted-foreground">
              Expires: {new Date(sub.trialEndDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Extend trial */}
          <div className="rounded-lg border bg-background p-3.5">
            <p className="mb-2.5 text-[13px] font-medium text-foreground">Extend Trial</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={extendDays}
                min={1}
                max={365}
                onChange={(e) => setExtendDays(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-muted-foreground">days</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExtend}
                disabled={saving && action === "extend"}
                className="ml-auto gap-1.5 border-primary/20 bg-primary/10 text-[#a78bfa] hover:bg-primary/20 hover:text-[#a78bfa]"
              >
                {saving && action === "extend" ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                Extend
              </Button>
            </div>
          </div>

          {/* Free forever */}
          <Button
            variant="outline"
            onClick={handleFreeForever}
            disabled={sub.isFreeForever}
            className="justify-center gap-2 border-primary/20 bg-primary/[0.08] text-[#a78bfa] hover:bg-primary/15 hover:text-[#a78bfa]"
          >
            {saving && action === "free" ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {sub.isFreeForever ? "Already Free Forever" : "Grant Free Forever Access"}
          </Button>

          {/* Cancel */}
          {sub.status !== "cancelled" && (
            <Button
              variant="outline"
              onClick={() => setConfirmCancel(true)}
              className="justify-center gap-2 border-destructive/20 bg-destructive/[0.06] text-destructive hover:bg-destructive/15 hover:text-destructive"
            >
              {saving && action === "cancel" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
              Cancel Subscription
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            {sub.moduleName} for {(sub.userId as any)?.name || "this user"} will be cancelled.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} className="bg-destructive text-white hover:bg-destructive/90">
            Cancel Subscription
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function SubscriptionsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/dashboard");
  }, [user]);

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Subscription | null>(null);
  const limit = 10;

  useEffect(() => { fetchSubs(); }, [page, statusFilter, typeFilter]);

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: limit.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { moduleType: typeFilter }),
      });
      const res = await api.get(`/usermodules?${params}`);
      setSubs(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  const totalPages = Math.ceil(total / limit);
  const selectClass = "h-8 rounded-lg border bg-background px-3 text-[13px] text-foreground outline-none cursor-pointer";

  // Stats
  const activeSubs = subs.filter(s => s.status === "active" || s.status === "trial").length;
  const expiredSubs = subs.filter(s => s.status === "expired").length;
  const freeForeverSubs = subs.filter(s => s.isFreeForever).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">Manage all user subscriptions — {total} total</p>
        </div>
        <Button variant="outline" onClick={fetchSubs} className="gap-1.5">
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {/* Quick stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: total, color: "#7c3aed" },
          { label: "Active / Trial", value: activeSubs, color: "#22c55e" },
          { label: "Expired", value: expiredSubs, color: "#ef4444" },
          { label: "Free Forever", value: freeForeverSubs, color: "#a78bfa" },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card px-4 py-3.5">
            <p className="mb-1.5 text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSubs()}
            placeholder="Search user or module..."
            className="pl-7.5"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={cn(selectClass, "min-w-[130px]")}>
          <option value="all">All Status</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className={cn(selectClass, "min-w-[130px]")}>
          <option value="all">All Types</option>
          <option value="agent">Agent</option>
          <option value="automation">Automation</option>
        </select>
        <span className="ml-auto text-xs text-muted-foreground">{total} results</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[2fr_1.5fr_100px_100px_80px_90px_80px] gap-2.5 border-b bg-background px-4.5 py-2.5">
              {["User", "Module", "Type", "Plan", "Status", "Expires", "Actions"].map((h) => (
                <span key={h} className="text-[11px] font-semibold text-muted-foreground">{h}</span>
              ))}
            </div>

            {loading ? (
              <div className="p-15 text-center">
                <Loader2 size={24} className="mx-auto animate-spin text-primary" />
              </div>
            ) : subs.length === 0 ? (
              <div className="p-15 text-center">
                <Package size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No subscriptions found</p>
              </div>
            ) : (
              subs.map((sub, i) => {
                const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.cancelled;
                const pc = PLAN_CONFIG[sub.planType] || PLAN_CONFIG.free_trial;
                const isExpiringSoon = sub.trialEndDate &&
                  new Date(sub.trialEndDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                return (
                  <div
                    key={sub._id}
                    className={cn(
                      "grid grid-cols-[2fr_1.5fr_100px_100px_80px_90px_80px] items-center gap-2.5 px-4.5 py-3 hover:bg-background",
                      i < subs.length - 1 && "border-b",
                    )}
                  >
                    {/* User */}
                    <div className="min-w-0">
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-foreground">
                        {(sub.userId as any)?.name || "Unknown"}
                      </p>
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-muted-foreground">
                        {(sub.userId as any)?.email || "—"}
                      </p>
                    </div>

                    {/* Module */}
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
                      {sub.moduleName}
                    </p>

                    {/* Type */}
                    <span className="inline-block w-fit rounded-md bg-primary/[0.08] px-2 py-0.75 text-[11px] font-semibold text-[#a78bfa] capitalize">
                      {sub.moduleType}
                    </span>

                    {/* Plan */}
                    <span className="inline-block w-fit rounded-full px-2 py-0.75 text-[11px] font-semibold" style={{ background: pc.bg, color: pc.color }}>
                      {pc.label}
                    </span>

                    {/* Status */}
                    <span className="inline-block w-fit rounded-full px-2 py-0.75 text-[11px] font-semibold" style={{ background: sc.bg, color: sc.color }}>
                      {sub.status}
                    </span>

                    {/* Expires */}
                    <p className={cn("text-[11px]", isExpiringSoon ? "text-amber-500" : "text-muted-foreground")}>
                      {sub.trialEndDate
                        ? new Date(sub.trialEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                        : "—"}
                    </p>

                    {/* Actions */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(sub)}
                      className="w-fit border-primary/20 bg-primary/[0.06] text-[#a78bfa] hover:bg-primary/15 hover:text-[#a78bfa]"
                    >
                      Manage
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-3.5 flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">
            {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={13} />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant="outline"
                size="icon"
                onClick={() => setPage(p)}
                className={cn(page === p && "border-primary/30 bg-primary/10 text-[#a78bfa]")}
              >
                {p}
              </Button>
            ))}
            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      )}

      {selected && (
        <ManageModal
          sub={selected}
          onClose={() => setSelected(null)}
          onRefresh={fetchSubs}
        />
      )}
    </div>
  );
}
