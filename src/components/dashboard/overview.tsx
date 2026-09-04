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
  CreditCard, Activity, Video, DollarSign, Key, Building2, MessageCircle,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { TrialBanner } from "./trial-banner";

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
    completed:        { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Complete" },
    paid:             { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Paid" },
    uploaded:         { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Uploaded" },
    running:          { color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Running" },
    generating_clips: { color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Generating" },
    trial:            { color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Trial" },
    draft:            { color: "#7c3aed", bg: "rgba(124,58,237,0.1)",  label: "Draft" },
    pending:          { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Pending" },
    paused:           { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Paused" },
    inactive:         { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Inactive" },
    failed:           { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Failed" },
    cancelled:        { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Cancelled" },
    expired:          { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Expired" },
  };
  const s = map[status] || { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: status };
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600, padding: "3px 8px",
      borderRadius: "9999px", background: s.bg, color: s.color, whiteSpace: "nowrap",
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

// ── Bar Chart ─────────────────────────────────────────────────
function BarChart({ data, color, label }: {
  data: { _id: string; count: number }[];
  color: string; label: string;
}) {
  const { colors } = useTheme();
  if (!data?.length) return (
    <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "20px" }}>
      <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "16px" }}>{label}</p>
      <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "13px", color: colors.textMuted }}>No data yet</p>
      </div>
    </div>
  );
  const max = Math.max(...data.map(d => d.count), 1);
  const last14 = data.slice(-14);
  return (
    <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>{label}</p>
        <p style={{ fontSize: "12px", color: colors.textMuted }}>
          Total: {data.reduce((s, d) => s + d.count, 0)}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px" }}>
        {last14.map(d => (
          <div key={d._id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div
              title={`${d._id}: ${d.count}`}
              style={{
                width: "100%", height: `${Math.max(4, (d.count / max) * 72)}px`,
                background: color, borderRadius: "3px", opacity: 0.85, transition: "height 0.3s",
              }}
            />
            <span style={{ fontSize: "9px", color: colors.textMuted, transform: "rotate(-45deg)", transformOrigin: "center", display: "block", whiteSpace: "nowrap" }}>
              {d._id.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SubscribedItem {
  key: string; name: string; type: "industry" | "agent" | "automation" | "chatbot";
  status: string; href: string;
}

// ── Main Component ────────────────────────────────────────────
export function DashboardOverview() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === "admin";
  const isVerified = !!user?.isEmailVerified;

  const [loading, setLoading] = useState(true);

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0,
    trialUsers: 0, freeForeverUsers: 0,
    totalAgents: 0, activeAgents: 0,
    uploadedVideos: 0, totalPipelines: 0,
    failedPipelines: 0, successRate: 0, totalApiCost: 0,
  });

  const [adminCharts, setAdminCharts] = useState<{
    videosByDay: { _id: string; count: number }[];
    usersByDay: { _id: string; count: number }[];
  }>({ videosByDay: [], usersByDay: [] });

  const [userStats, setUserStats] = useState({
    totalAgents: 0, totalAutomations: 0, totalChatbots: 0, totalIndustries: 0,
    totalApiKeys: 0, totalBilled: 0, totalRuns: 0,
  });
  const [subscribedItems, setSubscribedItems] = useState<SubscribedItem[]>([]);
  const [recentBilling, setRecentBilling] = useState<any[]>([]);

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
        const res = await api.get("/admin/overview").catch(() => ({ data: null }));
        const overview = res.data;
        if (overview?.stats) {
          setAdminStats({
            totalUsers: overview.stats.totalUsers || 0,
            activeUsers: overview.stats.activeUsers || 0,
            newUsersThisMonth: overview.stats.newUsersThisMonth || 0,
            trialUsers: overview.stats.trialUsers || 0,
            freeForeverUsers: overview.stats.freeForeverUsers || 0,
            totalAgents: overview.stats.totalAgents || 0,
            activeAgents: overview.stats.activeAgents || 0,
            uploadedVideos: overview.stats.uploadedVideos || 0,
            totalPipelines: overview.stats.totalPipelines || 0,
            failedPipelines: overview.stats.failedPipelines || 0,
            successRate: overview.stats.successRate || 0,
            totalApiCost: overview.stats.totalApiCost || 0,
          });
          setAdminCharts({
            videosByDay: overview.charts?.videosByDay || [],
            usersByDay: overview.charts?.usersByDay || [],
          });
          setChartData({ agents: overview.stats.totalAgents || 0, automations: 0 });
        }
      } else {
        const [agentsRes, automationsRes, chatbotsRes, apiKeysRes, industriesRes, billRes, runsRes, recentBillRes] = await Promise.all([
          api.get("/usermodules/my?moduleType=agent").catch(() => ({ data: { data: [], total: 0 } })),
          api.get("/usermodules/my?moduleType=automation").catch(() => ({ data: { data: [], total: 0 } })),
          api.get("/chatbots").catch(() => ({ data: [] })),
          api.get("/api-keys").catch(() => ({ data: [] })),
          api.get("/industry-subscriptions").catch(() => ({ data: [] })),
          api.get("/usermodules/billing-summary").catch(() => ({ data: { total: 0, byModule: [] } })),
          api.get("/pipeline-runs?limit=1").catch(() => ({ data: { total: 0 } })),
          api.get("/billing?limit=5").catch(() => ({ data: { data: [] } })),
        ]);

        const agents = agentsRes.data?.data || [];
        const automations = automationsRes.data?.data || [];
        const chatbots = Array.isArray(chatbotsRes.data) ? chatbotsRes.data : [];
        const apiKeys = Array.isArray(apiKeysRes.data) ? apiKeysRes.data : [];
        const industries = Array.isArray(industriesRes.data) ? industriesRes.data : [];
        const billing = billRes.data || {};

        setUserStats({
          totalAgents: agents.length,
          totalAutomations: automations.length,
          totalChatbots: chatbots.length,
          totalIndustries: industries.length,
          totalApiKeys: apiKeys.length,
          totalBilled: billing.total || 0,
          totalRuns: runsRes.data?.total || 0,
        });
        setChartData({ agents: agents.length, automations: automations.length });
        setRecentBilling(recentBillRes.data?.data || []);

        const items: SubscribedItem[] = [
          ...industries.map((i: any) => ({
            key: `industry-${i._id}`, name: i.industryName || i.industrySlug || "Industry",
            type: "industry" as const, status: i.status || "active", href: "/dashboard/industries",
          })),
          ...agents.map((a: any) => ({
            key: `agent-${a._id}`, name: a.name || a.moduleName, type: "agent" as const,
            status: a.status || "active", href: "/dashboard/modules",
          })),
          ...automations.map((a: any) => ({
            key: `auto-${a._id}`, name: a.name || a.moduleName, type: "automation" as const,
            status: a.status || "active", href: "/dashboard/modules",
          })),
          ...chatbots.map((c: any) => ({
            key: `bot-${c._id}`, name: c.name, type: "chatbot" as const,
            status: c.status || "draft", href: `/dashboard/chatbots/${c._id}`,
          })),
        ];
        setSubscribedItems(items);
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
      const isArray = Array.isArray(res.data);
      setTableData(isArray ? res.data : (res.data?.data || []));
      setTableTotal(isArray ? res.data.length : (res.data?.total || 0));
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
  const daypart = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";
  const totalSubscribed = userStats.totalIndustries + userStats.totalAgents + userStats.totalAutomations + userStats.totalChatbots;

  const inputStyle = {
    padding: "7px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  const TYPE_META: Record<SubscribedItem["type"], { label: string; color: string; icon: any }> = {
    industry: { label: "Industry", color: "#3b82f6", icon: Building2 },
    agent: { label: "Agent", color: "#7c3aed", icon: Bot },
    automation: { label: "Automation", color: "#22c55e", icon: Zap },
    chatbot: { label: "Chatbot", color: "#ec4899", icon: MessageCircle },
  };

  return (
    <div>
      <TrialBanner />

      {/* ── ONBOARDING / WELCOME CARD — shown until email is verified ── */}
      {!isAdmin && !loading && !isVerified && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-primary/[0.03] to-transparent">
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">🚀</div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {daypart}, {firstName}. Welcome to LogicMate!
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI agents, automations and chatbots — all running on your own API keys.
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {[
                { step: 1, title: "Add your API keys", desc: "OpenAI and Atlas Cloud keys are required to run any pipeline", href: "/dashboard/api-keys", cta: "Add keys", color: "#f59e0b" },
                { step: 2, title: "Choose a module", desc: "Browse agents, automations and chatbots in the marketplace", href: "/dashboard/modules", cta: "Browse marketplace", color: "#7c3aed" },
                { step: 3, title: "Run your first pipeline", desc: "Click ‘Configure & Run’ — results delivered automatically", href: "/dashboard/modules", cta: "Get started", color: "#22c55e" },
              ].map((item) => (
                <div key={item.step} className="flex flex-col rounded-xl border bg-card p-4">
                  <div
                    className="mb-3 flex size-7 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30`, color: item.color }}
                  >
                    {item.step}
                  </div>
                  <p className="mb-1 text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
                  <Link href={item.href} className="text-xs font-semibold no-underline" style={{ color: item.color }}>
                    {item.cta} →
                  </Link>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { emoji: "🤖", text: "AI agents & automations" },
                { emoji: "💬", text: "Ready-made chatbots" },
                { emoji: "🔄", text: "Runs on your schedule" },
                { emoji: "💰", text: "Bring your own API keys" },
                { emoji: "📧", text: "Email notifications" },
                { emoji: "🆓", text: "30-day free trial" },
              ].map((item) => (
                <span key={item.text} className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground">
                  <span>{item.emoji}</span>{item.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GREETING ── */}
      <div style={{ marginBottom: "24px" }}>
        {isAdmin ? (
          <>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
              {daypart}, {firstName} 👋
            </h1>
            <p style={{ fontSize: "14px", color: colors.textMuted }}>
              Platform overview — all users, agents and pipelines.
            </p>
          </>
        ) : isVerified ? (
          <>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
              {daypart}, {firstName}. Welcome back!
            </h1>
            <p style={{ fontSize: "14px", color: colors.textMuted }}>
              Here&apos;s your account overview.
            </p>
          </>
        ) : (
          <p style={{ fontSize: "14px", color: colors.textMuted }}>
            Your stats below update as soon as you add a module.
          </p>
        )}
      </div>

      {/* ── ADMIN STATS ── */}
      {isAdmin && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "16px" }}>
            <StatCard label="Total Users" value={loading ? "—" : adminStats.totalUsers}
              sub={`+${adminStats.newUsersThisMonth} this month`}
              icon={Users} color="#3b82f6" loading={loading}
              onClick={() => router.push("/dashboard/users")} />
            <StatCard label="Active Users" value={loading ? "—" : adminStats.activeUsers}
              sub="With active account"
              icon={Activity} color="#22c55e" loading={loading} />
            <StatCard label="Trial Users" value={loading ? "—" : adminStats.trialUsers}
              sub={`${adminStats.freeForeverUsers} free forever`}
              icon={Package} color="#f59e0b" loading={loading} />
            <StatCard label="Total Agents" value={loading ? "—" : adminStats.totalAgents}
              sub={`${adminStats.activeAgents} active`}
              icon={Bot} color="#7c3aed" loading={loading}
              onClick={() => router.push("/dashboard/subscriptions")} />
            <StatCard label="Videos Generated" value={loading ? "—" : adminStats.uploadedVideos}
              sub={`${adminStats.successRate}% success rate`}
              icon={Video} color="#ec4899" loading={loading}
              onClick={() => router.push("/dashboard/pipeline-logs")} />
            <StatCard label="Pipeline Runs" value={loading ? "—" : adminStats.totalPipelines}
              sub={`${adminStats.failedPipelines} failed`}
              icon={TrendingUp} color="#a78bfa" loading={loading}
              onClick={() => router.push("/dashboard/pipeline-logs")} />
            <StatCard label="Total API Cost" value={loading ? "—" : `$${adminStats.totalApiCost?.toFixed(2)}`}
              sub="All users combined"
              icon={DollarSign} color="#f59e0b" loading={loading} />
          </div>

          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              <BarChart data={adminCharts.videosByDay} color="#7c3aed" label="Videos uploaded (last 30 days)" />
              <BarChart data={adminCharts.usersByDay} color="#22c55e" label="New signups (last 30 days)" />
            </div>
          )}
        </>
      )}

      {/* ── USER STATS ── */}
      {!isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          <StatCard
            label="Total Billed"
            value={loading ? "—" : `$${userStats.totalBilled.toFixed(2)}`}
            sub="Across all services"
            icon={DollarSign} color="#f59e0b" loading={loading}
            onClick={() => router.push("/dashboard/billing")} />
          <StatCard
            label="Subscribed Modules"
            value={loading ? "—" : totalSubscribed}
            sub={loading ? undefined : `Industries: ${userStats.totalIndustries} · Agents: ${userStats.totalAgents} · Automations: ${userStats.totalAutomations} · Chatbots: ${userStats.totalChatbots}`}
            icon={Package} color="#7c3aed" loading={loading}
            onClick={() => router.push("/dashboard/modules")} />
          <StatCard
            label="API Keys"
            value={loading ? "—" : userStats.totalApiKeys}
            sub="Connected providers"
            icon={Key} color="#3b82f6" loading={loading}
            onClick={() => router.push("/dashboard/api-keys")} />
          <StatCard
            label="Chatbots"
            value={loading ? "—" : userStats.totalChatbots}
            sub="Live & draft bots"
            icon={MessageCircle} color="#ec4899" loading={loading}
            onClick={() => router.push("/dashboard/chatbots")} />
          <StatCard
            label="Pipeline Runs"
            value={loading ? "—" : userStats.totalRuns}
            sub="Total runs"
            icon={TrendingUp} color="#22c55e" loading={loading}
            onClick={() => router.push("/dashboard/pipeline-logs")} />
        </div>
      )}

      {/* ── TWO COLUMN LAYOUT ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "24px", alignItems: "start" }}>

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
                <option value="instagram">Instagram</option>
                <option value="podcast">Podcast</option>
                <option value="marketing">Marketing</option>
              </select>
              <Link href="/dashboard/pipeline-logs" style={{ fontSize: "12px", color: "#a78bfa", textDecoration: "none", whiteSpace: "nowrap" }}>
                View all →
              </Link>
            </div>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 90px 80px",
            gap: "10px", padding: "10px 18px",
            background: colors.bg, borderBottom: `1px solid ${colors.border}`,
          }}>
            {["Title / Niche", "Status", "Actions"].map((h) => (
              <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>{h}</span>
            ))}
          </div>

          {tableData.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              <FileText size={28} color={colors.textMuted} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
                {!isAdmin && totalSubscribed === 0 ? "No modules added yet" : "No pipeline runs yet"}
              </p>
              <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "16px" }}>
                {!isAdmin && totalSubscribed === 0
                  ? "Add a module and run your first pipeline to see results here"
                  : "Your first video will appear here after the pipeline runs"}
              </p>
              {!isAdmin && totalSubscribed === 0 && (
                <Link href="/dashboard/modules" style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "9px 18px", borderRadius: "8px",
                  background: "#7c3aed", color: "white",
                  textDecoration: "none", fontSize: "13px", fontWeight: 600,
                }}>
                  Browse marketplace →
                </Link>
              )}
              {!isAdmin && totalSubscribed > 0 && (
                <Link href="/dashboard/modules" style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "9px 18px", borderRadius: "8px",
                  border: `1px solid ${colors.border}`, background: colors.bgCard,
                  color: colors.textMuted, textDecoration: "none", fontSize: "13px",
                }}>
                  Go to my modules →
                </Link>
              )}
            </div>
          ) : (
            tableData.map((run, i) => (
              <div key={run._id} style={{
                display: "grid", gridTemplateColumns: "1fr 90px 80px",
                gap: "10px", padding: "12px 18px", alignItems: "center",
                borderBottom: i < tableData.length - 1 ? `1px solid ${colors.border}` : "none",
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "2px 6px",
                      borderRadius: "4px", background: "rgba(124,58,237,0.08)",
                      color: "#a78bfa", flexShrink: 0,
                    }}>
                      {run.moduleType || "youtube"}
                    </span>
                  </div>
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

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {isAdmin ? (
            <>
              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
                  <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>Modules Breakdown</h2>
                </div>
                <DonutChart agents={chartData.agents} automations={chartData.automations} colors={colors} />
              </div>
              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
                  <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>Cost Summary</h2>
                </div>
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { label: "Total API Cost", value: `$${adminStats.totalApiCost?.toFixed(2)}`, color: "#f59e0b" },
                    { label: "Success Rate", value: `${adminStats.successRate}%`, color: "#22c55e" },
                    { label: "Failed Pipelines", value: adminStats.failedPipelines, color: "#ef4444" },
                    { label: "Videos Generated", value: adminStats.uploadedVideos, color: "#7c3aed" },
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: colors.textMuted }}>{item.label}</span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Recent Billing */}
              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
                  <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>Recent Billing</h2>
                  <Link href="/dashboard/billing" style={{ fontSize: "12px", color: "#a78bfa", textDecoration: "none" }}>
                    View all →
                  </Link>
                </div>
                {recentBilling.length === 0 ? (
                  <div style={{ padding: "32px 18px", textAlign: "center" }}>
                    <CreditCard size={22} color={colors.textMuted} style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: "13px", color: colors.textMuted }}>No billing activity yet</p>
                  </div>
                ) : (
                  <div>
                    {recentBilling.map((b, i) => (
                      <div key={b._id} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
                        padding: "12px 18px",
                        borderBottom: i < recentBilling.length - 1 ? `1px solid ${colors.border}` : "none",
                      }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {b.moduleName || b.description || "Charge"}
                          </p>
                          <p style={{ fontSize: "11px", color: colors.textMuted }}>
                            {new Date(b.billingDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: colors.text }}>${(b.amount || 0).toFixed(2)}</span>
                          <StatusBadge status={b.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subscribed Modules */}
              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${colors.border}` }}>
                  <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>Subscribed Modules</h2>
                  <Link href="/dashboard/modules" style={{ fontSize: "12px", color: "#a78bfa", textDecoration: "none" }}>
                    View all →
                  </Link>
                </div>
                {subscribedItems.length === 0 ? (
                  <div style={{ padding: "32px 18px", textAlign: "center" }}>
                    <Package size={22} color={colors.textMuted} style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "12px" }}>Nothing subscribed yet</p>
                    <Link href="/dashboard/modules" style={{
                      display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px",
                      borderRadius: "7px", background: "#7c3aed", color: "white",
                      textDecoration: "none", fontSize: "12px", fontWeight: 600,
                    }}>
                      Browse marketplace →
                    </Link>
                  </div>
                ) : (
                  <div>
                    {subscribedItems.slice(0, 8).map((item, i, arr) => {
                      const meta = TYPE_META[item.type];
                      const Icon = meta.icon;
                      return (
                        <Link key={item.key} href={item.href} style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "11px 18px", textDecoration: "none",
                          borderBottom: i < arr.length - 1 ? `1px solid ${colors.border}` : "none",
                        }}>
                          <div style={{
                            width: "30px", height: "30px", borderRadius: "8px", flexShrink: 0,
                            background: `${meta.color}15`, border: `1px solid ${meta.color}25`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Icon size={14} color={meta.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.name}
                            </p>
                            <p style={{ fontSize: "11px", color: meta.color }}>{meta.label}</p>
                          </div>
                          <StatusBadge status={item.status} />
                        </Link>
                      );
                    })}
                    {subscribedItems.length > 8 && (
                      <div style={{ padding: "10px 18px", textAlign: "center", borderTop: `1px solid ${colors.border}` }}>
                        <Link href="/dashboard/modules" style={{ fontSize: "12px", color: "#a78bfa", textDecoration: "none" }}>
                          +{subscribedItems.length - 8} more →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
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
