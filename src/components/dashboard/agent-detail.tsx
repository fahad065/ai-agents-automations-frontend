"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Bot, ArrowLeft, Play, Pause, Trash2,
  Settings, Video, Zap, Clock,
  CheckCircle2, XCircle, Loader2,
  ExternalLink, Edit2, Save, X,
} from "lucide-react";

interface AgentDetail {
  _id: string;
  name: string;
  niche: string;
  status: string;
  scheduleFrequency: string;
  scheduleTime: string;
  videosGenerated: number;
  creditsUsed: number;
  lastRunAt?: string;
  createdAt: string;
  templateId: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    capabilities: string[];
  };
}

interface RecentVideo {
  _id: string;
  title: string;
  status: string;
  youtubeUrl?: string;
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    active: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    paused: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    error: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    uploaded: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    failed: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    uploading: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    draft: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{
      fontSize: "12px", fontWeight: 600,
      padding: "3px 10px", borderRadius: "9999px",
      background: s.bg, color: s.color,
    }}>
      {status}
    </span>
  );
}

export function DashboardAgentDetail({ agentId }: { agentId: string }) {
  const { colors } = useTheme();
  const router = useRouter();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "", niche: "",
    scheduleFrequency: "daily",
    scheduleTime: "08:00",
  });

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  const fetchAgent = async () => {
    setLoading(true);
    try {
      const [agentRes, videosRes] = await Promise.all([
        api.get(`/agents/${agentId}`),
        api.get(`/content-ideas?agentId=${agentId}`).catch(() => ({ data: [] })),
      ]);
      setAgent(agentRes.data);
      setRecentVideos((videosRes.data || []).slice(0, 8));
      setEditForm({
        name: agentRes.data.name,
        niche: agentRes.data.niche || "",
        scheduleFrequency: agentRes.data.scheduleFrequency,
        scheduleTime: agentRes.data.scheduleTime,
      });
    } catch {
      router.push("/dashboard/agents");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/agents/${agentId}`, editForm);
      setEditing(false);
      fetchAgent();
    } catch {}
    setSaving(false);
  };

  const handleToggle = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/agents/${agentId}/toggle`);
      fetchAgent();
    } catch {}
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      await api.delete(`/agents/${agentId}`);
      router.push("/dashboard/agents");
    } catch {}
    setActionLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px",
    borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`,
    background: colors.bg, color: colors.text,
    boxSizing: "border-box" as const, outline: "none",
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <Loader2 size={28} color="#7c3aed"
          style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!agent) return null;

  const t = agent.templateId;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/agents" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          color: colors.textMuted, textDecoration: "none",
          fontSize: "13px", marginBottom: "16px",
        }}>
          <ArrowLeft size={14} /> My Agents
        </Link>

        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "12px",
              background: `${t?.color || "#7c3aed"}15`,
              border: `1px solid ${t?.color || "#7c3aed"}30`,
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "24px",
            }}>
              {t?.icon || "🤖"}
            </div>
            <div>
              <h1 style={{
                fontSize: "20px", fontWeight: 700,
                color: colors.text, marginBottom: "4px",
              }}>
                {agent.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <StatusBadge status={agent.status} />
                <span style={{ fontSize: "12px", color: colors.textMuted }}>
                  {t?.name}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px" }}>
            <Link href="/dashboard/pipeline" style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "8px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", textDecoration: "none",
              fontSize: "13px", fontWeight: 600,
            }}>
              <Play size={13} /> Run pipeline
            </Link>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 16px", borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                background: colors.bgCard, color: colors.textMuted,
                cursor: "pointer", fontSize: "13px",
              }}
            >
              <Edit2 size={13} /> Edit
            </button>
            <button
              onClick={handleToggle}
              disabled={actionLoading}
              style={{
                padding: "9px 16px", borderRadius: "8px",
                border: `1px solid ${agent.status === "active"
                  ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`,
                background: agent.status === "active"
                  ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
                color: agent.status === "active" ? "#f59e0b" : "#22c55e",
                cursor: "pointer", fontSize: "13px",
                display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              {agent.status === "active"
                ? <><Pause size={13} /> Pause</>
                : <><Play size={13} /> Resume</>
              }
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              style={{
                width: "38px", height: "38px", borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.06)",
                color: "#ef4444", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{
          background: colors.bgCard,
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: "12px", padding: "20px",
          marginBottom: "20px",
        }}>
          <h2 style={{
            fontSize: "14px", fontWeight: 600,
            color: colors.text, marginBottom: "16px",
          }}>
            Edit agent configuration
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px", marginBottom: "14px",
          }}>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
                Agent name
              </label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
                Niche
              </label>
              <input
                value={editForm.niche}
                onChange={(e) => setEditForm((f) => ({ ...f, niche: e.target.value }))}
                placeholder="e.g. dark psychology and human behavior"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
                Frequency
              </label>
              <select
                value={editForm.scheduleFrequency}
                onChange={(e) => setEditForm((f) => ({ ...f, scheduleFrequency: e.target.value }))}
                style={inputStyle}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
                Run time
              </label>
              <input
                type="time"
                value={editForm.scheduleTime}
                onChange={(e) => setEditForm((f) => ({ ...f, scheduleTime: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "9px 18px", borderRadius: "8px",
                background: "#7c3aed", color: "white",
                border: "none", cursor: "pointer",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              {saving
                ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                : <Save size={13} />
              }
              Save changes
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: "9px 16px", borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                background: "none", color: colors.textMuted,
                cursor: "pointer", fontSize: "13px",
              }}
            >
              Cancel
            </button>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
      }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Stats */}
          <div style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px", padding: "20px",
          }}>
            <h2 style={{
              fontSize: "14px", fontWeight: 600,
              color: colors.text, marginBottom: "16px",
            }}>
              Performance
            </h2>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}>
              {[
                { icon: Video, label: "Videos generated", value: agent.videosGenerated, color: "#7c3aed" },
                { icon: Zap, label: "Credits used", value: `$${(agent.creditsUsed || 0).toFixed(2)}`, color: "#f59e0b" },
                { icon: Clock, label: "Schedule", value: `${agent.scheduleFrequency} @ ${agent.scheduleTime}`, color: "#3b82f6" },
                { icon: CheckCircle2, label: "Created", value: new Date(agent.createdAt).toLocaleDateString(), color: "#22c55e" },
              ].map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.label} style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px", padding: "12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <IconComponent size={13} color={stat.color} />
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>
                        {stat.label}
                      </p>
                    </div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Niche */}
          <div style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px", padding: "20px",
          }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "10px" }}>
              Niche configuration
            </h2>
            <p style={{
              fontSize: "13px", color: colors.textMuted,
              lineHeight: 1.6, marginBottom: "12px",
            }}>
              {agent.niche || "No niche configured — edit to add one"}
            </p>
            {t?.capabilities && (
              <div>
                <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "8px" }}>
                  Capabilities
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {t.capabilities.map((cap) => (
                    <span key={cap} style={{
                      fontSize: "11px", padding: "3px 8px",
                      borderRadius: "9999px",
                      background: `${t.color}10`,
                      border: `1px solid ${t.color}25`,
                      color: t.color,
                    }}>
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Template info */}
          {t && (
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: "12px", padding: "20px",
            }}>
              <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "10px" }}>
                Agent template
              </h2>
              <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "12px" }}>
                {t.description}
              </p>
              <Link href={`/agents/${t.slug}`} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "13px", color: "#a78bfa", textDecoration: "none",
              }}>
                <ExternalLink size={12} /> View template page
              </Link>
            </div>
          )}
        </div>

        {/* Right column — recent videos */}
        <div style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: "12px", overflow: "hidden",
          alignSelf: "start",
        }}>
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
              Generated content
            </h2>
            <Link href="/dashboard/pipeline" style={{
              fontSize: "12px", color: "#a78bfa",
              textDecoration: "none",
            }}>
              Run new →
            </Link>
          </div>

          {recentVideos.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <Video size={28} color={colors.textMuted}
                style={{ margin: "0 auto 12px" }} />
              <p style={{ color: colors.textMuted, fontSize: "13px", marginBottom: "12px" }}>
                No content generated yet
              </p>
              <Link href="/dashboard/pipeline" style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "13px", color: "white",
                background: "#7c3aed", padding: "8px 16px",
                borderRadius: "8px", textDecoration: "none",
                fontWeight: 600,
              }}>
                <Play size={12} /> Run first pipeline
              </Link>
            </div>
          ) : (
            recentVideos.map((video, i) => {
              const ytUrl = video.youtubeUrl || "";
              return (
                <div key={video._id} style={{
                  display: "flex", alignItems: "center",
                  gap: "12px", padding: "14px 20px",
                  borderBottom: i < recentVideos.length - 1
                    ? `1px solid ${colors.border}` : "none",
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    background: "rgba(239,68,68,0.1)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                    fontSize: "14px",
                  }}>
                    🎬
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "13px", color: colors.text, fontWeight: 500,
                      whiteSpace: "nowrap", overflow: "hidden",
                      textOverflow: "ellipsis", marginBottom: "2px",
                    }}>
                      {video.title}
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <StatusBadge status={video.status} />
                    {ytUrl && (
                      <a
                        href={ytUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#a78bfa" }}
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}