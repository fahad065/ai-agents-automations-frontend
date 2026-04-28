"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  Bot, Zap, Users, Package, TrendingUp,
  Eye, Trash2, FileText,
  ChevronLeft, ChevronRight,
  CreditCard,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, onClick, loading }: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string; onClick?: () => void; loading?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "12px", padding: "20px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`; }}
      onMouseLeave={(e) => { if (onClick) (e.currentTarget as HTMLDivElement).style.borderColor = colors.border; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <p style={{ fontSize: "13px", color: colors.textMuted, fontWeight: 500 }}>{label}</p>
        <div style={{
          width: "36px", height: "36px", borderRadius: "9px",
          background: `${color}15`, border: `1px solid ${color}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={17} color={color} />
        </div>
      </div>
      {loading ? (
        <div style={{ height: "32px", background: colors.border, borderRadius: "6px", width: "50%", animation: "pulse 1.5s ease infinite" }} />
      ) : (
        <p style={{ fontSize: "26px", fontWeight: 700, color: colors.text, lineHeight: 1, marginBottom: "6px" }}>{value}</p>
      )}
      {sub && <p style={{ fontSize: "12px", color: colors.textMuted }}>{sub}</p>}
      {onClick && <p style={{ fontSize: "11px", color: color, marginTop: "6px" }}>Click to view details →</p>}
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    active:           { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Active" },
    complete:         { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Complete" },
    uploaded:         { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Uploaded" },
    running:          { color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Running" },
    generating_clips: { color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Generating" },
    pending:          { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Pending" },
    paused:           { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Paused" },
    failed:           { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Failed" },
    cancelled:        { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Cancelled" },
  };
  const s = map[status] || { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: status };
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600, padding: "3px 8px",
      borderRadius: "9999px", background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

// ── Donut Chart ───────────────────────────────────────────────
function DonutChart({ agents, automations, colors }: { agents: number; automations: number; colors: any }) {
  const total = agents + automations || 1;
  const agentPct = (agents / total) * 100;
  const automationPct = (automations / total) * 100;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const agentDash = (agentPct / 100) * circ;
  const automationDash = (automationPct / 100) * circ;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px", justifyContent: "center", padding: "16px 0" }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke={colors.border} strokeWidth="14" />
        <circle cx="65" cy="65" r={r} fill="none" stroke="#7c3aed" strokeWidth="14"
          strokeDasharray={`${agentDash} ${circ - agentDash}`}
          strokeDashoffset={circ / 4} strokeLinecap="round" />
        <circle cx="65" cy="65" r={r} fill="none" stroke="#22c55e" strokeWidth="14"
          strokeDasharray={`${automationDash} ${circ - automationDash}`}
          strokeDashoffset={circ / 4 - agentDash} strokeLinecap="round" />
        <text x="65" y="60" textAnchor="middle" fontSize="20" fontWeight="700" fill={colors.text}>{agents + automations}</text>
        <text x="65" y="78" textAnchor="middle" fontSize="11" fill={colors.textMuted}>total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#7c3aed" }} />
          <span style={{ fontSize: "13px", color: colors.textMuted }}>Agents</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: colors.text, marginLeft: "auto" }}>{agents}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e" }} />
          <span style={{ fontSize: "13px", color: colors.textMuted }}>Automations</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: colors.text, marginLeft: "auto" }}>{automations}</span>
        </div>
        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: colors.border }} />
          <span style={{ fontSize: "12px", color: colors.textMuted }}>Usage</span>
          <span style={{ fontSize: "12px", color: colors.textMuted, marginLeft: "auto" }}>{Math.round(agentPct)}% / {Math.round(automationPct)}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export function DashboardOverview() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  const [loading, setLoading] = useState(true);

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0, totalAgents: 0, activeAgents: 0,
    totalAutomations: 0, activeAutomations: 0,
  });

  const [userStats, setUserStats] = useState({
    totalSubscribed: 0, totalAgents: 0, totalAutomations: 0, totalBilled: 0,
    billingByModule: [] as { name: string; amount: number }[],
  });

  const [tableData, setTableData] = useState<any[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [tablePage, setTablePage] = useState(1);
  const [tableType, setTableType] = useState("all");
  const tableLimit = 5;

  const [chartData, setChartData] = useState({ agents: 0, automations: 0 });

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchTable(); }, [tablePage, tableType]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [agentsRes, automationsRes, usersRes] = await Promise.all([
          api.get("/usermodules?moduleType=agent&limit=1").catch(() => ({ data: { total: 0 } })),
          api.get("/usermodules?moduleType=automation&limit=1").catch(() => ({ data: { total: 0 } })),
          api.get("/users?limit=1").catch(() => ({ data: { total: 0 } })),
        ]);
      
        const totalAgents = agentsRes.data?.total || 0;
        const totalAutomations = automationsRes.data?.total || 0;
      
        setAdminStats({
          totalUsers: usersRes.data?.total || 0,
          totalAgents,
          activeAgents: totalAgents,
          totalAutomations,
          activeAutomations: totalAutomations,
        });
        setChartData({ agents: totalAgents, automations: totalAutomations });
      } else {
        // ── User: fetch own usermodules + billing summary ─────
        const [agentsRes, automationsRes, billRes] = await Promise.all([
          api.get("/usermodules/my?moduleType=agent").catch(() => ({ data: { data: [], total: 0 } })),
          api.get("/usermodules/my?moduleType=automation").catch(() => ({ data: { data: [], total: 0 } })),
          api.get("/usermodules/billing-summary").catch(() => ({ data: { total: 0, byModule: [] } })),
        ]);

        const agents = agentsRes.data?.data || [];
        const automations = automationsRes.data?.data || [];
        const billing = billRes.data || {};

        setUserStats({
          totalSubscribed: agents.length + automations.length,
          totalAgents: agents.length,
          totalAutomations: automations.length,
          totalBilled: billing.total || 0,
          billingByModule: (billing.byModule || []).map((m: any) => ({
            name: m.name || m.moduleName,
            amount: m.amount || m.billingAmount || 0,
          })),
        });
        setChartData({ agents: agents.length, automations: automations.length });
      }
    } catch {}
    setLoading(false);
  };

  const fetchTable = async () => {
    try {
      const params = new URLSearchParams({
        page: tablePage.toString(),
        limit: tableLimit.toString(),
        ...(tableType !== "all" && { moduleType: tableType }),
      });
      const res = await api.get(`/pipeline-runs?${params}`);
      setTableData(res.data?.data || []);
      setTableTotal(res.data?.total || 0);
    } catch {}
  };

  const deleteRun = async (runId: string) => {
    if (!confirm("Delete this pipeline run?")) return;
    try {
      await api.delete(`/pipeline-runs/${runId}`);
      fetchTable();
    } catch {}
  };

  const totalTablePages = Math.ceil(tableTotal / tableLimit);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const inputStyle = {
    padding: "7px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "21px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
          {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          {isAdmin ? "Platform overview — all users, agents and pipelines." : "Here's your account overview."}
        </p>
      </div>

      {/* ── ADMIN STATS ── */}
      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <StatCard label="Total Users" value={loading ? "—" : adminStats.totalUsers}
            sub="Registered accounts" icon={Users} color="#3b82f6" loading={loading}
            onClick={() => router.push("/dashboard/users")} />
          <StatCard
            label="Total Agents"
            value={loading ? "—" : `${adminStats.activeAgents}/${adminStats.totalAgents}`}
            sub={`${adminStats.activeAgents} active out of ${adminStats.totalAgents}`}
            icon={Bot} color="#7c3aed" loading={loading}
            onClick={() => router.push("/dashboard/subscriptions")} />
          <StatCard
            label="Total Automations"
            value={loading ? "—" : `${adminStats.activeAutomations}/${adminStats.totalAutomations}`}
            sub={`${adminStats.activeAutomations} active out of ${adminStats.totalAutomations}`}
            icon={Zap} color="#22c55e" loading={loading}
            onClick={() => router.push("/dashboard/subscriptions")} />
          <StatCard label="Pipeline Runs" value={loading ? "—" : tableTotal}
            sub="All types combined" icon={TrendingUp} color="#f59e0b" loading={loading}
            onClick={() => router.push("/dashboard/pipeline-logs")} />
        </div>
      )}

      {/* ── USER STATS ── */}
      {!isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <StatCard
            label="Subscribed Modules"
            value={loading ? "—" : userStats.totalSubscribed}
            sub={`${userStats.totalAgents} agents · ${userStats.totalAutomations} automations`}
            icon={Package} color="#7c3aed" loading={loading}
            onClick={() => router.push("/dashboard/modules")} />
          <StatCard
            label="Total Billed"
            value={loading ? "—" : `$${userStats.totalBilled.toFixed(2)}`}
            sub="Across all services"
            icon={CreditCard} color="#f59e0b" loading={loading}
            onClick={() => router.push("/dashboard/billing")} />
          <StatCard
            label="Agents"
            value={loading ? "—" : userStats.totalAgents}
            sub="Active agent modules"
            icon={Bot} color="#3b82f6" loading={loading} />
          <StatCard
            label="Automations"
            value={loading ? "—" : userStats.totalAutomations}
            sub="Active automations"
            icon={Zap} color="#22c55e" loading={loading} />
        </div>
      )}

      {/* ── TWO COLUMN LAYOUT ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "16px", marginBottom: "24px", alignItems: "start" }}>

        {/* Pipelines table */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 18px", borderBottom: `1px solid ${colors.border}`, flexWrap: "wrap", gap: "10px",
          }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
              {isAdmin ? "All Pipeline Runs" : "Recent Pipeline Runs"}
            </h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <select value={tableType} onChange={(e) => { setTableType(e.target.value); setTablePage(1); }} style={inputStyle}>
                <option value="all">All Types</option>
                <option value="youtube">YouTube</option>
                <option value="podcast">Podcast</option>
                <option value="marketing">Marketing</option>
              </select>
              <Link href="/dashboard/pipeline-logs" style={{ fontSize: "12px", color: "#a78bfa", textDecoration: "none", whiteSpace: "nowrap" }}>
                View all →
              </Link>
            </div>
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "40px 80px 1fr 90px 90px",
            gap: "10px", padding: "10px 18px",
            background: colors.bg, borderBottom: `1px solid ${colors.border}`,
          }}>
            {["S.No", "Type", "Title / Niche", "Status", "Actions"].map((h) => (
              <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>{h}</span>
            ))}
          </div>

          {/* Table rows */}
          {tableData.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <FileText size={28} color={colors.textMuted} style={{ margin: "0 auto 10px" }} />
              <p style={{ fontSize: "13px", color: colors.textMuted }}>No pipeline runs yet</p>
            </div>
          ) : (
            tableData.map((run, i) => (
              <div key={run._id} style={{
                display: "grid", gridTemplateColumns: "40px 80px 1fr 90px 90px",
                gap: "10px", padding: "12px 18px", alignItems: "center",
                borderBottom: i < tableData.length - 1 ? `1px solid ${colors.border}` : "none",
              }}>
                <span style={{ fontSize: "13px", color: colors.textMuted }}>
                  {(tablePage - 1) * tableLimit + i + 1}
                </span>
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 8px",
                  borderRadius: "6px", background: "rgba(124,58,237,0.08)",
                  color: "#a78bfa", display: "inline-block",
                }}>
                  {run.moduleType || "youtube"}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: colors.text, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {run.title || "Untitled"}
                  </p>
                  <p style={{ fontSize: "11px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {run.niche || run.runId?.slice(0, 14) + "..."}
                  </p>
                </div>
                <StatusBadge status={run.status} />
                <div style={{ display: "flex", gap: "5px" }}>
                  <Link href="/dashboard/pipeline-logs" title="View logs" style={{
                    width: "26px", height: "26px", borderRadius: "6px",
                    border: `1px solid ${colors.border}`, background: colors.bg,
                    color: colors.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none",
                  }}>
                    <Eye size={11} />
                  </Link>
                  {run.youtubeUrl && (
                    <a href={run.youtubeUrl} target="_blank" rel="noopener noreferrer" title="View on YouTube" style={{
                      width: "26px", height: "26px", borderRadius: "6px",
                      border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                      color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <FaYoutube size={11} />
                    </a>
                  )}
                  <button onClick={() => deleteRun(run.runId)} title="Delete" style={{
                    width: "26px", height: "26px", borderRadius: "6px", cursor: "pointer",
                    border: "1px solid rgba(239,68,68,0.15)", background: "transparent",
                    color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))
          )}

          {totalTablePages > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 18px", borderTop: `1px solid ${colors.border}`,
            }}>
              <span style={{ fontSize: "12px", color: colors.textMuted }}>
                {(tablePage - 1) * tableLimit + 1}–{Math.min(tablePage * tableLimit, tableTotal)} of {tableTotal}
              </span>
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1} style={{
                  width: "28px", height: "28px", borderRadius: "6px", cursor: tablePage === 1 ? "not-allowed" : "pointer",
                  border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.text,
                  display: "flex", alignItems: "center", justifyContent: "center", opacity: tablePage === 1 ? 0.5 : 1,
                }}>
                  <ChevronLeft size={13} />
                </button>
                <button onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))} disabled={tablePage === totalTablePages} style={{
                  width: "28px", height: "28px", borderRadius: "6px", cursor: tablePage === totalTablePages ? "not-allowed" : "pointer",
                  border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.text,
                  display: "flex", alignItems: "center", justifyContent: "center", opacity: tablePage === totalTablePages ? 0.5 : 1,
                }}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column — Donut chart */}
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
              {isAdmin ? "Modules Breakdown" : "My Modules Breakdown"}
            </h2>
          </div>
          <DonutChart agents={chartData.agents} automations={chartData.automations} colors={colors} />

          {!isAdmin && userStats.billingByModule.length > 0 && (
            <div style={{ padding: "0 16px 16px" }}>
              <p style={{ fontSize: "12px", fontWeight: 600, color: colors.textMuted, marginBottom: "10px" }}>
                Billing Breakdown
              </p>
              {userStats.billingByModule.map((b, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 0", borderBottom: i < userStats.billingByModule.length - 1 ? `1px solid ${colors.border}` : "none",
                }}>
                  <span style={{ fontSize: "12px", color: colors.textMuted }}>{b.name}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#f59e0b" }}>${b.amount.toFixed(2)}</span>
                </div>
              ))}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${colors.border}`,
              }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>Total</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b" }}>
                  ${userStats.totalBilled.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}