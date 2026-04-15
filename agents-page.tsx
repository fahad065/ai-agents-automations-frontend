"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Bot, Plus, Play, Pause, Trash2,
  Loader2, Edit2, Save, CheckCircle2,
  AlertTriangle, X, Wand2, Key,
  ExternalLink, Link2, Link2Off,
} from "lucide-react";
import Link from "next/link";

interface Agent {
  _id: string;
  name: string;
  status: "active" | "paused" | "error";
  niche?: string;
  scheduleFrequency: string;
  scheduleTime: string;
  videosGenerated: number;
  creditsUsed: number;
  lastRunAt?: string;
  templateId: { _id: string; name: string; slug: string; category: string };
}

interface Template {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  capabilities: string[];
  defaultConfig?: Record<string, any>;
}

interface YoutubeStatus {
  connected: boolean;
  channelTitle?: string;
  channelId?: string;
  channelThumbnail?: string;
  expired?: boolean;
}

// Required keys per agent category
const REQUIRED_KEYS: Record<string, { provider: string; label: string }[]> = {
  youtube: [
    { provider: "atlas_seedance", label: "Atlas Cloud - Seedance" },
    { provider: "openai", label: "OpenAI (TTS voiceover)" },
  ],
  fitness: [{ provider: "openai", label: "OpenAI (content generation)" }],
  marketing: [{ provider: "openai", label: "OpenAI (ad copy generation)" }],
  education: [{ provider: "openai", label: "OpenAI (content generation)" }],
};

// ─── YouTube Connection Banner ────────────────────────────────

function YouTubeBanner({
  status,
  onDisconnect,
  disconnecting,
}: {
  status: YoutubeStatus | null;
  onDisconnect: () => void;
  disconnecting: boolean;
}) {
  const { colors } = useTheme();
  const [connectUrl, setConnectUrl] = useState("");

  // Build URL client-side only — avoids SSR hydration mismatch
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || "";
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1")
      .replace("/api/v1", "");
    setConnectUrl(`${apiBase}/api/v1/auth/youtube/connect?token=${token}`);
  }, []);

  const isConnected = status?.connected && !status?.expired;
  const isExpired = status?.connected && status?.expired;

  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${isConnected
        ? "rgba(34,197,94,0.3)"
        : isExpired
          ? "rgba(245,158,11,0.3)"
          : "rgba(239,68,68,0.2)"}`,
      borderRadius: "12px",
      padding: "16px 20px",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "14px",
      flexWrap: "wrap",
    }}>
      <div style={{
        width: "44px", height: "44px", borderRadius: "10px",
        background: isConnected
          ? "rgba(34,197,94,0.1)"
          : isExpired
            ? "rgba(245,158,11,0.1)"
            : "rgba(239,68,68,0.08)",
        border: `1px solid ${isConnected
          ? "rgba(34,197,94,0.2)"
          : isExpired
            ? "rgba(245,158,11,0.2)"
            : "rgba(239,68,68,0.15)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: "22px",
      }}>
        📺
      </div>

      <div style={{ flex: 1, minWidth: "200px" }}>
        {isConnected ? (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#22c55e", marginBottom: "2px" }}>
              YouTube connected ✓
            </p>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>
              {status?.channelTitle || "Your channel"} — ready to upload videos
            </p>
          </>
        ) : isExpired ? (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#f59e0b", marginBottom: "2px" }}>
              YouTube token expired
            </p>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>
              Your YouTube connection expired — reconnect to continue uploading
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "2px" }}>
              YouTube not connected
            </p>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>
              Connect your YouTube channel to enable automatic video uploads
            </p>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
        {isConnected ? (
          <>
            {status?.channelId && (
              <a
                href={`https://youtube.com/channel/${status.channelId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  background: colors.bg, color: colors.textMuted,
                  textDecoration: "none", fontSize: "12px", fontWeight: 500,
                }}
              >
                <ExternalLink size={12} /> View channel
              </a>
            )}
            <button
              onClick={onDisconnect}
              disabled={disconnecting}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.06)", color: "#ef4444",
                cursor: disconnecting ? "not-allowed" : "pointer",
                fontSize: "12px", fontWeight: 500,
              }}
            >
              {disconnecting
                ? <><Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> Disconnecting...</>
                : <><Link2Off size={12} /> Disconnect</>
              }
            </button>
          </>
        ) : (
          <a
            href={connectUrl || "#"}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 18px", borderRadius: "8px",
              background: isExpired
                ? "#f59e0b"
                : "linear-gradient(135deg, #ef4444, #dc2626)",
              color: "white", textDecoration: "none",
              fontSize: "13px", fontWeight: 600,
              opacity: connectUrl ? 1 : 0.6,
              pointerEvents: connectUrl ? "auto" : "none",
            }}
          >
            <Link2 size={14} />
            {isExpired ? "Reconnect YouTube" : "Connect YouTube"}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Edit Dialog ─────────────────────────────────────────────

function EditAgentDialog({
  agent, open, onClose, onSaved,
}: {
  agent: Agent | null; open: boolean;
  onClose: () => void; onSaved: () => void;
}) {
  const { colors } = useTheme();
  const [form, setForm] = useState({
    name: "", niche: "", scheduleFrequency: "daily", scheduleTime: "08:00",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name || "",
        niche: agent.niche || "",
        scheduleFrequency: agent.scheduleFrequency || "daily",
        scheduleTime: agent.scheduleTime || "08:00",
      });
      setSaved(false);
    }
  }, [agent]);

  if (!open || !agent) return null;

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/agents/${agent._id}`, form);
      setSaved(true);
      setTimeout(() => { onSaved(); onClose(); setSaved(false); }, 700);
    } catch {}
    setSaving(false);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text,
    outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "16px", padding: "28px",
          width: "100%", maxWidth: "440px", margin: "24px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Edit2 size={18} color="#a78bfa" />
              </div>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: colors.text, marginBottom: "2px" }}>Edit agent</h2>
                <p style={{ fontSize: "12px", color: colors.textMuted }}>{agent.name}</p>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: "30px", height: "30px", borderRadius: "8px",
              border: `1px solid ${colors.border}`, background: colors.bg, color: colors.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <X size={15} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>Agent name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>Niche</label>
              <input value={form.niche} onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}
                placeholder="e.g. dark psychology and human behavior" style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>Frequency</label>
                <select value={form.scheduleFrequency} onChange={(e) => setForm((f) => ({ ...f, scheduleFrequency: e.target.value }))} style={inputStyle}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="manual">Manual only</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>Run time</label>
                <input type="time" value={form.scheduleTime} onChange={(e) => setForm((f) => ({ ...f, scheduleTime: e.target.value }))} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
            <button onClick={onClose} disabled={saving} style={{
              flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
              fontWeight: 500, cursor: "pointer", border: `1px solid ${colors.border}`,
              background: colors.bg, color: colors.text,
            }}>Cancel</button>
            <button onClick={handleSave} disabled={saving || saved || !form.name.trim()} style={{
              flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px", fontWeight: 600,
              cursor: (saving || !form.name.trim()) ? "not-allowed" : "pointer", border: "none",
              background: saved ? "#22c55e" : saving ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              {saved ? <><CheckCircle2 size={14} /> Saved!</>
                : saving ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Saving...</>
                  : <><Save size={14} /> Save changes</>}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────

function DeleteAgentDialog({
  agent, open, onClose, onConfirm, loading,
}: {
  agent: Agent | null; open: boolean;
  onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  const { colors } = useTheme();
  if (!open || !agent) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "360px",
          margin: "24px", boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: colors.text, textAlign: "center", marginBottom: "8px" }}>Delete agent?</h2>
          <p style={{ fontSize: "14px", color: colors.textMuted, textAlign: "center", lineHeight: 1.6, marginBottom: "24px" }}>
            <strong style={{ color: colors.text }}>{agent.name}</strong> will be permanently deleted.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} disabled={loading} style={{
              flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
              fontWeight: 500, cursor: "pointer", border: `1px solid ${colors.border}`,
              background: colors.bg, color: colors.text,
            }}>Cancel</button>
            <button onClick={onConfirm} disabled={loading} style={{
              flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              border: "1px solid rgba(239,68,68,0.3)",
              background: loading ? "rgba(239,68,68,0.4)" : "#ef4444", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
              {loading ? <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Deleting...</> : <><Trash2 size={14} /> Delete</>}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Create Agent Form ────────────────────────────────────────

function CreateAgentForm({
  templates, onCreated, onCancel, existingApiKeys,
}: {
  templates: Template[];
  onCreated: () => void;
  onCancel: () => void;
  existingApiKeys: string[];
}) {
  const { colors } = useTheme();
  const [form, setForm] = useState({
    templateId: templates[0]?._id || "",
    name: "", niche: "",
    scheduleFrequency: "daily", scheduleTime: "08:00",
  });
  const [creating, setCreating] = useState(false);
  const [generatingNiche, setGeneratingNiche] = useState(false);
  const [nicheSuggestions, setNicheSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const selectedTemplate = templates.find((t) => t._id === form.templateId);
  const category = selectedTemplate?.category || "youtube";
  const requiredKeys = REQUIRED_KEYS[category] || [];
  const missingKeys = requiredKeys.filter((k) => !existingApiKeys.includes(k.provider));

  const generateNicheSuggestions = async () => {
    if (!selectedTemplate) return;
    setGeneratingNiche(true);
    setNicheSuggestions([]);
    setShowSuggestions(true);

    try {
      const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_URL || "http://localhost:8001";
      const params = new URLSearchParams({
        category: selectedTemplate.category,
        template_name: selectedTemplate.name,
      });
      const response = await fetch(`${pythonUrl}/niche/suggest/stream?${params}`);
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) { setGeneratingNiche(false); return; }
            if (data.suggestion) {
              setNicheSuggestions((prev) => prev.includes(data.suggestion) ? prev : [...prev, data.suggestion]);
            }
          } catch {}
        }
      }
    } catch {
      setNicheSuggestions([
        "dark psychology and human behavior",
        "stoicism and ancient philosophy",
        "financial freedom and passive income",
        "true crime and criminal psychology",
        "self improvement and discipline",
      ]);
    }
    setGeneratingNiche(false);
  };

  const handleCreate = async () => {
    if (!form.templateId || !form.name.trim() || !form.niche.trim()) return;
    setCreating(true);
    try {
      await api.post("/agents", form);
      onCreated();
    } catch {}
    setCreating(false);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text,
    outline: "none", boxSizing: "border-box" as const,
  };
  const labelStyle = { fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" };

  return (
    <div style={{
      background: colors.bgCard, border: "1px solid rgba(124,58,237,0.3)",
      borderRadius: "14px", padding: "24px", marginBottom: "24px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: colors.text, marginBottom: "2px" }}>Create new agent</h2>
          <p style={{ fontSize: "12px", color: colors.textMuted }}>Configure your AI automation agent</p>
        </div>
        <button onClick={onCancel} style={{
          width: "30px", height: "30px", borderRadius: "8px",
          border: `1px solid ${colors.border}`, background: colors.bg, color: colors.textMuted,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <X size={15} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "14px" }}>
        <div>
          <label style={labelStyle}>Agent type</label>
          <select value={form.templateId} onChange={(e) => {
            setForm((f) => ({ ...f, templateId: e.target.value, niche: "" }));
            setNicheSuggestions([]); setShowSuggestions(false);
          }} style={inputStyle}>
            {templates.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Agent name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={`e.g. My ${selectedTemplate?.name || "YouTube Agent"}`} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Run frequency</label>
          <select value={form.scheduleFrequency} onChange={(e) => setForm((f) => ({ ...f, scheduleFrequency: e.target.value }))} style={inputStyle}>
            <option value="daily">Daily — one video per day</option>
            <option value="weekly">Weekly — one video per week</option>
            <option value="manual">Manual — I trigger it myself</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Run time <span style={{ color: colors.textMuted, marginLeft: "4px" }}>(local time)</span></label>
          <input type="time" value={form.scheduleTime} onChange={(e) => setForm((f) => ({ ...f, scheduleTime: e.target.value }))} style={inputStyle} />
        </div>
      </div>

      {/* Niche */}
      <div style={{ marginBottom: "14px" }}>
        <label style={labelStyle}>Niche <span style={{ color: "#ef4444" }}>*</span></label>
        <div style={{ display: "flex", gap: "8px" }}>
          <input value={form.niche} onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}
            placeholder={category === "youtube" ? "e.g. dark psychology and human behavior" : "e.g. your content niche"}
            style={{ ...inputStyle, flex: 1 }} />
          <button onClick={generateNicheSuggestions} disabled={generatingNiche} style={{
            padding: "9px 14px", borderRadius: "8px",
            border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.08)", color: "#a78bfa",
            cursor: generatingNiche ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 500,
            display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {generatingNiche ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : <Wand2 size={13} />}
            {generatingNiche ? "Generating..." : "Suggest niches"}
          </button>
        </div>

        {showSuggestions && (
          <div style={{
            marginTop: "8px", background: colors.bgCard,
            border: "1px solid rgba(124,58,237,0.25)", borderRadius: "10px", overflow: "hidden",
          }}>
            {nicheSuggestions.length === 0 && generatingNiche ? (
              <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Loader2 size={14} color="#a78bfa" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                <p style={{ fontSize: "13px", color: colors.textMuted }}>Generating niche suggestions...</p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "11px", color: colors.textMuted, padding: "8px 12px 4px", borderBottom: nicheSuggestions.length > 0 ? `1px solid ${colors.border}` : "none" }}>
                  {generatingNiche ? `${nicheSuggestions.length} found — generating more...` : `${nicheSuggestions.length} suggestions — click to use`}
                </p>
                {nicheSuggestions.map((s, i) => (
                  <button key={s} onClick={() => { setForm((f) => ({ ...f, niche: s })); setShowSuggestions(false); setNicheSuggestions([]); }} style={{
                    width: "100%", padding: "10px 12px", background: "transparent", border: "none",
                    borderBottom: i < nicheSuggestions.length - 1 ? `1px solid ${colors.border}` : "none",
                    cursor: "pointer", textAlign: "left", fontSize: "13px", color: colors.text,
                    display: "flex", alignItems: "center", gap: "10px",
                  }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.06)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span style={{
                      width: "20px", height: "20px", borderRadius: "50%", background: "rgba(124,58,237,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "10px", color: "#a78bfa", flexShrink: 0, fontWeight: 700,
                    }}>{i + 1}</span>
                    {s}
                  </button>
                ))}
                {generatingNiche && nicheSuggestions.length > 0 && (
                  <div style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: "10px", borderTop: `1px solid ${colors.border}` }}>
                    <div style={{ display: "flex", gap: "3px" }}>
                      {[0, 1, 2].map((dot) => (
                        <div key={dot} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#a78bfa", animation: `bounce 1s infinite ${dot * 0.15}s` }} />
                      ))}
                    </div>
                    <p style={{ fontSize: "12px", color: colors.textMuted }}>Finding more niches...</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Missing API keys */}
      {missingKeys.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "10px", padding: "14px 16px", marginBottom: "14px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <Key size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#f59e0b", marginBottom: "6px" }}>Required API keys missing</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {missingKeys.map((k) => (
                  <div key={k.provider} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: colors.textMuted }}>
                    <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                    {k.label}
                  </div>
                ))}
              </div>
            </div>
            <Link href="/dashboard/api-keys" style={{
              display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px",
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b", textDecoration: "none", fontSize: "12px", fontWeight: 600, flexShrink: 0,
            }}>
              Add keys <ExternalLink size={11} />
            </Link>
          </div>
        </div>
      )}

      {missingKeys.length === 0 && requiredKeys.length > 0 && (
        <div style={{
          background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: "10px", padding: "10px 14px", marginBottom: "14px",
          display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#22c55e",
        }}>
          <CheckCircle2 size={14} color="#22c55e" />
          API keys configured — ready to run
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={handleCreate} disabled={creating || !form.name.trim() || !form.niche.trim()} style={{
          padding: "10px 24px", borderRadius: "8px",
          background: creating || !form.name.trim() || !form.niche.trim()
            ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "white", border: "none",
          cursor: (creating || !form.name.trim() || !form.niche.trim()) ? "not-allowed" : "pointer",
          fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px",
        }}>
          {creating ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Creating...</> : <><Plus size={14} /> Create agent</>}
        </button>
        <button onClick={onCancel} style={{
          padding: "10px 20px", borderRadius: "8px", background: "none",
          border: `1px solid ${colors.border}`, cursor: "pointer", fontSize: "14px", color: colors.textMuted,
        }}>Cancel</button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function AgentsPage() {
  const { colors } = useTheme();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editAgent, setEditAgent] = useState<Agent | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [youtubeStatus, setYoutubeStatus] = useState<YoutubeStatus | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchYoutubeStatus();
    handleYoutubeCallback();
  }, []);

  const handleYoutubeCallback = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const youtube = params.get("youtube");
    if (youtube) {
      window.history.replaceState({}, "", "/dashboard/agents");
      if (youtube === "connected") fetchYoutubeStatus();
    }
  };

  const fetchYoutubeStatus = async () => {
    try {
      const res = await api.get("/auth/youtube/status");
      setYoutubeStatus(res.data);
    } catch {}
  };

  const handleDisconnectYoutube = async () => {
    setDisconnecting(true);
    try {
      await api.delete("/auth/youtube/disconnect");
      setYoutubeStatus({ connected: false });
    } catch {}
    setDisconnecting(false);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [agentsRes, templatesRes, keysRes] = await Promise.all([
        api.get("/agents"),
        api.get("/agents/templates"),
        api.get("/api-keys").catch(() => ({ data: [] })),
      ]);
      setAgents(agentsRes.data || []);
      setTemplates(templatesRes.data || []);
      const setKeys = (keysRes.data || [])
        .filter((k: any) => k.isActive !== false)
        .map((k: any) => k.provider);
      setApiKeys(setKeys);
    } catch {}
    setLoading(false);
  };

  const toggleAgent = async (id: string) => {
    try {
      await api.patch(`/agents/${id}/toggle`);
      fetchAll();
    } catch {}
  };

  const confirmDelete = async () => {
    if (!deleteAgent) return;
    setDeleting(true);
    try {
      await api.delete(`/agents/${deleteAgent._id}`);
      setDeleteAgent(null);
      fetchAll();
    } catch {}
    setDeleting(false);
  };

  const statusColor = (s: string) =>
    s === "active" ? "#22c55e" : s === "paused" ? "#f59e0b" : "#ef4444";

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "24px", flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>My Agents</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>Manage and configure your AI automation agents.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "8px",
          background: showCreate ? colors.bgCard : "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: showCreate ? colors.textMuted : "white",
          border: showCreate ? `1px solid ${colors.border}` : "none",
          cursor: "pointer", fontSize: "14px", fontWeight: 600, transition: "all 0.2s",
        }}>
          {showCreate ? <><X size={15} /> Cancel</> : <><Plus size={15} /> New agent</>}
        </button>
      </div>

      {/* YouTube Banner */}
      <YouTubeBanner
        status={youtubeStatus}
        onDisconnect={handleDisconnectYoutube}
        disconnecting={disconnecting}
      />

      {/* Create form */}
      {showCreate && templates.length > 0 && (
        <CreateAgentForm
          templates={templates}
          existingApiKeys={apiKeys}
          onCreated={() => { setShowCreate(false); fetchAll(); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Agents list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : agents.length === 0 ? (
        <div style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "12px", padding: "60px 24px", textAlign: "center",
        }}>
          <Bot size={40} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>No agents yet</h2>
          <p style={{ color: colors.textMuted, fontSize: "14px", marginBottom: "20px" }}>
            Create your first agent to start automating your content pipeline.
          </p>
          <button onClick={() => setShowCreate(true)} style={{
            display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px",
            borderRadius: "8px", background: "#7c3aed", color: "white",
            border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
          }}>
            <Plus size={15} /> Create first agent
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {agents.map((agent) => (
            <div key={agent._id} style={{
              background: colors.bgCard, border: `1px solid ${colors.border}`,
              borderRadius: "12px", padding: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bot size={18} color="#a78bfa" />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>{agent.name}</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>{agent.templateId?.name}</p>
                  </div>
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px",
                  background: `${statusColor(agent.status)}15`, color: statusColor(agent.status),
                  border: `1px solid ${statusColor(agent.status)}30`,
                }}>
                  {agent.status}
                </span>
              </div>

              {agent.niche && (
                <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "14px", lineHeight: 1.5 }}>
                  {agent.niche}
                </p>
              )}

              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {[
                  { value: agent.videosGenerated, label: "Videos", color: colors.text },
                  { value: `$${(agent.creditsUsed || 0).toFixed(2)}`, label: "Spent", color: "#f59e0b" },
                  { value: agent.scheduleFrequency, label: agent.scheduleTime, color: colors.text },
                ].map((stat, i) => (
                  <div key={i} style={{
                    flex: 1, padding: "8px", background: colors.bg,
                    borderRadius: "8px", border: `1px solid ${colors.border}`, textAlign: "center",
                  }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    <p style={{ fontSize: "10px", color: colors.textMuted }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => setEditAgent(agent)} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer",
                  border: `1px solid ${colors.border}`, background: colors.bg, color: colors.textMuted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "5px", fontSize: "12px", fontWeight: 500,
                }}>
                  <Edit2 size={13} /> Edit
                </button>
                <button onClick={() => toggleAgent(agent._id)} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", cursor: "pointer",
                  border: `1px solid ${colors.border}`, background: colors.bg,
                  color: agent.status === "active" ? "#f59e0b" : "#22c55e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "5px", fontSize: "12px", fontWeight: 500,
                }}>
                  {agent.status === "active" ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Resume</>}
                </button>
                <button onClick={() => setDeleteAgent(agent)} style={{
                  width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer",
                  border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                  color: "#ef4444", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditAgentDialog agent={editAgent} open={!!editAgent} onClose={() => setEditAgent(null)} onSaved={fetchAll} />
      <DeleteAgentDialog agent={deleteAgent} open={!!deleteAgent} onClose={() => setDeleteAgent(null)} onConfirm={confirmDelete} loading={deleting} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}