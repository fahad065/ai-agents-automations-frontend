"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Users, Search, Eye, Pencil, Trash2,
  Loader2, ChevronLeft, ChevronRight,
  Shield, User,
  Phone, Globe,
  Save, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isDeleted: boolean;
  planType: string;
  phoneNumber?: string;
  country?: string;
  totalAgents?: number;
  totalAutomations?: number;
  totalBilled?: number;
  trialEndDate?: string;
  createdAt: string;
  provider: string;
}

const PLAN_COLORS: Record<string, { color: string; bg: string }> = {
  trial:        { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  paid:         { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  free_forever: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  expired:      { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const PLAN_LABELS: Record<string, string> = {
  trial: "Free Trial", paid: "Pro",
  free_forever: "Free Forever", expired: "Expired",
};

const selectClass = "h-8 rounded-lg border bg-background px-3 text-[13px] text-foreground outline-none cursor-pointer";

// ── View/Edit User Modal ──────────────────────────────────────
function UserModal({ user, onClose, onSave }: {
  user: UserData; onClose: () => void;
  onSave: (data: Partial<UserData>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: user.name || "",
    phoneNumber: user.phoneNumber || "",
    country: user.country || "",
    isActive: user.isActive,
    planType: user.planType || "trial",
    role: user.role || "user",
  });
  const [extendDays, setExtendDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"details" | "plan">("details");

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  const handleFreeForever = async () => {
    setSaving(true);
    await onSave({ planType: "free_forever", isFreeForever: true } as any);
    setSaving(false);
    onClose();
  };

  const handleExtendTrial = async () => {
    setSaving(true);
    const newEnd = new Date();
    newEnd.setDate(newEnd.getDate() + extendDays);
    await onSave({ trialEndDate: newEnd.toISOString(), planType: "trial" } as any);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-base font-bold text-primary-foreground">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <DialogTitle>{user.name}</DialogTitle>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="-mt-2 flex border-b">
          {(["details", "plan"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 text-[13px] capitalize",
                tab === t ? "border-primary font-semibold text-[#a78bfa]" : "border-transparent font-normal text-muted-foreground",
              )}
            >
              {t === "details" ? "User Details" : "Plan & Trial"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {tab === "details" && (
            <div className="flex flex-col gap-3.5">
              {[
                { label: "Full Name", key: "name", type: "text", icon: User },
                { label: "Phone Number", key: "phoneNumber", type: "tel", icon: Phone },
                { label: "Country", key: "country", type: "text", icon: Globe },
              ].map(({ label, key, type, icon: Icon }) => (
                <div key={key}>
                  <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Icon size={12} /> {label}
                  </Label>
                  <Input
                    type={type}
                    value={(form as any)[key] || ""}
                    onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}

              {/* Role */}
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Role</Label>
                <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} className={cn(selectClass, "w-full")}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Active status */}
              <div className="flex items-center justify-between rounded-lg border bg-background px-3.5 py-3">
                <div>
                  <p className="text-[13px] font-medium text-foreground">Account Active</p>
                  <p className="text-[11px] text-muted-foreground">
                    {form.isActive ? "User can login and use the platform" : "User is deactivated"}
                  </p>
                </div>
                <Switch checked={form.isActive} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, isActive: v }))} />
              </div>
            </div>
          )}

          {tab === "plan" && (
            <div className="flex flex-col gap-3.5">
              {/* Current plan */}
              <div className="rounded-lg border bg-background p-3.5">
                <p className="mb-1.5 text-xs text-muted-foreground">Current Plan</p>
                <div className="flex items-center gap-2.5">
                  <span
                    className="rounded-full px-3 py-1 text-[13px] font-semibold"
                    style={{ background: PLAN_COLORS[user.planType]?.bg || "rgba(107,114,128,0.1)", color: PLAN_COLORS[user.planType]?.color || "#6b7280" }}
                  >
                    {PLAN_LABELS[user.planType] || user.planType}
                  </span>
                  {user.trialEndDate && (
                    <span className="text-xs text-muted-foreground">
                      Expires: {new Date(user.trialEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Change plan */}
              <div>
                <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Change Plan</Label>
                <select value={form.planType} onChange={(e) => setForm(f => ({ ...f, planType: e.target.value }))} className={cn(selectClass, "w-full")}>
                  <option value="trial">Free Trial</option>
                  <option value="paid">Pro (Paid)</option>
                  <option value="free_forever">Free Forever</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Extend trial */}
              <div className="rounded-lg border bg-background p-3.5">
                <p className="mb-2.5 text-[13px] font-medium text-foreground">Extend Trial</p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number" value={extendDays} min={1} max={365}
                    onChange={(e) => setExtendDays(parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground">days</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExtendTrial}
                    className="border-primary/20 bg-primary/10 text-[#a78bfa] hover:bg-primary/20 hover:text-[#a78bfa]"
                  >
                    Extend
                  </Button>
                </div>
              </div>

              {/* Free forever */}
              <Button
                variant="outline"
                onClick={handleFreeForever}
                className="justify-center gap-2 border-blue-500/20 bg-blue-500/[0.08] text-blue-500 hover:bg-blue-500/15 hover:text-blue-500"
              >
                <Shield size={14} /> Grant Free Forever Access
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Users Page ───────────────────────────────────────────
export function UsersPage() {
  const { user: currentUser } = useAuthStore();
  const router = useRouter();

  // Redirect non-admins
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/dashboard");
    }
  }, [currentUser]);

  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const limit = 10;

  useEffect(() => { fetchUsers(); }, [page, statusFilter, planFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: limit.toString(),
        ...(statusFilter !== "all" && { isActive: statusFilter }),
        ...(planFilter !== "all" && { planType: planFilter }),
        ...(search && { search }),
      });
      const res = await api.get(`/users?${params}`);
      setUsers(res.data?.users || res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {}
    setLoading(false);
  };

  const handleSearch = () => { setPage(1); fetchUsers(); };

  const handleSave = async (userId: string, data: Partial<UserData>) => {
    try {
      await api.patch(`/users/${userId}`, data);
      toast.success("Updated successfully");
      fetchUsers();
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success("Deleted successfully");
      setDeleteUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to deactivate user");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage all registered users — {total} total
          </p>
        </div>
        <Button variant="outline" onClick={fetchUsers} className="gap-1.5">
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-3.5">
        {/* Search */}
        <div className="relative min-w-[200px] flex-1">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name or email..."
            className="pl-7.5"
          />
        </div>

        {/* Status filter */}
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={cn(selectClass, "min-w-[130px]")}>
          <option value="all">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Plan filter */}
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }} className={cn(selectClass, "min-w-[140px]")}>
          <option value="all">All Plans</option>
          <option value="trial">Free Trial</option>
          <option value="paid">Pro</option>
          <option value="free_forever">Free Forever</option>
          <option value="expired">Expired</option>
        </select>

        <Button onClick={handleSearch}>Search</Button>

        <span className="ml-auto text-xs text-muted-foreground">{total} users</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[780px]">
            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1.5fr_100px_120px_80px_90px_100px] gap-2.5 border-b bg-background px-5 py-2.5">
              {["User", "Email", "Role", "Plan", "Modules", "Billed", "Actions"].map((h) => (
                <span key={h} className="text-[11px] font-semibold text-muted-foreground">{h}</span>
              ))}
            </div>

            {loading ? (
              <div className="p-15 text-center">
                <Loader2 size={24} className="mx-auto animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-15 text-center">
                <Users size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              users.map((u, i) => {
                const plan = PLAN_COLORS[u.planType] || { color: "#6b7280", bg: "rgba(107,114,128,0.1)" };
                return (
                  <div
                    key={u._id}
                    className={cn(
                      "grid grid-cols-[2fr_1.5fr_100px_120px_80px_90px_100px] items-center gap-2.5 px-5 py-3.5 hover:bg-background",
                      i < users.length - 1 && "border-b",
                      u.isDeleted && "opacity-50",
                    )}
                  >
                    {/* User */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-[13px] font-bold text-primary-foreground">
                        {u.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-foreground">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {u.provider || "email"} · {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
                      {u.email}
                    </p>

                    {/* Role */}
                    <span
                      className={cn(
                        "inline-block w-fit rounded-md px-2 py-0.75 text-[11px] font-semibold",
                        u.role === "admin" ? "bg-primary/10 text-[#a78bfa]" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {u.role}
                    </span>

                    {/* Plan */}
                    <span className="inline-block w-fit rounded-full px-2 py-0.75 text-[11px] font-semibold" style={{ background: plan.bg, color: plan.color }}>
                      {PLAN_LABELS[u.planType] || u.planType || "Trial"}
                    </span>

                    {/* Modules */}
                    <p className="text-center text-xs text-muted-foreground">
                      {(u.totalAgents || 0) + (u.totalAutomations || 0)}
                    </p>

                    {/* Billed */}
                    <p className="text-xs font-semibold text-amber-500">
                      ${(u.totalBilled || 0).toFixed(2)}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" title="View/Edit" onClick={() => setSelectedUser(u)}>
                        <Eye size={12} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Edit"
                        onClick={() => setSelectedUser(u)}
                        className="border-primary/20 bg-primary/[0.06] text-[#a78bfa] hover:bg-primary/15 hover:text-[#a78bfa]"
                      >
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Deactivate"
                        onClick={() => setDeleteUser(u)}
                        className="border-destructive/20 bg-destructive/[0.06] text-destructive hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
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
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} />
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
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={(data) => handleSave(selectedUser._id, data)}
        />
      )}

      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate <strong>{deleteUser?.name}</strong> and all their subscribed services. Their data is soft-deleted and can be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteUser && handleDelete(deleteUser._id)} className="bg-destructive text-white hover:bg-destructive/90">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
