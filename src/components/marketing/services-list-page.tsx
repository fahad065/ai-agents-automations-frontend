"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/hooks/use-lang";
import { industryName } from "@/lib/translations";
import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { SERVICE_TYPES, SERVICE_TYPE_BY_KEY, serviceDetailHref, type ServiceTypeKey } from "@/config/service-types";

type ServiceType = ServiceTypeKey;

interface Service {
  _id: string;
  type: ServiceType | "bundle";
  name: string;
  name_ar?: string;
  slug: string;
  tagline?: string;
  tagline_ar?: string;
  description?: string;
  description_ar?: string;
  nicheSlug?: string;
  icon: string;
  color: string;
  badge?: string;
  capabilities: string[];
  capabilities_ar?: string[];
  status: "active" | "inactive" | "coming_soon";
  pricing?: { monthly: number; annual: number };
  pricingTiers?: { key: string; monthly: number }[];
}

const TYPES: ServiceType[] = SERVICE_TYPES.map((t) => t.key);

// Singular badge text on each card ("AI Agent"), vs the plural section
// labels in SERVICE_TYPES ("AI Agents").
const SINGULAR: Record<ServiceType, { en: string; ar: string }> = {
  agent: { en: "AI Agent", ar: "وكيل ذكي" },
  automation: { en: "Automation", ar: "أتمتة" },
  chatbot: { en: "Chatbot", ar: "شات بوت" },
};

// Chatbots price per tier — the entry price is the lowest tier.
function entryPrice(s: Service): number | null {
  const tierPrices = (s.pricingTiers || []).map((t) => t.monthly).filter((p) => p > 0);
  if (tierPrices.length) return Math.min(...tierPrices);
  return s.pricing?.monthly ? s.pricing.monthly : null;
}

export function ServicesListPage() {
  const { isAr, lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type");
  const initialNiche = searchParams.get("niche") || "";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>(TYPES.includes(initialType as ServiceType) ? initialType! : "");
  // Industry filter — replaces the old /industries pages. The homepage's
  // industry links land here as /services?niche=<nicheSlug>.
  const [niche, setNiche] = useState<string>(initialNiche);
  const [hovered, setHovered] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/services?limit=100`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setServices((data.data || []).filter((s: Service) => TYPES.includes(s.type as ServiceType)));
    } catch {
      setError(isAr ? "تعذّر تحميل الخدمات. حاول مرة ثانية." : "Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Keep the filters in the URL so a filtered view can be linked/shared.
  const syncUrl = (nextType: string, nextNiche: string) => {
    const qs = new URLSearchParams();
    if (nextType) qs.set("type", nextType);
    if (nextNiche) qs.set("niche", nextNiche);
    router.replace(qs.size ? `/services?${qs}` : "/services", { scroll: false });
  };
  const changeType = (next: string) => { setType(next); syncUrl(next, niche); };
  const changeNiche = (next: string) => { setNiche(next); syncUrl(type, next); };

  // Only industries that actually have services, plus whichever one the URL
  // asked for (so a link to an industry with nothing yet still shows its name).
  const nicheSlugs = Array.from(new Set(
    [...services.map((s) => s.nicheSlug), niche].filter(Boolean) as string[],
  ));
  const nicheOptions: ComboboxOption[] = nicheSlugs
    .map((slug) => ({ value: slug, label: industryName(slug, lang) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const typeOptions: ComboboxOption[] = SERVICE_TYPES.map((t) => {
    const Icon = t.icon;
    return {
      value: t.key,
      label: isAr ? t.label_ar : t.label,
      icon: <Icon className="size-4" style={{ color: t.color }} />,
    };
  });
  const countByType = (key: ServiceType) => services.filter((s) => s.type === key).length;

  const q = search.trim().toLowerCase();
  const filtered = services.filter((s) => {
    const matchesType = !type || s.type === type;
    const matchesNiche = !niche || s.nicheSlug === niche;
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.name_ar || "").includes(search.trim()) ||
      (s.description || "").toLowerCase().includes(q) ||
      (s.tagline || "").toLowerCase().includes(q);
    return matchesType && matchesNiche && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1280px] px-6 pt-22.5">
        <BreadcrumbNav items={[{ label: isAr ? "الخدمات" : "Services" }]} />
      </div>

      <section className="relative mx-auto max-w-[760px] overflow-hidden px-6 pt-6 pb-12 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[100px]" />
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-4 py-1.5 text-[13px] font-medium text-primary">
          <Sparkles size={12} /> {isAr ? "كل خدمات LogicMate" : "Every LogicMate service"}
        </div>
        <h1 className="mb-4.5 text-[clamp(34px,5.5vw,60px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
          {isAr ? "وكلاء، أتمتة وشات بوت" : "Agents, automations"}
          <br />
          <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
            {isAr ? "في مكان واحد." : "and chatbots."}
          </span>
        </h1>
        <p className="mx-auto max-w-[520px] text-[17px] leading-[1.7] text-muted-foreground">
          {isAr
            ? "اختر الخدمة المناسبة لعملك، اشترك، وخلّها تشتغل عنك 24/7."
            : "Pick the service that fits your business, subscribe, and let it run for you 24/7."}
        </p>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 pb-24">
        {/* Browse by type — the three things LogicMate offers, each with its own landing page */}
        <div className="mb-12 grid gap-3 sm:grid-cols-3">
          {SERVICE_TYPES.map((t) => {
            const Icon = t.icon;
            const n = countByType(t.key);
            return (
              <Link
                key={t.key}
                href={t.href}
                className="group flex items-start gap-3.5 rounded-[14px] border bg-card p-5 no-underline transition-colors hover:bg-muted/40"
              >
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl border"
                  style={{ background: `${t.color}14`, borderColor: `${t.color}30`, color: t.color }}
                >
                  <Icon size={20} />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[15px] font-bold text-foreground">{isAr ? t.label_ar : t.label}</span>
                  <span className="text-[13px] leading-snug text-muted-foreground">{isAr ? t.description_ar : t.description}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium" style={{ color: t.color }}>
                    {loading ? (isAr ? "استكشف" : "Explore") : isAr ? `استكشف ${n}` : `Explore ${n}`}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <h2 className="mb-5 text-center text-xl font-bold text-foreground">
          {isAr ? "كل الخدمات" : "All services"}
        </h2>

        {/* Filters */}
        <div className="mx-auto mb-8 flex max-w-[880px] flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={isAr ? "ابحث عن خدمة..." : "Search services..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Combobox
            value={type}
            onChange={changeType}
            options={typeOptions}
            placeholder={isAr ? "كل الأنواع" : "All types"}
            searchPlaceholder={isAr ? "ابحث..." : "Search types..."}
            className="sm:w-[200px]"
          />
          <Combobox
            value={niche}
            onChange={changeNiche}
            options={nicheOptions}
            placeholder={isAr ? "كل القطاعات" : "All industries"}
            searchPlaceholder={isAr ? "ابحث عن قطاع..." : "Search industries..."}
            className="sm:w-[220px]"
          />
        </div>

        {loading && (
          <div className="p-20 text-center">
            <Loader2 size={32} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">{isAr ? "جاري التحميل..." : "Loading services..."}</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-15 text-center">
            <p className="mb-4 text-sm text-destructive">{error}</p>
            <Button onClick={fetchServices}>{isAr ? "حاول مرة ثانية" : "Try again"}</Button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="mb-5 text-center text-[13px] text-muted-foreground">
              {isAr
                ? `${filtered.length} خدمة`
                : `${filtered.length} service${filtered.length !== 1 ? "s" : ""}`}
            </p>

            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {filtered.map((s) => {
                const isHovered = hovered === s._id;
                const meta = SERVICE_TYPE_BY_KEY[s.type as ServiceType];
                const TypeIcon = meta.icon;
                const comingSoon = s.status === "coming_soon";
                const price = entryPrice(s);
                const name = isAr && s.name_ar ? s.name_ar : s.name;
                const tagline = isAr && s.tagline_ar ? s.tagline_ar : s.tagline;
                const description = isAr && s.description_ar ? s.description_ar : s.description;
                const caps = isAr && s.capabilities_ar?.length ? s.capabilities_ar : s.capabilities || [];
                return (
                  <Link
                    key={s._id}
                    href={serviceDetailHref(s.type, s.slug)}
                    className="no-underline"
                    onMouseEnter={() => setHovered(s._id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div
                      className="flex h-full cursor-pointer flex-col rounded-[14px] border p-5.5 transition-all"
                      style={{
                        background: isHovered ? `${s.color}06` : undefined,
                        borderColor: isHovered ? s.color + "30" : undefined,
                        boxShadow: isHovered ? `0 0 30px ${s.color}10` : undefined,
                      }}
                    >
                      <div className="mb-4 flex items-start justify-between gap-2">
                        <div
                          className="flex size-12 items-center justify-center rounded-xl border text-[22px]"
                          style={{ background: `${s.color}15`, borderColor: `${s.color}30` }}
                        >
                          {s.icon}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.75 text-[11px] font-semibold"
                            style={{ color: meta.color, background: `${meta.color}12`, borderColor: `${meta.color}30` }}
                          >
                            <TypeIcon size={11} /> {isAr ? SINGULAR[meta.key].ar : SINGULAR[meta.key].en}
                          </span>
                          {comingSoon && (
                            <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-0.75 text-[11px] font-semibold text-amber-600">
                              {isAr ? "قريباً" : "Coming soon"}
                            </span>
                          )}
                        </div>
                      </div>

                      <h2 className="mb-1.5 text-[17px] font-bold text-foreground">{name}</h2>
                      {tagline && (
                        <p className="mb-2.5 text-[13px] font-medium" style={{ color: s.color }}>{tagline}</p>
                      )}
                      {description && (
                        <p className="mb-4 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
                      )}

                      <div className="mb-4.5 flex flex-wrap gap-1.5">
                        {caps.slice(0, 3).map((cap) => (
                          <span key={cap} className="rounded-full border bg-secondary px-2 py-0.75 text-[11px] text-muted-foreground">
                            {cap}
                          </span>
                        ))}
                        {caps.length > 3 && (
                          <span className="rounded-full border bg-secondary px-2 py-0.75 text-[11px] text-muted-foreground">
                            +{caps.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        {price ? (
                          <div>
                            {s.pricingTiers?.length ? (
                              <span className="mr-1 text-xs text-muted-foreground">{isAr ? "من" : "From"}</span>
                            ) : null}
                            <span className="text-xl font-bold text-foreground">${price}</span>
                            <span className="text-xs text-muted-foreground">/mo</span>
                          </div>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">{isAr ? "السعر قريباً" : "Pricing TBA"}</span>
                        )}
                        <div className="flex items-center gap-1 text-[13px] font-medium" style={{ color: s.color }}>
                          {isAr ? "عرض التفاصيل" : "View details"} <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="p-15 text-center">
                <p className="text-[15px] text-muted-foreground">
                  {niche && !search && !type
                    ? isAr
                      ? `ما عندنا خدمات جاهزة لقطاع ${industryName(niche, lang)} بعد.`
                      : `No ready-made services for ${industryName(niche, lang)} yet.`
                    : isAr ? "ما لقينا خدمات تطابق بحثك." : "No services match your filters."}
                </p>
                {niche && !search && !type && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isAr ? "نقدر نبني لك حل مخصص — " : "We can build one for you — "}
                    <Link href="/contact" className="font-medium text-primary">{isAr ? "تواصل معنا" : "get in touch"}</Link>
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
