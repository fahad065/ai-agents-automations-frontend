"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Bot, Plus, Pencil, Trash2, Search, Loader2,
  X, Save, ChevronRight, ChevronLeft, Check,
  Trash,
} from "lucide-react";

const MODULE_TYPES = [
  { value: "agent",      label: "Agent",      desc: "AI agent that runs tasks automatically", icon: "🤖" },
  { value: "automation", label: "Automation",  desc: "Workflow automation triggered by events", icon: "⚡" },
];

const CATEGORIES = [
  { value: "youtube",      label: "YouTube",      icon: "🎬" },
  { value: "instagram",    label: "Instagram",    icon: "📸" },
  { value: "tiktok",       label: "TikTok",       icon: "🎵" },
  { value: "arabic",       label: "Arabic",       icon: "🌍" },
  { value: "podcast",      label: "Podcast",      icon: "🎙️" },
  { value: "sales",        label: "Sales",        icon: "💰" },
  { value: "real_estate",  label: "Real Estate",  icon: "🏠" },
  { value: "support",      label: "Support",      icon: "🎧" },
  // { value: "social",       label: "Social Media", icon: "📱" },
  { value: "social_media", label: "Social Media", icon: "📲" },
  { value: "email",        label: "Email",        icon: "📧" },
  { value: "content",      label: "Content",      icon: "📝" },
  { value: "marketing",    label: "Marketing",    icon: "📢" },
  { value: "operations",   label: "Operations",   icon: "⚙️" },
  { value: "finance",      label: "Finance",      icon: "💹" },
  { value: "custom",       label: "Custom",       icon: "🔧" },
];

const PIPELINE_TYPES = [
  { value: "youtube",             label: "YouTube",              desc: "✅ Live" },
  { value: "instagram",           label: "Instagram",            desc: "Built, not connected" },
  { value: "tiktok",              label: "TikTok",               desc: "Coming soon" },
  { value: "arabic",              label: "Arabic Content",       desc: "Coming soon" },
  { value: "podcast",             label: "Podcast",              desc: "Coming soon" },
  { value: "whatsapp",            label: "WhatsApp",             desc: "Planned" },
  { value: "real_estate",         label: "Real Estate",          desc: "Planned" },
  { value: "support",             label: "Customer Support",     desc: "Planned" },
  { value: "social_scheduler",    label: "Social Scheduler",     desc: "Coming soon" },
  { value: "email_marketing",     label: "Email Marketing",      desc: "Coming soon" },
  { value: "lead_generation",     label: "Lead Generation",      desc: "Coming soon" },
  { value: "content_repurposing", label: "Content Repurposing",  desc: "Coming soon" },
  { value: "custom",              label: "Custom / Manual",      desc: "No auto pipeline" },
];

const OUTPUT_TYPES = [
  { value: "video",    label: "Video",        icon: "🎬" },
  { value: "audio",    label: "Audio",        icon: "🎙️" },
  { value: "messages", label: "Messages",     icon: "💬" },
  { value: "leads",    label: "Leads",        icon: "🎯" },
  { value: "posts",    label: "Social Posts", icon: "📱" },
  { value: "emails",   label: "Emails",       icon: "📧" },
  { value: "content",  label: "Content",      icon: "📝" },
  { value: "reports",  label: "Reports",      icon: "📊" },
];

const API_KEYS_OPTIONS = [
  { value: "openai",    label: "OpenAI" },
  { value: "seedance",  label: "Seedance" },
  { value: "atlas",     label: "Atlas Cloud" },
  { value: "youtube",   label: "YouTube API" },
  { value: "instagram", label: "Instagram API" },
  { value: "tiktok",    label: "TikTok API" },
  { value: "whatsapp",  label: "WhatsApp API" },
  { value: "spotify",   label: "Spotify API" },
  { value: "linkedin",  label: "LinkedIn API" },
  { value: "twitter",   label: "Twitter API" },
  { value: "facebook",  label: "Facebook API" },
];

const PLATFORMS = [
  { value: "youtube",   label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok",    label: "TikTok" },
  { value: "twitter",   label: "Twitter/X" },
  { value: "facebook",  label: "Facebook" },
  { value: "linkedin",  label: "LinkedIn" },
  { value: "spotify",   label: "Spotify" },
  { value: "whatsapp",  label: "WhatsApp" },
  { value: "email",     label: "Email" },
  { value: "web",       label: "Web" },
];

const ICON_OPTIONS = [
  "🎬","🎙️","📢","🏠","🛒","🎓","💪","📱","🎯","🤖",
  "⚡","📝","📊","📧","🔑","💡","🚀","💰","🌍","⚙️",
  "🔥","✨","🎵","📸","🎭","🧠","💼","🏆","🌟","📌",
  "💬","🎧","🏙️","♻️","📅","💹","🔧","🌐","🤝","🔗",
];

const COLOR_PRESETS = [
  "#7c3aed","#ef4444","#22c55e","#3b82f6",
  "#f59e0b","#ec4899","#06b6d4","#8b5cf6",
  "#10b981","#f97316","#6366f1","#14b8a6",
  "#e1306c","#25d366","#0088cc","#000000",
];

const BADGE_OPTIONS = ["Live", "New", "Popular", "Beta", "Pro", "Coming Soon", "Free", "Hot", "Featured"];

const STEPS = ["Basics", "Pipeline", "Content", "Pricing", "Detail Pages"];

const formatCategoryLabel = (val: string) =>
  val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

interface AgentTemplate {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  tagline?: string;
  moduleType: string;
  category: string;
  pipelineType: string;
  outputType: string;
  icon: string;
  color: string;
  badge?: string;
  isActive: boolean;
  isComingSoon: boolean;
  requiredApiKeys: string[];
  estimatedCostPerRun?: string;
  platforms: string[];
  capabilities: string[];
  sortOrder: number;
  pricing?: { monthly: number; annual: number; features: string[]; hasCustomPlan?: boolean; customLabel?: string };
  heroStats?: { label: string; value: string }[];
  features?: { title: string; description: string; icon: string }[];
  howItWorks?: { step: string; title: string; description: string }[];
  testimonials?: { name: string; role: string; avatar: string; text: string; rating: number }[];
  faq?: { question: string; answer: string }[];
  demoVideoUrl?: string;
  totalUsersCount: number;
  totalRunsCount: number;
}

const autoSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const toggleArr = (arr: string[], item: string) =>
  arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

function Stepper({ step, colors }: { step: number; colors: any }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
      {STEPS.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                background: done ? "#22c55e" : active ? "#7c3aed" : colors.border,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: 700,
                color: done || active ? "white" : colors.textMuted,
              }}>
                {done ? <Check size={12} /> : num}
              </div>
              <span style={{
                fontSize: "9px", fontWeight: active ? 600 : 400, whiteSpace: "nowrap",
                color: active ? "#7c3aed" : done ? "#22c55e" : colors.textMuted,
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "2px", margin: "0 4px", marginBottom: "14px",
                background: done ? "#22c55e" : colors.border,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TemplateModal({ template, nextSortOrder, onClose, onSave, colors, isDark }: {
  template?: AgentTemplate;
  nextSortOrder: number;
  onClose: () => void;
  onSave: () => void;
  colors: any;
  isDark: boolean;
}) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: template?.name || "",
    slug: template?.slug || "",
    tagline: template?.tagline || "",
    description: template?.description || "",
    moduleType: template?.moduleType || "agent",
    category: template?.category || "custom",
    icon: template?.icon || "🤖",
    color: template?.color || "#7c3aed",
    badge: template?.badge || "Coming Soon",
    isActive: template?.isActive ?? true,
    isComingSoon: template?.isComingSoon ?? false,
    sortOrder: template?.sortOrder ?? nextSortOrder,
    pipelineType: template?.pipelineType || "custom",
    outputType: template?.outputType || "video",
    requiredApiKeys: template?.requiredApiKeys || [] as string[],
    platforms: template?.platforms || [] as string[],
    estimatedCostPerRun: template?.estimatedCostPerRun || "",
    capabilities: (template?.capabilities || []).join("\n"),
    heroStats: template?.heroStats || [{ label: "", value: "" }] as { label: string; value: string }[],
    features: template?.features || [{ title: "", description: "", icon: "✅" }] as { title: string; description: string; icon: string }[],
    howItWorks: template?.howItWorks || [{ step: "1", title: "", description: "" }] as { step: string; title: string; description: string }[],
    demoVideoUrl: template?.demoVideoUrl || "",
    monthlyPrice: template?.pricing?.monthly ?? 0,
    annualPrice: template?.pricing?.annual ?? 0,
    pricingFeatures: (template?.pricing?.features || []).join("\n"),
    hasCustomPlan: template?.pricing?.hasCustomPlan ?? false,
    customLabel: template?.pricing?.customLabel || "Contact us for custom pricing",
    testimonials: template?.testimonials || [] as { name: string; role: string; avatar: string; text: string; rating: number }[],
    faq: template?.faq || [{ question: "", answer: "" }] as { question: string; answer: string }[]
  });

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
  };

  const chipStyle = (active: boolean, color = "#7c3aed") => ({
    padding: "5px 10px", borderRadius: "20px", fontSize: "11px", cursor: "pointer",
    border: `1px solid ${active ? color : colors.border}`,
    background: active ? `${color}12` : "transparent",
    color: active ? color : colors.textMuted,
    fontWeight: active ? 600 : 400,
  });

  const lbl = (text: string, hint?: string) => (
    <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: colors.textMuted, marginBottom: "5px" }}>
      {text} {hint && <span style={{ fontWeight: 400, fontSize: "11px" }}>{hint}</span>}
    </label>
  );

  const validateStep = () => {
    if (step === 1 && !form.name.trim()) { setError("Module name is required"); return false; }
    setError(""); return true;
  };

  const handleSave = async () => {
    if (!validateStep()) return;
    setSaving(true); setError("");
    try {
      const payload = {
        name: form.name,
        slug: form.slug || autoSlug(form.name),
        tagline: form.tagline,
        description: form.description,
        moduleType: form.moduleType,
        category: form.category,
        icon: form.icon,
        color: form.color,
        badge: form.badge,
        isActive: form.isActive,
        isComingSoon: form.isComingSoon,
        sortOrder: form.sortOrder,
        pipelineType: form.pipelineType,
        outputType: form.outputType,
        requiredApiKeys: form.requiredApiKeys,
        platforms: form.platforms,
        estimatedCostPerRun: form.estimatedCostPerRun,
        capabilities: form.capabilities.split("\n").map(c => c.trim()).filter(Boolean),
        heroStats: form.heroStats.filter(s => s.label && s.value),
        features: form.features.filter(f => f.title),
        howItWorks: form.howItWorks.filter(h => h.title),
        pricing: {
          monthly: form.monthlyPrice,
          annual: form.annualPrice,
          features: form.pricingFeatures.split("\n").map(f => f.trim()).filter(Boolean),
          hasCustomPlan: (form as any).hasCustomPlan,
          customLabel: (form as any).customLabel,
        },
        testimonials: form.testimonials.filter(t => t.name && t.text),
        faq: form.faq.filter(f => f.question && f.answer),
        demoVideoUrl: form.demoVideoUrl,
      };

      if (template?._id) {
        await api.patch(`/modules/${template.slug}`, payload);
      } else {
        await api.post("/modules", payload);
      }
      toast.success(template ? "Module updated successfully" : "Module created successfully");
      onSave();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save module");
    }
    setSaving(false);
  };

  const addItem = (field: string, empty: any) =>
    setForm(f => ({ ...f, [field]: [...(f as any)[field], empty] }));

  const removeItem = (field: string, index: number) =>
    setForm(f => ({ ...f, [field]: (f as any)[field].filter((_: any, i: number) => i !== index) }));

  const updateItem = (field: string, index: number, key: string, value: any) =>
    setForm(f => ({
      ...f,
      [field]: (f as any)[field].map((item: any, i: number) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: panelBg, border: `1px solid ${panelBorder}`,
        borderRadius: "18px", width: "100%", maxWidth: "780px",
        height: "92vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 28px 16px", borderBottom: `1px solid ${panelBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#e5e5e5" : "#111" }}>
                {template ? "Edit Module" : "Create New Module"}
              </p>
              <p style={{ fontSize: "12px", color: isDark ? "#737373" : "#6b7280" }}>Step {step} of {STEPS.length}</p>
            </div>
            <button onClick={onClose} style={{
              width: "30px", height: "30px", borderRadius: "8px", border: `1px solid ${panelBorder}`,
              background: "transparent", color: isDark ? "#737373" : "#6b7280",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X size={14} />
            </button>
          </div>
          <Stepper step={step} colors={colors} />
        </div>

        {/* Form body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 28px" }}>

          {/* ── STEP 1: BASICS ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                {lbl("Module Type *")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {MODULE_TYPES.map((t) => (
                    <button key={t.value} onClick={() => setForm(f => ({ ...f, moduleType: t.value }))} style={{
                      padding: "12px 14px", borderRadius: "10px", cursor: "pointer", textAlign: "left",
                      border: `2px solid ${form.moduleType === t.value ? "#7c3aed" : colors.border}`,
                      background: form.moduleType === t.value ? "rgba(124,58,237,0.08)" : colors.bg,
                    }}>
                      <div style={{ fontSize: "20px", marginBottom: "4px" }}>{t.icon}</div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: form.moduleType === t.value ? "#a78bfa" : colors.text }}>{t.label}</p>
                      <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  {lbl("Name *")}
                  <input value={form.name} onChange={(e) => setForm(f => ({
                    ...f, name: e.target.value,
                    slug: template ? f.slug : autoSlug(e.target.value),
                  }))} style={inp} placeholder="YouTube Agent" />
                </div>
                <div>
                  {lbl("Slug *")}
                  <input value={form.slug}
                    onChange={(e) => setForm(f => ({ ...f, slug: autoSlug(e.target.value) }))}
                    style={{ ...inp, opacity: template ? 0.6 : 1 }}
                    placeholder="youtube-agent" disabled={!!template} />
                </div>
              </div>

              <div>
                {lbl("Tagline")}
                <input value={form.tagline} onChange={(e) => setForm(f => ({ ...f, tagline: e.target.value }))}
                  style={inp} placeholder="Automate your YouTube channel with AI" />
              </div>

              <div>
                {lbl("Description")}
                <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} style={{ ...inp, resize: "vertical" as const }} placeholder="Full description..." />
              </div>

              <div>
                {lbl("Category")}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {CATEGORIES.map((c) => (
                    <button key={c.value} onClick={() => setForm(f => ({ ...f, category: c.value }))}
                      style={chipStyle(form.category === c.value)}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  {lbl("Icon", `— selected: ${form.icon}`)}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {ICON_OPTIONS.map((ic, idx) => (
                      <button key={`${ic}-${idx}`} onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{
                        width: "34px", height: "34px", borderRadius: "7px", fontSize: "17px",
                        cursor: "pointer",
                        border: `2px solid ${form.icon === ic ? "#7c3aed" : colors.border}`,
                        background: form.icon === ic ? "rgba(124,58,237,0.1)" : colors.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>{ic}</button>
                    ))}
                  </div>
                </div>
                <div>
                  {lbl("Brand Color")}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                    {COLOR_PRESETS.map((c) => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{
                        width: "26px", height: "26px", borderRadius: "50%", background: c,
                        cursor: "pointer", border: `3px solid ${form.color === c ? "white" : "transparent"}`,
                        boxShadow: form.color === c ? `0 0 0 2px ${c}` : "none", outline: "none",
                      }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input type="color" value={form.color}
                      onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                      style={{ width: "34px", height: "32px", borderRadius: "6px", border: `1px solid ${colors.border}`, cursor: "pointer", padding: "2px" }} />
                    <input value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))}
                      style={{ ...inp, width: "110px" }} placeholder="#7c3aed" />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "16px", alignItems: "start" }}>
                <div>
                  {lbl("Badge")}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {BADGE_OPTIONS.map((b) => (
                      <button key={b} onClick={() => setForm(f => ({ ...f, badge: b }))}
                        style={chipStyle(form.badge === b, "#f59e0b")}>{b}</button>
                    ))}
                  </div>
                </div>
                <div>
                  {lbl("Sort Order", "(auto-set)")}
                  <input type="number" value={form.sortOrder} min={0}
                    onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    style={{ ...inp, width: "80px" }} />
                  <p style={{ fontSize: "10px", color: colors.textMuted, marginTop: "3px" }}>Lower = shown first</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { key: "isActive", label: "Published", desc: "Visible on marketplace" },
                  { key: "isComingSoon", label: "Coming Soon", desc: "Show as coming soon" },
                ].map(({ key, label, desc }) => (
                  <div key={key} style={{
                    flex: 1, padding: "10px 14px", background: colors.bg,
                    border: `1px solid ${colors.border}`, borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 500, color: colors.text }}>{label}</p>
                      <p style={{ fontSize: "10px", color: colors.textMuted }}>{desc}</p>
                    </div>
                    <button onClick={() => setForm(f => ({ ...f, [key]: !(f as any)[key] }))} style={{
                      width: "38px", height: "20px", borderRadius: "10px", border: "none",
                      cursor: "pointer", position: "relative",
                      background: (form as any)[key] ? "#7c3aed" : colors.border, transition: "background 0.2s",
                    }}>
                      <div style={{
                        width: "14px", height: "14px", borderRadius: "50%", background: "white",
                        position: "absolute", top: "3px",
                        left: (form as any)[key] ? "21px" : "3px", transition: "left 0.2s",
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: PIPELINE ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                {lbl("Pipeline Type", "— tells Python which script to run")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {PIPELINE_TYPES.map((p) => (
                    <button key={p.value} onClick={() => setForm(f => ({ ...f, pipelineType: p.value }))} style={{
                      padding: "10px 12px", borderRadius: "8px", cursor: "pointer", textAlign: "left",
                      border: `2px solid ${form.pipelineType === p.value ? "#7c3aed" : colors.border}`,
                      background: form.pipelineType === p.value ? "rgba(124,58,237,0.08)" : colors.bg,
                    }}>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: form.pipelineType === p.value ? "#a78bfa" : colors.text }}>
                        {p.label}
                      </p>
                      <p style={{ fontSize: "10px", color: colors.textMuted }}>{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {lbl("Output Type")}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {OUTPUT_TYPES.map((o) => (
                    <button key={o.value} onClick={() => setForm(f => ({ ...f, outputType: o.value }))}
                      style={chipStyle(form.outputType === o.value)}>
                      {o.icon} {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {lbl("Required API Keys", "— shown to users before setup")}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {API_KEYS_OPTIONS.map((k) => (
                    <button key={k.value}
                      onClick={() => setForm(f => ({ ...f, requiredApiKeys: toggleArr(f.requiredApiKeys, k.value) }))}
                      style={chipStyle(form.requiredApiKeys.includes(k.value), "#f59e0b")}>
                      🔑 {k.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {lbl("Publishes To")}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {PLATFORMS.map((p) => (
                    <button key={p.value}
                      onClick={() => setForm(f => ({ ...f, platforms: toggleArr(f.platforms, p.value) }))}
                      style={chipStyle(form.platforms.includes(p.value), "#22c55e")}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {lbl("Estimated Cost Per Run")}
                <input value={form.estimatedCostPerRun}
                  onChange={(e) => setForm(f => ({ ...f, estimatedCostPerRun: e.target.value }))}
                  style={inp} placeholder="e.g. $3-5 per video" />
              </div>

              <div>
                {lbl("Capabilities", "— one per line")}
                <textarea value={form.capabilities}
                  onChange={(e) => setForm(f => ({ ...f, capabilities: e.target.value }))}
                  rows={6} style={{ ...inp, resize: "vertical" as const, lineHeight: 1.7 }}
                  placeholder={"Auto-generate video scripts\nAI video clips\nAutomatic upload\nSubtitle generation"} />
              </div>
            </div>
          )}

          {/* ── STEP 3: CONTENT ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                {lbl("Demo Video URL")}
                <input value={form.demoVideoUrl}
                  onChange={(e) => setForm(f => ({ ...f, demoVideoUrl: e.target.value }))}
                  style={inp} placeholder="https://youtu.be/..." />
              </div>

              <div>
                {lbl("Hero Stats", "— 4 numbers shown at top of detail page")}
                {form.heroStats.map((stat, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                    <input value={stat.value} onChange={(e) => updateItem("heroStats", i, "value", e.target.value)}
                      style={{ ...inp, width: "120px" }} placeholder="20+" />
                    <input value={stat.label} onChange={(e) => updateItem("heroStats", i, "label", e.target.value)}
                      style={inp} placeholder="Videos generated" />
                    <button onClick={() => removeItem("heroStats", i)} style={{
                      width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer", flexShrink: 0,
                      border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem("heroStats", { label: "", value: "" })} style={{
                  fontSize: "12px", color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                }}>+ Add stat</button>
              </div>

              <div>
                {lbl("Features", "— 'Everything included' section")}
                {form.features.map((feat, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input value={feat.icon} onChange={(e) => updateItem("features", i, "icon", e.target.value)}
                      style={{ ...inp, width: "50px" }} placeholder="✅" />
                    <input value={feat.title} onChange={(e) => updateItem("features", i, "title", e.target.value)}
                      style={{ ...inp, flex: 1 }} placeholder="Feature title" />
                    <input value={feat.description} onChange={(e) => updateItem("features", i, "description", e.target.value)}
                      style={{ ...inp, flex: 2 }} placeholder="Feature description" />
                    <button onClick={() => removeItem("features", i)} style={{
                      width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer", flexShrink: 0,
                      border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem("features", { title: "", description: "", icon: "✅" })} style={{
                  fontSize: "12px", color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                }}>+ Add feature</button>
              </div>

              <div>
                {lbl("How It Works", "— pipeline steps shown on detail page")}
                {form.howItWorks.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input value={h.step} onChange={(e) => updateItem("howItWorks", i, "step", e.target.value)}
                      style={{ ...inp, width: "50px" }} placeholder={`${i + 1}`} />
                    <input value={h.title} onChange={(e) => updateItem("howItWorks", i, "title", e.target.value)}
                      style={{ ...inp, flex: 1 }} placeholder="Step title" />
                    <input value={h.description} onChange={(e) => updateItem("howItWorks", i, "description", e.target.value)}
                      style={{ ...inp, flex: 2 }} placeholder="Step description" />
                    <button onClick={() => removeItem("howItWorks", i)} style={{
                      width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer", flexShrink: 0,
                      border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Trash size={12} />
                    </button>
                  </div>
                ))}
                <button onClick={() => addItem("howItWorks", { step: `${form.howItWorks.length + 1}`, title: "", description: "" })} style={{
                  fontSize: "12px", color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                }}>+ Add step</button>
              </div>
            </div>
          )}

          {/* ── STEP 4: PRICING ── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  {lbl("Monthly Price ($)")}
                  <input type="number" value={form.monthlyPrice} min={0}
                    onChange={(e) => setForm(f => ({ ...f, monthlyPrice: parseFloat(e.target.value) || 0 }))}
                    style={inp} placeholder="49" />
                </div>
                <div>
                  {lbl("Annual Price ($)", "— per month billed annually")}
                  <input type="number" value={form.annualPrice} min={0}
                    onChange={(e) => setForm(f => ({ ...f, annualPrice: parseFloat(e.target.value) || 0 }))}
                    style={inp} placeholder="39" />
                </div>
              </div>

              <div style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: "9px", padding: "12px 14px" }}>
                <p style={{ fontSize: "12px", color: "#a78bfa" }}>
                  💡 Set to <strong>0</strong> for free.
                  {form.monthlyPrice > 0 && ` Annual saves: $${(form.monthlyPrice - form.annualPrice) * 12}/year`}
                </p>
              </div>

              <div>
                {lbl("Pricing Features", "— one per line")}
                <textarea value={form.pricingFeatures}
                  onChange={(e) => setForm(f => ({ ...f, pricingFeatures: e.target.value }))}
                  rows={8} style={{ ...inp, resize: "vertical" as const, lineHeight: 1.7 }}
                  placeholder={"Unlimited pipeline runs\nDaily trend discovery\nAuto YouTube upload\nEmail notifications\nPriority support"} />
              </div>

              <div style={{ marginTop: "16px" }}>
                {lbl("Custom / Enterprise Plan")}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 14px", background: colors.bg,
                  border: `1px solid ${colors.border}`, borderRadius: "8px",
                  marginBottom: "10px",
                }}>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>Show Custom Pricing Option</p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>Shows "Contact us" card alongside standard pricing</p>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, hasCustomPlan: !(f as any).hasCustomPlan }))} style={{
                    width: "38px", height: "20px", borderRadius: "10px", border: "none",
                    cursor: "pointer", position: "relative",
                    background: (form as any).hasCustomPlan ? "#7c3aed" : colors.border,
                    transition: "background 0.2s",
                  }}>
                    <div style={{
                      width: "14px", height: "14px", borderRadius: "50%", background: "white",
                      position: "absolute", top: "3px",
                      left: (form as any).hasCustomPlan ? "21px" : "3px", transition: "left 0.2s",
                    }} />
                  </button>
                </div>
                {(form as any).hasCustomPlan && (
                  <input
                    value={(form as any).customLabel || ""}
                    onChange={e => setForm(f => ({ ...f, customLabel: e.target.value }))}
                    style={inp}
                    placeholder="Contact us for custom pricing"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── STEP 5: DETAIL PAGES ── */}
          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div>
                {lbl("Testimonials", "— 'What creators say' section. Only add real ones.")}
                {form.testimonials.map((t, i) => (
                  <div key={i} style={{
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    borderRadius: "8px", padding: "12px", marginBottom: "10px",
                  }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input value={t.name} onChange={(e) => updateItem("testimonials", i, "name", e.target.value)}
                        style={{ ...inp, flex: 1 }} placeholder="Creator name" />
                      <input value={t.role} onChange={(e) => updateItem("testimonials", i, "role", e.target.value)}
                        style={{ ...inp, flex: 1 }} placeholder="YouTube Creator, Dubai" />
                      <select value={t.rating} onChange={(e) => updateItem("testimonials", i, "rating", parseInt(e.target.value))}
                        style={{ ...inp, width: "80px" }}>
                        {[5, 4, 3].map(r => <option key={r} value={r}>{"⭐".repeat(r)}</option>)}
                      </select>
                      <button onClick={() => removeItem("testimonials", i)} style={{
                        width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer", flexShrink: 0,
                        border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Trash size={12} />
                      </button>
                    </div>
                    <textarea value={t.text} onChange={(e) => updateItem("testimonials", i, "text", e.target.value)}
                      rows={2} style={{ ...inp, resize: "vertical" as const }}
                      placeholder="This agent completely changed how I create content..." />
                  </div>
                ))}
                <button onClick={() => addItem("testimonials", { name: "", role: "", avatar: "👤", text: "", rating: 5 })} style={{
                  fontSize: "12px", color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                }}>+ Add testimonial</button>
              </div>

              <div>
                {lbl("FAQ", "— frequently asked questions")}
                {form.faq.map((f, i) => (
                  <div key={i} style={{
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    borderRadius: "8px", padding: "12px", marginBottom: "10px",
                  }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input value={f.question} onChange={(e) => updateItem("faq", i, "question", e.target.value)}
                        style={inp} placeholder="e.g. What API keys do I need?" />
                      <button onClick={() => removeItem("faq", i)} style={{
                        width: "30px", height: "30px", borderRadius: "6px", cursor: "pointer", flexShrink: 0,
                        border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)", color: "#ef4444",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Trash size={12} />
                      </button>
                    </div>
                    <textarea value={f.answer} onChange={(e) => updateItem("faq", i, "answer", e.target.value)}
                      rows={2} style={{ ...inp, resize: "vertical" as const }}
                      placeholder="You need OpenAI and Seedance API keys..." />
                  </div>
                ))}
                <button onClick={() => addItem("faq", { question: "", answer: "" })} style={{
                  fontSize: "12px", color: "#7c3aed", background: "none", border: "none", cursor: "pointer", padding: "4px 0",
                }}>+ Add FAQ</button>
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "12px", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: "7px" }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: `1px solid ${panelBorder}`, display: "flex", gap: "10px", alignItems: "center" }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              padding: "10px 16px", borderRadius: "8px", cursor: "pointer",
              border: `1px solid ${panelBorder}`, background: "transparent",
              color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {step === 1 && (
            <button onClick={onClose} style={{
              padding: "10px 16px", borderRadius: "8px", cursor: "pointer",
              border: `1px solid ${panelBorder}`, background: "transparent",
              color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px",
            }}>Cancel</button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEPS.length ? (
            <button onClick={() => { if (validateStep()) setStep(s => s + 1); }} style={{
              padding: "10px 24px", borderRadius: "8px", cursor: "pointer",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white",
              border: "none", fontSize: "13px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "6px",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
            }}>
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving} style={{
              padding: "10px 28px", borderRadius: "8px",
              cursor: saving ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", border: "none", fontSize: "13px", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "8px",
              opacity: saving ? 0.7 : 1,
              boxShadow: saving ? "none" : "0 4px 12px rgba(124,58,237,0.3)",
            }}>
              {saving ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={14} />}
              {saving ? "Saving..." : template ? "Save Changes" : "Create Module"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CmsModulesPage() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") router.push("/dashboard");
  }, [user]);

  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<AgentTemplate | undefined>();
  const [nextSortOrder, setNextSortOrder] = useState(1);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/modules/admin/all");
      const data = res.data?.data || res.data || [];
      setTemplates(data);
      if (data.length > 0) {
        const maxSort = Math.max(...data.map((t: AgentTemplate) => t.sortOrder || 0));
        setNextSortOrder(maxSort + 1);
      } else {
        setNextSortOrder(1);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const toggleActive = async (template: AgentTemplate) => {
    try {
      await api.patch(`/modules/${template.slug}`, { isActive: !template.isActive });
      fetchTemplates();
    } catch {}
  };

  const deleteTemplate = async (slug: string) => {
    if (!confirm("Delete this module? This cannot be undone.")) return;
    try {
      await api.delete(`/modules/${slug}`);
      fetchTemplates();
    } catch {}
  };

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || t.category === categoryFilter;
    const matchType = typeFilter === "all" || t.moduleType === typeFilter;
    return matchSearch && matchCat && matchType;
  });

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Modules</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>Create and manage agent and automation templates.</p>
        </div>
        <button onClick={() => { setEditTemplate(undefined); setShowModal(true); }} style={{
          display: "flex", alignItems: "center", gap: "8px", padding: "9px 18px",
          borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
          boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
        }}>
          <Plus size={15} /> New Module
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center",
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "10px", padding: "12px 16px",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={13} color={colors.textMuted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..."
            style={{ ...inputStyle, width: "100%", paddingLeft: "30px", boxSizing: "border-box" as const }} />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ ...inputStyle, minWidth: "130px" }}>
          <option value="all">All Types</option>
          <option value="agent">Agents</option>
          <option value="automation">Automations</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...inputStyle, minWidth: "160px" }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
        </select>
        <span style={{ fontSize: "12px", color: colors.textMuted, marginLeft: "auto" }}>{filtered.length} modules</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center" }}>
          <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", padding: "60px 24px", textAlign: "center" }}>
          <Bot size={36} color={colors.textMuted} style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: "15px", fontWeight: 500, color: colors.text, marginBottom: "6px" }}>No modules found</p>
          <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px" }}>Try adjusting your filters or create a new module.</p>
          <button onClick={() => { setEditTemplate(undefined); setShowModal(true); }} style={{
            display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 18px",
            borderRadius: "8px", background: "#7c3aed", color: "white", border: "none",
            cursor: "pointer", fontSize: "13px", fontWeight: 600,
          }}>
            <Plus size={14} /> Create Module
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
          {filtered.map((t) => (
            <div key={t._id} style={{
              background: colors.bgCard,
              border: `1px solid ${t.isActive ? colors.border : "rgba(239,68,68,0.15)"}`,
              borderRadius: "12px", padding: "20px 22px",
              opacity: t.isActive ? 1 : 0.75,
              minHeight: "230px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              {/* Top content */}
              <div>
                {/* Card header — icon + name + badge */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                      background: `${t.color}15`, border: `1px solid ${t.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px",
                    }}>
                      {t.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: "14px", fontWeight: 600, color: colors.text,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: "11px", color: colors.textMuted }}>
                        {t.moduleType.charAt(0).toUpperCase() + t.moduleType.slice(1)}
                        {" · "}
                        {formatCategoryLabel(t.category)}
                        {" · "}
                        #{t.sortOrder}
                      </p>
                    </div>
                  </div>

                  {/* Badge — single, no overlap */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0, alignItems: "flex-end" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "9999px",
                      whiteSpace: "nowrap",
                      background: t.isComingSoon
                        ? "rgba(245,158,11,0.1)"
                        : t.badge === "Live"
                        ? "rgba(34,197,94,0.1)"
                        : `${t.color}15`,
                      color: t.isComingSoon
                        ? "#f59e0b"
                        : t.badge === "Live"
                        ? "#22c55e"
                        : t.color,
                    }}>
                      {t.isComingSoon ? "Coming Soon" : t.badge || "Active"}
                    </span>
                    {!t.isActive && (
                      <span style={{
                        fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "9999px",
                        background: "rgba(239,68,68,0.1)", color: "#ef4444", whiteSpace: "nowrap",
                      }}>
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: "12px", color: colors.textMuted, lineHeight: 1.5, marginBottom: "10px",
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                }}>
                  {t.description || t.tagline || "No description"}
                </p>

                {/* Info chips */}
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <span style={{
                    fontSize: "10px", color: "#a78bfa",
                    background: "rgba(124,58,237,0.08)",
                    padding: "2px 7px", borderRadius: "5px",
                  }}>
                    {formatCategoryLabel(t.pipelineType || "custom")}
                  </span>
                  {t.estimatedCostPerRun && (
                    <span style={{
                      fontSize: "10px", color: "#f59e0b",
                      background: "rgba(245,158,11,0.08)",
                      padding: "2px 7px", borderRadius: "5px",
                    }}>
                      ~{t.estimatedCostPerRun}
                    </span>
                  )}
                  <span style={{
                    fontSize: "10px", color: colors.textMuted,
                    background: colors.bg, padding: "2px 7px",
                    borderRadius: "5px", border: `1px solid ${colors.border}`,
                  }}>
                    {t.pricing?.monthly ? `$${t.pricing.monthly}/mo` : "Free"}
                  </span>
                </div>
              </div>

              {/* Action buttons — always at bottom */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => { setEditTemplate(t); setShowModal(true); }} style={{
                  flex: 1, padding: "7px", borderRadius: "7px", cursor: "pointer",
                  border: "1px solid rgba(124,58,237,0.2)", background: "rgba(124,58,237,0.06)",
                  color: "#a78bfa", fontSize: "12px", fontWeight: 500,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                }}>
                  <Pencil size={12} /> Edit
                </button>
                <button onClick={() => toggleActive(t)} style={{
                  flex: 1, padding: "7px", borderRadius: "7px", cursor: "pointer",
                  border: `1px solid ${t.isActive ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}`,
                  background: t.isActive ? "rgba(245,158,11,0.06)" : "rgba(34,197,94,0.06)",
                  color: t.isActive ? "#f59e0b" : "#22c55e", fontSize: "12px", fontWeight: 500,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                }}>
                  {t.isActive ? "Hide" : "Publish"}
                </button>
                <button onClick={() => deleteTemplate(t.slug)} style={{
                  width: "32px", height: "32px", borderRadius: "7px", cursor: "pointer",
                  border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                  color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TemplateModal
          template={editTemplate}
          nextSortOrder={nextSortOrder}
          onClose={() => { setShowModal(false); setEditTemplate(undefined); }}
          onSave={fetchTemplates}
          colors={colors}
          isDark={isDark}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}