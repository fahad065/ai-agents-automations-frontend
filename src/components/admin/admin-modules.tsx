"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Plus, Pencil, Trash2, Loader2,
  CheckCircle2, XCircle, Boxes, X,
} from "lucide-react";
import { toast } from "sonner";

interface HeroStat { label: string; value: string; }
interface Feature { title: string; description: string; icon: string; }
interface HowItWorksStep { step: string; title: string; description: string; }
interface FaqItem { question: string; answer: string; }
interface Testimonial { name: string; role: string; avatar: string; text: string; rating: number; }
interface PricingData { monthly: number; annual: number; features: string[]; }

interface Module {
  _id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  category: string;
  moduleType: string;
  pipelineType: string;
  outputType: string;
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  isActive: boolean;
  isComingSoon: boolean;
  sortOrder: number;
  estimatedCostPerRun: string;
  platforms: string[];
  requiredApiKeys: string[];
  heroStats: HeroStat[];
  features: Feature[];
  howItWorks: HowItWorksStep[];
  faq: FaqItem[];
  testimonials: Testimonial[];
  pricing: PricingData;
  demoVideoUrl: string;
  createdAt: string;
}

const PIPELINE_TYPES = [
  "youtube", "instagram", "tiktok", "arabic",
  "podcast", "whatsapp", "real_estate", "support",
  "social_scheduler", "email_marketing",
  "lead_generation", "content_repurposing", "custom",
];

const OUTPUT_TYPES = [
  "video", "audio", "messages", "leads",
  "posts", "emails", "content", "reports",
];

const API_KEY_OPTIONS = [
  "openai", "atlas", "seedance", "youtube",
  "instagram", "tiktok", "whatsapp", "spotify",
  "linkedin", "twitter", "facebook",
];

const CATEGORY_OPTIONS = [
  "youtube", "instagram", "tiktok", "arabic",
  "podcast", "sales", "real_estate", "support",
  "social", "social_media", "email", "content", "marketing",
  "operations", "finance", "custom",
];

const BADGE_OPTIONS = ["Live", "Coming Soon", "New", "Beta", "Popular"];

const formatLabel = (val: string) =>
  val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const emptyForm = {
  name: "", slug: "", description: "", tagline: "",
  category: "youtube", moduleType: "agent",
  pipelineType: "youtube", outputType: "video",
  icon: "🤖", color: "#7c3aed", badge: "Coming Soon",
  capabilities: "", requiredApiKeys: [] as string[],
  isActive: true, isComingSoon: true, sortOrder: 1,
  estimatedCostPerRun: "", platforms: "",
  demoVideoUrl: "",
  heroStats: "", features: "", howItWorks: "",
  faq: "", testimonials: "",
  pricingMonthly: "49", pricingAnnual: "39", pricingFeatures: "",
};

type FormState = typeof emptyForm;

export function AdminModules() {
  const { colors } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "pipeline" | "content" | "pricing" | "testimonials">("basic");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await api.get("/modules/admin/all");
      setModules(res.data || []);
    } catch {
      try {
        const res = await api.get("/modules?limit=100");
        setModules(res.data?.data || res.data || []);
      } catch {}
    }
    setLoading(false);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setActiveTab("basic");
    setShowForm(true);
  };

  const openEdit = (m: Module) => {
    setForm({
      name: m.name || "",
      slug: m.slug || "",
      description: m.description || "",
      tagline: m.tagline || "",
      category: m.category || "youtube",
      moduleType: m.moduleType || "agent",
      pipelineType: m.pipelineType || "youtube",
      outputType: m.outputType || "video",
      icon: m.icon || "🤖",
      color: m.color || "#7c3aed",
      badge: m.badge || "Coming Soon",
      capabilities: (m.capabilities || []).join(", "),
      requiredApiKeys: m.requiredApiKeys || [],
      isActive: m.isActive ?? true,
      isComingSoon: m.isComingSoon ?? false,
      sortOrder: m.sortOrder || 1,
      estimatedCostPerRun: m.estimatedCostPerRun || "",
      platforms: (m.platforms || []).join(", "),
      demoVideoUrl: m.demoVideoUrl || "",
      heroStats: m.heroStats?.length
        ? m.heroStats.map(s => `${s.label}|${s.value}`).join("\n") : "",
      features: m.features?.length
        ? m.features.map(f => `${f.icon}|${f.title}|${f.description}`).join("\n") : "",
      howItWorks: m.howItWorks?.length
        ? m.howItWorks.map(s => `${s.step}|${s.title}|${s.description}`).join("\n") : "",
      faq: m.faq?.length
        ? m.faq.map(f => `${f.question}|${f.answer}`).join("\n") : "",
      testimonials: m.testimonials?.length
        ? m.testimonials.map(t => `${t.name}|${t.role}|${t.avatar}|${t.rating}|${t.text}`).join("\n") : "",
      pricingMonthly: String(m.pricing?.monthly || "49"),
      pricingAnnual: String(m.pricing?.annual || "39"),
      pricingFeatures: (m.pricing?.features || []).join("\n"),
    });
    setEditingId(m._id);
    setActiveTab("basic");
    setShowForm(true);
  };

  const parseHeroStats = (raw: string) =>
    raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const [label, value] = l.split("|");
      return { label: label?.trim() || "", value: value?.trim() || "" };
    });

  const parseFeatures = (raw: string) =>
    raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const [icon, title, ...rest] = l.split("|");
      return { icon: icon?.trim() || "⚡", title: title?.trim() || "", description: rest.join("|").trim() };
    });

  const parseHowItWorks = (raw: string) =>
    raw.split("\n").map(l => l.trim()).filter(Boolean).map((l, i) => {
      const [step, title, ...rest] = l.split("|");
      return { step: step?.trim() || String(i + 1), title: title?.trim() || "", description: rest.join("|").trim() };
    });

  const parseFaq = (raw: string) =>
    raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const [question, ...rest] = l.split("|");
      return { question: question?.trim() || "", answer: rest.join("|").trim() };
    });

  const parseTestimonials = (raw: string) =>
    raw.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
      const [name, role, avatar, rating, ...rest] = l.split("|");
      return {
        name: name?.trim() || "",
        role: role?.trim() || "",
        avatar: avatar?.trim() || "👤",
        rating: Number(rating?.trim()) || 5,
        text: rest.join("|").trim(),
      };
    });

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        tagline: form.tagline.trim(),
        category: form.category,
        moduleType: form.moduleType,
        pipelineType: form.pipelineType,
        outputType: form.outputType,
        icon: form.icon.trim(),
        color: form.color.trim(),
        badge: form.badge.trim(),
        isActive: form.isActive,
        isComingSoon: form.isComingSoon,
        sortOrder: Number(form.sortOrder),
        estimatedCostPerRun: form.estimatedCostPerRun.trim(),
        demoVideoUrl: form.demoVideoUrl.trim(),
        capabilities: form.capabilities.split(",").map(c => c.trim()).filter(Boolean),
        platforms: form.platforms.split(",").map(p => p.trim()).filter(Boolean),
        requiredApiKeys: form.requiredApiKeys,
        heroStats: form.heroStats.trim() ? parseHeroStats(form.heroStats) : [],
        features: form.features.trim() ? parseFeatures(form.features) : [],
        howItWorks: form.howItWorks.trim() ? parseHowItWorks(form.howItWorks) : [],
        faq: form.faq.trim() ? parseFaq(form.faq) : [],
        testimonials: form.testimonials.trim() ? parseTestimonials(form.testimonials) : [],
        pricing: {
          monthly: Number(form.pricingMonthly),
          annual: Number(form.pricingAnnual),
          features: form.pricingFeatures.split("\n").map(f => f.trim()).filter(Boolean),
        },
      };

      if (editingId) {
        await api.patch(`/modules/${editingId}`, payload);
        toast.success("Module updated ✅");
      } else {
        await api.post("/modules", payload);
        toast.success("Module created ✅");
      }
      setShowForm(false);
      fetchModules();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this module?")) return;
    setDeleteLoading(id);
    try {
      await api.delete(`/modules/${id}`);
      toast.success("Deleted");
      fetchModules();
    } catch {}
    setDeleteLoading(null);
  };

  const toggleApiKey = (key: string) => {
    setForm(f => ({
      ...f,
      requiredApiKeys: f.requiredApiKeys.includes(key)
        ? f.requiredApiKeys.filter(k => k !== key)
        : [...f.requiredApiKeys, key],
    }));
  };

  const filteredModules = modules.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      m.name.toLowerCase().includes(q) ||
      m.slug.toLowerCase().includes(q) ||
      (m.description || "").toLowerCase().includes(q);
    const matchType = !filterType || m.moduleType === filterType;
    const matchCat = !filterCategory || m.category === filterCategory;
    return matchSearch && matchType && matchCat;
  });

  const inp = {
    width: "100%", padding: "9px 12px", borderRadius: "8px",
    fontSize: "13px", border: `1px solid ${colors.border}`,
    background: colors.bg, color: colors.text,
    boxSizing: "border-box" as const, outline: "none",
  };

  const selectStyle = {
    padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", cursor: "pointer",
  };

  const lbl = (text: string, hint?: string) => (
    <label style={{ fontSize: "12px", color: colors.textMuted, display: "block", marginBottom: "5px" }}>
      {text} {hint && <span style={{ color: colors.textSubtle }}>({hint})</span>}
    </label>
  );

  const fld = (content: React.ReactNode, fullWidth = false) => (
    <div style={{ marginBottom: "14px", ...(fullWidth ? { gridColumn: "1/-1" } : {}) }}>
      {content}
    </div>
  );

  const TABS = ["basic", "pipeline", "content", "pricing", "testimonials"] as const;

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "16px", flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Modules</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>
            {filteredModules.length} of {modules.length} agents & automations
          </p>
        </div>
        <button onClick={openCreate} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "9px 18px", borderRadius: "8px",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "white", border: "none", cursor: "pointer",
          fontSize: "14px", fontWeight: 600,
        }}>
          <Plus size={15} /> New module
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{
            position: "absolute", left: "10px", top: "50%",
            transform: "translateY(-50%)", color: colors.textMuted,
            fontSize: "13px", pointerEvents: "none",
          }}>🔍</span>
          <input
            placeholder="Search by name, slug or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 32px",
              borderRadius: "8px", fontSize: "13px",
              border: `1px solid ${colors.border}`,
              background: colors.bg, color: colors.text,
              boxSizing: "border-box" as const, outline: "none",
            }}
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
          <option value="">All types</option>
          <option value="agent">Agent</option>
          <option value="automation">Automation</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={selectStyle}>
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map(c => (
            <option key={c} value={c}>{formatLabel(c)}</option>
          ))}
        </select>
        {(search || filterType || filterCategory) && (
          <button
            onClick={() => { setSearch(""); setFilterType(""); setFilterCategory(""); }}
            style={{
              padding: "8px 12px", borderRadius: "8px", fontSize: "13px",
              border: `1px solid ${colors.border}`, background: colors.bg,
              color: colors.textMuted, cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "flex-start",
          justifyContent: "center", padding: "24px",
          overflowY: "auto",
        }}>
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "16px", width: "100%", maxWidth: "800px",
            marginTop: "20px", marginBottom: "40px",
          }}>
            {/* Modal Header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "20px 24px", borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "9px",
                  background: `${form.color}15`, border: `1px solid ${form.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px",
                }}>
                  {form.icon || "🤖"}
                </div>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: colors.text }}>
                    {editingId ? `Edit: ${form.name || "module"}` : "Create module"}
                  </h2>
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>{form.slug || "no slug yet"}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} style={{
                background: "transparent", border: "none",
                cursor: "pointer", color: colors.textMuted, padding: "4px",
              }}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", borderBottom: `1px solid ${colors.border}`,
              padding: "0 24px", overflowX: "auto",
            }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{
                  padding: "11px 16px", fontSize: "13px",
                  fontWeight: activeTab === t ? 600 : 400,
                  color: activeTab === t ? "#a78bfa" : colors.textMuted,
                  background: "transparent", border: "none",
                  borderBottom: `2px solid ${activeTab === t ? "#7c3aed" : "transparent"}`,
                  cursor: "pointer", textTransform: "capitalize",
                  whiteSpace: "nowrap",
                }}>
                  {t}
                </button>
              ))}
            </div>

            {/* Form Body */}
            <div style={{ padding: "24px" }}>

              {/* ── BASIC TAB ── */}
              {activeTab === "basic" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  {fld(<>{lbl("Name *")}<input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="YouTube Agent" style={inp} /></>)}
                  {fld(<>{lbl("Slug *")}<input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="youtube-agent" style={inp} /></>)}
                  {fld(<>{lbl("Tagline")}<input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Automate your YouTube channel" style={inp} /></>)}
                  {fld(<>{lbl("Icon", "emoji")}<input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🤖" style={inp} /></>)}
                  {fld(<>
                    {lbl("Color", "hex")}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="color" value={form.color}
                        onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                        style={{ width: "44px", height: "36px", borderRadius: "8px", border: `1px solid ${colors.border}`, cursor: "pointer", padding: "2px" }}
                      />
                      <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ ...inp, flex: 1 }} />
                    </div>
                  </>)}
                  {fld(<>
                    {lbl("Badge")}
                    <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} style={inp}>
                      {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </>)}
                  {fld(<>
                    {lbl("Module Type")}
                    <select value={form.moduleType} onChange={e => setForm(f => ({ ...f, moduleType: e.target.value }))} style={inp}>
                      <option value="agent">Agent</option>
                      <option value="automation">Automation</option>
                    </select>
                  </>)}
                  {fld(<>
                    {lbl("Category")}
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
                    </select>
                  </>)}
                  {fld(<>{lbl("Sort Order")}<input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} style={inp} /></>)}
                  {fld(<>{lbl("Est. Cost Per Run")}<input value={form.estimatedCostPerRun} onChange={e => setForm(f => ({ ...f, estimatedCostPerRun: e.target.value }))} placeholder="$3-5 Per Video" style={inp} /></>)}
                  {fld(<>
                    {lbl("Description")}
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" as const }} />
                  </>, true)}
                  {fld(<>
                    {lbl("Capabilities", "comma separated")}
                    <input value={form.capabilities} onChange={e => setForm(f => ({ ...f, capabilities: e.target.value }))} placeholder="Trend discovery, AI scriptwriting, Auto upload" style={inp} />
                  </>, true)}
                  {fld(<>
                    {lbl("Platforms", "comma separated")}
                    <input value={form.platforms} onChange={e => setForm(f => ({ ...f, platforms: e.target.value }))} placeholder="youtube, instagram, tiktok" style={inp} />
                  </>, true)}
                  {fld(<>
                    {lbl("Demo Video URL")}
                    <input value={form.demoVideoUrl} onChange={e => setForm(f => ({ ...f, demoVideoUrl: e.target.value }))} placeholder="https://youtu.be/..." style={inp} />
                  </>, true)}
                  <div style={{ gridColumn: "1/-1", display: "flex", gap: "24px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: colors.text }}>
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ accentColor: "#7c3aed" }} />
                      Active (visible to users)
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: colors.text }}>
                      <input type="checkbox" checked={form.isComingSoon} onChange={e => setForm(f => ({ ...f, isComingSoon: e.target.checked }))} style={{ accentColor: "#7c3aed" }} />
                      Coming Soon
                    </label>
                  </div>
                </div>
              )}

              {/* ── PIPELINE TAB ── */}
              {activeTab === "pipeline" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  {fld(<>
                    {lbl("Pipeline Type", "how Python routes this")}
                    <select value={form.pipelineType} onChange={e => setForm(f => ({ ...f, pipelineType: e.target.value }))} style={inp}>
                      {PIPELINE_TYPES.map(p => <option key={p} value={p}>{formatLabel(p)}</option>)}
                    </select>
                  </>)}
                  {fld(<>
                    {lbl("Output Type")}
                    <select value={form.outputType} onChange={e => setForm(f => ({ ...f, outputType: e.target.value }))} style={inp}>
                      {OUTPUT_TYPES.map(o => <option key={o} value={o}>{formatLabel(o)}</option>)}
                    </select>
                  </>)}
                  <div style={{ gridColumn: "1/-1", marginBottom: "14px" }}>
                    {lbl("Required API Keys", "click to toggle")}
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: "8px",
                      padding: "12px", borderRadius: "8px",
                      border: `1px solid ${colors.border}`, background: colors.bg,
                    }}>
                      {API_KEY_OPTIONS.map(key => {
                        const selected = form.requiredApiKeys.includes(key);
                        return (
                          <button key={key} onClick={() => toggleApiKey(key)} style={{
                            padding: "5px 12px", borderRadius: "6px",
                            fontSize: "12px", fontWeight: selected ? 600 : 400,
                            cursor: "pointer",
                            background: selected ? "rgba(124,58,237,0.12)" : colors.bgCard,
                            border: `1px solid ${selected ? "rgba(124,58,237,0.35)" : colors.border}`,
                            color: selected ? "#a78bfa" : colors.textMuted,
                            transition: "all 0.15s",
                          }}>
                            {selected ? "✓ " : ""}{key}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <div style={{
                      background: "rgba(124,58,237,0.06)",
                      border: "1px solid rgba(124,58,237,0.15)",
                      borderRadius: "10px", padding: "14px",
                    }}>
                      <p style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 600, marginBottom: "8px" }}>
                        Pipeline routing info
                      </p>
                      <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.8 }}>
                        <strong style={{ color: colors.text }}>youtube</strong> → <code>pipelines/youtube/pipeline.py</code> ✅ Live<br />
                        <strong style={{ color: colors.text }}>instagram</strong> → <code>pipelines/instagram/pipeline.py</code> ✅ Built, not connected yet<br />
                        <strong style={{ color: colors.text }}>tiktok / arabic / podcast</strong> → pipeline files needed 🔧 Coming soon<br />
                        <strong style={{ color: colors.text }}>whatsapp / real_estate / support</strong> → different architecture 📋 Planned
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── CONTENT TAB ── */}
              {activeTab === "content" && (
                <div>
                  {fld(<>
                    {lbl("Hero Stats", "one per line: Label|Value")}
                    <textarea
                      value={form.heroStats}
                      onChange={e => setForm(f => ({ ...f, heroStats: e.target.value }))}
                      rows={5}
                      placeholder={"Videos generated|20+\nCost per video|$3-5\nShorts per video|3\nSuccess rate|95%"}
                      style={{ ...inp, resize: "vertical" as const, fontFamily: "monospace", fontSize: "12px" }}
                    />
                  </>)}
                  {fld(<>
                    {lbl("Features", "one per line: emoji|Title|Description")}
                    <textarea
                      value={form.features}
                      onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                      rows={7}
                      placeholder={"⚡|Viral hook generation|Generates psychological hooks...\n📝|AI scriptwriting|Full 8-12 minute scripts..."}
                      style={{ ...inp, resize: "vertical" as const, fontFamily: "monospace", fontSize: "12px" }}
                    />
                  </>)}
                  {fld(<>
                    {lbl("How It Works", "one per line: StepNum|Title|Description")}
                    <textarea
                      value={form.howItWorks}
                      onChange={e => setForm(f => ({ ...f, howItWorks: e.target.value }))}
                      rows={5}
                      placeholder={"1|Agent discovers trending topic|Every day the agent scans...\n2|Script generated|AI writes full script..."}
                      style={{ ...inp, resize: "vertical" as const, fontFamily: "monospace", fontSize: "12px" }}
                    />
                  </>)}
                  {fld(<>
                    {lbl("FAQ", "one per line: Question|Answer")}
                    <textarea
                      value={form.faq}
                      onChange={e => setForm(f => ({ ...f, faq: e.target.value }))}
                      rows={5}
                      placeholder={"How much does it cost?|Each video costs approximately $3-5...\nDo I need an account?|Yes you need..."}
                      style={{ ...inp, resize: "vertical" as const, fontFamily: "monospace", fontSize: "12px" }}
                    />
                  </>)}
                </div>
              )}

              {/* ── PRICING TAB ── */}
              {activeTab === "pricing" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                    {fld(<>{lbl("Monthly Price ($)")}<input type="number" value={form.pricingMonthly} onChange={e => setForm(f => ({ ...f, pricingMonthly: e.target.value }))} style={inp} /></>)}
                    {fld(<>{lbl("Annual Price ($/mo)")}<input type="number" value={form.pricingAnnual} onChange={e => setForm(f => ({ ...f, pricingAnnual: e.target.value }))} style={inp} /></>)}
                  </div>
                  {fld(<>
                    {lbl("Pricing Features", "one per line")}
                    <textarea
                      value={form.pricingFeatures}
                      onChange={e => setForm(f => ({ ...f, pricingFeatures: e.target.value }))}
                      rows={10}
                      placeholder={"Unlimited pipeline runs\nDaily trend discovery\nFull script generation\nAuto YouTube upload\n3 Shorts per video\nAI thumbnail generation\nEmail notifications\nPriority support"}
                      style={{ ...inp, resize: "vertical" as const }}
                    />
                  </>)}
                  <div style={{
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    borderRadius: "10px", padding: "14px", marginTop: "4px",
                  }}>
                    <p style={{ fontSize: "12px", color: colors.textMuted }}>
                      Preview: <strong style={{ color: colors.text }}>${form.pricingMonthly}/mo</strong> or{" "}
                      <strong style={{ color: "#22c55e" }}>${form.pricingAnnual}/mo annually</strong>{" "}
                      — saves <strong style={{ color: "#22c55e" }}>${(Number(form.pricingMonthly) - Number(form.pricingAnnual)) * 12}/year</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* ── TESTIMONIALS TAB ── */}
              {activeTab === "testimonials" && (
                <div>
                  <div style={{
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.15)",
                    borderRadius: "10px", padding: "14px", marginBottom: "16px",
                  }}>
                    <p style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600, marginBottom: "6px" }}>
                      How to add testimonials
                    </p>
                    <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.7 }}>
                      Format: <code style={{ background: colors.bg, padding: "1px 6px", borderRadius: "4px" }}>Name|Role|Avatar Emoji|Rating (1-5)|Review text</code><br />
                      Example: <code style={{ background: colors.bg, padding: "1px 6px", borderRadius: "4px" }}>Ahmed Al Rashid|Content Creator, Dubai|👨‍💼|5|This agent saved me 20 hours a week...</code><br />
                      Only add real testimonials from actual users.
                    </p>
                  </div>
                  {fld(<>
                    {lbl("Testimonials", "one per line: Name|Role|Avatar|Rating|Text")}
                    <textarea
                      value={form.testimonials}
                      onChange={e => setForm(f => ({ ...f, testimonials: e.target.value }))}
                      rows={8}
                      placeholder={"Ahmed Al Rashid|Content Creator, Dubai|👨‍💼|5|This agent saved me 20 hours a week.\nSarah Thompson|Marketing Manager, London|👩‍💼|5|Incredible quality."}
                      style={{ ...inp, resize: "vertical" as const, fontFamily: "monospace", fontSize: "12px" }}
                    />
                  </>)}
                  {form.testimonials.trim() && (
                    <div style={{ marginTop: "16px" }}>
                      <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "10px", fontWeight: 600 }}>
                        Preview:
                      </p>
                      {form.testimonials.split("\n").filter(Boolean).map((line, i) => {
                        const [name, role, avatar, rating, ...textParts] = line.split("|");
                        return (
                          <div key={i} style={{
                            background: colors.bg, border: `1px solid ${colors.border}`,
                            borderRadius: "10px", padding: "14px", marginBottom: "8px",
                          }}>
                            <div style={{ display: "flex", gap: "3px", marginBottom: "8px" }}>
                              {Array.from({ length: Math.min(Number(rating) || 5, 5) }).map((_, j) => (
                                <span key={j} style={{ color: "#f59e0b", fontSize: "13px" }}>★</span>
                              ))}
                            </div>
                            <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "10px", lineHeight: 1.6 }}>
                              "{textParts.join("|")}"
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "20px" }}>{avatar || "👤"}</span>
                              <div>
                                <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>{name}</p>
                                <p style={{ fontSize: "11px", color: colors.textMuted }}>{role}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              display: "flex", gap: "8px", padding: "16px 24px",
              borderTop: `1px solid ${colors.border}`,
              justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ display: "flex", gap: "6px" }}>
                {TABS.map(t => (
                  <div
                    key={t}
                    onClick={() => setActiveTab(t)}
                    style={{
                      width: activeTab === t ? "18px" : "6px",
                      height: "6px", borderRadius: "3px",
                      background: activeTab === t ? "#7c3aed" : colors.border,
                      transition: "all 0.2s", cursor: "pointer",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => setShowForm(false)} style={{
                  padding: "10px 16px", borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  background: "none", color: colors.textMuted,
                  cursor: "pointer", fontSize: "13px",
                }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: "10px 24px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white", border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "14px", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "6px",
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
                  {editingId ? "Update module" : "Create module"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modules grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : modules.length === 0 ? (
        <div style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "12px", padding: "60px", textAlign: "center",
        }}>
          <Boxes size={36} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
          <p style={{ color: colors.textMuted, marginBottom: "16px" }}>No modules yet</p>
          <button onClick={openCreate} style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", borderRadius: "8px",
            background: "#7c3aed", color: "white",
            border: "none", cursor: "pointer",
            fontSize: "13px", fontWeight: 600,
          }}>
            <Plus size={14} /> Create first module
          </button>
        </div>
      ) : filteredModules.length === 0 ? (
        <div style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "12px", padding: "40px", textAlign: "center",
        }}>
          <p style={{ color: colors.textMuted, fontSize: "14px", marginBottom: "10px" }}>
            No modules match your filters
          </p>
          <button
            onClick={() => { setSearch(""); setFilterType(""); setFilterCategory(""); }}
            style={{
              fontSize: "13px", color: "#a78bfa", background: "none",
              border: "none", cursor: "pointer", textDecoration: "underline",
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}>
          {filteredModules.map((m) => (
            <div key={m._id} style={{
              background: colors.bgCard, border: `1px solid ${colors.border}`,
              borderRadius: "12px", padding: "20px",
            }}>
              {/* Card header */}
              <div style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", marginBottom: "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: `${m.color || "#7c3aed"}15`,
                    border: `1px solid ${m.color || "#7c3aed"}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", flexShrink: 0,
                  }}>
                    {m.icon || "🤖"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>{m.name}</p>
                      {m.isActive
                        ? <CheckCircle2 size={12} color="#22c55e" />
                        : <XCircle size={12} color="#ef4444" />}
                    </div>
                    <p style={{ fontSize: "11px", color: colors.textMuted, fontFamily: "monospace" }}>{m.slug}</p>
                  </div>
                </div>

                {/* Single badge — no overlap */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px",
                    background: m.isComingSoon
                      ? "rgba(245,158,11,0.1)"
                      : m.badge === "Live"
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(124,58,237,0.08)",
                    color: m.isComingSoon
                      ? "#f59e0b"
                      : m.badge === "Live"
                      ? "#22c55e"
                      : "#a78bfa",
                  }}>
                    {m.isComingSoon ? "Coming Soon" : m.badge || "Active"}
                  </span>
                  <span style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "9999px",
                    background: colors.bgSecondary, color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                  }}>
                    {formatLabel(m.moduleType || "agent")}
                  </span>
                  {!m.isActive && (
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px",
                      background: "rgba(239,68,68,0.1)", color: "#ef4444",
                    }}>
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "10px" }}>
                {(m.description || "No description").slice(0, 90)}
                {(m.description || "").length > 90 ? "..." : ""}
              </p>

              {/* Info badges */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                {m.category && (
                  <span style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "6px",
                    background: colors.bgSecondary, color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                  }}>
                    {formatLabel(m.category)}
                  </span>
                )}
                {m.pipelineType && (
                  <span style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "6px",
                    background: "rgba(59,130,246,0.08)", color: "#60a5fa",
                    border: "1px solid rgba(59,130,246,0.15)",
                  }}>
                    {formatLabel(m.pipelineType)}
                  </span>
                )}
                {m.estimatedCostPerRun && (
                  <span style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "6px",
                    background: "rgba(34,197,94,0.06)", color: "#22c55e",
                    border: "1px solid rgba(34,197,94,0.15)",
                  }}>
                    {m.estimatedCostPerRun}
                  </span>
                )}
                {m.pricing?.monthly ? (
                  <span style={{
                    fontSize: "10px", padding: "2px 8px", borderRadius: "6px",
                    background: "rgba(124,58,237,0.08)", color: "#a78bfa",
                  }}>
                    ${m.pricing.monthly}/mo
                  </span>
                ) : null}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => openEdit(m)} style={{
                  flex: 1, padding: "7px", borderRadius: "7px",
                  fontSize: "12px", fontWeight: 500, cursor: "pointer",
                  border: `1px solid ${colors.border}`,
                  background: colors.bg, color: colors.textMuted,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                }}>
                  <Pencil size={11} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  disabled={deleteLoading === m._id}
                  style={{
                    width: "32px", height: "32px", borderRadius: "7px",
                    border: "1px solid rgba(239,68,68,0.2)",
                    background: "rgba(239,68,68,0.06)", color: "#ef4444",
                    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  }}
                >
                  {deleteLoading === m._id
                    ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                    : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}