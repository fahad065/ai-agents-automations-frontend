"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Users, Bot, Video, TrendingUp,
  CheckCircle2, XCircle, Loader2,
  Activity, DollarSign, Zap,
} from "lucide-react";

interface OverviewData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    totalAgents: number;
    activeAgents: number;
    totalVideos: number;
    uploadedVideos: number;
    totalPipelines: number;
    failedPipelines: number;
    successRate: number;
  };
  charts: {
    videosByDay: { _id: string; count: number }[];
    usersByDay: { _id: string; count: number }[];
  };
}

function StatCard({
  label, value, sub, icon: Icon, color, loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  color: string;
  loading?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: "12px", padding: "20px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "12px",
      }}>
        <p style={{ fontSize: "13px", color: colors.textMuted }}>{label}</p>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          background: `${color}15`,
          border: `1px solid ${color}20`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={15} color={color} />
        </div>
      </div>
      {loading ? (
        <div style={{
          height: "32px", width: "80px", borderRadius: "6px",
          background: colors.bgSecondary, animation: "pulse 1.5s infinite",
        }} />
      ) : (
        <p style={{
          fontSize: "28px", fontWeight: 700,
          color: colors.text, lineHeight: 1,
        }}>
          {value}
        </p>
      )}
      {sub && !loading && (
        <p style={{ fontSize: "12px", color: colors.textMuted, marginTop: "6px" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function MiniChart({
  data, color, label,
}: {
  data: { _id: string; count: number }[];
  color: string;
  label: string;
}) {
  const { colors } = useTheme();
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const last7 = data.slice(-14);

  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: "12px", padding: "20px",
    }}>
      <p style={{
        fontSize: "14px", fontWeight: 600,
        color: colors.text, marginBottom: "16px",
      }}>
        {label}
      </p>
      <div style={{
        display: "flex", alignItems: "flex-end",
        gap: "4px", height: "80px",
      }}>
        {last7.map((d) => (
          <div key={d._id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div
              title={`${d._id}: ${d.count}`}
              style={{
                width: "100%",
                height: `${Math.max(4, (d.count / max) * 72)}px`,
                background: color,
                borderRadius: "3px",
                opacity: 0.8,
                transition: "height 0.3s",
              }}
            />
            <span style={{
              fontSize: "9px", color: colors.textMuted,
              transform: "rotate(-45deg)",
              transformOrigin: "center",
              display: "block",
              whiteSpace: "nowrap",
            }}>
              {d._id.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminOverview() {
  const { colors } = useTheme();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/overview")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
          Admin Overview
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          Platform health and key metrics at a glance.
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px", marginBottom: "24px",
      }}>
        <StatCard label="Total users" value={s?.totalUsers ?? 0}
          sub={`+${s?.newUsersThisMonth ?? 0} this month`}
          icon={Users} color="#7c3aed" loading={loading} />
        <StatCard label="Active users" value={s?.activeUsers ?? 0}
          sub="With active account"
          icon={TrendingUp} color="#22c55e" loading={loading} />
        <StatCard label="Total agents" value={s?.totalAgents ?? 0}
          sub={`${s?.activeAgents ?? 0} active`}
          icon={Bot} color="#3b82f6" loading={loading} />
        <StatCard label="Videos generated" value={s?.uploadedVideos ?? 0}
          sub={`${s?.successRate ?? 0}% success rate`}
          icon={Video} color="#f59e0b" loading={loading} />
        <StatCard label="Total pipelines" value={s?.totalPipelines ?? 0}
          sub={`${s?.failedPipelines ?? 0} failed`}
          icon={Activity} color="#ec4899" loading={loading} />
        <StatCard label="Success rate" value={`${s?.successRate ?? 0}%`}
          sub="Pipeline completion"
          icon={CheckCircle2} color="#22c55e" loading={loading} />
      </div>

      {/* Charts */}
      {data?.charts && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          <MiniChart
            data={data.charts.videosByDay}
            color="#7c3aed"
            label="Videos uploaded (last 30 days)"
          />
          <MiniChart
            data={data.charts.usersByDay}
            color="#22c55e"
            label="New signups (last 30 days)"
          />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}