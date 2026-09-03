"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { apiClient } from "@/lib/api-client";
import { ArrowRight, Bot, Zap, Package, Loader2, CheckCircle2, X, Info } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { tr, industryName, industryDesc } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Module {
  _id: string;
  name: string;
  name_ar?: string;
  slug: string;
  tagline: string;
  tagline_ar?: string;
  description: string;
  description_ar?: string;
  category: string;
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  capabilities_ar?: string[];
  moduleType: "agent" | "automation";
  pipelineCategory?: "standalone" | "niche_pipeline";
  nicheSlug?: string;
  components?: Array<{ name: string; description: string; icon: string; color?: string }>;
  pricing?: { monthly: number; annual: number };
  pricingFeatures_ar?: string[];
}

const INDUSTRY_ICONS: Record<string, { icon: string; color: string }> = {
  real_estate:       { icon: "🏡", color: "#3b82f6" },
  content_social:    { icon: "🎬", color: "#7c3aed" },
  healthcare:        { icon: "🏥", color: "#22c55e" },
  hr_recruitment:    { icon: "👥", color: "#8b5cf6" },
  ecommerce_retail:  { icon: "🛒", color: "#ef4444" },
  marketing:         { icon: "📣", color: "#f59e0b" },
  hospitality:       { icon: "🏨", color: "#06b6d4" },
  education:         { icon: "🎓", color: "#f97316" },
  logistics:         { icon: "🚚", color: "#84cc16" },
  agriculture:       { icon: "🌾", color: "#84cc16" },
  finance:           { icon: "💹", color: "#10b981" },
  internal_copilot:  { icon: "⚙️", color: "#a78bfa" },
};

export function IndustryDetailPage({ slug }: { slug: string }) {
  const { isDark } = useTheme();
  const { lang, isAr } = useLang();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoModule, setInfoModule] = useState<Module | null>(null);

  const icons = INDUSTRY_ICONS[slug] || { icon: "⚡", color: "#7c3aed" };
  const meta = {
    label: industryName(slug, lang),
    icon: icons.icon,
    color: icons.color,
    desc: industryDesc(slug, lang),
  };

  const fetchModules = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiClient.get<{ data: Module[] }>("/modules", { nicheSlug: slug });
      setModules((data as any).data || (data as any));
    } catch {
      setError("Failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [slug, lang]); // re-fetch when lang changes

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const pipeline = modules.find((m) => m.pipelineCategory === "niche_pipeline");
  const agents = modules.filter((m) => m.moduleType === "agent" && m.pipelineCategory !== "niche_pipeline");
  const automations = modules.filter((m) => m.moduleType === "automation" && m.pipelineCategory !== "niche_pipeline");

  const mName = (m: Module) => (isAr && m.name_ar) ? m.name_ar : m.name;
  const mTagline = (m: Module) => (isAr && m.tagline_ar) ? m.tagline_ar : m.tagline;
  const mDesc = (m: Module) => (isAr && m.description_ar) ? m.description_ar : m.description;
  const mCaps = (m: Module): string[] => (isAr && m.capabilities_ar?.length) ? m.capabilities_ar : m.capabilities;

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      {/* Info modal */}
      {infoModule && (
        <InfoModal module={infoModule} onClose={() => setInfoModule(null)} isAr={isAr} lang={lang} />
      )}

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-27.5 pb-13">
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: `${meta.color}10` }}
        />

        <div className="relative mx-auto max-w-[900px]">
          <div className="mb-7">
            <BreadcrumbNav items={[
              { label: "Industries", href: "/industries" },
              { label: meta.label },
            ]} />
          </div>

          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.75 text-[13px] font-semibold"
            style={{ borderColor: `${meta.color}30`, background: `${meta.color}10`, color: meta.color }}
          >
            <span className="text-base">{meta.icon}</span>
            {meta.label}
          </div>

          <h1 className="mb-4.5 text-[clamp(36px,5.5vw,62px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
            {isAr ? "أدوات ذكاء اصطناعي لـ" : "AI tools built for"}<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${meta.color}, ${meta.color}80)` }}
            >
              {meta.label}.
            </span>
          </h1>

          <p className="mb-7 max-w-[520px] text-[17px] leading-[1.7] text-muted-foreground">
            {meta.desc}
          </p>

          {/* Counts */}
          {!loading && (
            <div className="flex flex-wrap gap-5">
              {pipeline && (
                <Chip icon={<Package size={13} color={meta.color} />} label={isAr ? "حزمة كاملة واحدة" : "1 complete bundle"} color={meta.color} />
              )}
              {agents.length > 0 && (
                <Chip icon={<Bot size={13} color={meta.color} />} label={isAr ? `${agents.length} وكيل` : `${agents.length} agent${agents.length !== 1 ? "s" : ""}`} color={meta.color} />
              )}
              {automations.length > 0 && (
                <Chip icon={<Zap size={13} color={meta.color} />} label={isAr ? `${automations.length} أتمتة` : `${automations.length} automation${automations.length !== 1 ? "s" : ""}`} color={meta.color} />
              )}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1100px] px-6 pb-25">
        {loading && (
          <div className="p-20 text-center">
            <Loader2 size={30} className="mx-auto mb-3.5 animate-spin" color={meta.color} />
            <p className="text-sm text-muted-foreground">{isAr ? `جاري تحميل أدوات ${meta.label}...` : `Loading ${meta.label} tools...`}</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-15 text-center">
            <p className="mb-3.5 text-destructive">{isAr ? tr("failedToLoad", "ar") : error}</p>
            <Button onClick={fetchModules} style={{ background: meta.color }}>{tr("tryAgain", lang)}</Button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Pipeline Bundle */}
            {pipeline && (
              <section className="mb-14">
                <SectionLabel icon={<Package size={14} color={meta.color} />} label="Complete Bundle" color={meta.color} />
                <div
                  className="relative overflow-hidden rounded-2xl border p-8"
                  style={{ background: `${meta.color}06`, borderColor: `${meta.color}25` }}
                >
                  <div
                    className="pointer-events-none absolute -top-10 -right-10 size-[180px] rounded-full blur-[50px]"
                    style={{ background: `${meta.color}12` }}
                  />
                  <div className="flex flex-wrap items-start gap-4.5">
                    <div
                      className="flex size-14 shrink-0 items-center justify-center rounded-[13px] border text-2xl"
                      style={{ background: `${meta.color}15`, borderColor: `${meta.color}30` }}
                    >
                      {pipeline.icon}
                    </div>
                    <div className="min-w-[200px] flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                        <h3 className="text-xl font-extrabold tracking-[-0.02em] text-foreground">
                          {mName(pipeline)}
                        </h3>
                        <span
                          className="rounded-full border px-2.5 py-0.75 text-[10px] font-bold tracking-[0.05em] uppercase"
                          style={{ background: `${meta.color}15`, color: meta.color, borderColor: `${meta.color}30` }}
                        >
                          {tr("fullBundle", lang)}
                        </span>
                      </div>
                      {mTagline(pipeline) && (
                        <p className="mb-2 text-[13px] font-medium" style={{ color: meta.color }}>
                          {mTagline(pipeline)}
                        </p>
                      )}
                      <p className="mb-5 max-w-[560px] text-sm leading-[1.7] text-muted-foreground">
                        {mDesc(pipeline)}
                      </p>

                      {pipeline.components && pipeline.components.length > 0 && (
                        <div className="mb-5.5">
                          <p className="mb-2.5 text-[11px] font-semibold tracking-[0.07em] text-muted-foreground uppercase">
                            {tr("whatsIncluded", lang)}
                          </p>
                          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
                            {pipeline.components.map((comp, i) => (
                              <div key={i} className={cn("flex items-start gap-2.5 rounded-[9px] border px-3.25 py-2.75", isDark ? "bg-white/3" : "bg-black/2")}>
                                <span className="shrink-0 text-[17px]">{comp.icon}</span>
                                <div>
                                  <p className="mb-0.5 text-xs font-semibold text-foreground">{comp.name}</p>
                                  <p className="text-[11px] leading-tight text-muted-foreground">{comp.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!pipeline.components?.length && mCaps(pipeline).length > 0 && (
                        <div className="mb-4.5 flex flex-wrap gap-1.5">
                          {mCaps(pipeline).map((cap) => (
                            <span
                              key={cap}
                              className="flex items-center gap-1.25 rounded-md border px-2.5 py-1 text-[11px]"
                              style={{ background: `${meta.color}10`, color: meta.color, borderColor: `${meta.color}20` }}
                            >
                              <CheckCircle2 size={10} /> {cap}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <Button nativeButton={false} render={<Link href={`/agents/${pipeline.slug}`} />} className="gap-1.75" style={{ background: meta.color }}>
                          {tr("getBundle", lang)} <ArrowRight size={14} />
                        </Button>
                        {pipeline.pricing?.monthly && (
                          <span className="text-[13px] text-muted-foreground">
                            {tr("fromPerMonth", lang)} ${pipeline.pricing.monthly}{tr("perMonth", lang)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Agents */}
            {agents.length > 0 && (
              <section className="mb-14">
                <SectionLabel icon={<Bot size={14} color={meta.color} />} label={`${tr("aiAgents", lang)} (${agents.length})`} color={meta.color} />
                <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
                  {agents.map((m) => (
                    <ModuleCard key={m._id} module={m} onInfo={() => setInfoModule(m)} lang={lang} isAr={isAr} />
                  ))}
                </div>
              </section>
            )}

            {/* Automations */}
            {automations.length > 0 && (
              <section className="mb-14">
                <SectionLabel icon={<Zap size={14} color={meta.color} />} label={`${tr("automationsLabel", lang)} (${automations.length})`} color={meta.color} />
                <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))" }}>
                  {automations.map((m) => (
                    <ModuleCard key={m._id} module={m} onInfo={() => setInfoModule(m)} lang={lang} isAr={isAr} />
                  ))}
                </div>
              </section>
            )}

            {modules.length === 0 && (
              <div className="px-6 py-20 text-center">
                <div className="mb-4 text-5xl">{meta.icon}</div>
                <h3 className="mb-2.5 text-xl font-bold text-foreground">
                  {tr("comingSoon", lang)}
                </h3>
                <p className="mx-auto mb-6 max-w-[400px] text-sm text-muted-foreground">
                  {isAr ? `نبني أدوات ذكاء اصطناعي لـ ${meta.label}. تحقق قريباً.` : `We're building AI tools for ${meta.label}. Check back soon.`}
                </p>
                <Button nativeButton={false} render={<Link href="/industries" />} style={{ background: meta.color }}>
                  {tr("browseOther", lang)}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="mb-4 flex items-center gap-1.75">
      {icon}
      <span className="text-xs font-bold tracking-[0.07em] uppercase" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function Chip({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-full border px-3 py-1.25 text-xs font-medium"
      style={{ background: `${color}10`, borderColor: `${color}25`, color }}
    >
      {icon} {label}
    </div>
  );
}

function ModuleCard({ module, onInfo, lang, isAr }: {
  module: Module;
  onInfo: () => void;
  lang: import("@/lib/translations").Lang;
  isAr: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [infoHovered, setInfoHovered] = useState(false);
  const href = module.moduleType === "automation"
    ? `/automations/${module.slug}`
    : `/agents/${module.slug}`;
  const name = (isAr && module.name_ar) ? module.name_ar : module.name;
  const tagline = (isAr && module.tagline_ar) ? module.tagline_ar : module.tagline;
  const desc = (isAr && module.description_ar) ? module.description_ar : module.description;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex flex-col rounded-[13px] border p-5 transition-all"
      style={{
        background: hovered ? `${module.color}06` : undefined,
        borderColor: hovered ? module.color + "30" : undefined,
        boxShadow: hovered ? `0 0 20px ${module.color}10` : undefined,
      }}
    >
      {/* Info button */}
      <button
        onClick={(e) => { e.stopPropagation(); onInfo(); }}
        title="More info"
        onMouseEnter={() => setInfoHovered(true)}
        onMouseLeave={() => setInfoHovered(false)}
        className="absolute top-3.5 right-3.5 flex size-6 items-center justify-center rounded-full border text-muted-foreground transition-all"
        style={infoHovered ? { background: `${module.color}15`, borderColor: `${module.color}30`, color: module.color } : undefined}
      >
        <Info size={12} />
      </button>

      <div className="mb-3 flex items-start gap-3 pr-7">
        <div
          className="flex size-10.5 shrink-0 items-center justify-center rounded-[10px] border text-[19px]"
          style={{ background: `${module.color}12`, borderColor: `${module.color}25` }}
        >
          {module.icon}
        </div>
        <div>
          <h3 className="mb-0.75 text-sm leading-tight font-bold text-foreground">
            {name}
          </h3>
          {module.moduleType === "automation" && (
            <span className="inline-flex items-center gap-0.75 rounded-full border border-primary/20 bg-primary/10 px-1.75 py-0.25 text-[10px] font-semibold text-[#a78bfa]">
              <Zap size={8} /> Automation
            </span>
          )}
        </div>
      </div>

      {tagline && (
        <p className="mb-1.5 text-[11px] font-medium" style={{ color: module.color }}>
          {tagline}
        </p>
      )}

      <p className="mb-3.5 flex-1 text-xs leading-relaxed text-muted-foreground">
        {desc?.length > 100 ? desc.slice(0, 100) + "…" : desc}
      </p>

      <div className="flex items-center justify-between border-t pt-3">
        <Link href={href} className="flex items-center gap-1 text-xs font-semibold no-underline" style={{ color: module.color }}>
          {tr("viewDetails", lang)} <ArrowRight size={11} />
        </Link>
        {module.pricing?.monthly ? (
          <span className="text-[11px] text-muted-foreground">from ${module.pricing.monthly}/mo</span>
        ) : null}
      </div>
    </div>
  );
}

function InfoModal({ module, onClose, isAr, lang }: {
  module: Module;
  onClose: () => void;
  isAr: boolean;
  lang: import("@/lib/translations").Lang;
}) {
  const name = (isAr && module.name_ar) ? module.name_ar : module.name;
  const tagline = (isAr && module.tagline_ar) ? module.tagline_ar : module.tagline;
  const desc = (isAr && module.description_ar) ? module.description_ar : module.description;
  const caps: string[] = (isAr && module.capabilities_ar?.length) ? module.capabilities_ar : module.capabilities;
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const href = module.moduleType === "automation"
    ? `/automations/${module.slug}`
    : `/agents/${module.slug}`;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-2000 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-[480px] rounded-2xl border bg-card p-7 shadow-[0_24px_64px_rgba(0,0,0,0.3)]">
        <button onClick={onClose} className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-[7px] bg-secondary text-muted-foreground">
          <X size={14} />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-[11px] border text-[22px]"
            style={{ background: `${module.color}12`, borderColor: `${module.color}25` }}
          >
            {module.icon}
          </div>
          <div>
            <h3 className="mb-0.75 text-[17px] font-bold text-foreground">{name}</h3>
            <span
              className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: module.badge === "Live" ? "rgba(34,197,94,0.1)" : `${module.color}12`,
                color: module.badge === "Live" ? "#22c55e" : module.color,
                borderColor: module.badge === "Live" ? "rgba(34,197,94,0.2)" : module.color + "25",
              }}
            >
              {module.badge || tr("active", lang)}
            </span>
          </div>
        </div>

        {tagline && (
          <p className="mb-2.5 text-[13px] font-medium" style={{ color: module.color }}>
            {tagline}
          </p>
        )}

        <p className="mb-4.5 text-[13px] leading-[1.7] text-muted-foreground">{desc}</p>

        {caps?.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[11px] font-semibold tracking-[0.07em] text-muted-foreground uppercase">
              {tr("capabilities", lang)}
            </p>
            <div className="flex flex-wrap gap-1.25">
              {caps.map((cap) => (
                <span
                  key={cap}
                  className="flex items-center gap-1 rounded-md border px-2.25 py-0.75 text-[11px]"
                  style={{ background: `${module.color}10`, color: module.color, borderColor: `${module.color}20` }}
                >
                  <CheckCircle2 size={9} /> {cap}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button nativeButton={false} render={<Link href={href} />} className="w-full gap-1.5" style={{ background: module.color }}>
          {tr("viewDetails", lang)} <ArrowRight size={13} />
        </Button>
      </div>
    </div>
  );
}
