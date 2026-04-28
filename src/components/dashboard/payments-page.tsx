"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  DollarSign, TrendingUp, TrendingDown, Zap,
  ChevronLeft, ChevronRight, Loader2, Filter,
  BarChart3, Users, CreditCard, Package,
} from "lucide-react";

interface BillingRecord {
  _id: string;
  userId?: { name: string; email: string };
  moduleType: string;
  moduleName: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  billingDate: string;
  apiCosts?: { openai?: number; seedance?: number; atlas?: number };
}

interface ProfitLoss {
  revenue: number;
  costs: number;
  profit: number;
  apiBreakdown: { openai: number; seedance: number; atlas: number };
}

interface ApiCosts {
  totalAmount: number;
  totalOpenAI: number;
  totalSeedance: number;
  totalAtlas: number;
  count: number;
}

// ── Mini Bar Chart ────────────────────────────────────────────
function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const { colors } = useTheme();
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
        <span style={{ fontSize: "12px", color: colors.textMuted }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: colors.text }}>${value.toFixed(2)}</span>
      </div>
      <div style={{ height: "6px", borderRadius: "3px", background: colors.border, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "3px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

export function PaymentsPage() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "admin") router.push("/dashboard");
  }, [user]);

  const [loading, setLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);
  const [apiCosts, setApiCosts] = useState<ApiCosts | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(() => {
    // Default to current month
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split("T")[0];
  });
  const limit = 10;

  useEffect(() => { fetchAll(); }, [startDate, endDate]);
  useEffect(() => { fetchRecords(); }, [page, startDate, endDate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = `startDate=${startDate}&endDate=${endDate}`;
      const [plRes, acRes, sumRes] = await Promise.all([
        api.get(`/billing/profit-loss?${params}`),
        api.get(`/billing/api-costs?${params}`),
        api.get("/billing/summary"),
      ]);
      setProfitLoss(plRes.data);
      setApiCosts(acRes.data);
      setSummary(sumRes.data);
    } catch {}
    setLoading(false);
  };

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(), limit: limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const res = await api.get(`/billing?${params}`);
      setRecords(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch {}
  };

  const totalPages = Math.ceil(total / limit);
  const maxApiCost = Math.max(
    apiCosts?.totalOpenAI || 0,
    apiCosts?.totalSeedance || 0,
    apiCosts?.totalAtlas || 0,
  );

  const inputStyle = {
    padding: "7px 10px", borderRadius: "7px", fontSize: "12px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  const StatCard = ({ label, value, sub, icon: Icon, color, positive }: any) => (
    <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <p style={{ fontSize: "12px", color: colors.textMuted }}>{label}</p>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      {loading ? (
        <div style={{ height: "28px", background: colors.border, borderRadius: "6px", width: "50%", animation: "pulse 1.5s ease infinite" }} />
      ) : (
        <p style={{ fontSize: "22px", fontWeight: 700, color: positive === false ? "#ef4444" : positive === true ? "#22c55e" : colors.text }}>
          {value}
        </p>
      )}
      {sub && <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "4px" }}>{sub}</p>}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Payment Dashboard</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>Platform-wide billing, API costs and profit/loss.</p>
        </div>

        {/* Date range filter */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <Filter size={13} color={colors.textMuted} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          <span style={{ fontSize: "12px", color: colors.textMuted }}>to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        <StatCard label="Total Revenue" value={`$${(profitLoss?.revenue || 0).toFixed(2)}`}
          sub="From subscriptions" icon={DollarSign} color="#22c55e" positive={true} />
        <StatCard label="Total API Costs" value={`$${(apiCosts?.totalAmount || 0).toFixed(2)}`}
          sub={`${apiCosts?.count || 0} transactions`} icon={Zap} color="#f59e0b" positive={false} />
        <StatCard
          label="Net Profit/Loss"
          value={`${(profitLoss?.profit || 0) >= 0 ? "+" : ""}$${(profitLoss?.profit || 0).toFixed(2)}`}
          sub="Revenue minus costs" icon={(profitLoss?.profit ?? 0) >= 0 ? TrendingUp : TrendingDown}
          color={(profitLoss?.profit ?? 0) >= 0 ? "#22c55e" : "#ef4444"}
          positive={(profitLoss?.profit ?? 0) >= 0} />
        <StatCard label="This Month" value={`$${(summary?.grandTotal || 0).toFixed(2)}`}
          sub={summary?.month || "—"} icon={BarChart3} color="#7c3aed" />
      </div>

      {/* Two column — API costs + top modules */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>

        {/* API Cost Breakdown */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px 20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "16px" }}>API Cost Breakdown</h2>
          {loading ? (
            <Loader2 size={20} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <>
              <MiniBar label="OpenAI" value={apiCosts?.totalOpenAI || 0} max={maxApiCost} color="#22c55e" />
              <MiniBar label="Seedance (Atlas)" value={apiCosts?.totalSeedance || 0} max={maxApiCost} color="#7c3aed" />
              <MiniBar label="Atlas Cloud" value={apiCosts?.totalAtlas || 0} max={maxApiCost} color="#f59e0b" />
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>Total</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>${(apiCosts?.totalAmount || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Top modules by revenue */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px 20px" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "16px" }}>Revenue by Module</h2>
          {loading ? (
            <Loader2 size={20} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
          ) : !summary?.byModule?.length ? (
            <p style={{ fontSize: "13px", color: colors.textMuted }}>No revenue data yet</p>
          ) : (
            <>
              {summary.byModule.map((m: any, i: number) => (
                <MiniBar key={i} label={m.moduleName} value={m.total}
                  max={summary.byModule[0]?.total || 1} color="#a78bfa" />
              ))}
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>Total</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#22c55e" }}>${(summary?.grandTotal || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent transactions table */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>Recent Transactions</h2>
        </div>

        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 100px 80px 100px 100px",
          gap: "10px", padding: "10px 18px",
          background: colors.bg, borderBottom: `1px solid ${colors.border}`,
        }}>
          {["Description", "User", "Module", "Type", "Amount", "Status"].map((h) => (
            <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>{h}</span>
          ))}
        </div>

        {records.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ fontSize: "13px", color: colors.textMuted }}>No transactions found for this period</p>
          </div>
        ) : (
          records.map((r, i) => (
            <div key={r._id} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 100px 80px 100px 100px",
              gap: "10px", padding: "12px 18px", alignItems: "center",
              borderBottom: i < records.length - 1 ? `1px solid ${colors.border}` : "none",
            }}>
              <div>
                <p style={{ fontSize: "13px", color: colors.text, fontWeight: 500 }}>{r.description}</p>
                <p style={{ fontSize: "11px", color: colors.textMuted }}>
                  {new Date(r.billingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>
                {(r.userId as any)?.name || "—"}
              </p>
              <p style={{ fontSize: "12px", color: colors.textMuted }}>{r.moduleName}</p>
              <span style={{
                fontSize: "11px", fontWeight: 600, padding: "3px 7px", borderRadius: "6px",
                background: "rgba(124,58,237,0.08)", color: "#a78bfa",
                display: "inline-block", textTransform: "capitalize",
              }}>
                {r.type}
              </span>
              <p style={{ fontSize: "13px", fontWeight: 700, color: r.type === "refund" ? "#22c55e" : colors.text }}>
                {r.type === "refund" ? "+" : ""}${r.amount.toFixed(2)}
              </p>
              <span style={{
                fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px",
                background: (r.status === "paid" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)"),
                color: (r.status === "paid" ? "#22c55e" : "#f59e0b"),
                display: "inline-block",
              }}>
                {r.status}
              </span>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: `1px solid ${colors.border}` }}>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @media (max-width: 900px) {
          .two-col { grid-template-columns: 1fr !important; }
          .four-col { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}