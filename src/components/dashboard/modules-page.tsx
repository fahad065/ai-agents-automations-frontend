"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  Package, Plus, Play, Pause, Trash2,
  Loader2, Search,
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
import { Combobox } from "@/components/ui/combobox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CHATBOT_TEMPLATE_META, SERVICE_SLUG_TO_TEMPLATE } from "@/lib/chatbot-templates";

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
    name: string; slug: string;
    icon: string; color: string; capabilities: string[];
  };
}

export interface AvailableModule {
  _id: string; name: string; slug: string; tagline?: string; description?: string;
  type: string; pipelineType: string;
  pipelineCategory: string; nicheSlug: string;
  icon: string; color: string; badge?: string;
  capabilities: string[]; requiredApiKeys: string[];
  platforms: string[];
  pricing?: { monthly: number; annual: number; features?: string[] };
  pricingTiers?: { key: "basic" | "pro"; monthly: number; annual: number; features: string[] }[];
  status: "active" | "inactive" | "coming_soon";
  components?: { key: string; name: string; description: string; icon: string; isRequired: boolean; sortOrder: number }[];
}

const STATUS_CONFIG: Record<string, string> = {
  active:    "bg-[#22c55e]/10 text-[#22c55e]",
  trial:     "bg-[#f59e0b]/10 text-[#f59e0b]",
  paused:    "bg-secondary text-muted-foreground",
  expired:   "bg-destructive/10 text-destructive",
  cancelled: "bg-secondary text-muted-foreground",
};

// ── Add Chatbot Modal ────────────────────────────────────────
// Chatbots don't go through /usermodules/subscribe (SubscribeModal below) —
// that endpoint creates a UserModule record, the wrong data model for a
// chatbot. This does what the marketing page's pricing section does:
// POST /chatbots with moduleSlug + the chosen tier, so the backend prices
// the 30-day trial off that tier, then straight into the bot's settings.
export function AddChatbotModal({ module, onClose, onSuccess }: {
  module: AvailableModule; onClose: () => void; onSuccess: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(module.name);
  const tiers = module.pricingTiers?.length
    ? module.pricingTiers
    : [{ key: "basic" as const, monthly: module.pricing?.monthly || 0, annual: module.pricing?.annual || 0, features: module.pricing?.features || [] }];
  const [tier, setTier] = useState<"basic" | "pro">("basic");

  const handleAdd = async () => {
    if (!name.trim()) { setError("Enter a name for your chatbot"); return; }
    setSaving(true); setError("");
    try {
      const res = await api.post("/chatbots", {
        name: name.trim(),
        description: module.description || module.tagline,
        template: SERVICE_SLUG_TO_TEMPLATE[module.slug] || "custom",
        language: "both",
        moduleSlug: module.slug,
        tier,
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
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9.5 items-center justify-center rounded-[9px] border text-lg" style={{ background: `${module.color}12`, borderColor: `${module.color}20` }}>
              {module.icon}
            </div>
            <div>
              <DialogTitle>{module.name}</DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">30-day free trial · No credit card</p>
            </div>
          </div>
        </DialogHeader>

        <div className="-mx-1 overflow-y-auto px-1">
          {module.tagline && <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">{module.tagline}</p>}

          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Chatbot name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter chatbot name" className="mb-4" />

          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Choose a plan</Label>
          <div className={cn("mb-3 grid gap-2.5", tiers.length > 1 ? "sm:grid-cols-2" : "")} role="radiogroup" aria-label="Plan">
            {tiers.map((t) => {
              const active = tier === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTier(t.key)}
                  className={cn("rounded-[10px] border-[1.5px] p-3.5 text-left transition-colors", active ? "border-primary bg-primary/[0.05]" : "bg-background")}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-[13px] font-bold tracking-wide text-foreground uppercase">{t.key === "pro" ? "Pro" : "Basic"}</span>
                    {active && <Check size={14} className="text-primary" />}
                  </div>
                  {t.monthly > 0 && (
                    <>
                      <p className="text-xl font-extrabold text-foreground">${t.monthly}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                      {t.annual > 0 && t.annual < t.monthly && (
                        <p className="text-[11px] text-muted-foreground">or ${t.annual}/mo billed annually</p>
                      )}
                    </>
                  )}
                  <ul className="mt-2 space-y-1">
                    {t.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
                        <Check size={11} className="mt-0.5 shrink-0 text-[#22c55e]" /> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            You won&apos;t be charged during the trial. Next you&apos;ll add your business details and AI key, then go live when you&apos;re ready.
            You can upgrade from Basic to Pro later from the Billing tab.
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
            {saving ? <Loader2 size={14} className="animate-spin" /> : <>Start free trial <ArrowRight size={13} /></>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Subscribe Modal ───────────────────────────────────────────
export function SubscribeModal({ module, onClose, onSuccess }: {
  module: AvailableModule; onClose: () => void; onSuccess: () => void;
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
        moduleType: module.type, pipelineType: module.pipelineType,
        name: form.name, niche: form.niche, apiKeyMode: form.apiKeyMode,
        scheduleFrequency: form.scheduleFrequency, scheduleTime: form.scheduleTime,
        nicheSlug: module.nicheSlug, pipelineCategory: module.pipelineCategory,
      });
      toast.success(isNichePipeline ? "Pipeline activated — 30-day trial started!" : "Service added — 30-day trial started!");
      onSuccess(); onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to subscribe");
    }
    setSaving(false);
  };

  const needsYouTube = module.pipelineType === "youtube" || module.platforms?.includes("youtube");
  const needsInstagram = module.pipelineType === "instagram" || module.platforms?.includes("instagram");

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
              <p className="text-xs text-muted-foreground">30-day free trial · No credit card</p>
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
                    What&apos;s included ({module.components.length} agents):
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
                    <p className="mb-2.5 text-[13px] font-semibold text-foreground">What this service does:</p>
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
                <p className="mt-1.5 text-xs font-medium text-[#22c55e]">✓ 30-day free trial included</p>
              </div>
            </div>
          )}

          {/* ── SETUP ── */}
          {step === "setup" && (
            <div className="flex flex-col gap-3.5">
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
                    <Label className="mb-1.5 text-xs font-medium text-muted-foreground">Service Name</Label>
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
                    <Combobox
                      value={form.scheduleFrequency}
                      onChange={(v) => setForm(f => ({ ...f, scheduleFrequency: v }))}
                      options={[
                        { value: "manual", label: "Manual only" },
                        { value: "daily", label: "Daily" },
                        { value: "weekly", label: "Weekly" },
                      ]}
                    />
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
                {isNichePipeline ? "Activate Pipeline" : "Set Up Service"} <ChevronRight size={14} />
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

interface MyChatbot {
  _id: string;
  name: string;
  template?: string;
  status: "draft" | "active" | "inactive";
  channels?: { website?: { enabled?: boolean }; whatsapp?: { enabled?: boolean }; instagram?: { enabled?: boolean } };
  billing?: { tier?: "basic" | "pro" | "custom"; status?: string; trialEndsAt?: string };
}

const BOT_STATUS: Record<string, { className: string; label: string }> = {
  active: { className: "bg-[#22c55e]/10 text-[#22c55e]", label: "Live" },
  draft: { className: "bg-[#f59e0b]/10 text-[#f59e0b]", label: "Draft" },
  inactive: { className: "bg-secondary text-muted-foreground", label: "Paused" },
};

const trialDaysLeft = (iso?: string) =>
  iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)) : null;

// One page for everything the user has subscribed to: chatbots (their own
// Chatbot docs) next to agents and automations (UserModule docs). Adding a
// new service happens on /dashboard/services (Browse Services).
export function MyModulesPage() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<UserModule[]>([]);
  const [chatbots, setChatbots] = useState<MyChatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kindFilter, setKindFilter] = useState<"all" | "chatbot" | "pipeline">("all");
  const [editModule, setEditModule] = useState<UserModule | null>(null);
  const [runningModuleId, setRunningModuleId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserModule | null>(null);
  const [deleteBot, setDeleteBot] = useState<MyChatbot | null>(null);

  useEffect(() => { fetchModules(); }, []);

  // Old deep link (marketing "Get started" → signup → here with
  // ?openModule=<slug>) now opens that service on Browse Services.
  useEffect(() => {
    const slug = searchParams.get("openModule");
    if (!slug) return;
    router.replace(`/dashboard/services?open=${encodeURIComponent(slug)}`, { scroll: false });
  }, [searchParams, router]);

  const fetchModules = async () => {
    setLoading(true);
    const [mods, bots] = await Promise.allSettled([api.get("/usermodules/my"), api.get("/chatbots")]);
    if (mods.status === "fulfilled") setAgents(mods.value.data?.data || mods.value.data || []);
    if (bots.status === "fulfilled") setChatbots(bots.value.data?.data || bots.value.data || []);
    setLoading(false);
  };

  const toggleModule = async (id: string) => {
    try { await api.patch(`/usermodules/${id}/toggle`); fetchModules(); } catch {}
  };

  const deleteModule = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/usermodules/${deleteTarget._id}`);
      toast.success("Service removed");
      fetchModules();
    } catch {
      toast.error("Failed to remove service");
    }
    setDeleteTarget(null);
  };

  const deleteChatbot = async () => {
    if (!deleteBot) return;
    try {
      await api.delete(`/chatbots/${deleteBot._id}`);
      toast.success("Chatbot deleted");
      fetchModules();
    } catch {
      toast.error("Failed to delete chatbot");
    }
    setDeleteBot(null);
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

  const q = search.toLowerCase();
  const filtered = kindFilter === "chatbot" ? [] : agents.filter((m) => {
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.niche?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const filteredBots = kindFilter === "pipeline" ? [] : chatbots.filter((b) => {
    const matchSearch = !q || b.name.toLowerCase().includes(q) || (b.template || "").includes(q);
    const onTrial = b.billing?.status === "trial";
    const matchStatus = statusFilter === "all" || b.status === statusFilter || (statusFilter === "trial" && onTrial)
      || (statusFilter === "paused" && b.status === "inactive");
    return matchSearch && matchStatus;
  });
  const total = filtered.length + filteredBots.length;

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
          <h1 className="mb-1 text-xl font-bold text-foreground">My Services</h1>
          <p className="text-sm text-muted-foreground">Your chatbots, agents and automations in one place.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/services")} className="gap-2">
          <Plus size={15} /> Add Service
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-[10px] border bg-card px-4 py-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="h-8 w-full pl-7.5 text-[13px]" />
        </div>
        <Combobox
          value={kindFilter}
          onChange={(v) => setKindFilter((v || "all") as typeof kindFilter)}
          options={[
            { value: "all", label: "All types" },
            { value: "chatbot", label: "Chatbots" },
            { value: "pipeline", label: "Agents & automations" },
          ]}
          className="w-auto min-w-[170px]"
        />
        <Combobox
          value={statusFilter}
          onChange={(v) => setStatusFilter(v || "all")}
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active / Live" },
            { value: "trial", label: "Trial" },
            { value: "draft", label: "Draft" },
            { value: "paused", label: "Paused" },
            { value: "expired", label: "Expired" },
          ]}
          className="w-auto min-w-[150px]"
        />
        <span className="ml-auto text-xs text-muted-foreground">{total} service{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-15 text-center">
          <Loader2 size={28} className="mx-auto animate-spin text-primary" />
        </div>
      ) : total === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-15 text-center">
          <Package size={40} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="mb-2 text-base font-semibold text-foreground">{search || statusFilter !== "all" || kindFilter !== "all" ? "No services found" : "No services yet"}</h2>
          <p className="mb-5 text-sm text-muted-foreground">{search ? "Try a different search term." : "Browse services to start your first 30-day free trial."}</p>
          <Button onClick={() => router.push("/dashboard/services")} className="gap-2">
            <Plus size={15} /> Browse Services
          </Button>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {filteredBots.map((bot) => {
            const meta = CHATBOT_TEMPLATE_META[bot.template || "custom"] || CHATBOT_TEMPLATE_META.custom;
            const st = BOT_STATUS[bot.status] || BOT_STATUS.draft;
            const days = bot.billing?.status === "trial" ? trialDaysLeft(bot.billing?.trialEndsAt) : null;
            const channels = (["website", "whatsapp", "instagram"] as const).filter((c) => bot.channels?.[c]?.enabled);
            return (
              <div key={bot._id} className="flex flex-col rounded-xl border bg-card p-4.5" data-testid="my-chatbot-card">
                <div className="mb-2.5 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-primary/20 bg-primary/[0.06] text-xl">{meta.emoji}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{bot.name}</p>
                      <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MessageCircle size={10} /> {meta.name} chatbot · {bot.billing?.tier === "pro" ? "Pro" : bot.billing?.tier === "custom" ? "Custom" : "Basic"}
                      </p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.75 text-[10px] font-semibold", st.className)}>{st.label}</span>
                </div>
                <div className="mb-3 flex gap-1.5">
                  <div className="flex-1 rounded-md border bg-background px-2 py-1.5 text-center">
                    <p className="text-[11px] font-bold text-foreground">{days !== null ? `${days} day${days === 1 ? "" : "s"}` : bot.billing?.status === "active" ? "Paid" : "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{days !== null ? "Trial left" : "Billing"}</p>
                  </div>
                  <div className="flex-1 rounded-md border bg-background px-2 py-1.5 text-center">
                    <p className="truncate text-[11px] font-bold text-foreground capitalize">{channels.length ? channels.join(", ") : "None yet"}</p>
                    <p className="text-[10px] text-muted-foreground">Channels</p>
                  </div>
                </div>
                <div className="mt-auto flex items-stretch gap-1.5">
                  <Button onClick={() => router.push(`/dashboard/chatbots/${bot._id}`)} className="flex-1 gap-1.5 text-xs">
                    <Settings2 size={13} /> Configure
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setDeleteBot(bot)} title="Delete" className="border-destructive/20 bg-destructive/6 text-destructive">
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
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
            <AlertDialogTitle>Remove this service?</AlertDialogTitle>
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
      <AlertDialog open={!!deleteBot} onOpenChange={(open) => !open && setDeleteBot(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chatbot?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteBot && `"${deleteBot.name}" and its knowledge base and conversations will be deleted. This can't be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteChatbot} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
