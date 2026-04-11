"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Zap, Plus, Pause, Play, Trash2,
  ExternalLink, Loader2, ArrowRight,
  CheckCircle2, XCircle, Search,
} from "lucide-react";

interface AutomationTemplate {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  pricing?: { monthly: number };
}

interface UserAutomation {
  _id: string;
  status: "active" | "paused" | "cancelled";
  activatedAt: string;
  config: Record<string, any>;
  templateId: AutomationTemplate;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    active: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
    paused: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
    cancelled: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)" },
  };
  const s = map[status] || map.paused;
  return (
    <span style={{
      fontSize: "11px", fontWeight: 600,
      padding: "3px 10px", borderRadius: "9999px",
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export function DashboardAutomationsPage() {
  const { colors } = useTheme();
  const [userAutomations, setUserAutomations] = useState<UserAutomation[]>([]);
  const [allTemplates, setAllTemplates] = useState<AutomationTemplate[]>([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchMyAutomations = useCallback(async () => {
    try {
      const res = await api.get("/automations/my");
      setUserAutomations(res.data || []);
    } catch {}
    setLoadingMy(false);
  }, []);

  const fetchAllTemplates = useCallback(async () => {
    try {
      const res = await api.get("/automations/templates");
      setAllTemplates(res.data || []);
    } catch {}
    setLoadingAll(false);
  }, []);

  useEffect(() => {
    fetchMyAutomations();
    fetchAllTemplates();
  }, [fetchMyAutomations, fetchAllTemplates]);

  const handleActivate = async (templateId: string) => {
    setActivatingId(templateId);
    try {
      await api.post("/automations/activate", { templateId });
      await fetchMyAutomations();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to activate";
      alert(msg);
    }
    setActivatingId(null);
  };

  const handleToggle = async (userAutomationId: string) => {
    setActionLoading(userAutomationId);
    try {
      await api.patch(`/automations/${userAutomationId}/toggle`);
      await fetchMyAutomations();
    } catch {}
    setActionLoading(null);
  };

  const handleCancel = async (userAutomationId: string) => {
    setActionLoading(userAutomationId);
    try {
      await api.delete(`/automations/${userAutomationId}`);
      await fetchMyAutomations();
    } catch {}
    setActionLoading(null);
    setDeleteConfirm(null);
  };

  // Templates not yet activated by user
  const activeTemplateIds = userAutomations.map((ua) => ua.templateId?._id);
  const browsableTemplates = allTemplates.filter(
    (t) => !activeTemplateIds.includes(t._id) &&
      (!search || t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const cardStyle = {
    background: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    padding: "20px",
    transition: "all 0.2s",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontSize: "20px", fontWeight: 700,
          color: colors.text, marginBottom: "4px",
        }}>
          My Automations
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          Manage your active automations and browse available ones.
        </p>
      </div>

      {/* Active automations */}
      <div style={{ marginBottom: "40px" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "16px",
        }}>
          <h2 style={{
            fontSize: "15px", fontWeight: 600, color: colors.text,
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <CheckCircle2 size={15} color="#22c55e" />
            Active automations
          </h2>
          <span style={{
            fontSize: "12px", color: colors.textMuted,
            background: colors.bgSecondary,
            padding: "3px 10px", borderRadius: "9999px",
            border: `1px solid ${colors.border}`,
          }}>
            {userAutomations.length} activated
          </span>
        </div>

        {loadingMy ? (
          <div style={{ display: "flex", gap: "16px" }}>
            {[1, 2].map((i) => (
              <div key={i} style={{
                ...cardStyle, flex: 1, height: "160px",
                animation: "pulse 1.5s infinite",
              }} />
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
          </div>
        ) : userAutomations.length === 0 ? (
          <div style={{
            ...cardStyle,
            textAlign: "center", padding: "48px 24px",
          }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px", fontSize: "24px",
            }}>
              <Zap size={24} color="#a78bfa" />
            </div>
            <p style={{
              fontSize: "15px", fontWeight: 600,
              color: colors.text, marginBottom: "8px",
            }}>
              No automations activated yet
            </p>
            <p style={{
              fontSize: "13px", color: colors.textMuted,
              marginBottom: "20px", maxWidth: "320px", margin: "0 auto 20px",
            }}>
              Browse the automations below and activate ones that match your workflow.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}>
            {userAutomations.map((ua) => {
              const t = ua.templateId;
              if (!t) return null;
              const isLoading = actionLoading === ua._id;

              return (
                <div key={ua._id} style={cardStyle}>
                  {/* Header */}
                  <div style={{
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between", marginBottom: "14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "42px", height: "42px", borderRadius: "10px",
                        background: `${t.color}15`,
                        border: `1px solid ${t.color}30`,
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "20px", flexShrink: 0,
                      }}>
                        {t.icon}
                      </div>
                      <div>
                        <p style={{
                          fontSize: "14px", fontWeight: 600, color: colors.text,
                          marginBottom: "3px",
                        }}>
                          {t.name}
                        </p>
                        <StatusBadge status={ua.status} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleToggle(ua._id)}
                        disabled={isLoading}
                        title={ua.status === "active" ? "Pause" : "Resume"}
                        style={{
                          width: "30px", height: "30px", borderRadius: "7px",
                          border: `1px solid ${ua.status === "active"
                            ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`,
                          background: ua.status === "active"
                            ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)",
                          color: ua.status === "active" ? "#f59e0b" : "#22c55e",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {isLoading
                          ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                          : ua.status === "active"
                            ? <Pause size={12} />
                            : <Play size={12} />
                        }
                      </button>

                      {deleteConfirm === ua._id ? (
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => handleCancel(ua._id)}
                            style={{
                              padding: "4px 8px", borderRadius: "6px",
                              fontSize: "11px", fontWeight: 600,
                              background: "#ef4444", color: "white",
                              border: "none", cursor: "pointer",
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              padding: "4px 8px", borderRadius: "6px",
                              fontSize: "11px",
                              background: colors.bgSecondary, color: colors.textMuted,
                              border: `1px solid ${colors.border}`, cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(ua._id)}
                          title="Remove automation"
                          style={{
                            width: "30px", height: "30px", borderRadius: "7px",
                            border: "1px solid rgba(239,68,68,0.2)",
                            background: "rgba(239,68,68,0.06)",
                            color: "#ef4444",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    fontSize: "12px", color: colors.textMuted,
                    lineHeight: 1.6, marginBottom: "14px",
                  }}>
                    {t.description?.slice(0, 100)}
                    {t.description?.length > 100 ? "..." : ""}
                  </p>

                  {/* Footer */}
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "12px",
                    borderTop: `1px solid ${colors.border}`,
                  }}>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>
                      Activated {new Date(ua.activatedAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                    <Link href={`/automations/${t.slug}`} style={{
                      display: "flex", alignItems: "center", gap: "4px",
                      fontSize: "12px", color: t.color, textDecoration: "none",
                    }}>
                      View details <ExternalLink size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Browse more */}
      <div>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "16px",
          flexWrap: "wrap", gap: "12px",
        }}>
          <h2 style={{
            fontSize: "15px", fontWeight: 600, color: colors.text,
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Plus size={15} color="#7c3aed" />
            Browse automations
          </h2>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={14} color={colors.textMuted} style={{
              position: "absolute", left: "10px", top: "50%",
              transform: "translateY(-50%)",
            }} />
            <input
              placeholder="Search automations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "7px 12px 7px 32px",
                borderRadius: "8px", fontSize: "13px",
                border: `1px solid ${colors.border}`,
                background: colors.bgCard, color: colors.text,
                outline: "none", width: "220px",
              }}
            />
          </div>
        </div>

        {loadingAll ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ ...cardStyle, height: "200px", animation: "pulse 1.5s infinite" }} />
            ))}
          </div>
        ) : browsableTemplates.length === 0 && search ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: colors.textMuted, fontSize: "14px" }}>
              No automations match &ldquo;{search}&rdquo;
            </p>
          </div>
        ) : browsableTemplates.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "40px" }}>
            <CheckCircle2 size={32} color="#22c55e" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
              You have activated all available automations!
            </p>
            <p style={{ fontSize: "13px", color: colors.textMuted }}>
              Check back soon — more automations are coming.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {browsableTemplates.map((template) => {
              const isActivating = activatingId === template._id;
              const isLive = template.badge === "Live";

              return (
                <div key={template._id} style={cardStyle}>
                  {/* Header */}
                  <div style={{
                    display: "flex", alignItems: "flex-start",
                    justifyContent: "space-between", marginBottom: "14px",
                  }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "11px",
                      background: `${template.color}15`,
                      border: `1px solid ${template.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "20px",
                    }}>
                      {template.icon}
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 600,
                      padding: "3px 10px", borderRadius: "9999px",
                      background: isLive ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.08)",
                      color: isLive ? "#22c55e" : colors.textMuted,
                      border: `1px solid ${isLive ? "rgba(34,197,94,0.2)" : colors.border}`,
                    }}>
                      {template.badge}
                    </span>
                  </div>

                  <p style={{
                    fontSize: "15px", fontWeight: 600,
                    color: colors.text, marginBottom: "6px",
                  }}>
                    {template.name}
                  </p>

                  {template.tagline && (
                    <p style={{
                      fontSize: "12px", color: template.color,
                      fontWeight: 500, marginBottom: "8px",
                    }}>
                      {template.tagline}
                    </p>
                  )}

                  <p style={{
                    fontSize: "12px", color: colors.textMuted,
                    lineHeight: 1.6, marginBottom: "16px",
                  }}>
                    {template.description?.slice(0, 90)}
                    {template.description?.length > 90 ? "..." : ""}
                  </p>

                  {/* Capabilities */}
                  <div style={{
                    display: "flex", flexWrap: "wrap",
                    gap: "5px", marginBottom: "16px",
                  }}>
                    {template.capabilities?.slice(0, 3).map((cap) => (
                      <span key={cap} style={{
                        fontSize: "10px", padding: "2px 8px",
                        borderRadius: "9999px",
                        background: colors.bgSecondary,
                        border: `1px solid ${colors.border}`,
                        color: colors.textMuted,
                      }}>
                        {cap}
                      </span>
                    ))}
                    {(template.capabilities?.length || 0) > 3 && (
                      <span style={{
                        fontSize: "10px", padding: "2px 8px",
                        borderRadius: "9999px",
                        background: colors.bgSecondary,
                        border: `1px solid ${colors.border}`,
                        color: colors.textMuted,
                      }}>
                        +{template.capabilities.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: "flex", gap: "8px",
                    paddingTop: "12px",
                    borderTop: `1px solid ${colors.border}`,
                  }}>
                    <button
                      onClick={() => isLive && handleActivate(template._id)}
                      disabled={isActivating || !isLive}
                      style={{
                        flex: 1, padding: "8px",
                        borderRadius: "8px", fontSize: "13px",
                        fontWeight: 600, cursor: (!isLive || isActivating) ? "not-allowed" : "pointer",
                        background: !isLive
                          ? colors.bgSecondary
                          : isActivating
                            ? "rgba(124,58,237,0.4)"
                            : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                        color: !isLive ? colors.textMuted : "white",
                        border: "none",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: "6px",
                        transition: "all 0.2s",
                      }}
                    >
                      {isActivating ? (
                        <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                      ) : (
                        <Plus size={13} />
                      )}
                      {!isLive ? "Coming soon" : isActivating ? "Activating..." : "Activate"}
                    </button>

                    <Link
                      href={`/automations/${template.slug}`}
                      style={{
                        padding: "8px 12px", borderRadius: "8px",
                        border: `1px solid ${colors.border}`,
                        background: colors.bg,
                        display: "flex", alignItems: "center", gap: "5px",
                        fontSize: "12px", color: colors.textMuted,
                        textDecoration: "none", whiteSpace: "nowrap",
                      }}
                    >
                      Details <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}