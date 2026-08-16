"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Package, Plus, Play, Pause, Trash2, Eye,
  Loader2, Search, X, AlertTriangle,
  ChevronRight, Key, Check, Settings, Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { YouTubeConnectButton } from "./youtube-connect-button";
import { InstagramConnectButton } from "./instagram-connect-button";
import { EditModuleModal } from "./edit-module-modal";
import { NicheSuggester } from "./niche-suggester";
import { PipelineStatusWidget } from "./pipeline-status-widget";

interface UserModule {
  _id: string;
  name: string;
  niche?: string;
  status: string;
  moduleType: "agent" | "automation";
  pipelineType: string;
  moduleName: string;
  scheduleFrequency?: string;
  scheduleTime?: string;
  customPrompt?: string;
  useCustomPrompt?: boolean;
  totalRuns?: number;
  totalCost?: number;
  createdAt: string;
  moduleId?: {
    name: string; slug: string; category: string;
    icon: string; color: string; capabilities: string[];
    estimatedCostPerRun?: string;
  };
}

interface AvailableModule {
  _id: string; name: string; slug: string; tagline?: string;
  moduleType: string; category: string; pipelineType: string;
  pipelineCategory: string; nicheSlug: string;
  icon: string; color: string; badge?: string;
  capabilities: string[]; requiredApiKeys: string[];
  platforms: string[]; estimatedCostPerRun?: string;
  pricing?: { monthly: number; annual: number };
  isComingSoon: boolean;
  components?: { key: string; name: string; description: string; icon: string; isRequired: boolean; sortOrder: number }[];
  availableIn: string[];
}

interface Niche {
  slug: string; name: string; icon: string; color: string; availableIn: string[];
}

const COUNTRIES = [
  { code: 'UAE',   label: 'UAE',   flag: '🇦🇪' },
  { code: 'Kenya', label: 'Kenya', flag: '🇰🇪' },
];

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  active:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  trial:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  paused:    { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  expired:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  cancelled: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

// ── Subscribe Modal ───────────────────────────────────────────
function SubscribeModal({ module, country, onClose, onSuccess, colors, isDark }: {
  module: AvailableModule; country: string; onClose: () => void; onSuccess: () => void; colors: any; isDark: boolean;
}) {
  const isNichePipeline = module.pipelineCategory === "niche_pipeline";
  const [step, setStep] = useState<"overview" | "setup">("overview");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: module.name, niche: "",
    scheduleFrequency: "daily", scheduleTime: "22:30",
    apiKeyMode: "own_keys",
  });

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
  };

  const handleSubscribe = async () => {
    if (!isNichePipeline && !form.niche.trim()) { setError("Content niche is required"); return; }
    setSaving(true); setError("");
    try {
      await api.post("/usermodules/subscribe", {
        moduleId: module._id, moduleName: module.name,
        moduleType: module.moduleType, pipelineType: module.pipelineType,
        name: form.name, niche: form.niche, apiKeyMode: form.apiKeyMode,
        scheduleFrequency: form.scheduleFrequency, scheduleTime: form.scheduleTime,
        country, nicheSlug: module.nicheSlug, pipelineCategory: module.pipelineCategory,
      });
      toast.success(isNichePipeline ? "Pipeline activated — 30-day trial started!" : "Module added — 30-day trial started!");
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to subscribe");
    }
    setSaving(false);
  };

  const needsYouTube = module.pipelineType === "youtube" || module.platforms?.includes("youtube");
  const needsInstagram = module.pipelineType === "instagram" || module.platforms?.includes("instagram");
  const countryFlag = country === "UAE" ? "🇦🇪" : "🇰🇪";

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "24px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "18px", width: "100%", maxWidth: "520px",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${panelBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px", fontSize: "22px",
                background: `${module.color}15`, border: `1px solid ${module.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{module.icon}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111" }}>{module.name}</p>
                  {isNichePipeline && (
                    <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", background: `${module.color}20`, color: module.color, fontWeight: 700, border: `1px solid ${module.color}30` }}>PIPELINE</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>30-day free trial · No credit card</p>
                  <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", border: `1px solid ${colors.border}`, color: colors.textMuted }}>{countryFlag} {country}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: "28px", height: "28px", borderRadius: "7px",
              border: `1px solid ${panelBorder}`, background: "transparent",
              color: isDark ? "#737373" : "#6b7280", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}><X size={13} /></button>
          </div>
          <div style={{ display: "flex", gap: "2px", marginTop: "16px", background: colors.bg, borderRadius: "8px", padding: "3px" }}>
            {(["overview", "setup"] as const).map((s) => (
              <button key={s} onClick={() => setStep(s)} style={{
                flex: 1, padding: "6px", borderRadius: "6px", fontSize: "12px",
                fontWeight: step === s ? 600 : 400, cursor: "pointer", border: "none",
                background: step === s ? (isDark ? "#1a1a1a" : "#ffffff") : "transparent",
                color: step === s ? colors.text : colors.textMuted,
                boxShadow: step === s ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}>{s === "overview" ? "Overview" : "Setup"}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          {/* ── OVERVIEW ── */}
          {step === "overview" && (
            <div>
              {module.tagline && (
                <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "20px" }}>{module.tagline}</p>
              )}

              {/* Niche pipeline: show components */}
              {isNichePipeline && module.components && module.components.length > 0 ? (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "10px" }}>
                    What's included ({module.components.length} agents):
                  </p>
                  {module.components
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((c, i) => (
                      <div key={c.key} style={{
                        display: "flex", alignItems: "flex-start", gap: "10px",
                        padding: "10px 12px", borderRadius: "8px", marginBottom: "6px",
                        background: colors.bg, border: `1px solid ${colors.border}`,
                      }}>
                        <div style={{ fontSize: "18px", flexShrink: 0, marginTop: "1px" }}>{c.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>{c.name}</p>
                            {c.isRequired && (
                              <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "3px", background: "rgba(124,58,237,0.1)", color: "#a78bfa", fontWeight: 600 }}>CORE</span>
                            )}
                          </div>
                          <p style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.5 }}>{c.description}</p>
                        </div>
                        <span style={{ fontSize: "11px", color: colors.textMuted, flexShrink: 0, marginTop: "2px" }}>#{i + 1}</span>
                      </div>
                    ))}
                </div>
              ) : (
                module.capabilities?.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "10px" }}>What this module does:</p>
                    {module.capabilities.map((cap, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                        <Check size={13} color={module.color} style={{ marginTop: "2px", flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", color: colors.textMuted }}>{cap}</span>
                      </div>
                    ))}
                  </div>
                )
              )}

              <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: "9px", padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>Pricing</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#22c55e" }}>
                    {module.pricing?.monthly ? `$${module.pricing.monthly}/mo` : "Free"}
                  </p>
                </div>
                {module.estimatedCostPerRun && (
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>+ ~{module.estimatedCostPerRun} in API costs per run</p>
                )}
                <p style={{ fontSize: "12px", color: "#22c55e", marginTop: "6px", fontWeight: 500 }}>✓ 30-day free trial included</p>
              </div>
            </div>
          )}

          {/* ── SETUP ── */}
          {step === "setup" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Country confirmation */}
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: colors.bg, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: colors.text }}>Country</p>
                  <p style={{ fontSize: "11px", color: colors.textMuted }}>Module will be set up for this market</p>
                </div>
                <span style={{ fontSize: "14px", fontWeight: 700, color: colors.text }}>{countryFlag} {country}</span>
              </div>

              {/* For niche pipelines: show component summary instead of niche field */}
              {isNichePipeline ? (
                <div style={{ padding: "12px 14px", borderRadius: "8px", background: `${module.color}08`, border: `1px solid ${module.color}20` }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: module.color, marginBottom: "8px" }}>
                    {module.components?.length || 0} agents will be activated:
                  </p>
                  {module.components?.map(c => (
                    <div key={c.key} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px" }}>{c.icon}</span>
                      <span style={{ fontSize: "12px", color: colors.textMuted }}>{c.name}</span>
                      {c.isRequired && <span style={{ fontSize: "10px", color: "#a78bfa", marginLeft: "auto" }}>core</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Module Name</label>
                    <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="My YouTube Agent" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
                      Content Niche * <span style={{ fontWeight: 400 }}>— click 🔄 for suggestions</span>
                    </label>
                    <NicheSuggester value={form.niche} onChange={(v) => setForm(f => ({ ...f, niche: v }))} pipelineType={module.pipelineType} colors={colors} isDark={isDark} />
                    <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "4px" }}>AI will research topics and create content for this niche.</p>
                  </div>
                </>
              )}

              {needsYouTube && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>YouTube Channel</label>
                  <YouTubeConnectButton colors={colors} />
                </div>
              )}
              {needsInstagram && (
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Instagram Account</label>
                  <InstagramConnectButton colors={colors} />
                </div>
              )}

              {/* Schedule — only for standalone agents */}
              {!isNichePipeline && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Schedule</label>
                    <select value={form.scheduleFrequency} onChange={(e) => setForm(f => ({ ...f, scheduleFrequency: e.target.value }))} style={inp}>
                      <option value="manual">Manual only</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>Run Time (24hr)</label>
                    <input type="time" value={form.scheduleTime} onChange={(e) => setForm(f => ({ ...f, scheduleTime: e.target.value }))} style={inp} />
                  </div>
                </div>
              )}

              <div style={{ padding: "10px 14px", borderRadius: "8px", border: "2px solid #22c55e", background: "rgba(34,197,94,0.05)" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "#22c55e", marginBottom: "2px" }}>Own API Keys ✓</p>
                <p style={{ fontSize: "11px", color: colors.textMuted }}>Uses your OpenAI and Seedance keys from Settings → API Keys.</p>
              </div>

              {error && (
                <p style={{ fontSize: "12px", color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "7px" }}>{error}</p>
              )}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${panelBorder}`, display: "flex", gap: "10px" }}>
          {step === "overview" ? (
            <>
              <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", border: `1px solid ${panelBorder}`, background: "transparent", color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px" }}>Cancel</button>
              <button onClick={() => setStep("setup")} style={{ flex: 2, padding: "10px", borderRadius: "8px", cursor: "pointer", background: `linear-gradient(135deg, ${module.color}, ${module.color}cc)`, color: "white", border: "none", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                {isNichePipeline ? "Activate Pipeline" : "Set Up Module"} <ChevronRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep("overview")} style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", border: `1px solid ${panelBorder}`, background: "transparent", color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px" }}>Back</button>
              <button onClick={handleSubscribe} disabled={saving} style={{ flex: 2, padding: "10px", borderRadius: "8px", cursor: saving ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", border: "none", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                {saving ? "Activating..." : isNichePipeline ? "Activate Pipeline" : "Start Free Trial"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Marketplace Modal ─────────────────────────────────────────
function MarketplaceModal({ onClose, onSubscribed, colors, isDark, country, onCountryChange }: {
  onClose: () => void; onSubscribed: () => void; colors: any; isDark: boolean;
  country: string; onCountryChange: (c: string) => void;
}) {
  const [modules, setModules] = useState<AvailableModule[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeNiche, setActiveNiche] = useState("all");
  const [selected, setSelected] = useState<AvailableModule | null>(null);

  const panelBg = isDark ? "#111111" : "#f8f8f8";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";

  useEffect(() => {
    setLoading(true);
    setActiveNiche("all");
    Promise.all([
      api.get(`/modules?limit=100&country=${country}`),
      api.get(`/niches?country=${country}`),
    ]).then(([modRes, nicheRes]) => {
      setModules(modRes.data?.data || []);
      setNiches(nicheRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [country]);

  const filtered = modules.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchNiche = activeNiche === "all" || m.nicheSlug === activeNiche;
    return matchSearch && matchNiche;
  });

  if (selected) {
    return <SubscribeModal module={selected} country={country} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); onClose(); onSubscribed(); }} colors={colors} isDark={isDark} />;
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: panelBg, border: `1px solid ${panelBorder}`, borderRadius: "18px", width: "100%", maxWidth: "780px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${panelBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111" }}>Module Marketplace</p>
              <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>Choose a module to add to your account</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Country selector */}
              <select
                value={country}
                onChange={(e) => onCountryChange(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, cursor: "pointer", outline: "none" }}
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
                ))}
              </select>
              <button onClick={onClose} style={{ width: "28px", height: "28px", borderRadius: "7px", border: `1px solid ${panelBorder}`, background: "transparent", color: isDark ? "#737373" : "#6b7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <Search size={13} color={colors.textMuted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: "8px", fontSize: "13px", border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, outline: "none", boxSizing: "border-box" as const }} />
          </div>

          {/* Niche tabs */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
            <button
              onClick={() => setActiveNiche("all")}
              style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", border: `1px solid ${activeNiche === "all" ? "#7c3aed" : colors.border}`, background: activeNiche === "all" ? "rgba(124,58,237,0.1)" : "transparent", color: activeNiche === "all" ? "#a78bfa" : colors.textMuted }}
            >
              All
            </button>
            {niches.map(n => (
              <button
                key={n.slug}
                onClick={() => setActiveNiche(n.slug)}
                style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", border: `1px solid ${activeNiche === n.slug ? n.color : colors.border}`, background: activeNiche === n.slug ? `${n.color}15` : "transparent", color: activeNiche === n.slug ? n.color : colors.textMuted }}
              >
                {n.icon} {n.name}
              </button>
            ))}
          </div>
        </div>

        {/* Module grid */}
        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px" }}>
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center" }}><Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center" }}>
              {modules.length === 0 ? (
                <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "32px 24px" }}>
                  <AlertTriangle size={28} color="#f59e0b" style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#e5e5e5" : "#111", marginBottom: "6px" }}>No modules available yet</p>
                  <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>Admin hasn't published any modules yet.</p>
                </div>
              ) : (
                <p style={{ fontSize: "13px", color: colors.textMuted }}>No modules match your search</p>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {filtered.map((m) => (
                <div key={m._id}
                  style={{ background: isDark ? "#1a1a1a" : "#ffffff", border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "16px", cursor: m.isComingSoon ? "not-allowed" : "pointer", opacity: m.isComingSoon ? 0.6 : 1, transition: "border-color 0.15s" }}
                  onClick={() => !m.isComingSoon && setSelected(m)}
                  onMouseEnter={(e) => { if (!m.isComingSoon) (e.currentTarget as HTMLDivElement).style.borderColor = `${m.color}50`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = colors.border; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "9px", fontSize: "20px", background: `${m.color}12`, border: `1px solid ${m.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{m.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#e5e5e5" : "#111" }}>{m.name}</p>
                        {m.pipelineCategory === "niche_pipeline" && (
                          <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "4px", background: `${m.color}15`, color: m.color, fontWeight: 700, border: `1px solid ${m.color}25` }}>PIPELINE</span>
                        )}
                      </div>
                      <p style={{ fontSize: "11px", color: isDark ? "#737373" : "#6b7280", textTransform: "capitalize" }}>{m.moduleType} · {m.category}</p>
                    </div>
                    {m.isComingSoon ? (
                      <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "9999px", background: "rgba(107,114,128,0.1)", color: "#6b7280", fontWeight: 600 }}>Soon</span>
                    ) : (
                      <span style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "9999px", background: "rgba(34,197,94,0.1)", color: "#22c55e", fontWeight: 600 }}>Free Trial</span>
                    )}
                  </div>

                  {m.tagline && <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280", lineHeight: 1.5, marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{m.tagline}</p>}

                  {/* Niche pipeline: show component list preview */}
                  {m.pipelineCategory === "niche_pipeline" && m.components && m.components.length > 0 && (
                    <div style={{ marginBottom: "10px" }}>
                      {m.components.slice(0, 3).map(c => (
                        <div key={c.key} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                          <span style={{ fontSize: "10px" }}>{c.icon}</span>
                          <span style={{ fontSize: "11px", color: colors.textMuted }}>{c.name}</span>
                        </div>
                      ))}
                      {m.components.length > 3 && (
                        <p style={{ fontSize: "10px", color: colors.textMuted, marginTop: "2px" }}>+{m.components.length - 3} more components</p>
                      )}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: m.pricing?.monthly ? isDark ? "#e5e5e5" : "#111" : "#22c55e" }}>{m.pricing?.monthly ? `$${m.pricing.monthly}/mo` : "Free"}</span>
                    {!m.isComingSoon && <span style={{ fontSize: "11px", color: m.color, fontWeight: 500 }}>{m.pipelineCategory === "niche_pipeline" ? "Set up pipeline →" : "Get started →"}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function MyModulesPage() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [agents, setAgents] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [editModule, setEditModule] = useState<UserModule | null>(null);
  const [runningModuleId, setRunningModuleId] = useState<string | null>(null);
  const [country, setCountry] = useState("UAE");

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await api.get("/usermodules/my");
      setAgents(res.data?.data || res.data || []);
    } catch {}
    setLoading(false);
  };

  const toggleModule = async (id: string) => {
    try { await api.patch(`/usermodules/${id}/toggle`); fetchModules(); } catch {}
  };

  const deleteModule = async (id: string) => {
    if (!confirm("Remove this module? This cannot be undone.")) return;
    try { await api.delete(`/usermodules/${id}`); toast.success("Module removed"); fetchModules(); } catch {}
  };

  const handleRunNow = async (id: string) => {
    try {
      setRunningModuleId(id);
      await api.post(`/usermodules/${id}/run`);
      toast.success("Pipeline started! Takes 15-25 min. You'll get a notification when done.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start pipeline");
    } finally {
      setRunningModuleId(null);
    }
  };

  const filtered = agents.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.niche?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const inp = { padding: "8px 12px", borderRadius: "8px", fontSize: "13px", border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, outline: "none" };

  // Format schedule display
  const formatSchedule = (module: UserModule) => {
    if (!module.scheduleFrequency || module.scheduleFrequency === "manual") return "Manual";
    const time = module.scheduleTime || "08:00";
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${module.scheduleFrequency === "daily" ? "Daily" : "Weekly"} ${hour}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>My Modules</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>Manage your subscribed agents and automations.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Country selector */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.text, cursor: "pointer", outline: "none" }}
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
            ))}
          </select>
          <button onClick={() => setShowMarketplace(true)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px", borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
            <Plus size={15} /> Add Module
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "12px 16px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={13} color={colors.textMuted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." style={{ ...inp, width: "100%", paddingLeft: "30px", boxSizing: "border-box" as const }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inp, minWidth: "130px" }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
        </select>
        <span style={{ fontSize: "12px", color: colors.textMuted, marginLeft: "auto" }}>{filtered.length} module{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
          <Package size={40} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>{search ? "No modules found" : "No modules yet"}</h2>
          <p style={{ color: colors.textMuted, fontSize: "14px", marginBottom: "20px" }}>{search ? "Try a different search term." : "Browse the marketplace to add your first module."}</p>
          {!search && (
            <button onClick={() => setShowMarketplace(true)} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "8px", background: "#7c3aed", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
              <Plus size={15} /> Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
          {filtered.map((module) => {
            const sc = STATUS_COLORS[module.status] || STATUS_COLORS.paused;
            const isYouTube = module.pipelineType === "youtube";
            const isRunning = runningModuleId === module._id;
            return (
              <div key={module._id} style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "18px" }}>
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", fontSize: "20px", background: `${(module.moduleId as any)?.color || "#7c3aed"}15`, border: `1px solid ${(module.moduleId as any)?.color || "#7c3aed"}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {(module.moduleId as any)?.icon || "🤖"}
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>{module.name}</p>
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>{module.moduleName}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "9999px", background: sc.bg, color: sc.color }}>
                      {module.status}
                    </span>
                  </div>
                </div>
 
                {/* Niche */}
                {module.niche && (
                  <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "10px", lineHeight: 1.5 }}>{module.niche}</p>
                )}
 
                {/* Stats row */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                  {[
                    { label: "Runs", value: module.totalRuns ?? 0 },
                    { label: "Spent", value: `$${(module.totalCost || 0).toFixed(2)}` },
                    { label: "Schedule", value: formatSchedule(module) },
                  ].map((s, i) => (
                    <div key={i} style={{ flex: 1, padding: "6px 8px", background: colors.bg, borderRadius: "7px", border: `1px solid ${colors.border}`, textAlign: "center" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.value}</p>
                      <p style={{ fontSize: "10px", color: colors.textMuted }}>{s.label}</p>
                    </div>
                  ))}
                </div>
 
                {/* YouTube connect — compact */}
                {isYouTube && (
                  <div style={{ marginBottom: "10px" }}>
                    <YouTubeConnectButton colors={colors} compact />
                  </div>
                )}

                {/* Instagram connect — compact */}
                {module.pipelineType === "instagram" && (
                  <div style={{ marginBottom: "10px" }}>
                    <InstagramConnectButton colors={colors} compact />
                  </div>
                )}
 
                {/* Pipeline status widget */}
                <div style={{ marginBottom: "10px" }}>
                  <PipelineStatusWidget
                    userModuleId={module._id}
                    colors={colors}
                    onRunNow={() => setEditModule(module)}
                  />
                </div>
 
                {/* Configure & Run button + pause + delete */}
                <div style={{ display: "flex", gap: "6px", alignItems: "stretch" }}>
                  <button onClick={() => setEditModule(module)} style={{
                    flex: 1, padding: "9px 14px", borderRadius: "8px", cursor: "pointer",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "white", border: "none", fontSize: "12px", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
                  }}>
                    <Settings2 size={13} /> Configure & Run
                  </button>
                  <button onClick={() => toggleModule(module._id)} title={["active", "trial"].includes(module.status) ? "Pause" : "Resume"} style={{ width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", border: `1px solid ${colors.border}`, background: colors.bg, color: ["active", "trial"].includes(module.status) ? "#f59e0b" : "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {["active", "trial"].includes(module.status) ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button onClick={() => deleteModule(module._id)} title="Remove" style={{ width: "36px", height: "36px", borderRadius: "8px", cursor: "pointer", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Marketplace modal */}
      {showMarketplace && (
        <MarketplaceModal onClose={() => setShowMarketplace(false)} onSubscribed={fetchModules} colors={colors} isDark={isDark} country={country} onCountryChange={setCountry} />
      )}

      {/* Edit module modal */}
      {editModule && (
        <EditModuleModal
          module={editModule}
          onClose={() => setEditModule(null)}
          onSaved={fetchModules}
          onRunNow={() => handleRunNow(editModule._id)}
          colors={colors}
          isDark={isDark}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}