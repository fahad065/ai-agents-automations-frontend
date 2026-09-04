"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Plus, Pencil, Trash2, Loader2,
  CheckCircle2, XCircle, Boxes, Search,
  Info, Workflow, FileText, DollarSign, MessageSquare, Languages,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface HeroStat { label: string; value: string; }
interface Feature { title: string; description: string; icon: string; }
interface HowItWorksStep { step: string; title: string; description: string; }
interface FaqItem { question: string; answer: string; }
interface Testimonial { name: string; role: string; avatar: string; text: string; rating: number; }
interface PricingData { monthly: number; annual: number; features: string[]; }
interface PricingTier { key: "basic" | "pro"; monthly: number; annual: number; features: string[]; features_ar?: string[]; }

interface Module {
  _id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  category: string;
  moduleType: string;
  pipelineType: string;
  pipelineCategory: string;
  nicheSlug: string;
  availableIn: string[];
  components: string[];
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
  pricingTiers?: PricingTier[];
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

const NICHE_OPTIONS = [
  { slug: "content_social",   name: "Content & Social Media" },
  { slug: "real_estate",      name: "Real Estate" },
  { slug: "healthcare",       name: "Healthcare & Clinics" },
  { slug: "hr_recruitment",   name: "HR & Recruitment" },
  { slug: "ecommerce_retail", name: "E-commerce & Retail" },
  { slug: "marketing",        name: "Marketing & Agencies" },
  { slug: "hospitality",      name: "Hospitality & Tourism" },
  { slug: "education",        name: "Education & Schools" },
  { slug: "logistics",        name: "Logistics & Delivery" },
  { slug: "agriculture",      name: "Agriculture" },
  { slug: "finance",          name: "Finance & Microfinance" },
  { slug: "internal_copilot", name: "Internal Copilot" },
];

const COUNTRY_OPTIONS = ["UAE", "Kenya"];

const formatLabel = (val: string) =>
  val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const emptyForm = {
  name: "", slug: "", description: "", tagline: "",
  category: "youtube", moduleType: "agent",
  pipelineType: "youtube", outputType: "video",
  pipelineCategory: "standalone", nicheSlug: "content_social",
  availableIn: ["UAE"] as string[], components: "",
  icon: "🤖", color: "#7c3aed", badge: "Coming Soon",
  capabilities: "", requiredApiKeys: [] as string[],
  isActive: true, isComingSoon: true, sortOrder: 1,
  estimatedCostPerRun: "", platforms: "",
  demoVideoUrl: "",
  heroStats: "", features: "", howItWorks: "",
  faq: "", testimonials: "",
  pricingMonthly: "49", pricingAnnual: "39", pricingFeatures: "",
  // Chatbot-only tiered pricing (Basic/Pro) — see backend CLAUDE.md "Tiered chatbot pricing"
  tierBasicMonthly: "39", tierBasicAnnual: "31", tierBasicFeatures: "",
  tierProMonthly: "79", tierProAnnual: "63", tierProFeatures: "",
  // Arabic fields
  name_ar: "", tagline_ar: "", description_ar: "",
  capabilities_ar: "", pricingFeatures_ar: "",
  tierBasicFeatures_ar: "", tierProFeatures_ar: "",
};

type FormState = typeof emptyForm;

const selectClass = "h-8 w-full rounded-lg border bg-background px-3 text-[13px] text-foreground outline-none cursor-pointer";
const monoTextareaClass = "font-mono text-xs";

const fieldLabel = (text: string, hint?: string) => (
  <Label className="mb-1.25 block text-xs text-muted-foreground">
    {text} {hint && <span className="text-muted-foreground/70">({hint})</span>}
  </Label>
);

const TAB_CONFIG = [
  { key: "basic", label: "Basic", icon: Info },
  { key: "pipeline", label: "Pipeline", icon: Workflow },
  { key: "content", label: "Content", icon: FileText },
  { key: "pricing", label: "Pricing", icon: DollarSign },
  { key: "testimonials", label: "Testimonials", icon: MessageSquare },
  { key: "arabic", label: "Arabic", icon: Languages },
] as const;
const TABS = TAB_CONFIG.map((t) => t.key);

export function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Module | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("basic");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => { fetchModules(); }, []);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await api.get("/modules/admin/all");
      setModules(Array.isArray(res.data) ? res.data : res.data?.data || []);
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
      pipelineCategory: m.pipelineCategory || "standalone",
      nicheSlug: m.nicheSlug || "content_social",
      availableIn: m.availableIn?.length ? m.availableIn : ["UAE"],
      components: (m.components || []).join("\n"),
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
      tierBasicMonthly: String(m.pricingTiers?.find(t => t.key === "basic")?.monthly ?? m.pricing?.monthly ?? "39"),
      tierBasicAnnual: String(m.pricingTiers?.find(t => t.key === "basic")?.annual ?? m.pricing?.annual ?? "31"),
      tierBasicFeatures: (m.pricingTiers?.find(t => t.key === "basic")?.features ?? m.pricing?.features ?? []).join("\n"),
      tierProMonthly: String(m.pricingTiers?.find(t => t.key === "pro")?.monthly ?? "79"),
      tierProAnnual: String(m.pricingTiers?.find(t => t.key === "pro")?.annual ?? "63"),
      tierProFeatures: (m.pricingTiers?.find(t => t.key === "pro")?.features ?? []).join("\n"),
      name_ar: (m as any).name_ar || "",
      tagline_ar: (m as any).tagline_ar || "",
      description_ar: (m as any).description_ar || "",
      capabilities_ar: ((m as any).capabilities_ar || []).join(", "),
      pricingFeatures_ar: ((m as any).pricing?.features_ar || []).join("\n"),
      tierBasicFeatures_ar: (m.pricingTiers?.find(t => t.key === "basic")?.features_ar ?? []).join("\n"),
      tierProFeatures_ar: (m.pricingTiers?.find(t => t.key === "pro")?.features_ar ?? []).join("\n"),
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
        pipelineCategory: form.pipelineCategory,
        nicheSlug: form.nicheSlug,
        availableIn: form.availableIn,
        components: form.components.split("\n").map(c => c.trim()).filter(Boolean),
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
        pricing: form.moduleType === "chatbot"
          ? {
              monthly: Number(form.tierBasicMonthly),
              annual: Number(form.tierBasicAnnual),
              features: form.tierBasicFeatures.split("\n").map(f => f.trim()).filter(Boolean),
              features_ar: form.tierBasicFeatures_ar.split("\n").map(f => f.trim()).filter(Boolean),
            }
          : {
              monthly: Number(form.pricingMonthly),
              annual: Number(form.pricingAnnual),
              features: form.pricingFeatures.split("\n").map(f => f.trim()).filter(Boolean),
              features_ar: form.pricingFeatures_ar.split("\n").map(f => f.trim()).filter(Boolean),
            },
        name_ar: form.name_ar.trim() || undefined,
        tagline_ar: form.tagline_ar.trim() || undefined,
        description_ar: form.description_ar.trim() || undefined,
        capabilities_ar: form.capabilities_ar.split(",").map(c => c.trim()).filter(Boolean),
      };

      if (form.moduleType === "chatbot") {
        payload.pricingTiers = [
          {
            key: "basic",
            monthly: Number(form.tierBasicMonthly),
            annual: Number(form.tierBasicAnnual),
            features: form.tierBasicFeatures.split("\n").map(f => f.trim()).filter(Boolean),
            features_ar: form.tierBasicFeatures_ar.split("\n").map(f => f.trim()).filter(Boolean),
          },
          {
            key: "pro",
            monthly: Number(form.tierProMonthly),
            annual: Number(form.tierProAnnual),
            features: form.tierProFeatures.split("\n").map(f => f.trim()).filter(Boolean),
            features_ar: form.tierProFeatures_ar.split("\n").map(f => f.trim()).filter(Boolean),
          },
        ];
      }

      if (editingId) {
        await api.patch(`/modules/${editingId}`, payload);
        toast.success("Module updated");
      } else {
        await api.post("/modules", payload);
        toast.success("Module created");
      }
      setShowForm(false);
      fetchModules();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(deleteTarget._id);
    try {
      await api.delete(`/modules/${deleteTarget._id}`);
      toast.success("Deleted");
      fetchModules();
    } catch {
      toast.error("Failed to delete module");
    }
    setDeleteLoading(null);
    setDeleteTarget(null);
  };

  const toggleCountry = (c: string) => {
    setForm(f => ({
      ...f,
      availableIn: f.availableIn.includes(c)
        ? f.availableIn.filter(x => x !== c)
        : [...f.availableIn, c],
    }));
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

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Modules</h1>
          <p className="text-sm text-muted-foreground">
            {filteredModules.length} of {modules.length} modules
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={15} /> New module
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-7.5"
          />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={cn(selectClass, "w-auto min-w-[130px]")}>
          <option value="">All types</option>
          <option value="agent">Agent</option>
          <option value="automation">Automation</option>
          <option value="chatbot">Chatbot</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={cn(selectClass, "w-auto min-w-[150px]")}>
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map(c => (
            <option key={c} value={c}>{formatLabel(c)}</option>
          ))}
        </select>
        {(search || filterType || filterCategory) && (
          <Button variant="outline" onClick={() => { setSearch(""); setFilterType(""); setFilterCategory(""); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border text-lg"
                style={{ background: `${form.color}15`, borderColor: `${form.color}30` }}
              >
                {form.icon || "🤖"}
              </div>
              <div>
                <DialogTitle>{editingId ? `Edit: ${form.name || "module"}` : "Create module"}</DialogTitle>
                <p className="text-xs text-muted-foreground">{form.slug || "no slug yet"}</p>
              </div>
            </div>
          </DialogHeader>

          {/* Nav + Form Body */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[190px_1fr]">
            <nav className="flex flex-row gap-1 overflow-x-auto rounded-xl border bg-card p-2 md:flex-col md:overflow-visible">
              {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                    activeTab === key
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </nav>

            <div className="overflow-y-auto pr-1">
            {/* BASIC TAB */}
            {activeTab === "basic" && (
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <div className="mb-3.5">{fieldLabel("Name *")}<Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="YouTube Agent" /></div>
                <div className="mb-3.5">{fieldLabel("Slug *")}<Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="youtube-agent" /></div>
                <div className="mb-3.5">{fieldLabel("Tagline")}<Input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Automate your YouTube channel" /></div>
                <div className="mb-3.5">{fieldLabel("Icon", "emoji")}<Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="🤖" /></div>
                <div className="mb-3.5">
                  {fieldLabel("Color", "hex")}
                  <div className="flex gap-2">
                    <input
                      type="color" value={form.color}
                      onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                      className="h-9 w-11 cursor-pointer rounded-lg border p-0.5"
                    />
                    <Input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="flex-1" />
                  </div>
                </div>
                <div className="mb-3.5">
                  {fieldLabel("Badge")}
                  <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className={selectClass}>
                    {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="mb-3.5">
                  {fieldLabel("Module Type")}
                  <select value={form.moduleType} onChange={e => setForm(f => ({ ...f, moduleType: e.target.value }))} className={selectClass}>
                    <option value="agent">Agent</option>
                    <option value="automation">Automation</option>
                    <option value="chatbot">Chatbot</option>
                  </select>
                </div>
                <div className="mb-3.5">
                  {fieldLabel("Category")}
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={selectClass}>
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
                  </select>
                </div>
                <div className="mb-3.5">{fieldLabel("Sort Order")}<Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} /></div>
                <div className="mb-3.5">{fieldLabel("Est. Cost Per Run")}<Input value={form.estimatedCostPerRun} onChange={e => setForm(f => ({ ...f, estimatedCostPerRun: e.target.value }))} placeholder="$3-5 Per Video" /></div>
                <div className="col-span-full mb-3.5">
                  {fieldLabel("Description")}
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div className="col-span-full mb-3.5">
                  {fieldLabel("Capabilities", "comma separated")}
                  <Input value={form.capabilities} onChange={e => setForm(f => ({ ...f, capabilities: e.target.value }))} placeholder="Trend discovery, AI scriptwriting, Auto upload" />
                </div>
                <div className="col-span-full mb-3.5">
                  {fieldLabel("Platforms", "comma separated")}
                  <Input value={form.platforms} onChange={e => setForm(f => ({ ...f, platforms: e.target.value }))} placeholder="youtube, instagram, tiktok" />
                </div>
                <div className="col-span-full mb-3.5">
                  {fieldLabel("Demo Video URL")}
                  <Input value={form.demoVideoUrl} onChange={e => setForm(f => ({ ...f, demoVideoUrl: e.target.value }))} placeholder="https://youtu.be/..." />
                </div>
                <div className="col-span-full flex gap-6">
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
                    <Checkbox checked={form.isActive} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, isActive: !!v }))} />
                    Active (visible to users)
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
                    <Checkbox checked={form.isComingSoon} onCheckedChange={(v: boolean) => setForm(f => ({ ...f, isComingSoon: !!v }))} />
                    Coming Soon
                  </label>
                </div>
              </div>
            )}

            {/* PIPELINE TAB */}
            {activeTab === "pipeline" && (
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <div className="mb-3.5">
                  {fieldLabel("Pipeline Type", "how Python routes this")}
                  <select value={form.pipelineType} onChange={e => setForm(f => ({ ...f, pipelineType: e.target.value }))} className={selectClass}>
                    {PIPELINE_TYPES.map(p => <option key={p} value={p}>{formatLabel(p)}</option>)}
                  </select>
                </div>
                <div className="mb-3.5">
                  {fieldLabel("Output Type")}
                  <select value={form.outputType} onChange={e => setForm(f => ({ ...f, outputType: e.target.value }))} className={selectClass}>
                    {OUTPUT_TYPES.map(o => <option key={o} value={o}>{formatLabel(o)}</option>)}
                  </select>
                </div>
                <div className="mb-3.5">
                  {fieldLabel("Pipeline Category")}
                  <select value={form.pipelineCategory} onChange={e => setForm(f => ({ ...f, pipelineCategory: e.target.value }))} className={selectClass}>
                    <option value="standalone">Standalone Agent</option>
                    <option value="niche_pipeline">Niche Pipeline</option>
                  </select>
                </div>
                <div className="mb-3.5">
                  {fieldLabel("Niche")}
                  <select value={form.nicheSlug} onChange={e => setForm(f => ({ ...f, nicheSlug: e.target.value }))} className={selectClass}>
                    {NICHE_OPTIONS.map(n => <option key={n.slug} value={n.slug}>{n.name}</option>)}
                  </select>
                </div>
                <div className="col-span-full mb-3.5">
                  {fieldLabel("Available In", "select countries")}
                  <div className="flex gap-3">
                    {COUNTRY_OPTIONS.map(c => (
                      <label key={c} className="flex cursor-pointer items-center gap-1.5 text-[13px] text-foreground">
                        <Checkbox checked={form.availableIn.includes(c)} onCheckedChange={() => toggleCountry(c)} />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
                {form.pipelineCategory === "niche_pipeline" && (
                  <div className="col-span-full mb-3.5">
                    {fieldLabel("Pipeline Components", "one component slug per line — e.g. whatsapp_channel, leads_collector")}
                    <Textarea
                      value={form.components}
                      onChange={e => setForm(f => ({ ...f, components: e.target.value }))}
                      rows={4}
                      placeholder={"whatsapp_channel\nleads_collector\nai_qualifier\ncrm_sync"}
                      className={monoTextareaClass}
                    />
                  </div>
                )}
                <div className="col-span-full mb-3.5">
                  {fieldLabel("Required API Keys", "click to toggle")}
                  <div className="flex flex-wrap gap-2 rounded-lg border bg-background p-3">
                    {API_KEY_OPTIONS.map(key => {
                      const selected = form.requiredApiKeys.includes(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleApiKey(key)}
                          className={cn(
                            "rounded-md border px-3 py-1.25 text-xs transition-colors",
                            selected ? "border-primary/35 bg-primary/[0.12] font-semibold text-[#a78bfa]" : "border-border bg-card font-normal text-muted-foreground",
                          )}
                        >
                          {selected ? "✓ " : ""}{key}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="col-span-full">
                  <div className="rounded-lg border border-primary/15 bg-primary/[0.06] p-3.5">
                    <p className="mb-2 text-xs font-semibold text-[#a78bfa]">Pipeline routing info</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <strong className="text-foreground">youtube</strong> → <code>pipelines/youtube/pipeline.py</code> ✅ Live<br />
                      <strong className="text-foreground">instagram</strong> → <code>pipelines/instagram/pipeline.py</code> ✅ Built, not connected yet<br />
                      <strong className="text-foreground">tiktok / arabic / podcast</strong> → pipeline files needed 🔧 Coming soon<br />
                      <strong className="text-foreground">whatsapp / real_estate / support</strong> → different architecture 📋 Planned
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENT TAB */}
            {activeTab === "content" && (
              <div>
                <div className="mb-3.5">
                  {fieldLabel("Hero Stats", "one per line: Label|Value")}
                  <Textarea
                    value={form.heroStats}
                    onChange={e => setForm(f => ({ ...f, heroStats: e.target.value }))}
                    rows={5}
                    placeholder={"Videos generated|20+\nCost per video|$3-5\nShorts per video|3\nSuccess rate|95%"}
                    className={monoTextareaClass}
                  />
                </div>
                <div className="mb-3.5">
                  {fieldLabel("Features", "one per line: emoji|Title|Description")}
                  <Textarea
                    value={form.features}
                    onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                    rows={7}
                    placeholder={"⚡|Viral hook generation|Generates psychological hooks...\n📝|AI scriptwriting|Full 8-12 minute scripts..."}
                    className={monoTextareaClass}
                  />
                </div>
                <div className="mb-3.5">
                  {fieldLabel("How It Works", "one per line: StepNum|Title|Description")}
                  <Textarea
                    value={form.howItWorks}
                    onChange={e => setForm(f => ({ ...f, howItWorks: e.target.value }))}
                    rows={5}
                    placeholder={"1|Agent discovers trending topic|Every day the agent scans...\n2|Script generated|AI writes full script..."}
                    className={monoTextareaClass}
                  />
                </div>
                <div className="mb-3.5">
                  {fieldLabel("FAQ", "one per line: Question|Answer")}
                  <Textarea
                    value={form.faq}
                    onChange={e => setForm(f => ({ ...f, faq: e.target.value }))}
                    rows={5}
                    placeholder={"How much does it cost?|Each video costs approximately $3-5...\nDo I need an account?|Yes you need..."}
                    className={monoTextareaClass}
                  />
                </div>
              </div>
            )}

            {/* PRICING TAB */}
            {activeTab === "pricing" && (
              form.moduleType === "chatbot" ? (
                <div>
                  <div className="mb-4 rounded-lg border border-primary/15 bg-primary/[0.06] p-3.5">
                    <p className="mb-1 text-xs font-semibold text-[#a78bfa]">Basic / Pro tiered pricing</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Chatbots price as Basic + Pro tiers (Pro adds WhatsApp, Instagram &amp; Analytics — enforced server-side, not just hidden in the UI).
                      Basic's numbers below also populate this module&apos;s legacy single-plan price shown on the /pricing page card.
                      Custom/Enterprise has no fixed price — it&apos;s always a &quot;Contact us&quot; card, nothing to configure here.
                    </p>
                  </div>

                  {/* Basic tier */}
                  <div className="mb-4 rounded-lg border p-3.5">
                    <p className="mb-3 text-sm font-semibold text-foreground">Basic tier</p>
                    <div className="mb-3.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>{fieldLabel("Monthly Price ($)")}<Input type="number" value={form.tierBasicMonthly} onChange={e => setForm(f => ({ ...f, tierBasicMonthly: e.target.value }))} /></div>
                      <div>{fieldLabel("Annual Price ($/mo)")}<Input type="number" value={form.tierBasicAnnual} onChange={e => setForm(f => ({ ...f, tierBasicAnnual: e.target.value }))} /></div>
                    </div>
                    <div>
                      {fieldLabel("Basic Features", "one per line")}
                      <Textarea
                        value={form.tierBasicFeatures}
                        onChange={e => setForm(f => ({ ...f, tierBasicFeatures: e.target.value }))}
                        rows={5}
                        placeholder={"Website chat widget\nKnowledge base\nEmail notifications"}
                      />
                    </div>
                  </div>

                  {/* Pro tier */}
                  <div className="mb-4 rounded-lg border p-3.5">
                    <p className="mb-3 text-sm font-semibold text-foreground">Pro tier</p>
                    <div className="mb-3.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>{fieldLabel("Monthly Price ($)")}<Input type="number" value={form.tierProMonthly} onChange={e => setForm(f => ({ ...f, tierProMonthly: e.target.value }))} /></div>
                      <div>{fieldLabel("Annual Price ($/mo)")}<Input type="number" value={form.tierProAnnual} onChange={e => setForm(f => ({ ...f, tierProAnnual: e.target.value }))} /></div>
                    </div>
                    <div>
                      {fieldLabel("Pro Features", "one per line")}
                      <Textarea
                        value={form.tierProFeatures}
                        onChange={e => setForm(f => ({ ...f, tierProFeatures: e.target.value }))}
                        rows={6}
                        placeholder={"Everything in Basic\nWhatsApp integration\nInstagram integration\nAnalytics & insights\nPriority support"}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background p-3.5">
                    <p className="text-xs text-muted-foreground">
                      Basic: <strong className="text-foreground">${form.tierBasicMonthly}/mo</strong> or{" "}
                      <strong className="text-[#22c55e]">${form.tierBasicAnnual}/mo annually</strong>
                      <br />
                      Pro: <strong className="text-foreground">${form.tierProMonthly}/mo</strong> or{" "}
                      <strong className="text-[#22c55e]">${form.tierProAnnual}/mo annually</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-3.5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>{fieldLabel("Monthly Price ($)")}<Input type="number" value={form.pricingMonthly} onChange={e => setForm(f => ({ ...f, pricingMonthly: e.target.value }))} /></div>
                    <div>{fieldLabel("Annual Price ($/mo)")}<Input type="number" value={form.pricingAnnual} onChange={e => setForm(f => ({ ...f, pricingAnnual: e.target.value }))} /></div>
                  </div>
                  <div className="mb-3.5">
                    {fieldLabel("Pricing Features", "one per line")}
                    <Textarea
                      value={form.pricingFeatures}
                      onChange={e => setForm(f => ({ ...f, pricingFeatures: e.target.value }))}
                      rows={10}
                      placeholder={"Unlimited pipeline runs\nDaily trend discovery\nFull script generation\nAuto YouTube upload\n3 Shorts per video\nAI thumbnail generation\nEmail notifications\nPriority support"}
                    />
                  </div>
                  <div className="rounded-lg border bg-background p-3.5">
                    <p className="text-xs text-muted-foreground">
                      Preview: <strong className="text-foreground">${form.pricingMonthly}/mo</strong> or{" "}
                      <strong className="text-[#22c55e]">${form.pricingAnnual}/mo annually</strong>{" "}
                      — saves <strong className="text-[#22c55e]">${(Number(form.pricingMonthly) - Number(form.pricingAnnual)) * 12}/year</strong>
                    </p>
                  </div>
                </div>
              )
            )}

            {/* TESTIMONIALS TAB */}
            {activeTab === "testimonials" && (
              <div>
                <div className="mb-4 rounded-lg border border-[#22c55e]/15 bg-[#22c55e]/[0.06] p-3.5">
                  <p className="mb-1.5 text-xs font-semibold text-[#22c55e]">How to add testimonials</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Format: <code className="rounded bg-background px-1.5 py-0.5">Name|Role|Avatar Emoji|Rating (1-5)|Review text</code><br />
                    Example: <code className="rounded bg-background px-1.5 py-0.5">Ahmed Al Rashid|Content Creator, Dubai|👨‍💼|5|This agent saved me 20 hours a week...</code><br />
                    Only add real testimonials from actual users.
                  </p>
                </div>
                <div className="mb-3.5">
                  {fieldLabel("Testimonials", "one per line: Name|Role|Avatar|Rating|Text")}
                  <Textarea
                    value={form.testimonials}
                    onChange={e => setForm(f => ({ ...f, testimonials: e.target.value }))}
                    rows={8}
                    placeholder={"Ahmed Al Rashid|Content Creator, Dubai|👨‍💼|5|This agent saved me 20 hours a week.\nSarah Thompson|Marketing Manager, London|👩‍💼|5|Incredible quality."}
                    className={monoTextareaClass}
                  />
                </div>
                {form.testimonials.trim() && (
                  <div className="mt-4">
                    <p className="mb-2.5 text-xs font-semibold text-muted-foreground">Preview:</p>
                    {form.testimonials.split("\n").filter(Boolean).map((line, i) => {
                      const [name, role, avatar, rating, ...textParts] = line.split("|");
                      return (
                        <div key={i} className="mb-2 rounded-lg border bg-background p-3.5">
                          <div className="mb-2 flex gap-0.75">
                            {Array.from({ length: Math.min(Number(rating) || 5, 5) }).map((_, j) => (
                              <span key={j} className="text-[13px] text-amber-500">★</span>
                            ))}
                          </div>
                          <p className="mb-2.5 text-[13px] leading-relaxed text-muted-foreground">
                            "{textParts.join("|")}"
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{avatar || "👤"}</span>
                            <div>
                              <p className="text-[13px] font-semibold text-foreground">{name}</p>
                              <p className="text-[11px] text-muted-foreground">{role}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ARABIC TAB */}
            {activeTab === "arabic" && (
              <div>
                <div className="mb-5 rounded-lg border border-primary/20 bg-primary/[0.06] p-3.5">
                  <p className="mb-1 text-xs font-semibold text-[#a78bfa]">🇦🇪 Arabic (UAE) Content</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Fill in the Arabic translations below. These will be shown when the user switches the portal language to Arabic (AR).
                    Leave a field blank to fall back to the English version.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                  <div className="mb-3.5">
                    {fieldLabel("Name (AR) — الاسم")}
                    <Input
                      value={form.name_ar}
                      onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                      placeholder="مثال: وكيل يوتيوب"
                      dir="rtl"
                    />
                  </div>
                  <div className="mb-3.5">
                    {fieldLabel("Tagline (AR) — الشعار")}
                    <Input
                      value={form.tagline_ar}
                      onChange={e => setForm(f => ({ ...f, tagline_ar: e.target.value }))}
                      placeholder="مثال: أتمتة قناتك على يوتيوب"
                      dir="rtl"
                    />
                  </div>
                  <div className="col-span-full mb-3.5">
                    {fieldLabel("Description (AR) — الوصف")}
                    <Textarea
                      value={form.description_ar}
                      onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))}
                      rows={4}
                      placeholder="وصف بالعربية..."
                      dir="rtl"
                    />
                  </div>
                  <div className="col-span-full mb-3.5">
                    {fieldLabel("Capabilities (AR) — المميزات", "comma separated in Arabic")}
                    <Input
                      value={form.capabilities_ar}
                      onChange={e => setForm(f => ({ ...f, capabilities_ar: e.target.value }))}
                      placeholder="اكتشاف الاتجاهات, كتابة السيناريو بالذكاء الاصطناعي, الرفع التلقائي"
                      dir="rtl"
                    />
                  </div>
                  {form.moduleType === "chatbot" ? (
                    <>
                      <div className="col-span-full mb-3.5">
                        {fieldLabel("Basic Features (AR)", "one per line in Arabic")}
                        <Textarea
                          value={form.tierBasicFeatures_ar}
                          onChange={e => setForm(f => ({ ...f, tierBasicFeatures_ar: e.target.value }))}
                          rows={4}
                          placeholder={"واجهة الدردشة على الموقع\nقاعدة المعرفة\nإشعارات البريد الإلكتروني"}
                          dir="rtl"
                        />
                      </div>
                      <div className="col-span-full mb-3.5">
                        {fieldLabel("Pro Features (AR)", "one per line in Arabic")}
                        <Textarea
                          value={form.tierProFeatures_ar}
                          onChange={e => setForm(f => ({ ...f, tierProFeatures_ar: e.target.value }))}
                          rows={5}
                          placeholder={"كل ما في الباقة الأساسية\nتكامل واتساب\nتكامل انستغرام\nتحليلات ورؤى"}
                          dir="rtl"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-full mb-3.5">
                      {fieldLabel("Pricing Features (AR) — مميزات الخطة", "one per line in Arabic")}
                      <Textarea
                        value={form.pricingFeatures_ar}
                        onChange={e => setForm(f => ({ ...f, pricingFeatures_ar: e.target.value }))}
                        rows={5}
                        placeholder={"نشر غير محدود\nدعم اللغة العربية\nتحليلات الأداء"}
                        dir="rtl"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editingId ? "Update module" : "Create module"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modules grid */}
      {loading ? (
        <div className="p-15 text-center">
          <Loader2 size={24} className="mx-auto animate-spin text-primary" />
        </div>
      ) : modules.length === 0 ? (
        <div className="rounded-xl border bg-card p-15 text-center">
          <Boxes size={36} className="mx-auto mb-4 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">No modules yet</p>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={14} /> Create first module
          </Button>
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center">
          <p className="mb-2.5 text-sm text-muted-foreground">No modules match your filters</p>
          <button
            onClick={() => { setSearch(""); setFilterType(""); setFilterCategory(""); }}
            className="border-none bg-transparent text-[13px] text-[#a78bfa] underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {filteredModules.map((m) => (
            <div key={m._id} className="rounded-xl border bg-card p-5">
              {/* Card header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex size-9.5 shrink-0 items-center justify-center rounded-lg border text-lg"
                    style={{ background: `${m.color || "#7c3aed"}15`, borderColor: `${m.color || "#7c3aed"}30` }}
                  >
                    {m.icon || "🤖"}
                  </div>
                  <div>
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      {m.isActive
                        ? <CheckCircle2 size={12} className="text-[#22c55e]" />
                        : <XCircle size={12} className="text-destructive" />}
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground">{m.slug}</p>
                  </div>
                </div>

                {/* Single badge — no overlap */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: m.isComingSoon ? "rgba(245,158,11,0.1)" : m.badge === "Live" ? "rgba(34,197,94,0.1)" : "rgba(124,58,237,0.08)",
                      color: m.isComingSoon ? "#f59e0b" : m.badge === "Live" ? "#22c55e" : "#a78bfa",
                    }}
                  >
                    {m.isComingSoon ? "Coming Soon" : m.badge || "Active"}
                  </span>
                  <span className="rounded-full border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {formatLabel(m.moduleType || "agent")}
                  </span>
                  {!m.isActive && (
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                      Hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="mb-2.5 text-xs leading-relaxed text-muted-foreground">
                {(m.description || "No description").slice(0, 90)}
                {(m.description || "").length > 90 ? "..." : ""}
              </p>

              {/* Info badges */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {m.category && (
                  <span className="rounded-md border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    {formatLabel(m.category)}
                  </span>
                )}
                {m.pipelineType && (
                  <span className="rounded-md border border-blue-500/15 bg-blue-500/[0.08] px-2 py-0.5 text-[10px] text-blue-400">
                    {formatLabel(m.pipelineType)}
                  </span>
                )}
                {m.estimatedCostPerRun && (
                  <span className="rounded-md border border-[#22c55e]/15 bg-[#22c55e]/[0.06] px-2 py-0.5 text-[10px] text-[#22c55e]">
                    {m.estimatedCostPerRun}
                  </span>
                )}
                {m.pricing?.monthly ? (
                  <span className="rounded-md bg-primary/[0.08] px-2 py-0.5 text-[10px] text-[#a78bfa]">
                    ${m.pricing.monthly}/mo
                  </span>
                ) : null}
                {m.nicheSlug && (
                  <span className="rounded-md border border-yellow-500/20 bg-yellow-500/[0.08] px-2 py-0.5 text-[10px] text-yellow-600">
                    {formatLabel(m.nicheSlug)}
                  </span>
                )}
                {m.availableIn?.length ? (
                  <span className="rounded-md border border-cyan-500/20 bg-cyan-500/[0.08] px-2 py-0.5 text-[10px] text-cyan-600">
                    {m.availableIn.join(" · ")}
                  </span>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={() => openEdit(m)} className="flex-1 gap-1">
                  <Pencil size={11} /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteTarget(m)}
                  disabled={deleteLoading === m._id}
                  className="border-destructive/20 bg-destructive/[0.06] text-destructive hover:bg-destructive/15 hover:text-destructive"
                >
                  {deleteLoading === m._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this module?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `"${deleteTarget.name}" will be permanently deleted. This can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
