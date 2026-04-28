"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  CreditCard, Package, ChevronLeft, ChevronRight,
  Loader2, CheckCircle2, XCircle, Clock, Filter,
  TrendingUp, DollarSign, Zap, BarChart3,
} from "lucide-react";

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

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  paid:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  failed:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  refunded:{ color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
};

const PLAN_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  free_trial:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Free Trial" },
  monthly:      { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Monthly" },
  annual:       { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  label: "Annual" },
  free_forever: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", label: "Free Forever" },
  trial:        { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Free Trial" },
};

export function BillingPage() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();

  const [tab, setTab] = useState<"subscriptions" | "history">("subscriptions");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

  const cancelSubscription = async (id: string) => {
    if (!confirm("Cancel this subscription?")) return;
    try {
      await api.patch(`/usermodules/${id}/cancel`);
      fetchAll();
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);

  const inputStyle = {
    padding: "7px 10px", borderRadius: "7px", fontSize: "12px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Billing</h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>Manage your subscriptions and payment history.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {/* Total this month */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>This Month</p>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={15} color="#f59e0b" />
            </div>
          </div>
          <p style={{ fontSize: "24px", fontWeight: 700, color: colors.text }}>${(summary?.grandTotal || 0).toFixed(2)}</p>
          <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "4px" }}>{summary?.month || "—"}</p>
        </div>

        {/* Active subscriptions */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>Active Plans</p>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={15} color="#22c55e" />
            </div>
          </div>
          <p style={{ fontSize: "24px", fontWeight: 700, color: colors.text }}>
            {subscriptions.filter(s => s.status === "active" || s.status === "trial").length}
          </p>
          <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "4px" }}>of {subscriptions.length} total</p>
        </div>

        {/* Top module */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>Top Service</p>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={15} color="#a78bfa" />
            </div>
          </div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: colors.text, marginBottom: "2px" }}>
            {summary?.byModule?.[0]?.moduleName || "—"}
          </p>
          <p style={{ fontSize: "11px", color: colors.textMuted }}>${(summary?.byModule?.[0]?.total || 0).toFixed(2)} this month</p>
        </div>

        {/* API key mode */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>API Key Mode</p>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src="/icon.svg" width="30" height="30" style={{ borderRadius: "8px" }} />
            </div>
          </div>
          <p style={{ fontSize: "15px", fontWeight: 700, color: colors.text, marginBottom: "2px" }}>
            {subscriptions[0]?.apiKeyMode === "own_keys" ? "Own Keys" : "Platform Keys"}
          </p>
          <p style={{ fontSize: "11px", color: colors.textMuted }}>
            {subscriptions[0]?.apiKeyMode === "own_keys" ? "Lower monthly rate" : "Higher monthly rate"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", marginBottom: "16px", background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {(["subscriptions", "history"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: "7px", fontSize: "13px",
            fontWeight: tab === t ? 600 : 400, cursor: "pointer", border: "none",
            background: tab === t ? (isDark ? "#1a1a1a" : "#ffffff") : "transparent",
            color: tab === t ? colors.text : colors.textMuted,
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            textTransform: "capitalize",
          }}>
            {t === "subscriptions" ? "My Subscriptions" : "Payment History"}
          </button>
        ))}
      </div>

      {/* ── Subscriptions tab ── */}
      {tab === "subscriptions" && (
        <div>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            </div>
          ) : subscriptions.length === 0 ? (
            <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
              <Package size={36} color={colors.textMuted} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "15px", fontWeight: 500, color: colors.text, marginBottom: "6px" }}>No subscriptions yet</p>
              <p style={{ fontSize: "13px", color: colors.textMuted }}>Browse the marketplace to subscribe to a module.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {subscriptions.map((sub) => {
                const plan = PLAN_CONFIG[sub.planType] || PLAN_CONFIG.free_trial;
                const isExpiringSoon = sub.trialEndDate && new Date(sub.trialEndDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                return (
                  <div key={sub._id} style={{
                    background: colors.bgCard, border: `1px solid ${isExpiringSoon ? "rgba(245,158,11,0.3)" : colors.border}`,
                    borderRadius: "12px", padding: "18px 20px",
                    display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
                      background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Package size={20} color="#a78bfa" />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: "150px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "4px" }}>
                        {sub.moduleName}
                      </p>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: colors.textMuted, textTransform: "capitalize" }}>
                          {sub.moduleType}
                        </span>
                        <span style={{ color: colors.border }}>·</span>
                        <span style={{ fontSize: "11px", color: colors.textMuted, textTransform: "capitalize" }}>
                          {sub.apiKeyMode === "own_keys" ? "Own API Keys" : "Platform Keys"}
                        </span>
                        {sub.trialEndDate && (
                          <>
                            <span style={{ color: colors.border }}>·</span>
                            <span style={{ fontSize: "11px", color: isExpiringSoon ? "#f59e0b" : colors.textMuted }}>
                              {isExpiringSoon ? "⚠️ " : ""}Expires {new Date(sub.trialEndDate).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Plan badge */}
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "4px 12px",
                      borderRadius: "9999px", background: plan.bg, color: plan.color,
                    }}>
                      {plan.label}
                    </span>

                    {/* Price */}
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "16px", fontWeight: 700, color: colors.text }}>
                        ${sub.billingAmount > 0 ? `${sub.billingAmount}/mo` : "Free"}
                      </p>
                    </div>

                    {/* Cancel */}
                    {(sub.status === "active" || sub.status === "trial") && (
                      <button onClick={() => cancelSubscription(sub._id)} style={{
                        padding: "7px 14px", borderRadius: "7px", cursor: "pointer",
                        border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                        color: "#ef4444", fontSize: "12px", fontWeight: 500,
                      }}>
                        Cancel
                      </button>
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
          <div style={{
            display: "flex", gap: "10px", marginBottom: "14px",
            flexWrap: "wrap", alignItems: "center",
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "10px", padding: "12px 16px",
          }}>
            <Filter size={13} color={colors.textMuted} />
            <span style={{ fontSize: "12px", color: colors.textMuted }}>From</span>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} style={inputStyle} />
            <span style={{ fontSize: "12px", color: colors.textMuted }}>To</span>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} style={inputStyle} />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(""); setEndDate(""); setPage(1); }} style={{
                padding: "5px 10px", borderRadius: "6px", cursor: "pointer",
                border: `1px solid ${colors.border}`, background: "transparent",
                color: colors.textMuted, fontSize: "12px",
              }}>
                Clear
              </button>
            )}
            <span style={{ fontSize: "12px", color: colors.textMuted, marginLeft: "auto" }}>
              {total} records
            </span>
          </div>

          {/* Table */}
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 100px",
              gap: "10px", padding: "10px 18px",
              background: colors.bg, borderBottom: `1px solid ${colors.border}`,
            }}>
              {["Description", "Module", "Type", "Amount", "Status"].map((h) => (
                <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
              </div>
            ) : billingRecords.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: colors.textMuted }}>No billing records found</p>
              </div>
            ) : (
              billingRecords.map((record, i) => {
                const sc = STATUS_CONFIG[record.status] || STATUS_CONFIG.pending;
                return (
                  <div key={record._id} style={{
                    display: "grid", gridTemplateColumns: "1fr 100px 80px 80px 100px",
                    gap: "10px", padding: "12px 18px", alignItems: "center",
                    borderBottom: i < billingRecords.length - 1 ? `1px solid ${colors.border}` : "none",
                  }}>
                    <div>
                      <p style={{ fontSize: "13px", color: colors.text, fontWeight: 500, marginBottom: "2px" }}>
                        {record.description}
                      </p>
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>
                        {new Date(record.billingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <p style={{ fontSize: "12px", color: colors.textMuted }}>{record.moduleName}</p>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 7px", borderRadius: "6px",
                      background: "rgba(124,58,237,0.08)", color: "#a78bfa",
                      display: "inline-block", textTransform: "capitalize",
                    }}>
                      {record.type}
                    </span>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: record.type === "refund" ? "#22c55e" : colors.text }}>
                      {record.type === "refund" ? "+" : ""}${record.amount.toFixed(2)}
                    </p>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 8px",
                      borderRadius: "9999px", background: sc.bg, color: sc.color,
                      display: "inline-block",
                    }}>
                      {record.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>
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
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}