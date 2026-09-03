"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { useAuthStore } from "@/store/auth.store";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, Star, ChevronDown, ChevronUp,
  CheckCircle2, Play, Loader2, ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface AutomationTemplate {
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
  heroStats: { label: string; value: string }[];
  features: { title: string; description: string; icon: string }[];
  howItWorks: { step: string; title: string; description: string }[];
  testimonials: { name: string; role: string; avatar: string; text: string; rating: number }[];
  pricing: { monthly: number; annual: number; features: string[]; hasCustomPlan?: boolean; customLabel?: string };
  faq: { question: string; answer: string }[];
  integrations: { name: string; icon: string; description: string }[];
  demoVideoUrl?: string;
  isComingSoon?: boolean;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn("mb-2 overflow-hidden rounded-xl border transition-all", open ? "border-primary/25 bg-primary/[0.04]" : "bg-foreground/[0.015]")}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-5.5 py-4.5 text-left"
      >
        <span className="text-sm font-medium text-foreground">{question}</span>
        {open ? <ChevronUp size={16} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={16} className="shrink-0 text-muted-foreground" />}
      </button>
      {open && (
        <div className="border-t bg-foreground/[0.015] px-5 pb-4">
          <p className="pt-3 text-sm leading-[1.7] text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function AutomationDetailPage({ slug }: { slug: string }) {
  const { isAr } = useLang();
  const { isAuthenticated } = useAuthStore();
  const [automation, setAutomation] = useState<AutomationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAutomation = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        const res = await fetch(`${apiUrl}/modules/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setAutomation(data);
      } catch {
        setError("Automation not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchAutomation();
  }, [slug]);

  useEffect(() => {
    if (!automation) return;
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" });
      if (featuresRef.current?.children) {
        gsap.from(Array.from(featuresRef.current.children), {
          opacity: 0, y: 24, duration: 0.5, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: featuresRef.current, start: "top 85%" },
        });
      }
    });
    return () => ctx.revert();
  }, [automation]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !automation) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-lg text-foreground">Automation not found</p>
        <Link href="/automations" className="text-[#a78bfa] no-underline">
          Browse all automations
        </Link>
      </div>
    );
  }

  // Deep-link straight to this module's setup form on My Modules instead of
  // the plain grid/dashboard — mirrors agent-detail-page.tsx's fix, and
  // fixes a pre-existing inconsistency where this page's "Get started"
  // pointed authenticated users at bare /dashboard (no modules setup at
  // all) instead of /dashboard/modules.
  const openModulePath = `/dashboard/modules?openModule=${automation.slug}`;
  const getStartedHref = isAuthenticated
    ? openModulePath
    : `/auth/signup?redirect=${encodeURIComponent(openModulePath)}`;

  const embedUrl = automation.demoVideoUrl
    ? automation.demoVideoUrl
        .replace("youtu.be/", "www.youtube.com/embed/")
        .replace("watch?v=", "embed/")
    : "";

  const ctaLabel = automation.badge === "Live"
    ? (isAuthenticated ? (isAr ? "فتح لوحة التحكم" : "Open dashboard") : (isAr ? "ابدأ مجاناً" : "Get started free"))
    : (isAr ? "انضم للقائمة" : "Join waitlist");

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="border-b px-6 pt-25 pb-18">
        <div className="mx-auto max-w-[1100px]">
          <Link href="/automations" className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground no-underline">
            <ArrowLeft size={14} /> {isAr ? "كل الأتمتة" : "All automations"}
          </Link>

          <div className="grid items-center gap-12" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {/* Left */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex size-14 items-center justify-center rounded-2xl border text-[26px]"
                  style={{ background: `${automation.color}15`, borderColor: `${automation.color}30` }}
                >
                  {automation.icon}
                </div>
                <span
                  className="rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{
                    background: automation.badge === "Live" ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.08)",
                    color: automation.badge === "Live" ? "#22c55e" : undefined,
                    borderColor: automation.badge === "Live" ? "rgba(34,197,94,0.2)" : undefined,
                  }}
                >
                  {automation.badge}
                </span>
              </div>

              <h1 className="mb-3 text-[clamp(32px,5vw,52px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
                {(isAr && automation.name_ar) ? automation.name_ar : automation.name}
              </h1>

              {((isAr && automation.tagline_ar) ? automation.tagline_ar : automation.tagline) && (
                <p className="mb-4 text-lg font-medium" style={{ color: automation.color }}>
                  {(isAr && automation.tagline_ar) ? automation.tagline_ar : automation.tagline}
                </p>
              )}

              <p className="mb-8 text-base leading-[1.7] text-muted-foreground">
                {(isAr && automation.description_ar) ? automation.description_ar : automation.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button nativeButton={false} render={<Link href={getStartedHref} />} className="gap-2 rounded-[10px] px-7 py-5.5 text-[15px] shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
                  {ctaLabel}
                  <ArrowRight size={15} />
                </Button>

                {automation.demoVideoUrl && (
                  <a
                    href={automation.demoVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[10px] border bg-foreground/[0.015] px-7 py-3.25 text-[15px] font-medium text-muted-foreground no-underline"
                  >
                    <Play size={14} /> {isAr ? "شاهد العرض" : "Watch demo"}
                  </a>
                )}
              </div>
            </div>

            {/* Hero stats */}
            {automation.heroStats?.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {automation.heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border bg-foreground/[0.015] p-5 text-center">
                    <p className="mb-1.5 text-2xl leading-none font-extrabold" style={{ color: automation.color }}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      {automation.isComingSoon && (
        <section className="border-b px-6 py-8" style={{ background: `${automation.color}08`, borderColor: `${automation.color}20` }}>
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border text-xl"
                style={{ background: `${automation.color}15`, borderColor: `${automation.color}30` }}
              >
                🚀
              </div>
              <div>
                <p className="mb-0.5 text-[15px] font-semibold text-foreground">
                  This automation is coming soon
                </p>
                <p className="text-[13px] text-muted-foreground">
                  We're actively building this. Join the waitlist to get notified and receive 40% off at launch.
                </p>
              </div>
            </div>
            <Button
              nativeButton={false}
              render={<Link href="/auth/signup" />}
              className="gap-2 whitespace-nowrap"
              style={{ background: `linear-gradient(135deg, ${automation.color}, ${automation.color}cc)` }}
            >
              Join waitlist <ArrowRight size={14} />
            </Button>
          </div>
        </section>
      )}

      {/* Demo video */}
      {automation.demoVideoUrl && embedUrl && (
        <section className="border-b bg-foreground/[0.015] px-6 py-16">
          <div className="mx-auto max-w-[800px] text-center">
            <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold text-foreground">
              See it in action
            </h2>
            <p className="mb-8 text-base text-muted-foreground">
              A real example of this automation running end to end.
            </p>
            <div className="relative overflow-hidden rounded-2xl border pb-[56.25%] shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
              <iframe
                src={embedUrl}
                title={`${automation.name} demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
            </div>
            <a
              href={automation.demoVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground no-underline"
            >
              <ExternalLink size={13} /> Watch on YouTube
            </a>
          </div>
        </section>
      )}

      {/* Capabilities */}
      {automation.capabilities?.length > 0 && (
        <section className="border-b px-6 py-16">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-10 text-center">
              <h2 className="mb-2 text-[clamp(22px,3vw,36px)] font-bold text-foreground">
                {isAr ? `ما تفعله ${(isAr && automation.name_ar) ? automation.name_ar : automation.name}` : `What ${automation.name} does`}
              </h2>
              <p className="text-[15px] text-muted-foreground">
                {isAr ? "يتم التعامل مع كل شيء تلقائياً — لا يلزم أي عمل يدوي." : "Everything handled automatically — no manual work required."}
              </p>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {((isAr && automation.capabilities_ar?.length) ? automation.capabilities_ar : automation.capabilities).map((cap) => (
                <div key={cap} className="flex items-center gap-2.5 rounded-[10px] border bg-foreground/[0.015] px-4 py-3.5">
                  <div className="size-2 shrink-0 rounded-full" style={{ background: automation.color }} />
                  <span className="text-[13px] font-medium text-foreground">{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {automation.features?.length > 0 && (
        <section className="border-b px-6 py-20">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                {isAr ? "كل شيء مشمول" : "Everything included"}
              </h2>
              <p className="text-base text-muted-foreground">
                {isAr ? "لا حاجة لأدوات إضافية. الأتمتة تتولى كل شيء." : "No extra tools needed. The automation handles everything."}
              </p>
            </div>
            <div ref={featuresRef} className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {automation.features.map((feature) => (
                <div key={feature.title} className="rounded-xl border bg-foreground/[0.015] p-5.5">
                  <div className="mb-3 text-2xl">{feature.icon}</div>
                  <h3 className="mb-2 text-[15px] font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] leading-[1.7] text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      {automation.howItWorks?.length > 0 && (
        <section className="border-b bg-foreground/[0.015] px-6 py-20">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                {isAr ? "كيف يعمل" : "How it works"}
              </h2>
              <p className="text-base text-muted-foreground">
                {isAr ? "جاهز للعمل في أقل من 10 دقائق." : "Up and running in under 10 minutes."}
              </p>
            </div>
            <div className="flex flex-col">
              {automation.howItWorks.map((step, i) => (
                <div key={step.step} className={cn("relative flex gap-5", i < automation.howItWorks.length - 1 && "pb-8")}>
                  {i < automation.howItWorks.length - 1 && (
                    <div
                      className="absolute top-11 bottom-0 left-4.75 w-0.5"
                      style={{ background: `${automation.color}30` }}
                    />
                  )}
                  <div
                    className="z-1 flex size-10 shrink-0 items-center justify-center rounded-full border-2"
                    style={{ background: `${automation.color}15`, borderColor: `${automation.color}40` }}
                  >
                    <span className="font-mono text-xs font-bold" style={{ color: automation.color }}>
                      {step.step}
                    </span>
                  </div>
                  <div className="pt-1.5">
                    <h3 className="mb-1.5 text-base font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-[1.7] text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Integrations */}
      {automation.integrations?.length > 0 && (
        <section className="border-b px-6 py-20">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                Integrations
              </h2>
              <p className="text-base text-muted-foreground">
                Works with the tools you already use.
              </p>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
              {automation.integrations.map((integration) => (
                <div key={integration.name} className="rounded-xl border bg-foreground/[0.015] p-4 text-center">
                  <div className="mb-2 text-[28px]">{integration.icon}</div>
                  <p className="mb-1 text-[13px] font-semibold text-foreground">
                    {integration.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {automation.testimonials?.length > 0 && (
        <section className="border-b bg-foreground/[0.015] px-6 py-20">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                What users say
              </h2>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {automation.testimonials.map((t) => (
                <div key={t.name} className="rounded-xl border bg-background p-5.5">
                  <div className="mb-3.5 flex gap-0.75">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={13} className="fill-[#f59e0b] text-[#f59e0b]" />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-[1.7] text-muted-foreground">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex size-9 items-center justify-center rounded-full border text-xs font-bold"
                      style={{ background: `${automation.color}20`, borderColor: `${automation.color}30`, color: automation.color }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {automation.pricing && (
        <section className="border-b px-6 py-20">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
              {isAr ? "تسعير بسيط" : "Simple pricing"}
            </h2>
            <p className="mb-12 text-base text-muted-foreground">
              {isAr ? "خطة واحدة. كل شيء مشمول. إلغاء في أي وقت." : "One plan. Everything included. Cancel anytime."}
            </p>

            <div
              className={cn("mx-auto grid grid-cols-1 gap-4", automation.pricing?.hasCustomPlan ? "sm:grid-cols-3" : "sm:grid-cols-2")}
              style={{ maxWidth: automation.pricing?.hasCustomPlan ? "900px" : "640px" }}
            >
              {/* Monthly */}
              <div className="flex flex-col rounded-2xl border bg-background p-7 text-left">
                <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">{isAr ? "شهري" : "Monthly"}</p>
                <div className="mb-5">
                  <span className="text-4xl font-extrabold text-foreground">${automation.pricing.monthly}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mb-5 text-[13px] text-muted-foreground">{isAr ? "يُحسب شهرياً. إلغاء في أي وقت." : "Billed monthly. Cancel anytime."}</p>
                <ul className="mb-6 flex-1 list-none p-0">
                  {automation.pricing.features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 py-1.5 text-[13px] text-muted-foreground">
                      <CheckCircle2 size={13} className="shrink-0 text-[#22c55e]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button nativeButton={false} variant="outline" render={<Link href={getStartedHref} />} className="w-full">
                  {automation.badge === "Live" ? (isAuthenticated ? (isAr ? "فتح لوحة التحكم" : "Open dashboard") : (isAr ? "ابدأ" : "Get started")) : (isAr ? "انضم للقائمة" : "Join waitlist")}
                </Button>
              </div>

              {/* Annual — highlighted */}
              <div className="relative flex flex-col rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/8 to-[#6d28d9]/4 p-7 text-left shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-[#6d28d9] px-4 py-1 text-[11px] font-bold whitespace-nowrap text-white">
                  ⭐ {isAr ? "الأكثر شيوعاً" : "Most Popular"}
                </div>
                <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-[#a78bfa] uppercase">{isAr ? "سنوي" : "Annual"}</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-foreground">${automation.pricing.annual}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mb-5 text-xs font-semibold text-[#22c55e]">
                  Save ${(automation.pricing.monthly - automation.pricing.annual) * 12}/year — billed annually
                </p>
                <ul className="mb-6 flex-1 list-none p-0">
                  {automation.pricing.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 py-1.5 text-[13px] text-foreground">
                      <CheckCircle2 size={13} className="shrink-0 text-[#22c55e]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button nativeButton={false} render={<Link href={getStartedHref} />} className="w-full gap-1.5 shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
                  {automation.badge === "Live" ? (isAuthenticated ? (isAr ? "فتح لوحة التحكم" : "Open dashboard") : (isAr ? "ابدأ التجربة المجانية" : "Start free trial")) : (isAr ? "انضم للقائمة" : "Join waitlist")}
                  <ArrowRight size={14} />
                </Button>
                <p className="mt-2.5 text-center text-[11px] text-muted-foreground">{isAr ? "لا حاجة لبطاقة ائتمان" : "No credit card required"}</p>
              </div>

              {/* Enterprise */}
              {automation.pricing?.hasCustomPlan && (
                <div className="flex flex-col rounded-2xl border bg-background p-7 text-left">
                  <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">{isAr ? "مؤسسي" : "Enterprise"}</p>
                  <div className="mb-5">
                    <span className="text-4xl font-extrabold text-foreground">Custom</span>
                  </div>
                  <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                    {automation.pricing.customLabel || "Need a tailored solution for your team or business?"}
                  </p>
                  <ul className="mb-6 flex-1 list-none p-0">
                    {["Custom pipeline configuration", "Dedicated support", "SLA guarantee", "Custom integrations", "Team management"].map((f) => (
                      <li key={f} className="flex items-center gap-2 py-1.5 text-[13px] text-muted-foreground">
                        <CheckCircle2 size={13} className="shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="mailto:hello@logicmate.io" className="flex items-center justify-center gap-1.5 rounded-[10px] border border-primary/30 bg-primary/6 p-3 text-sm font-semibold text-[#a78bfa] no-underline">
                    Contact us →
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {automation.faq?.length > 0 && (
        <section className="border-b px-6 py-20">
          <div className="mx-auto max-w-[680px]">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                {isAr ? "الأسئلة الشائعة" : "Frequently asked questions"}
              </h2>
            </div>
            {automation.faq.map((item) => (
              <FaqItem key={item.question} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div
          className="mx-auto max-w-[600px] rounded-[20px] border p-14 text-center"
          style={{ background: `${automation.color}08`, borderColor: `${automation.color}20` }}
        >
          <div className="mb-4 text-4xl">{automation.icon}</div>
          <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold text-foreground">
            {isAr ? `هل أنت مستعد لنشر ${(isAr && automation.name_ar) ? automation.name_ar : automation.name}؟` : `Ready to deploy ${automation.name}?`}
          </h2>
          <p className="mb-7 text-base leading-[1.7] text-muted-foreground">
            {automation.badge === "Live"
              ? (isAr ? "ابدأ في دقائق. لا يلزم إعداد تقني." : "Get started in minutes. No technical setup required.")
              : (isAr ? "انضم للقائمة واحصل على خصم 40% عند الإطلاق." : "Join the waitlist and get 40% off when we launch.")
            }
          </p>
          <Button nativeButton={false} render={<Link href={getStartedHref} />} className="gap-2 rounded-[10px] px-8 py-6 text-[15px] shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
            {automation.badge === "Live"
              ? (isAuthenticated ? (isAr ? "فتح لوحة التحكم" : "Open dashboard") : (isAr ? "ابدأ مجاناً" : "Start free"))
              : (isAr ? "انضم للقائمة" : "Join waitlist")
            }
            <ArrowRight size={15} />
          </Button>
        </div>
      </section>
    </div>
  );
}
