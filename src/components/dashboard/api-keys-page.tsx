"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Key, Plus, Trash2, Eye, EyeOff,
  CheckCircle2, XCircle, Loader2,
  AlertTriangle, X, Copy, Check,
  RefreshCw, Shield,
} from "lucide-react";

interface ApiKey {
  _id: string;
  provider: string;
  label: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
}

const PROVIDERS = [
  {
    provider: "atlas_seedance",
    label: "Atlas Cloud - Seedance",
    description: "AI video clip generation via Seedance v1.5 Pro",
    icon: "🎬",
    color: "#7c3aed",
    required: true,
    helpUrl: "https://atlascloud.ai",
    placeholder: "sk-atlas-...",
  },
  {
    provider: "openai",
    label: "OpenAI",
    description: "TTS voiceover generation (onyx voice)",
    icon: "🎙️",
    color: "#22c55e",
    required: true,
    helpUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
  },
  {
    provider: "youtube_oauth",
    label: "YouTube OAuth",
    description: "Upload and schedule videos to your YouTube channel",
    icon: "📺",
    color: "#ef4444",
    required: true,
    helpUrl: "https://console.cloud.google.com",
    placeholder: "OAuth credentials JSON or token",
  },
  {
    provider: "youtube_data",
    label: "YouTube Data API",
    description: "Trend discovery and video analytics",
    icon: "📊",
    color: "#f59e0b",
    required: false,
    helpUrl: "https://console.cloud.google.com",
    placeholder: "AIza...",
  },
  {
    provider: "elevenlabs",
    label: "ElevenLabs",
    description: "Premium TTS fallback voice generation",
    icon: "🔊",
    color: "#3b82f6",
    required: false,
    helpUrl: "https://elevenlabs.io",
    placeholder: "el-...",
  },
  {
    provider: "ollama",
    label: "Ollama",
    description: "Local LLM host URL (default: http://localhost:11434)",
    icon: "🧠",
    color: "#a78bfa",
    required: false,
    helpUrl: "https://ollama.ai",
    placeholder: "http://localhost:11434",
  },
];

// ─── Add / Edit Key Dialog ────────────────────────────────────

function KeyDialog({
  open,
  onClose,
  onSaved,
  existingKey,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingKey?: ApiKey | null;
}) {
  const { colors } = useTheme();
  const [provider, setProvider] = useState("");
  const [label, setLabel] = useState("");
  const [keyValue, setKeyValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (existingKey) {
        setProvider(existingKey.provider);
        setLabel(existingKey.label);
        setKeyValue("");
      } else {
        setProvider(PROVIDERS[0].provider);
        setLabel(PROVIDERS[0].label);
        setKeyValue("");
      }
      setSaved(false);
      setError("");
      setShowKey(false);
    }
  }, [open, existingKey]);

  if (!open) return null;

  const selectedProvider = PROVIDERS.find((p) => p.provider === provider);

  const handleProviderChange = (p: string) => {
    setProvider(p);
    const pInfo = PROVIDERS.find((x) => x.provider === p);
    if (pInfo && !existingKey) setLabel(pInfo.label);
  };

  const handleSave = async () => {
    if (!provider || !keyValue.trim()) {
      setError("Provider and key value are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/api-keys", {
        provider,
        label: label || selectedProvider?.label || provider,
        key: keyValue.trim(),
      });
      setSaved(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save key");
    }
    setSaving(false);
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text,
    outline: "none", boxSizing: "border-box" as const,
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "16px", padding: "28px",
            width: "100%", maxWidth: "460px", margin: "24px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: "22px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Key size={18} color="#a78bfa" />
              </div>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: colors.text, marginBottom: "2px" }}>
                  {existingKey ? "Update API key" : "Add API key"}
                </h2>
                <p style={{ fontSize: "12px", color: colors.textMuted }}>
                  Stored encrypted with AES-256
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: "30px", height: "30px", borderRadius: "8px",
                border: `1px solid ${colors.border}`, background: colors.bg,
                color: colors.textMuted, display: "flex", alignItems: "center",
                justifyContent: "center", cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Provider selector */}
          {!existingKey && (
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "6px" }}>
                Service / Provider
              </label>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}>
                {PROVIDERS.map((p) => (
                  <button
                    key={p.provider}
                    onClick={() => handleProviderChange(p.provider)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px", cursor: "pointer",
                      border: `1px solid ${provider === p.provider
                        ? `${p.color}50` : colors.border}`,
                      background: provider === p.provider
                        ? `${p.color}10` : colors.bg,
                      display: "flex", alignItems: "center", gap: "8px",
                      textAlign: "left", transition: "all 0.15s",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{p.icon}</span>
                    <div>
                      <p style={{
                        fontSize: "12px", fontWeight: 600,
                        color: provider === p.provider ? p.color : colors.text,
                      }}>
                        {p.label}
                      </p>
                      {p.required && (
                        <p style={{ fontSize: "10px", color: "#ef4444" }}>Required</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Label */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
              Label
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={selectedProvider?.label || "My API Key"}
              style={inputStyle}
            />
          </div>

          {/* Key value */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "5px" }}>
              <label style={{ fontSize: "12px", color: colors.textMuted }}>
                {existingKey ? "New key value (leave blank to keep existing)" : "API key value"}
              </label>
              {selectedProvider?.helpUrl && (
                <a
                  href={selectedProvider.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "11px", color: "#a78bfa", textDecoration: "none" }}
                >
                  Get key →
                </a>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showKey ? "text" : "password"}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder={selectedProvider?.placeholder || "Paste your key here"}
                style={{ ...inputStyle, paddingRight: "40px" }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute", right: "10px", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: colors.textMuted, padding: "2px",
                }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Security note */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 12px", borderRadius: "8px",
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.15)",
            marginBottom: "16px",
          }}>
            <Shield size={13} color="#a78bfa" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.5 }}>
              Your key is encrypted with AES-256 before storage. Raw values are never logged or visible after saving.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 12px", borderRadius: "8px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              fontSize: "13px", color: "#ef4444", marginBottom: "14px",
            }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
                fontWeight: 500, cursor: "pointer",
                border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              style={{
                flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
                fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
                border: "none",
                background: saved ? "#22c55e"
                  : saving ? "rgba(124,58,237,0.5)"
                    : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                transition: "all 0.2s",
              }}
            >
              {saved ? (
                <><CheckCircle2 size={14} /> Saved!</>
              ) : saving ? (
                <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Saving...</>
              ) : (
                <><Key size={14} /> Save key</>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Delete Dialog ────────────────────────────────────────────

function DeleteKeyDialog({
  keyItem, open, onClose, onConfirm, loading,
}: {
  keyItem: ApiKey | null; open: boolean;
  onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  const { colors } = useTheme();
  if (!open || !keyItem) return null;
  const pInfo = PROVIDERS.find((p) => p.provider === keyItem.provider);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "16px", padding: "28px",
            width: "100%", maxWidth: "360px", margin: "24px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <h2 style={{
            fontSize: "17px", fontWeight: 700, color: colors.text,
            textAlign: "center", marginBottom: "8px",
          }}>
            Remove API key?
          </h2>
          <p style={{
            fontSize: "14px", color: colors.textMuted,
            textAlign: "center", lineHeight: 1.6, marginBottom: "24px",
          }}>
            <strong style={{ color: colors.text }}>
              {pInfo?.icon} {keyItem.label}
            </strong>{" "}
            will be removed. Any automations using this key will stop working.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
                fontWeight: 500, cursor: "pointer",
                border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text,
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
                fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                border: "1px solid rgba(239,68,68,0.3)",
                background: loading ? "rgba(239,68,68,0.4)" : "#ef4444", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              {loading ? (
                <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Removing...</>
              ) : (
                <><Trash2 size={14} /> Remove</>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function ApiKeysPage() {
  const { colors } = useTheme();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editKey, setEditKey] = useState<ApiKey | null>(null);
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, "ok" | "error">>({});
  const [copied, setCopied] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api-keys");
      setKeys(res.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleDelete = async () => {
    if (!deleteKey) return;
    setDeleting(true);
    try {
      await api.delete(`/api-keys/${deleteKey._id}`);
      setDeleteKey(null);
      fetchKeys();
    } catch {}
    setDeleting(false);
  };

  const handleTest = async (key: ApiKey) => {
    setTestingKey(key._id);
    try {
      await api.post(`/api-keys/${key.provider}/test`);
      setTestResults((prev) => ({ ...prev, [key._id]: "ok" }));
    } catch {
      setTestResults((prev) => ({ ...prev, [key._id]: "error" }));
    }
    setTestingKey(null);
    // Clear result after 4 seconds
    setTimeout(() => {
      setTestResults((prev) => {
        const next = { ...prev };
        delete next[key._id];
        return next;
      });
    }, 4000);
  };

  // Get which required providers are missing
  const setProviders = keys.map((k) => k.provider);
  const missingRequired = PROVIDERS.filter(
    (p) => p.required && !setProviders.includes(p.provider)
  );

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "24px", flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
            API Keys
          </h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>
            Manage your service API keys. All keys are encrypted with AES-256.
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 18px", borderRadius: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", border: "none", cursor: "pointer",
            fontSize: "14px", fontWeight: 600,
          }}
        >
          <Plus size={15} /> Add API key
        </button>
      </div>

      {/* Missing required keys banner */}
      {missingRequired.length > 0 && (
        <div style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "12px", padding: "16px 20px", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#f59e0b", marginBottom: "6px" }}>
                {missingRequired.length} required key{missingRequired.length > 1 ? "s" : ""} missing
              </p>
              <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "8px" }}>
                Your pipeline won't run until these are added:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {missingRequired.map((p) => (
                  <button
                    key={p.provider}
                    onClick={() => {
                      setShowAddDialog(true);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "5px 12px", borderRadius: "7px",
                      background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      color: "#f59e0b", cursor: "pointer", fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {p.icon} {p.label} — Add
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All keys configured */}
      {missingRequired.length === 0 && keys.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "12px 16px", borderRadius: "10px",
          background: "rgba(34,197,94,0.06)",
          border: "1px solid rgba(34,197,94,0.2)",
          marginBottom: "24px",
          fontSize: "13px", color: "#22c55e",
        }}>
          <CheckCircle2 size={15} color="#22c55e" />
          All required API keys are configured — your pipeline is ready to run
        </div>
      )}

      {/* Keys list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Loader2 size={28} color="#7c3aed"
            style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : keys.length === 0 ? (
        <div style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "12px", padding: "60px 24px", textAlign: "center",
        }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px",
            background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <Key size={24} color="#a78bfa" />
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>
            No API keys added yet
          </h2>
          <p style={{ color: colors.textMuted, fontSize: "14px", marginBottom: "20px", maxWidth: "340px", margin: "0 auto 20px" }}>
            Add your API keys to enable the pipeline. Start with Atlas Seedance, OpenAI, and YouTube OAuth.
          </p>
          <button
            onClick={() => setShowAddDialog(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", borderRadius: "8px",
              background: "#7c3aed", color: "white",
              border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
            }}
          >
            <Plus size={15} /> Add first key
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Group by required vs optional */}
          {["required", "optional"].map((group) => {
            const groupKeys = keys.filter((k) => {
              const pInfo = PROVIDERS.find((p) => p.provider === k.provider);
              return group === "required" ? pInfo?.required : !pInfo?.required;
            });
            if (groupKeys.length === 0) return null;

            return (
              <div key={group}>
                <p style={{
                  fontSize: "11px", fontWeight: 600, color: colors.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}>
                  {group === "required" ? "Required keys" : "Optional keys"}
                </p>
                <div style={{
                  background: colors.bgCard, border: `1px solid ${colors.border}`,
                  borderRadius: "12px", overflow: "hidden",
                }}>
                  {groupKeys.map((key, i) => {
                    const pInfo = PROVIDERS.find((p) => p.provider === key.provider);
                    const testResult = testResults[key._id];
                    const isTesting = testingKey === key._id;

                    return (
                      <div key={key._id} style={{
                        display: "flex", alignItems: "center", gap: "14px",
                        padding: "14px 20px",
                        borderBottom: i < groupKeys.length - 1
                          ? `1px solid ${colors.border}` : "none",
                      }}>
                        {/* Icon */}
                        <div style={{
                          width: "38px", height: "38px", borderRadius: "9px",
                          background: pInfo ? `${pInfo.color}12` : "rgba(124,58,237,0.1)",
                          border: `1px solid ${pInfo ? `${pInfo.color}25` : "rgba(124,58,237,0.2)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "18px", flexShrink: 0,
                        }}>
                          {pInfo?.icon || "🔑"}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
                              {key.label}
                            </p>
                            <span style={{
                              fontSize: "10px", fontWeight: 600,
                              padding: "2px 7px", borderRadius: "9999px",
                              background: "rgba(34,197,94,0.1)", color: "#22c55e",
                            }}>
                              Active
                            </span>
                          </div>
                          <p style={{ fontSize: "12px", color: colors.textMuted }}>
                            {pInfo?.description || key.provider}
                            {key.lastUsedAt && (
                              <span style={{ marginLeft: "8px" }}>
                                · Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Key preview — masked */}
                        <div style={{
                          fontFamily: "monospace", fontSize: "12px",
                          color: colors.textMuted, flexShrink: 0,
                          background: colors.bgSecondary,
                          padding: "4px 10px", borderRadius: "6px",
                          border: `1px solid ${colors.border}`,
                        }}>
                          ••••••••••••
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          {/* Test */}
                          <button
                            onClick={() => handleTest(key)}
                            disabled={isTesting}
                            title="Test key"
                            style={{
                              padding: "6px 12px", borderRadius: "7px", cursor: "pointer",
                              border: `1px solid ${testResult === "ok"
                                ? "rgba(34,197,94,0.3)"
                                : testResult === "error"
                                  ? "rgba(239,68,68,0.3)"
                                  : colors.border}`,
                              background: testResult === "ok"
                                ? "rgba(34,197,94,0.08)"
                                : testResult === "error"
                                  ? "rgba(239,68,68,0.08)"
                                  : colors.bg,
                              color: testResult === "ok" ? "#22c55e"
                                : testResult === "error" ? "#ef4444"
                                  : colors.textMuted,
                              fontSize: "12px", fontWeight: 500,
                              display: "flex", alignItems: "center", gap: "5px",
                              transition: "all 0.2s",
                            }}
                          >
                            {isTesting ? (
                              <Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} />
                            ) : testResult === "ok" ? (
                              <CheckCircle2 size={12} />
                            ) : testResult === "error" ? (
                              <XCircle size={12} />
                            ) : (
                              <RefreshCw size={12} />
                            )}
                            {isTesting ? "Testing..."
                              : testResult === "ok" ? "Valid"
                                : testResult === "error" ? "Failed"
                                  : "Test"}
                          </button>

                          {/* Update */}
                          <button
                            onClick={() => setEditKey(key)}
                            title="Update key value"
                            style={{
                              padding: "6px 12px", borderRadius: "7px", cursor: "pointer",
                              border: `1px solid ${colors.border}`,
                              background: colors.bg, color: colors.textMuted,
                              fontSize: "12px", display: "flex", alignItems: "center", gap: "5px",
                            }}
                          >
                            <Key size={12} /> Update
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteKey(key)}
                            title="Remove key"
                            style={{
                              width: "32px", height: "32px", borderRadius: "7px",
                              border: "1px solid rgba(239,68,68,0.2)",
                              background: "rgba(239,68,68,0.06)", color: "#ef4444",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Missing required keys as empty slots */}
          {missingRequired.length > 0 && (
            <div>
              <p style={{
                fontSize: "11px", fontWeight: 600, color: colors.textMuted,
                textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px",
              }}>
                Missing required keys
              </p>
              <div style={{
                background: colors.bgCard, border: `1px solid ${colors.border}`,
                borderRadius: "12px", overflow: "hidden",
              }}>
                {missingRequired.map((p, i) => (
                  <div key={p.provider} style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 20px",
                    borderBottom: i < missingRequired.length - 1
                      ? `1px solid ${colors.border}` : "none",
                    opacity: 0.7,
                  }}>
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "9px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "18px", flexShrink: 0,
                    }}>
                      {p.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "2px" }}>
                        {p.label}
                        <span style={{
                          fontSize: "10px", marginLeft: "8px",
                          padding: "2px 7px", borderRadius: "9999px",
                          background: "rgba(239,68,68,0.1)", color: "#ef4444",
                        }}>
                          Missing
                        </span>
                      </p>
                      <p style={{ fontSize: "12px", color: colors.textMuted }}>
                        {p.description}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddDialog(true)}
                      style={{
                        padding: "7px 16px", borderRadius: "7px", cursor: "pointer",
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "rgba(239,68,68,0.08)", color: "#ef4444",
                        fontSize: "12px", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "5px",
                      }}
                    >
                      <Plus size={12} /> Add now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <KeyDialog
        open={showAddDialog || !!editKey}
        existingKey={editKey}
        onClose={() => { setShowAddDialog(false); setEditKey(null); }}
        onSaved={() => { setShowAddDialog(false); setEditKey(null); fetchKeys(); }}
      />
      <DeleteKeyDialog
        keyItem={deleteKey} open={!!deleteKey}
        onClose={() => setDeleteKey(null)}
        onConfirm={handleDelete} loading={deleting}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}