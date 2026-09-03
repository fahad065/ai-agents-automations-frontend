"use client";

import { useEffect, useState, useCallback } from "react";
import { useLang } from "@/hooks/use-lang";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { Check, ArrowRight, Loader2, Zap, Bot, Package, Star, MessageCircle } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Module {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  moduleType: string;
  pipelineCategory?: string;
  nicheSlug?: string;
  icon: string;
  color: string;
  badge?: string;
  capabilities: string[];
  pricing: {
    monthly: number;
    annual: number;
    features: string[];
    hasCustomPlan?: boolean;
    customLabel?: string;
  };
  isComingSoon: boolean;
}

type FilterType = "all" | "industries" | "agents" | "automations" | "chatbots";

const FILTER_TABS_EN = [
  { id: "all" as FilterType,         label: "All",         icon: <Star size={13} /> },
  { id: "industries" as FilterType,  label: "Industries",  icon: <Package size={13} /> },
  { id: "agents" as FilterType,      label: "AI Agents",   icon: <Bot size={13} /> },
  { id: "automations" as FilterType, label: "Automations", icon: <Zap size={13} /> },
  { id: "chatbots" as FilterType,    label: "Chatbots",    icon: <MessageCircle size={13} /> },
];
const FILTER_TABS_AR = [
  { id: "all" as FilterType,         label: "الكل",        icon: <Star size={13} /> },
  { id: "industries" as FilterType,  label: "القطاعات",    icon: <Package size={13} /> },
  { id: "agents" as FilterType,      label: "الوكلاء",     icon: <Bot size={13} /> },
  { id: "automations" as FilterType, label: "الأتمتة",     icon: <Zap size={13} /> },
  { id: "chatbots" as FilterType,    label: "الشات بوت",   icon: <MessageCircle size={13} /> },
];

export function PricingPage() {
  const { isDark } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const { lang, isAr } = useLang();

  const fetchModules = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiClient.get<{ data: Module[] }>("/modules");
      setModules((data as any).data || (data as any));
    } catch {
      setError("Failed to load pricing. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [lang]); // re-fetch when lang changes

  useEffect(() => { fetchModules(); }, [fetchModules]);

  // Chatbots are priced exactly like agents/automations now (module.pricing,
  // admin-edited from /dashboard/cms-modules) — same withPricing/filtered
  // pipeline, no special-casing needed.
  const withPricing = modules.filter((m) => m.pricing?.monthly > 0);

  const filtered = withPricing.filter((m) => {
    if (filter === "industries") return m.pipelineCategory === "niche_pipeline";
    if (filter === "agents")     return m.moduleType === "agent" && m.pipelineCategory !== "niche_pipeline";
    if (filter === "automations") return m.moduleType === "automation";
    if (filter === "chatbots")   return m.moduleType === "chatbot";
    return true;
  });

  const annualSaving = 20;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden px-6 pb-25">
        {/* Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[140px]" />

        {/* Breadcrumb */}
        <div className="relative mb-8 pt-27.5">
          <BreadcrumbNav items={[{ label: "Pricing" }]} />
        </div>

        {/* Hero */}
        <div className="relative mb-14 text-center">
          <h1 className="mb-4 text-[clamp(36px,5.5vw,64px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
            {isAr ? "تسعير بسيط وشفاف." : "Simple, transparent pricing."}
            <br />
            <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
              {isAr ? "ادفع فقط مقابل ما تستخدمه." : "Pay only for what you use."}
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-[500px] text-[17px] leading-[1.7] text-muted-foreground">
            {isAr
              ? "اشترك في وكلاء فردية أو أتمتة كاملة أو حزم قطاعية متكاملة. كل خطة تشمل 30 يوم تجريب مجاني."
              : "Subscribe to individual agents, full automations, or complete industry bundles. Every plan includes a 30-day free trial."
            }
          </p>

          {/* Billing toggle */}
          <div className={cn("inline-flex items-center gap-1 rounded-[10px] border p-1", isDark ? "bg-white/5" : "bg-black/4")}>
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[7px] border-0 px-5 py-2 text-[13px] font-semibold transition-all",
                  billing === b
                    ? cn(isDark ? "bg-primary/30 text-[#c4b5fd]" : "bg-white text-primary", "shadow-[0_1px_6px_rgba(0,0,0,0.12)]")
                    : "text-muted-foreground"
                )}
              >
                {b === "monthly" ? (isAr ? "شهري" : "Monthly") : (isAr ? "سنوي" : "Annual")}
                {b === "annual" && (
                  <span className="rounded px-1.5 py-0.25 text-[10px] font-bold text-[#22c55e]" style={{ background: "rgba(34,197,94,0.15)" }}>
                    -{annualSaving}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mb-9 flex flex-wrap justify-center gap-1.5">
          {(isAr ? FILTER_TABS_AR : FILTER_TABS_EN).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4.5 py-2 text-[13px] font-medium transition-all",
                filter === tab.id ? "border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div className="p-20 text-center">
            <Loader2 size={30} className="mx-auto mb-3.5 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading pricing...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-15 text-center">
            <p className="mb-3.5 text-destructive">{error}</p>
            <Button onClick={fetchModules}>Try again</Button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Count */}
            <p className="mb-6 text-center text-xs text-muted-foreground opacity-60">
              {filtered.length} plan{filtered.length !== 1 ? "s" : ""} available
            </p>

            {/* Cards grid */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))" }}>
              {filtered.map((module) => {
                const price = billing === "annual"
                  ? Math.round(module.pricing.monthly * (1 - annualSaving / 100))
                  : module.pricing.monthly;
                const isBundle = module.pipelineCategory === "niche_pipeline";
                const isAuto = module.moduleType === "automation";
                const isBot = module.moduleType === "chatbot";
                const href = isBot ? `/chatbots/${module.slug}` : isAuto ? `/automations/${module.slug}` : `/agents/${module.slug}`;

                return (
                  <PricingCard
                    key={module._id}
                    module={module}
                    price={price}
                    billing={billing}
                    isBundle={isBundle}
                    isAuto={isAuto}
                    isBot={isBot}
                    href={href}
                    isDark={isDark}
                  />
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="p-15 text-center">
                <p className="text-muted-foreground">No plans available for this filter.</p>
              </div>
            )}
          </>
        )}

        {/* Bottom CTA — shown for every filter, not just modules */}
        {!loading && !error && (
          <div
            className={cn(
              "relative mt-20 overflow-hidden rounded-[20px] border border-primary/20 p-12 text-center",
              isDark ? "bg-primary/6" : "bg-primary/4"
            )}
          >
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[80px]" />
            <div className="relative">
              <h3 className="mb-3 text-[clamp(22px,3vw,34px)] font-extrabold tracking-[-0.03em] text-foreground">
                {isAr ? "تحتاج خطة مخصصة؟" : "Need a custom plan?"}
              </h3>
              <p className="mx-auto mb-7 max-w-[440px] text-[15px] leading-relaxed text-muted-foreground">
                {isAr
                  ? "تشغّل قطاعات متعددة أو تبني مسار مخصص؟ تحدث معنا وسنبني الحزمة المناسبة لفريقك."
                  : "Running multiple industries or building a custom pipeline? Talk to us and we'll build the right package for your team."
                }
              </p>
              <Button nativeButton={false} render={<Link href="/contact" />} className="gap-1.75 rounded-[10px] px-7 py-5.5 text-sm shadow-[0_4px_24px_rgba(124,58,237,0.35)]">
                {isAr ? "تحدث معنا" : "Talk to us"} <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PricingCard({ module, price, billing, isBundle, isAuto, isBot, href, isDark }: {
  module: Module;
  price: number;
  billing: "monthly" | "annual";
  isBundle: boolean;
  isAuto: boolean;
  isBot?: boolean;
  href: string;
  isDark: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const typeLabel = isBundle ? "Industry Bundle" : isBot ? "Chatbot" : isAuto ? "Automation" : "AI Agent";
  const typeColor = isBundle ? "#f59e0b" : isBot ? "#a78bfa" : isAuto ? "#a78bfa" : module.color;
  const TypeIcon = isBundle ? Package : isBot ? MessageCircle : isAuto ? Zap : Bot;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn("relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all", !isDark && !hovered && "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]")}
      style={{
        background: hovered ? `${module.color}06` : undefined,
        borderColor: hovered ? module.color + "35" : undefined,
        boxShadow: hovered ? `0 8px 40px ${module.color}12` : undefined,
      }}
    >
      {/* Bundle spotlight */}
      {isBundle && (
        <div
          className="pointer-events-none absolute -top-7.5 -right-7.5 size-[120px] rounded-full blur-[40px]"
          style={{ background: `${module.color}15` }}
        />
      )}

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex size-12 items-center justify-center rounded-xl border text-[22px]"
            style={{ background: `${module.color}12`, borderColor: `${module.color}25` }}
          >
            {module.icon}
          </div>
          <div>
            <h3 className="mb-1 text-[15px] leading-tight font-bold text-foreground">{module.name}</h3>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: `${typeColor}12`, color: typeColor, borderColor: `${typeColor}25` }}
            >
              <TypeIcon size={9} /> {typeLabel}
            </span>
          </div>
        </div>

        {module.badge === "Popular" || module.badge === "Hot" ? (
          <span className="rounded-full border border-[#eab308]/25 px-2.25 py-0.75 text-[10px] font-bold text-[#eab308]" style={{ background: "rgba(234,179,8,0.15)" }}>
            ⭐ {module.badge}
          </span>
        ) : null}
      </div>

      {/* Tagline */}
      {module.tagline && (
        <p className="mb-2 text-xs font-medium" style={{ color: module.color }}>
          {module.tagline}
        </p>
      )}

      {/* Price */}
      <div className="mb-5 flex items-end gap-1.5 border-b pb-5">
        <span className="text-[40px] leading-none font-extrabold tracking-[-0.04em] text-foreground">
          ${price}
        </span>
        <div className="pb-1">
          <p className="text-xs leading-tight text-muted-foreground">/ month</p>
          {billing === "annual" && (
            <p className="text-[10px] font-semibold text-[#22c55e]">billed annually</p>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="mb-6 flex-1 list-none p-0">
        {(module.pricing.features || module.capabilities || []).slice(0, 5).map((feat: string, i: number) => (
          <li key={i} className="mb-2.5 flex items-start gap-2.25">
            <div
              className="mt-0.25 flex size-4 shrink-0 items-center justify-center rounded-full border"
              style={{ background: `${module.color}15`, borderColor: `${module.color}30` }}
            >
              <Check size={9} color={module.color} strokeWidth={3} />
            </div>
            <span className="text-[13px] leading-normal text-muted-foreground">{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="flex gap-2">
        <Link
          href="/auth/signup"
          className="flex flex-1 items-center justify-center gap-1.25 rounded-[9px] p-2.75 text-center text-[13px] font-semibold text-white no-underline transition-opacity"
          style={{ background: module.color }}
        >
          Start free trial <ArrowRight size={12} />
        </Link>
        <Link
          href={href}
          className="flex items-center justify-center rounded-[9px] border px-3.5 py-2.75 text-xs font-medium whitespace-nowrap text-muted-foreground no-underline"
        >
          Details
        </Link>
      </div>

      {module.isComingSoon && (
        <div className={cn("absolute inset-0 flex items-center justify-center rounded-2xl backdrop-blur-[2px]", isDark ? "bg-black/70" : "bg-white/85")}>
          <span className={cn("rounded-full border px-4.5 py-2 text-[13px] font-semibold text-muted-foreground", isDark ? "bg-white/5" : "bg-white")}>
            Coming soon
          </span>
        </div>
      )}
    </div>
  );
}
