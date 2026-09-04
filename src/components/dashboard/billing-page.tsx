"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Package, ChevronLeft, ChevronRight,
  Loader2, CheckCircle2, Filter,
  TrendingUp, DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface BillingRecord {
  _id: string;
  moduleType: string;
  moduleName: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  billingDate: string;
  apiCosts?: { openai?: number; seedance?: number; atlas?: number };
}

interface Subscription {
  _id: string;
  moduleName: string;
  moduleType: string;
  planType: string;
  status: string;
  billingAmount: number;
  trialEndDate?: string;
  apiKeyMode: string;
}

interface Summary {
  grandTotal: number;
  byModule: { moduleName: string; total: number; count: number }[];
  month: string;
}

const STATUS_CONFIG: Record<string, string> = {
  paid:    "bg-[#22c55e]/10 text-[#22c55e]",
  pending: "bg-[#f59e0b]/10 text-[#f59e0b]",
  failed:  "bg-destructive/10 text-destructive",
  refunded:"bg-[#3b82f6]/10 text-[#3b82f6]",
};

const PLAN_CONFIG: Record<string, { className: string; label: string }> = {
  free_trial:   { className: "bg-[#f59e0b]/10 text-[#f59e0b]", label: "Free Trial" },
  monthly:      { className: "bg-[#22c55e]/10 text-[#22c55e]", label: "Monthly" },
  annual:       { className: "bg-[#3b82f6]/10 text-[#3b82f6]", label: "Annual" },
  free_forever: { className: "bg-primary/10 text-[#a78bfa]", label: "Free Forever" },
  trial:        { className: "bg-[#f59e0b]/10 text-[#f59e0b]", label: "Free Trial" },
};

export function BillingPage() {
  const [tab, setTab] = useState<"subscriptions" | "history">("subscriptions");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);
  const limit = 10;

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (tab === "history") fetchBilling(); }, [tab, page, startDate, endDate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subsRes, summaryRes] = await Promise.all([
        api.get("/usermodules/my"),
        api.get("/billing/summary"),
      ]);
      setSubscriptions(subsRes.data?.data || subsRes.data || []);
      setSummary(summaryRes.data || null);
    } catch {}
    setLoading(false);
  };

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await api.get(`/billing?${params}`);
      setBillingRecords(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  const cancelSubscription = async () => {
    if (!cancelTarget) return;
    try {
      await api.patch(`/usermodules/${cancelTarget._id}/cancel`);
      toast.success("Subscription cancelled");
      fetchAll();
    } catch {
      toast.error("Failed to cancel subscription");
    }
    setCancelTarget(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscriptions and payment history.</p>
      </div>

      {/* Manual payment banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-primary/20 bg-primary/6 px-4.5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">💳</span>
          <div>
            <p className="mb-0.5 text-[13px] font-semibold text-foreground">
              Ready to subscribe?
            </p>
            <p className="text-xs text-muted-foreground">
              We accept manual bank transfer payments. View instructions and notify us after payment.
            </p>
          </div>
        </div>
        <Button nativeButton={false} render={<a href="/dashboard/payment-instructions" />} className="whitespace-nowrap">
          View Payment Instructions →
        </Button>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {/* Total this month */}
        <div className="rounded-xl border bg-card px-5 py-4.5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">This Month</p>
            <div className="flex size-8 items-center justify-center rounded-lg border border-[#f59e0b]/20 bg-[#f59e0b]/10">
              <DollarSign size={15} className="text-[#f59e0b]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">${(summary?.grandTotal || 0).toFixed(2)}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">{summary?.month || "—"}</p>
        </div>

        {/* Active subscriptions */}
        <div className="rounded-xl border bg-card px-5 py-4.5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Active Plans</p>
            <div className="flex size-8 items-center justify-center rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/10">
              <CheckCircle2 size={15} className="text-[#22c55e]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {subscriptions.filter(s => s.status === "active" || s.status === "trial").length}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">of {subscriptions.length} total</p>
        </div>

        {/* Top module */}
        <div className="rounded-xl border bg-card px-5 py-4.5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Top Service</p>
            <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
              <TrendingUp size={15} className="text-[#a78bfa]" />
            </div>
          </div>
          <p className="mb-0.5 text-[15px] font-bold text-foreground">
            {summary?.byModule?.[0]?.moduleName || "—"}
          </p>
          <p className="text-[11px] text-muted-foreground">${(summary?.byModule?.[0]?.total || 0).toFixed(2)} this month</p>
        </div>

        {/* API key mode */}
        <div className="rounded-xl border bg-card px-5 py-4.5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">API Key Mode</p>
            <div className="flex size-8 items-center justify-center rounded-lg border border-[#3b82f6]/20 bg-[#3b82f6]/10">
              <img src="/icon.svg" width="30" height="30" className="rounded-lg" />
            </div>
          </div>
          <p className="mb-0.5 text-[15px] font-bold text-foreground">
            {subscriptions[0]?.apiKeyMode === "own_keys" ? "Own Keys" : "Platform Keys"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {subscriptions[0]?.apiKeyMode === "own_keys" ? "Lower monthly rate" : "Higher monthly rate"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex w-fit gap-0.5 rounded-[10px] border bg-card p-1">
        {(["subscriptions", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-[7px] border-0 px-4.5 py-1.75 text-[13px] transition-colors",
              tab === t ? "bg-background font-semibold text-foreground shadow-sm" : "font-normal text-muted-foreground"
            )}
          >
            {t === "subscriptions" ? "My Subscriptions" : "Payment History"}
          </button>
        ))}
      </div>

      {/* ── Subscriptions tab ── */}
      {tab === "subscriptions" && (
        <div>
          {loading ? (
            <div className="p-15 text-center">
              <Loader2 size={24} className="mx-auto animate-spin text-primary" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="rounded-xl border bg-card px-6 py-15 text-center">
              <Package size={36} className="mx-auto mb-3 text-muted-foreground" />
              <p className="mb-1.5 text-[15px] font-medium text-foreground">No subscriptions yet</p>
              <p className="text-[13px] text-muted-foreground">Browse the marketplace to subscribe to a module.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {subscriptions.map((sub) => {
                const plan = PLAN_CONFIG[sub.planType] || PLAN_CONFIG.free_trial;
                const isExpiringSoon = sub.trialEndDate && new Date(sub.trialEndDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                return (
                  <div
                    key={sub._id}
                    className={cn("flex flex-wrap items-center gap-4 rounded-xl border bg-card px-5 py-4.5", isExpiringSoon && "border-[#f59e0b]/30")}
                  >
                    {/* Icon */}
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-primary/20 bg-primary/10">
                      <Package size={20} className="text-[#a78bfa]" />
                    </div>

                    {/* Info */}
                    <div className="min-w-[150px] flex-1">
                      <p className="mb-1 text-sm font-semibold text-foreground">
                        {sub.moduleName}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {sub.moduleType}
                        </span>
                        <span className="text-border">·</span>
                        <span className="text-[11px] text-muted-foreground capitalize">
                          {sub.apiKeyMode === "own_keys" ? "Own API Keys" : "Platform Keys"}
                        </span>
                        {sub.trialEndDate && (
                          <>
                            <span className="text-border">·</span>
                            <span className={cn("text-[11px]", isExpiringSoon ? "text-[#f59e0b]" : "text-muted-foreground")}>
                              {isExpiringSoon ? "⚠️ " : ""}Expires {new Date(sub.trialEndDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Plan badge */}
                    <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold", plan.className)}>
                      {plan.label}
                    </span>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-base font-bold text-foreground">
                        ${sub.billingAmount > 0 ? `${sub.billingAmount}/mo` : "Free"}
                      </p>
                    </div>

                    {/* Cancel */}
                    {(sub.status === "active" || sub.status === "trial") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelTarget(sub)}
                        className="border-destructive/20 bg-destructive/6 text-destructive"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Payment History tab ── */}
      {tab === "history" && (
        <div>
          {/* Date filters */}
          <div className="mb-3.5 flex flex-wrap items-center gap-2.5 rounded-[10px] border bg-card px-4 py-3">
            <Filter size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">From</span>
            <input
              type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="rounded-md border bg-background px-2.5 py-1.75 text-xs text-foreground outline-none"
            />
            <span className="text-xs text-muted-foreground">To</span>
            <input
              type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="rounded-md border bg-background px-2.5 py-1.75 text-xs text-foreground outline-none"
            />
            {(startDate || endDate) && (
              <Button variant="outline" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }}>
                Clear
              </Button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {total} records
            </span>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border bg-card">
            {loading ? (
              <div className="p-10 text-center">
                <Loader2 size={22} className="mx-auto animate-spin text-primary" />
              </div>
            ) : billingRecords.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-[13px] text-muted-foreground">No billing records found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingRecords.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="whitespace-normal">
                        <p className="mb-0.5 text-[13px] font-medium text-foreground">{record.description}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(record.billingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{record.moduleName}</TableCell>
                      <TableCell>
                        <span className="inline-block rounded-md bg-primary/8 px-1.75 py-0.75 text-[11px] font-semibold text-[#a78bfa] capitalize">
                          {record.type}
                        </span>
                      </TableCell>
                      <TableCell className={cn("text-[13px] font-bold", record.type === "refund" ? "text-[#22c55e]" : "text-foreground")}>
                        {record.type === "refund" ? "+" : ""}${record.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={cn("inline-block rounded-full px-2 py-0.75 text-[11px] font-semibold", STATUS_CONFIG[record.status] || STATUS_CONFIG.pending)}>
                          {record.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft size={13} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight size={13} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget && `"${cancelTarget.moduleName}" will be cancelled immediately. This can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep subscription</AlertDialogCancel>
            <AlertDialogAction onClick={cancelSubscription} className="bg-destructive text-white hover:bg-destructive/90">
              Cancel subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
