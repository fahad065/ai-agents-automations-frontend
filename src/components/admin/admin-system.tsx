"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Server, DollarSign, Activity,
  Clock, Zap, CheckCircle2, Loader2,
} from "lucide-react";

interface SystemStats {
  totalAtlasCost: number;
  weeklyPipelines: number;
  avgCostPerVideo: number;
  systemVersion: string;
  nodeVersion: string;
  uptime: number;
}

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  const { colors } = useTheme();
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "12px 0",
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <p style={{ fontSize: "13px", color: colors.textMuted }}>{label}</p>
      <p style={{ fontSize: "13px", fontWeight: 500, color: color || colors.text }}>
        {value}
      </p>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function AdminSystem() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/system")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <Loader2 size={28} color="#7c3aed"
          style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
          System Settings
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          Platform health, costs, and configuration.
        </p>
      </div>

      {/* Cost overview */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px", marginBottom: "24px",
      }}>
        {[
          {
            icon: DollarSign, color: "#f59e0b",
            label: "Total Atlas cost",
            value: `$${(stats?.totalAtlasCost || 0).toFixed(2)}`,
          },
          {
            icon: Activity, color: "#7c3aed",
            label: "Runs this week",
            value: String(stats?.weeklyPipelines || 0),
          },
          {
            icon: Zap, color: "#22c55e",
            label: "Avg cost per video",
            value: `$${(stats?.avgCostPerVideo || 0).toFixed(2)}`,
          },
        ].map((card) => {
          const IconComponent = card.icon;
          return (
            <div key={card.label} style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px", padding: "20px",
            }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: `${card.color}15`,
                border: `1px solid ${card.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "12px",
              }}>
                <IconComponent size={16} color={card.color} />
              </div>
              <p style={{ fontSize: "22px", fontWeight: 700, color: colors.text }}>
                {card.value}
              </p>
              <p style={{ fontSize: "12px", color: colors.textMuted, marginTop: "4px" }}>
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* System info */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px", padding: "20px",
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <Server size={15} color="#a78bfa" />
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
            System info
          </h2>
        </div>
        <div>
          <InfoRow label="Platform version" value={stats?.systemVersion || "1.0.0"} />
          <InfoRow label="Node.js version" value={stats?.nodeVersion || "—"} />
          <InfoRow label="Server uptime" value={formatUptime(stats?.uptime || 0)} color="#22c55e" />
          <InfoRow label="Environment" value={process.env.NODE_ENV || "development"} />
        </div>
      </div>

      {/* Status */}
      <div style={{
        background: "rgba(34,197,94,0.05)",
        border: "1px solid rgba(34,197,94,0.2)",
        borderRadius: "12px", padding: "16px",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <CheckCircle2 size={18} color="#22c55e" />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>
            All systems operational
          </p>
          <p style={{ fontSize: "12px", color: colors.textMuted }}>
            NestJS API · MongoDB Atlas · Python pipeline
          </p>
        </div>
      </div>
    </div>
  );
}