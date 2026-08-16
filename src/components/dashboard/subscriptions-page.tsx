"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Package, Search, ChevronLeft, ChevronRight,
  Loader2, Shield, Clock, XCircle, CheckCircle2,
  RefreshCw, Filter, X, Save, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

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
function ManageModal({ sub, onClose, onRefresh, colors, isDark }: {
  sub: Subscription; onClose: () => void;
  onRefresh: () => void; colors: any; isDark: boolean;
}) {
  const [extendDays, setExtendDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [action, setAction] = useState<string | null>(null);

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";

  const handleExtend = async () => {
    setSaving(true); setAction("extend");
    try {
      await api.patch(`/usermodules/${sub._id}/extend-trial`, { days: extendDays });
      toast.success("Subscription updated.")
      onRefresh(); onClose();
    } catch {}
    setSaving(false); setAction(null);
  };

  const handleFreeForever = async () => {
    setSaving(true); setAction("free");
    try {
      await api.patch(`/usermodules/${sub._id}/free-forever`);
      toast.success("Updated successfully.")
      onRefresh(); onClose();
    } catch {}
    setSaving(false); setAction(null);
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this subscription?")) return;
    setSaving(true); setAction("cancel");
    try {
      await api.patch(`/usermodules/${sub._id}/cancel`);
      toast.success("Subscription updated")
      onRefresh(); onClose();
    } catch {}
    setSaving(false); setAction(null);
  };

  const inputStyle = {
    padding: "8px 10px", borderRadius: "7px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", width: "80px",
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "16px", width: "100%", maxWidth: "440px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${panelBorder}` }}>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111", marginBottom: "2px" }}>
              Manage Subscription
            </p>
            <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>
              {(sub.userId as any)?.name || "Unknown"} · {sub.moduleName}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: "28px", height: "28px", borderRadius: "7px", border: `1px solid ${panelBorder}`,
            background: "transparent", color: isDark ? "#737373" : "#6b7280", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={13} />
          </button>
        </div>

        {/* Current status */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${panelBorder}` }}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "9999px",
              background: STATUS_CONFIG[sub.status]?.bg || "rgba(107,114,128,0.1)",
              color: STATUS_CONFIG[sub.status]?.color || "#6b7280",
            }}>
              {sub.status}
            </span>
            <span style={{
              fontSize: "12px", fontWeight: 600, padding: "4px 12px", borderRadius: "9999px",
              background: PLAN_CONFIG[sub.planType]?.bg || "rgba(107,114,128,0.1)",
              color: PLAN_CONFIG[sub.planType]?.color || "#6b7280",
            }}>
              {PLAN_CONFIG[sub.planType]?.label || sub.planType}
            </span>
            {sub.trialEndDate && (
              <span style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>
                Expires: {new Date(sub.trialEndDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Extend trial */}
          <div style={{ padding: "14px", borderRadius: "10px", background: colors.bg, border: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: isDark ? "#e5e5e5" : "#111", marginBottom: "10px" }}>
              Extend Trial
            </p>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input type="number" value={extendDays} min={1} max={365}
                onChange={(e) => setExtendDays(parseInt(e.target.value))}
                style={inputStyle} />
              <span style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>days</span>
              <button onClick={handleExtend} disabled={saving && action === "extend"} style={{
                padding: "8px 16px", borderRadius: "7px", cursor: "pointer",
                background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                color: "#a78bfa", fontSize: "12px", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {saving && action === "extend" ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Clock size={12} />}
                Extend
              </button>
            </div>
          </div>

          {/* Free forever */}
          <button onClick={handleFreeForever} disabled={sub.isFreeForever} style={{
            padding: "12px 16px", borderRadius: "9px", cursor: sub.isFreeForever ? "not-allowed" : "pointer",
            background: sub.isFreeForever ? "rgba(167,139,250,0.05)" : "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.2)", color: "#a78bfa",
            fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: sub.isFreeForever ? 0.6 : 1,
          }}>
            {saving && action === "free" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Shield size={14} />}
            {sub.isFreeForever ? "Already Free Forever" : "Grant Free Forever Access"}
          </button>

          {/* Cancel */}
          {sub.status !== "cancelled" && (
            <button onClick={handleCancel} style={{
              padding: "12px 16px", borderRadius: "9px", cursor: "pointer",
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", fontSize: "13px", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              {saving && action === "cancel" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={14} />}
              Cancel Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function SubscriptionsPage() {
  const { colors, isDark } = useTheme();
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
  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  // Stats
  const activeSubs = subs.filter(s => s.status === "active" || s.status === "trial").length;
  const expiredSubs = subs.filter(s => s.status === "expired").length;
  const freeForeverSubs = subs.filter(s => s.isFreeForever).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Subscriptions</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>Manage all user subscriptions — {total} total</p>
        </div>
        <button onClick={fetchSubs} style={{
          display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px",
          borderRadius: "8px", border: `1px solid ${colors.border}`,
          background: colors.bgCard, color: colors.textMuted, cursor: "pointer", fontSize: "13px",
        }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Total", value: total, color: "#7c3aed" },
          { label: "Active / Trial", value: activeSubs, color: "#22c55e" },
          { label: "Expired", value: expiredSubs, color: "#ef4444" },
          { label: "Free Forever", value: freeForeverSubs, color: "#a78bfa" },
        ].map((s) => (
          <div key={s.label} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "14px 16px" }}>
            <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "6px" }}>{s.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center",
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "10px", padding: "12px 16px",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={13} color={colors.textMuted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSubs()}
            placeholder="Search user or module..."
            style={{ ...inputStyle, width: "100%", paddingLeft: "30px", boxSizing: "border-box" as const }} />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: "130px" }}>
          <option value="all">All Status</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: "130px" }}>
          <option value="all">All Types</option>
          <option value="agent">Agent</option>
          <option value="automation">Automation</option>
        </select>
        <span style={{ fontSize: "12px", color: colors.textMuted, marginLeft: "auto" }}>{total} results</span>
      </div>

      {/* Table */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.5fr 100px 100px 80px 90px 80px",
          gap: "10px", padding: "10px 18px",
          background: colors.bg, borderBottom: `1px solid ${colors.border}`,
        }}>
          {["User", "Module", "Type", "Plan", "Status", "Expires", "Actions"].map((h) => (
            <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : subs.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <Package size={32} color={colors.textMuted} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "14px", color: colors.textMuted }}>No subscriptions found</p>
          </div>
        ) : (
          subs.map((sub, i) => {
            const sc = STATUS_CONFIG[sub.status] || STATUS_CONFIG.cancelled;
            const pc = PLAN_CONFIG[sub.planType] || PLAN_CONFIG.free_trial;
            const isExpiringSoon = sub.trialEndDate &&
              new Date(sub.trialEndDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
            return (
              <div key={sub._id} style={{
                display: "grid", gridTemplateColumns: "2fr 1.5fr 100px 100px 80px 90px 80px",
                gap: "10px", padding: "12px 18px", alignItems: "center",
                borderBottom: i < subs.length - 1 ? `1px solid ${colors.border}` : "none",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = colors.bg; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              >
                {/* User */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {(sub.userId as any)?.name || "Unknown"}
                  </p>
                  <p style={{ fontSize: "11px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {(sub.userId as any)?.email || "—"}
                  </p>
                </div>

                {/* Module */}
                <p style={{ fontSize: "12px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {sub.moduleName}
                </p>

                {/* Type */}
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px",
                  background: "rgba(124,58,237,0.08)", color: "#a78bfa",
                  display: "inline-block", textTransform: "capitalize",
                }}>
                  {sub.moduleType}
                </span>

                {/* Plan */}
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px",
                  background: pc.bg, color: pc.color, display: "inline-block",
                }}>
                  {pc.label}
                </span>

                {/* Status */}
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px",
                  background: sc.bg, color: sc.color, display: "inline-block",
                }}>
                  {sub.status}
                </span>

                {/* Expires */}
                <p style={{ fontSize: "11px", color: isExpiringSoon ? "#f59e0b" : colors.textMuted }}>
                  {sub.trialEndDate
                    ? new Date(sub.trialEndDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    : "—"}
                </p>

                {/* Actions */}
                <button onClick={() => setSelected(sub)} style={{
                  padding: "5px 10px", borderRadius: "6px", cursor: "pointer",
                  border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)",
                  color: "#a78bfa", fontSize: "11px", fontWeight: 600,
                }}>
                  Manage
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px" }}>
          <p style={{ fontSize: "13px", color: colors.textMuted }}>
            {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
              width: "30px", height: "30px", borderRadius: "7px", cursor: page === 1 ? "not-allowed" : "pointer",
              border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.text,
              display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1,
            }}>
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: "30px", height: "30px", borderRadius: "7px", cursor: "pointer",
                border: `1px solid ${page === p ? "rgba(124,58,237,0.3)" : colors.border}`,
                background: page === p ? "rgba(124,58,237,0.1)" : colors.bgCard,
                color: page === p ? "#a78bfa" : colors.text,
                fontSize: "13px", fontWeight: page === p ? 600 : 400,
              }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
              width: "30px", height: "30px", borderRadius: "7px", cursor: page === totalPages ? "not-allowed" : "pointer",
              border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.text,
              display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages ? 0.4 : 1,
            }}>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {selected && (
        <ManageModal
          sub={selected}
          onClose={() => setSelected(null)}
          onRefresh={fetchSubs}
          colors={colors}
          isDark={isDark}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}