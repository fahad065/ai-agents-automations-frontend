"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  Package, Plus, Play, Pause, Trash2,
  Loader2, Search, AlertTriangle,
  ChevronRight, Check, Settings2,
  MessageCircle, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { YouTubeConnectButton } from "./youtube-connect-button";
import { InstagramConnectButton } from "./instagram-connect-button";
import { EditModuleModal } from "./edit-module-modal";
import { NicheSuggester } from "./niche-suggester";
import { PipelineStatusWidget } from "./pipeline-status-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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

// Maps a chatbot template module's slug to the Chatbot.template enum the
// backend expects on creation (see chatbot.schema.ts) — same lookup used on
// the marketing detail page (chatbot-detail-page.tsx).
const CHATBOT_TEMPLATE_ENUM: Record<string, string> = {
  "restaurant-chatbot": "restaurant",
  "real-estate-chatbot": "real_estate",
  "clinic-chatbot": "clinic",
  "ecommerce-chatbot": "ecommerce",
  "gym-chatbot": "gym",
  "education-chatbot": "education",
  "salon-chatbot": "salon",
  "hotel-chatbot": "hotel",
  "auto-dealership-chatbot": "auto_dealership",
};

interface AvailableModule {
  _id: string; name: string; slug: string; tagline?: string; description?: string;
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

const STATUS_CONFIG: Record<string, string> = {
  active:    "bg-[#22c55e]/10 text-[#22c55e]",
  trial:     "bg-[#f59e0b]/10 text-[#f59e0b]",
  paused:    "bg-secondary text-muted-foreground",
  expired:   "bg-destructive/10 text-destructive",
  cancelled: "bg-secondary text-muted-foreground",
};

// ── Add Chatbot Modal ────────────────────────────────────────
// Chatbots don't go through /usermodules/subscribe (SubscribeModal below) —
// that endpoint creates a UserModule record, which is the wrong data model
// entirely for a chatbot (no embedKey, no knowledge base, no channels).
// This mirrors exactly what the marketing detail page's pricing section
// does: POST /chatbots with moduleSlug so the backend prices the trial off
// this template's module.pricing.monthly, then straight into the bot's own
// config portal — same 30-day auto-trial, same destination.
function AddChatbotModal({ module, onClose, onSuccess }: {
  module: AvailableModule; onClose: () => void; onSuccess: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    setSaving(true); setError("");
    try {
      const res = await api.post("/chatbots", {
        name: module.name,
        description: module.description || module.tagline,
        template: CHATBOT_TEMPLATE_ENUM[module.slug] || "custom",
        language: "both",
        moduleSlug: module.slug,
      });
      const created = res.data?.data || res.data;
      toast.success("Chatbot created — 30-day free trial started!");
      onSuccess(); onClose();
      router.push(`/dashboard/chatbots/${created._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create chatbot");
    }
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9.5 items-center justify-center rounded-[9px] border text-lg" style={{ background: `${module.color}12`, borderColor: `${module.color}20` }}>
              {module.icon}
            </div>
            <div>
              <DialogTitle>{module.name}</DialogTitle>
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-primary/12 px-1.75 py-0.5 text-[10px] font-semibold text-[#a78bfa]">
                <MessageCircle size={9} /> Chatbot
              </span>
            </div>
          </div>
        </DialogHeader>

        <div>
          {module.tagline && (
            <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">{module.tagline}</p>
          )}

          {module.pricing && module.pricing.monthly > 0 && (
            <div className="mb-4 rounded-[10px] border bg-background px-4 py-3.5">
              <div className="mb-0.5 flex items-baseline gap-1">
                <span className="text-[22px] font-extrabold text-foreground">${module.pricing.monthly}</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </div>
              <p className="text-[11px] font-semibold text-[#22c55e]">30-day free trial — no credit card required</p>
            </div>
          )}

          <p className="mb-1 text-xs leading-relaxed text-muted-foreground">
            This creates the chatbot right away and takes you into its setup — add your knowledge base, connect channels, and go live whenever you're ready.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-[13px] text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleAdd} disabled={saving} className="flex-2 gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <>Add chatbot <ArrowRight size={13} /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Subscribe Modal ───────────────────────────────────────────
function SubscribeModal({ module, country, onClose, onSuccess }: {
  module: AvailableModule; country: string; onClose: () => void; onSuccess: () => void;
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
  const { colors, isDark } = useTheme();

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border text-xl" style={{ background: `${module.color}15`, borderColor: `${module.color}25` }}>
              {module.icon}
            </div>
            <div>
              <div className="mb-0.5 flex items-center gap-1.5">
                <DialogTitle>{module.name}</DialogTitle>
                {isNichePipeline && (
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: `${module.color}20`, color: module.color, border: `1px solid ${module.color}30` }}>PIPELINE</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">30-day free trial · No credit card</p>
                <span className="rounded border bg-secondary px-1.5 py-0.25 text-[11px] text-muted-foreground">{countryFlag} {country}</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-0.5 rounded-lg bg-background p-0.75">
            {(["overview", "setup"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={cn(
                  "flex-1 rounded-md border-0 py-1.5 text-xs transition-colors",
                  step === s ? "bg-card font-semibold text-foreground shadow-sm" : "font-normal text-muted-foreground"
                )}
              >
                {s === "overview" ? "Overview" : "Setup"}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* ── OVERVIEW ── */}
          {step === "overview" && (
            <div>
              {module.tagline && (
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{module.tagline}</p>
              )}

              {/* Niche pipeline: show components */}
              {isNichePipeline && module.components && module.components.length > 0 ? (
                <div className="mb-5">
                  <p className="mb-2.5 text-[13px] font-semibold text-foreground">
                    What's included ({module.components.length} agents):
                  </p>
                  {module.components
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((c, i) => (
                      <div key={c.key} className="mb-1.5 flex items-start gap-2.5 rounded-lg border bg-background px-3 py-2.5">
                        <div className="mt-0.25 shrink-0 text-lg">{c.icon}</div>
                        <div className="flex-1">
                          <div className="mb-0.5 flex items-center gap-1.5">
                            <p className="text-[13px] font-semibold text-foreground">{c.name}</p>
                            {c.isRequired && (
                              <span className="rounded bg-primary/10 px-1.25 py-0.25 text-[9px] font-semibold text-[#a78bfa]">CORE</span>
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed text-muted-foreground">{c.description}</p>
                        </div>
                        <span className="mt-0.5 shrink-0 text-[11px] text-muted-foreground">#{i + 1}</span>
                      </div>
                    ))}
                </div>
              ) : (
                module.capabilities?.length > 0 && (
                  <div className="mb-5">
                    <p className="mb-2.5 text-[13px] font-semibold text-foreground">What this module does:</p>
                    {module.capabilities.map((cap, i) => (
                      <div key={i} className="mb-2 flex items-start gap-2">
                        <Check size={13} className="mt-0.5 shrink-0" color={module.color} />
                        <span className="text-[13px] text-muted-foreground">{cap}</span>
                      </div>
                    ))}
                  </div>
                )
              )}

              <div className="rounded-[9px] border bg-background p-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-foreground">Pricing</p>
                  <p className="text-lg font-bold text-[#22c55e]">
                    {module.pricing?.monthly ? `$${module.pricing.monthly}/mo` : "Free"}
                  </p>
                </div>
                {module.estimatedCostPerRun && (
                  <p className="text-xs text-muted-foreground">+ ~{module.estimatedCostPerRun} in API costs per run</p>
                )}
                <p className="mt-1.5 text-xs font-medium text-[#22c55e]">✓ 30-day free trial included</p>
              </div>
            </div>
          )}

          {/* ── SETUP ── */}
          {step === "setup" && (
            <div className="flex flex-col gap-3.5">
              {/* Country confirmation */}
              <div className="flex items-center justify-between rounded-lg border bg-background px-3.5 py-2.5">
                <div>
                  <p className="text-xs font-semibold text-foreground">Country</p>
                  <p className="text-[11px] text-muted-foreground">Module will be set up for this market</p>
                </div>
                <span className="text-sm font-bold text-foreground">{countryFlag} {country}</span>
              </div>

              {/* For niche pipelines: show component summary instead of niche field */}
              {isNichePipeline ? (
                <div className="rounded-lg border p-3.5" style={{ background: `${module.color}08`, borderColor: `${module.color}20` }}>
                  <p className="mb-2 text-xs font-semibold" style={{ color: module.color }}>
                    {module.components?.length || 0} agents will be activated:
                  </p>
                  {module.components?.map(c => (
                    <div key={c.key} className="mb-1 flex items-center gap-1.5">
                      <span className="text-xs">{c.icon}</span>
                      <span className="text-xs text-muted-foreground">{c.name}</span>
                      {c.isRequired && <span className="ml-auto text-[10px] text-[#a78bfa]">core</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div>
                    <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Module Name</Label>
                    <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My YouTube Agent" />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs font-medium text-muted-foreground">
                      Content Niche * <span className="font-normal">— click 🔄 for suggestions</span>
                    </Label>
                    <NicheSuggester value={form.niche} onChange={(v) => setForm(f => ({ ...f, niche: v }))} pipelineType={module.pipelineType} colors={colors} isDark={isDark} />
                    <p className="mt-1 text-[11px] text-muted-foreground">AI will research topics and create content for this niche.</p>
                  </div>
                </>
              )}

              {needsYouTube && (
                <div>
                  <Label className="mb-1.5 text-xs font-medium text-muted-foreground">YouTube Channel</Label>
                  <YouTubeConnectButton colors={colors} />
                </div>
              )}
              {needsInstagram && (
                <div>
                  <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Instagram Account</Label>
                  <InstagramConnectButton colors={colors} />
                </div>
              )}

              {/* Schedule — only for standalone agents */}
              {!isNichePipeline && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Schedule</Label>
                    <select
                      value={form.scheduleFrequency}
                      onChange={(e) => setForm(f => ({ ...f, scheduleFrequency: e.target.value }))}
                      className="h-8 w-full cursor-pointer rounded-lg border bg-background px-3 text-[13px] text-foreground outline-none"
                    >
                      <option value="manual">Manual only</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Run Time (24hr)</Label>
                    <Input type="time" value={form.scheduleTime} onChange={(e) => setForm(f => ({ ...f, scheduleTime: e.target.value }))} />
                  </div>
                </div>
              )}

              <div className="rounded-lg border-2 border-[#22c55e] bg-[#22c55e]/5 px-3.5 py-2.5">
                <p className="mb-0.5 text-xs font-semibold text-[#22c55e]">Own API Keys ✓</p>
                <p className="text-[11px] text-muted-foreground">Uses your OpenAI and Seedance keys from Settings → API Keys.</p>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/8 px-3 py-2 text-xs text-destructive">{error}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "overview" ? (
            <>
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button
                onClick={() => setStep("setup")}
                className="flex-2 gap-2"
                style={{ background: `linear-gradient(135deg, ${module.color}, ${module.color}cc)` }}
              >
                {isNichePipeline ? "Activate Pipeline" : "Set Up Module"} <ChevronRight size={14} />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("overview")} className="flex-1">Back</Button>
              <Button onClick={handleSubscribe} disabled={saving} className="flex-2 gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {saving ? "Activating..." : isNichePipeline ? "Activate Pipeline" : "Start Free Trial"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Marketplace Modal ─────────────────────────────────────────
function MarketplaceModal({ onClose, onSubscribed, country, onCountryChange, initialSlug }: {
  onClose: () => void; onSubscribed: () => void;
  country: string; onCountryChange: (c: string) => void; initialSlug?: string | null;
}) {
  const [modules, setModules] = useState<AvailableModule[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeNiche, setActiveNiche] = useState("all");
  const [selected, setSelected] = useState<AvailableModule | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setActiveNiche("all");
    Promise.all([
      api.get(`/modules?limit=100&country=${country}`),
      api.get(`/niches?country=${country}`),
    ]).then(([modRes, nicheRes]) => {
      const mods: AvailableModule[] = modRes.data?.data || [];
      setModules(mods);
      setNiches(nicheRes.data || []);
      setLoading(false);
      // Coming from a marketing page's "Get started" via the signup redirect
      // (or an already-logged-in user's own "Get started" link) — open this
      // module's setup form directly instead of leaving them to rediscover
      // it in the grid.
      if (initialSlug) {
        const match = mods.find((m) => m.slug === initialSlug);
        if (match) setSelected(match);
      }
    }).catch(() => setLoading(false));
  }, [country, initialSlug]);

  const filtered = modules.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase());
    const matchNiche = activeNiche === "all" || m.nicheSlug === activeNiche;
    return matchSearch && matchNiche;
  });

  if (selected) {
    if (selected.moduleType === "chatbot") {
      return <AddChatbotModal module={selected} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); onClose(); onSubscribed(); }} />;
    }
    return <SubscribeModal module={selected} country={country} onClose={() => setSelected(null)} onSuccess={() => { setSelected(null); onClose(); onSubscribed(); }} />;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <div className="mb-1 flex items-center justify-between">
            <div>
              <DialogTitle>Module Marketplace</DialogTitle>
              <p className="mt-1 text-xs text-muted-foreground">Choose a module to add to your account</p>
            </div>
            {/* Country selector */}
            <select
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              className="h-8 cursor-pointer rounded-lg border bg-background px-2.5 text-xs font-semibold text-foreground outline-none"
            >
              {COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="h-8 pl-7.5 text-[13px]" />
          </div>

          {/* Niche tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            <button
              onClick={() => setActiveNiche("all")}
              className={cn(
                "rounded-full border px-3 py-1.25 text-[11px] font-semibold whitespace-nowrap",
                activeNiche === "all" ? "border-primary/60 bg-primary/10 text-[#a78bfa]" : "text-muted-foreground"
              )}
            >
              All
            </button>
            {niches.map(n => (
              <button
                key={n.slug}
                onClick={() => setActiveNiche(n.slug)}
                className="rounded-full border px-3 py-1.25 text-[11px] font-semibold whitespace-nowrap"
                style={activeNiche === n.slug ? { borderColor: n.color, background: `${n.color}15`, color: n.color } : undefined}
              >
                {n.icon} {n.name}
              </button>
            ))}
          </div>
        </DialogHeader>

        {/* Module grid */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-15 text-center"><Loader2 size={24} className="mx-auto animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              {modules.length === 0 ? (
                <div className="rounded-xl border border-[#f59e0b]/20 bg-[#f59e0b]/6 px-6 py-8">
                  <AlertTriangle size={28} className="mx-auto mb-3 text-[#f59e0b]" />
                  <p className="mb-1.5 text-sm font-semibold text-foreground">No modules available yet</p>
                  <p className="text-xs text-muted-foreground">Admin hasn't published any modules yet.</p>
                </div>
              ) : (
                <p className="text-[13px] text-muted-foreground">No modules match your search</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filtered.map((m) => {
                const isHovered = hoveredId === m._id;
                return (
                  <div
                    key={m._id}
                    className={cn("rounded-xl border bg-card p-4 transition-colors", m.isComingSoon ? "cursor-not-allowed opacity-60" : "cursor-pointer")}
                    style={isHovered && !m.isComingSoon ? { borderColor: `${m.color}50` } : undefined}
                    onClick={() => !m.isComingSoon && setSelected(m)}
                    onMouseEnter={() => setHoveredId(m._id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <div className="flex size-9.5 shrink-0 items-center justify-center rounded-[9px] border text-xl" style={{ background: `${m.color}12`, borderColor: `${m.color}20` }}>{m.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-semibold text-foreground">{m.name}</p>
                          {m.pipelineCategory === "niche_pipeline" && (
                            <span className="rounded border px-1.25 py-0.25 text-[9px] font-bold" style={{ background: `${m.color}15`, color: m.color, borderColor: `${m.color}25` }}>PIPELINE</span>
                          )}
                          {m.moduleType === "chatbot" && (
                            <span className="rounded border border-primary/30 bg-primary/15 px-1.25 py-0.25 text-[9px] font-bold text-[#a78bfa]">CHATBOT</span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground capitalize">{m.moduleType} · {m.category}</p>
                      </div>
                      {m.isComingSoon ? (
                        <span className="rounded-full bg-secondary px-1.75 py-0.5 text-[10px] font-semibold text-muted-foreground">Soon</span>
                      ) : (
                        <span className="rounded-full bg-[#22c55e]/10 px-1.75 py-0.5 text-[10px] font-semibold text-[#22c55e]">Free Trial</span>
                      )}
                    </div>

                    {m.tagline && <p className="mb-2.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{m.tagline}</p>}

                    {/* Niche pipeline: show component list preview */}
                    {m.pipelineCategory === "niche_pipeline" && m.components && m.components.length > 0 && (
                      <div className="mb-2.5">
                        {m.components.slice(0, 3).map(c => (
                          <div key={c.key} className="mb-0.75 flex items-center gap-1.5">
                            <span className="text-[10px]">{c.icon}</span>
                            <span className="text-[11px] text-muted-foreground">{c.name}</span>
                          </div>
                        ))}
                        {m.components.length > 3 && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">+{m.components.length - 3} more components</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={cn("text-xs font-bold", m.pricing?.monthly ? "text-foreground" : "text-[#22c55e]")}>{m.pricing?.monthly ? `$${m.pricing.monthly}/mo` : "Free"}</span>
                      {!m.isComingSoon && <span className="text-[11px] font-medium" style={{ color: m.color }}>{m.pipelineCategory === "niche_pipeline" ? "Set up pipeline →" : "Get started →"}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function MyModulesPage() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMarketplace, setShowMarketplace] = useState(false);
  const [editModule, setEditModule] = useState<UserModule | null>(null);
  const [runningModuleId, setRunningModuleId] = useState<string | null>(null);
  const [country, setCountry] = useState("UAE");
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserModule | null>(null);

  useEffect(() => { fetchModules(); }, []);

  // A marketing page's "Get started" link (or the post-signup redirect chain)
  // lands here with ?openModule=<slug> — open the marketplace straight to
  // that module's setup form instead of the plain grid.
  useEffect(() => {
    const slug = searchParams.get("openModule");
    if (!slug) return;
    setPendingSlug(slug);
    setShowMarketplace(true);
    router.replace("/dashboard/modules", { scroll: false });
  }, [searchParams, router]);

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

  const deleteModule = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/usermodules/${deleteTarget._id}`);
      toast.success("Module removed");
      fetchModules();
    } catch {
      toast.error("Failed to remove module");
    }
    setDeleteTarget(null);
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">My Modules</h1>
          <p className="text-sm text-muted-foreground">Manage your subscribed agents and automations.</p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Country selector */}
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-8 cursor-pointer rounded-lg border bg-card px-3 text-[13px] font-semibold text-foreground outline-none"
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag} {c.label}</option>
            ))}
          </select>
          <Button onClick={() => setShowMarketplace(true)} className="gap-2">
            <Plus size={15} /> Add Module
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-[10px] border bg-card px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..." className="h-8 w-full pl-7.5 text-[13px]" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 min-w-[130px] cursor-pointer rounded-lg border bg-background px-3 text-[13px] text-foreground outline-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
        </select>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} module{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-15 text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-15 text-center">
          <Package size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="mb-2 text-base font-semibold text-foreground">{search ? "No modules found" : "No modules yet"}</h2>
          <p className="mb-5 text-sm text-muted-foreground">{search ? "Try a different search term." : "Browse the marketplace to add your first module."}</p>
          {!search && (
            <Button onClick={() => setShowMarketplace(true)} className="gap-2">
              <Plus size={15} /> Browse Marketplace
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {filtered.map((module) => {
            const scClass = STATUS_CONFIG[module.status] || STATUS_CONFIG.paused;
            const isYouTube = module.pipelineType === "youtube";
            return (
              <div key={module._id} className="rounded-xl border bg-card p-4.5">
                {/* Card header */}
                <div className="mb-2.5 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border text-xl"
                      style={{ background: `${(module.moduleId as any)?.color || "#7c3aed"}15`, borderColor: `${(module.moduleId as any)?.color || "#7c3aed"}25` }}
                    >
                      {(module.moduleId as any)?.icon || "🤖"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{module.name}</p>
                      <p className="text-[11px] text-muted-foreground">{module.moduleName}</p>
                    </div>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.75 text-[10px] font-semibold", scClass)}>
                    {module.status}
                  </span>
                </div>

                {/* Niche */}
                {module.niche && (
                  <p className="mb-2.5 text-xs leading-relaxed text-muted-foreground">{module.niche}</p>
                )}

                {/* Stats row */}
                <div className="mb-3 flex gap-1.5">
                  {[
                    { label: "Runs", value: module.totalRuns ?? 0 },
                    { label: "Spent", value: `$${(module.totalCost || 0).toFixed(2)}` },
                    { label: "Schedule", value: formatSchedule(module) },
                  ].map((s, i) => (
                    <div key={i} className="flex-1 rounded-md border bg-background px-2 py-1.5 text-center">
                      <p className="overflow-hidden text-[11px] font-bold text-ellipsis whitespace-nowrap text-foreground">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* YouTube connect — compact */}
                {isYouTube && (
                  <div className="mb-2.5">
                    <YouTubeConnectButton colors={colors} compact />
                  </div>
                )}

                {/* Instagram connect — compact */}
                {module.pipelineType === "instagram" && (
                  <div className="mb-2.5">
                    <InstagramConnectButton colors={colors} compact />
                  </div>
                )}

                {/* Pipeline status widget */}
                <div className="mb-2.5">
                  <PipelineStatusWidget
                    userModuleId={module._id}
                    colors={colors}
                    onRunNow={() => setEditModule(module)}
                  />
                </div>

                {/* Configure & Run button + pause + delete */}
                <div className="flex items-stretch gap-1.5">
                  <Button onClick={() => setEditModule(module)} className="flex-1 gap-1.5 text-xs">
                    <Settings2 size={13} /> Configure & Run
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleModule(module._id)}
                    title={["active", "trial"].includes(module.status) ? "Pause" : "Resume"}
                    className={["active", "trial"].includes(module.status) ? "text-[#f59e0b]" : "text-[#22c55e]"}
                  >
                    {["active", "trial"].includes(module.status) ? <Pause size={13} /> : <Play size={13} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteTarget(module)}
                    title="Remove"
                    className="border-destructive/20 bg-destructive/6 text-destructive"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Marketplace modal */}
      {showMarketplace && (
        <MarketplaceModal
          onClose={() => { setShowMarketplace(false); setPendingSlug(null); }}
          onSubscribed={fetchModules}
          country={country}
          onCountryChange={setCountry}
          initialSlug={pendingSlug}
        />
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this module?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `"${deleteTarget.name}" will be removed. This can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteModule} className="bg-destructive text-white hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
