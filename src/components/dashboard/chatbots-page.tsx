"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Bot, Plus, Trash2, Loader2, X, Globe, Settings2, Check,
} from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────
interface Chatbot {
  _id: string;
  name: string;
  description?: string;
  persona?: string;
  language: "en" | "ar" | "both";
  template?: string;
  status: "draft" | "active" | "inactive";
  fallbackMessage?: string;
  fallbackMessage_ar?: string;
  humanHandoff?: boolean;
  embedKey: string;
  channels?: {
    website?: { enabled?: boolean };
    whatsapp?: { enabled?: boolean };
    instagram?: { enabled?: boolean };
  };
  createdAt: string;
  updatedAt?: string;
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  active: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  draft: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  inactive: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  draft: "Draft",
  inactive: "Paused",
};

interface Template {
  key: string;
  emoji: string;
  name: string;
}

const TEMPLATES: Template[] = [
  { key: "restaurant", emoji: "🍽️", name: "Restaurant" },
  { key: "real_estate", emoji: "🏠", name: "Real Estate" },
  { key: "clinic", emoji: "💆", name: "Clinic" },
  { key: "ecommerce", emoji: "🛍️", name: "E-commerce" },
  { key: "gym", emoji: "🏋️", name: "Gym" },
  { key: "education", emoji: "🎓", name: "Education" },
  { key: "custom", emoji: "✨", name: "Custom / Blank" },
];

const TEMPLATE_EMOJI: Record<string, string> = TEMPLATES.reduce((acc, t) => {
  acc[t.key] = t.emoji;
  return acc;
}, {} as Record<string, string>);

// ── Create Chatbot Modal ────────────────────────────────────────
function CreateChatbotModal({ onClose, onCreated, colors, isDark }: {
  onClose: () => void; onCreated: (id: string) => void; colors: any; isDark: boolean;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState<string>("custom");
  const [language, setLanguage] = useState<"en" | "ar" | "both">("en");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
  };

  const lbl = (text: string) => (
    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
      {text}
    </label>
  );

  const handleCreate = async () => {
    if (!name.trim()) { setError("Chatbot name is required"); return; }
    setSaving(true); setError("");
    try {
      const res = await api.post("/chatbots", {
        name: name.trim(),
        description: description.trim() || undefined,
        language,
        template: template !== "custom" ? template : undefined,
      });
      const created = res.data?.data || res.data;
      toast.success("Chatbot created!");
      onCreated(created._id);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create chatbot");
    }
    setSaving(false);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "18px", width: "100%", maxWidth: "620px",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${panelBorder}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111" }}>New Chatbot</p>
            <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>Pick a template and give it a name</p>
          </div>
          <button onClick={onClose} style={{
            width: "28px", height: "28px", borderRadius: "7px",
            border: `1px solid ${panelBorder}`, background: "transparent",
            color: isDark ? "#737373" : "#6b7280", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}><X size={13} /></button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            {lbl("Chatbot Name *")}
            <input value={name} onChange={(e) => setName(e.target.value)} style={inp} placeholder="e.g. Sunset Cafe Assistant" />
          </div>

          <div>
            {lbl("Description")}
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              style={{ ...inp, resize: "vertical" as const }} placeholder="What does this bot do for your business?" />
          </div>

          <div>
            {lbl("Template")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "8px" }}>
              {TEMPLATES.map((t) => (
                <button key={t.key} onClick={() => setTemplate(t.key)} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 12px", borderRadius: "9px", cursor: "pointer",
                  border: `1.5px solid ${template === t.key ? "#7c3aed" : colors.border}`,
                  background: template === t.key ? "rgba(124,58,237,0.1)" : colors.bg,
                  textAlign: "left" as const,
                }}>
                  <span style={{ fontSize: "18px" }}>{t.emoji}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: template === t.key ? "#a78bfa" : colors.text }}>{t.name}</span>
                  {template === t.key && <Check size={12} color="#a78bfa" style={{ marginLeft: "auto" }} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            {lbl("Language")}
            <div style={{ display: "flex", gap: "8px" }}>
              {([
                { value: "en", label: "English" },
                { value: "ar", label: "Arabic" },
                { value: "both", label: "Both" },
              ] as const).map((l) => (
                <button key={l.value} onClick={() => setLanguage(l.value)} style={{
                  flex: 1, padding: "9px", borderRadius: "8px", cursor: "pointer",
                  border: `1.5px solid ${language === l.value ? "#7c3aed" : colors.border}`,
                  background: language === l.value ? "rgba(124,58,237,0.1)" : colors.bg,
                  color: language === l.value ? "#a78bfa" : colors.text,
                  fontSize: "13px", fontWeight: 600,
                }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ fontSize: "12px", color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "7px" }}>{error}</p>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${panelBorder}`, display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", border: `1px solid ${panelBorder}`, background: "transparent", color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px" }}>Cancel</button>
          <button onClick={handleCreate} disabled={saving} style={{
            flex: 2, padding: "10px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", border: "none",
            fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={14} />}
            {saving ? "Creating..." : "Create Chatbot"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function ChatbotsPage() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchChatbots(); }, []);

  const fetchChatbots = async () => {
    setLoading(true);
    try {
      const res = await api.get("/chatbots");
      setChatbots(res.data?.data || res.data || []);
    } catch {
      toast.error("Failed to load chatbots");
    }
    setLoading(false);
  };

  const deleteChatbot = async (id: string) => {
    if (!confirm("Delete this chatbot? This cannot be undone.")) return;
    try {
      await api.delete(`/chatbots/${id}`);
      toast.success("Chatbot deleted");
      fetchChatbots();
    } catch {
      toast.error("Failed to delete chatbot");
    }
  };

  const handleCreated = (id: string) => {
    setShowCreate(false);
    router.push(`/dashboard/chatbots/${id}`);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Chatbots</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>Build and deploy AI chatbots on your website, WhatsApp, and Instagram.</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px",
          borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
          boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
        }}>
          <Plus size={15} /> New Chatbot
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : chatbots.length === 0 ? (
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
          <Bot size={40} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>No chatbots yet</h2>
          <p style={{ color: colors.textMuted, fontSize: "14px", marginBottom: "20px" }}>Create your first chatbot to start answering customers 24/7.</p>
          <button onClick={() => setShowCreate(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", background: "#7c3aed", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
            <Plus size={15} /> Create your first chatbot
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {chatbots.map((bot) => {
            const sc = STATUS_COLORS[bot.status] || STATUS_COLORS.draft;
            const emoji = (bot.template && TEMPLATE_EMOJI[bot.template]) || "🤖";
            const channels = bot.channels || {};
            return (
              <div key={bot._id} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px" }}>
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", fontSize: "20px", background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {emoji}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{bot.name}</p>
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>{new Date(bot.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px", background: sc.bg, color: sc.color, flexShrink: 0 }}>
                    {STATUS_LABELS[bot.status] || bot.status}
                  </span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: "12px", color: colors.textMuted, marginBottom: "14px", lineHeight: 1.5,
                  minHeight: "18px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                }}>
                  {bot.description || "No description added yet."}
                </p>

                {/* Channels row */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                  {[
                    { key: "website", icon: Globe, color: "#7c3aed", enabled: !!channels.website?.enabled },
                    { key: "whatsapp", icon: FaWhatsapp, color: "#22c55e", enabled: !!channels.whatsapp?.enabled },
                    { key: "instagram", icon: FaInstagram, color: "#e1306c", enabled: !!channels.instagram?.enabled },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    return (
                      <div key={ch.key} title={`${ch.key}${ch.enabled ? " enabled" : " disabled"}`} style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                        padding: "6px", borderRadius: "7px",
                        background: ch.enabled ? `${ch.color}12` : colors.bg,
                        border: `1px solid ${ch.enabled ? `${ch.color}30` : colors.border}`,
                        opacity: ch.enabled ? 1 : 0.4,
                      }}>
                        <Icon size={13} color={ch.enabled ? ch.color : colors.textMuted} />
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px" }}>
                  <button onClick={() => router.push(`/dashboard/chatbots/${bot._id}`)} style={{
                    flex: 1, padding: "9px 14px", borderRadius: "8px", cursor: "pointer",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "white", border: "none", fontSize: "12px", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
                  }}>
                    <Settings2 size={13} /> Configure
                  </button>
                  <button onClick={() => deleteChatbot(bot._id)} title="Delete" style={{ width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateChatbotModal onClose={() => setShowCreate(false)} onCreated={handleCreated} colors={colors} isDark={isDark} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
