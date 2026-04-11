"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  Bot, Zap, Play, TrendingUp,
  ArrowRight, Clock, CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";

interface StatsData {
  totalAgents: number;
  activeAgents: number;
  totalVideos: number;
  totalCreditsUsed: number;
}

interface RecentVideo {
  _id: string;
  title: string;
  status: string;
  youtubeUrl?: string;
  createdAt: string;
  scheduledUploadTime?: string;
}

function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  sub?: string;
}) {
  const { colors } = useTheme();
  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: "12px", padding: "20px",
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: "12px",
      }}>
        <p style={{ fontSize: "13px", color: colors.textMuted }}>{label}</p>
        <div style={{
          width: "34px", height: "34px", borderRadius: "8px",
          background: `${color}15`,
          border: `1px solid ${color}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <p style={{
        fontSize: "28px", fontWeight: 700,
        color: colors.text, lineHeight: 1,
        marginBottom: sub ? "6px" : 0,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: "12px", color: colors.textMuted }}>{sub}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    uploaded: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "Uploaded" },
    uploading: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "Uploading" },
    video_queued: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Queued" },
    generating_clips: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", label: "Generating" },
    assembling_video: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)", label: "Assembling" },
    failed: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Failed" },
    script_ready: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Ready" },
    draft: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Draft" },
  };
  const s = map[status] || { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: status };
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600,
      padding: "3px 8px", borderRadius: "9999px",
      background: s.bg, color: s.color,
    }}>
      {s.label}
    </span>
  );
}

export function DashboardOverview() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StatsData>({
    totalAgents: 0, activeAgents: 0,
    totalVideos: 0, totalCreditsUsed: 0,
  });
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, videosRes] = await Promise.all([
          api.get("/agents"),
          api.get("/content-ideas/recent").catch(() => ({ data: [] })),
        ]);

        const agents = agentsRes.data || [];
        setStats({
          totalAgents: agents.length,
          activeAgents: agents.filter((a: any) => a.status === "active").length,
          totalVideos: agents.reduce((sum: number, a: any) => sum + (a.videosGenerated || 0), 0),
          totalCreditsUsed: agents.reduce((sum: number, a: any) => sum + (a.creditsUsed || 0), 0),
        });
        setRecentVideos((videosRes.data || []).slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{
          fontSize: "22px", fontWeight: 700,
          color: colors.text, marginBottom: "4px",
        }}>
          {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          Here&apos;s what&apos;s happening with your agents today.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px", marginBottom: "28px",
      }}>
        <StatCard
          label="Total agents"
          value={loading ? "—" : stats.totalAgents}
          icon={Bot} color="#7c3aed"
          sub={`${stats.activeAgents} active`}
        />
        <StatCard
          label="Videos generated"
          value={loading ? "—" : stats.totalVideos}
          icon={FaYoutube} color="#ef4444"
          sub="All time"
        />
        <StatCard
          label="Credits used"
          value={loading ? "—" : `$${stats.totalCreditsUsed.toFixed(2)}`}
          icon={Zap} color="#f59e0b"
          sub="Atlas Seedance"
        />
        <StatCard
          label="Pipeline runs"
          value={loading ? "—" : stats.totalVideos}
          icon={TrendingUp} color="#22c55e"
          sub="Successful runs"
        />
      </div>

      {/* Quick actions */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "12px", marginBottom: "28px",
      }}>
        {[
          {
            icon: Play, color: "#7c3aed",
            label: "Run pipeline",
            desc: "Generate a new video now",
            href: "/dashboard/pipeline",
          },
          {
            icon: Bot, color: "#3b82f6",
            label: "Manage agents",
            desc: "View and configure your agents",
            href: "/dashboard/agents",
          },
          {
            icon: Zap, color: "#22c55e",
            label: "Browse automations",
            desc: "Add new automations",
            href: "/dashboard/automations",
          },
        ].map((action) => {
          const IconComponent = action.icon;
          return (
            <Link key={action.href} href={action.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px", padding: "16px",
                display: "flex", alignItems: "center",
                gap: "14px", transition: "all 0.2s",
                cursor: "pointer",
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: `${action.color}15`,
                  border: `1px solid ${action.color}25`,
                  display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}>
                  <IconComponent size={18} color={action.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: "14px", fontWeight: 600,
                    color: colors.text, marginBottom: "2px",
                  }}>
                    {action.label}
                  </p>
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>
                    {action.desc}
                  </p>
                </div>
                <ArrowRight size={14} color={colors.textMuted} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent videos */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px", overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: colors.text }}>
            Recent content
          </h2>
          <Link href="/dashboard/pipeline" style={{
            fontSize: "13px", color: "#a78bfa",
            textDecoration: "none", display: "flex",
            alignItems: "center", gap: "4px",
          }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div style={{
              width: "24px", height: "24px", borderRadius: "50%",
              border: "2px solid #7c3aed",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : recentVideos.length === 0 ? (
          <div style={{
            padding: "48px 24px", textAlign: "center",
          }}>
            <FaYoutube size={32} color={colors.textMuted}
              style={{ margin: "0 auto 12px" }} />
            <p style={{ color: colors.textMuted, fontSize: "14px", marginBottom: "16px" }}>
              No content generated yet
            </p>
            <Link href="/dashboard/pipeline" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#7c3aed", color: "white",
              padding: "8px 20px", borderRadius: "8px",
              fontSize: "13px", fontWeight: 600, textDecoration: "none",
            }}>
              <Play size={14} /> Run your first pipeline
            </Link>
          </div>
        ) : (
          recentVideos.map((video, i) => (
            <div key={video._id} style={{
              display: "flex", alignItems: "center",
              gap: "14px", padding: "14px 20px",
              borderBottom: i < recentVideos.length - 1
                ? `1px solid ${colors.border}` : "none",
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <FaYoutube size={16} color="#ef4444" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "13px", fontWeight: 500, color: colors.text,
                  whiteSpace: "nowrap", overflow: "hidden",
                  textOverflow: "ellipsis", marginBottom: "3px",
                }}>
                  {video.title}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={11} color={colors.textMuted} />
                  <span style={{ fontSize: "11px", color: colors.textMuted }}>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <StatusBadge status={video.status} />
                {video.youtubeUrl && (
                  <a href={video.youtubeUrl} target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#a78bfa", textDecoration: "none" }}>
                    <ArrowRight size={14} />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}