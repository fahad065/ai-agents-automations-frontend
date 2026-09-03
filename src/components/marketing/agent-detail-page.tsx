"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { useAuthStore } from "@/store/auth.store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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

interface AgentTemplate {
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
  demoVideoUrl?: string;
  isComingSoon?: boolean;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2 overflow-hidden rounded-[10px] border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 border-0 bg-card px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-foreground">{question}</span>
        {open
          ? <ChevronUp size={16} className="shrink-0 text-muted-foreground" />
          : <ChevronDown size={16} className="shrink-0 text-muted-foreground" />
        }
      </button>
      {open && (
        <div className="border-t bg-card px-5 pb-4">
          <p className="pt-3 text-sm leading-[1.7] text-muted-foreground">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function AgentDetailPage({ slug }: { slug: string }) {
  const { isAr } = useLang();
  const { isAuthenticated } = useAuthStore();
  const [agent, setAgent] = useState<AgentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        const res = await fetch(`${apiUrl}/modules/${slug}`);
        if (!res.ok) throw new Error("Agent not found");
        const data = await res.json();
        setAgent(data);
      } catch {
        setError("Agent not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [slug]);

  useEffect(() => {
    if (!agent) return;
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: "power3.out",
      });
      if (featuresRef.current?.children) {
        gsap.from(Array.from(featuresRef.current.children), {
          opacity: 0, y: 24, duration: 0.5, stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: featuresRef.current, start: "top 85%" },
        });
      }
    });
    return () => ctx.revert();
  }, [agent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <p className="text-lg text-foreground">Agent not found</p>
          <Link href="/agents" className="text-sm text-[#a78bfa] no-underline">
            Browse all agents
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Deep-link straight to this module's setup form on My Modules instead of
  // the plain grid — for a logged-in visitor that's an immediate jump, and
  // for a logged-out one the redirect param carries it through signup (see
  // signup-form.tsx / verify-email / login-form.tsx) so they land on the
  // same setup form right after verifying instead of losing their intent.
  const openModulePath = `/dashboard/modules?openModule=${agent.slug}`;
  const getStartedHref = isAuthenticated
    ? openModulePath
    : `/auth/signup?redirect=${encodeURIComponent(openModulePath)}`;

  const embedUrl = agent.demoVideoUrl
    ? agent.demoVideoUrl
        .replace("youtu.be/", "www.youtube.com/embed/")
        .replace("watch?v=", "embed/")
    : "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden border-b px-6 pt-25 pb-18">
        {/* Glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full blur-[80px]"
          style={{ background: `${agent.color}07` }}
        />
        <div className="relative mx-auto max-w-[1100px]">
          <Link href="/agents" className="mb-10 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground no-underline opacity-70">
            <ArrowLeft size={13} /> {isAr ? "كل الوكلاء" : "All agents"}
          </Link>

          <div className="grid items-center gap-14" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {/* Left */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex size-14 items-center justify-center rounded-2xl border text-[26px]"
                  style={{ background: `${agent.color}12`, borderColor: `${agent.color}25` }}
                >
                  {agent.icon}
                </div>
                <span
                  className="rounded-full border px-3 py-1 text-[11px] font-bold"
                  style={{
                    background: agent.badge === "Live" ? "rgba(34,197,94,0.1)" : `${agent.color}12`,
                    color: agent.badge === "Live" ? "#22c55e" : agent.color,
                    borderColor: agent.badge === "Live" ? "rgba(34,197,94,0.2)" : agent.color + "25",
                  }}
                >
                  {agent.badge}
                </span>
              </div>

              <h1 className="mb-3.5 text-[clamp(32px,5vw,56px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
                {(isAr && agent.name_ar) ? agent.name_ar : agent.name}
              </h1>

              {((isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline) && (
                <p className="mb-4.5 text-lg leading-snug font-medium" style={{ color: agent.color }}>
                  {(isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline}
                </p>
              )}

              <p className="mb-9 text-base leading-[1.75] text-muted-foreground">
                {(isAr && agent.description_ar) ? agent.description_ar : agent.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  nativeButton={false}
                  render={<Link href={getStartedHref} />}
                  className="gap-2 rounded-[10px] px-7.5 py-6 text-[15px] shadow-[0_4px_24px_rgba(124,58,237,0.4),0_0_0_1px_rgba(124,58,237,0.3)]"
                >
                  {isAuthenticated ? (isAr ? "إضافة للوحة التحكم" : "Add to dashboard") : (isAr ? "ابدأ مجاناً" : "Get started free")}
                  <ArrowRight size={15} />
                </Button>

                {agent.demoVideoUrl && (
                  <a
                    href={agent.demoVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-[10px] border bg-foreground/[0.02] px-6 py-3.5 text-[15px] font-medium text-muted-foreground no-underline"
                  >
                    <Play size={14} /> {isAr ? "شاهد العرض" : "Watch demo"}
                  </a>
                )}
              </div>
            </div>

            {/* Right — hero stats */}
            {agent.heroStats?.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                {agent.heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border bg-foreground/[0.03] p-5.5 text-center">
                    <p className="mb-1.5 text-[30px] leading-none font-extrabold tracking-[-0.02em]" style={{ color: agent.color }}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {agent.slug === "youtube-agent" && !agent.isComingSoon && (
        <section className="border-b bg-card px-6 py-12">
          <div className="mx-auto max-w-[900px]">
            <div className="mb-8 text-center">
              <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#ef4444]/20 bg-[#ef4444]/[0.08] px-3.5 py-1 text-xs font-semibold text-[#ef4444]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444">
                  <path d="M23.5 6.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C17.1 2.7 12 2.7 12 2.7s-5.1 0-8.3.2c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.2 8 .2 9.8v1.7c0 1.8.3 3.6.3 3.6s.2 1.6.9 2.3c.9.9 2 .9 2.6 1 1.9.2 8 .2 8 .2s5.1 0 8.3-.2c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.3-1.8.3-3.6V9.8c0-1.8-.3-3.6-.3-3.6zM9.7 15.5V8.1l6.6 3.7-6.6 3.7z"/>
                </svg>
                Live proof — real channel
              </span>
              <h2 className="mb-3 text-[clamp(22px,3vw,36px)] font-bold text-foreground">
                See it running on a real channel
              </h2>
              <p className="mx-auto max-w-[560px] text-base text-muted-foreground">
                Knowledge Truth is a YouTube channel running entirely on LogicMate.
                Every video is AI-generated — no filming, no editing, no manual work.
              </p>
            </div>

            {/* Stats row */}
            <div className="mb-7 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              {[
                { label: "Cost per video", value: "~$3-5", color: "#22c55e" },
                { label: "Videos generated", value: "20+", color: "#7c3aed" },
                { label: "Shorts per video", value: "3", color: "#3b82f6" },
                { label: "Manual work", value: "Zero", color: "#f59e0b" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border bg-background p-4.5 text-center">
                  <p className="mb-1 text-[28px] font-extrabold" style={{ color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Channel link */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://www.youtube.com/@knowledgetruth9287"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-[10px] bg-[#ef4444] px-7 py-3.5 text-[15px] font-semibold text-white no-underline shadow-[0_4px_20px_rgba(239,68,68,0.3)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M23.5 6.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C17.1 2.7 12 2.7 12 2.7s-5.1 0-8.3.2c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.2 8 .2 9.8v1.7c0 1.8.3 3.6.3 3.6s.2 1.6.9 2.3c.9.9 2 .9 2.6 1 1.9.2 8 .2 8 .2s5.1 0 8.3-.2c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.3-1.8.3-3.6V9.8c0-1.8-.3-3.6-.3-3.6zM9.7 15.5V8.1l6.6 3.7-6.6 3.7z"/>
                </svg>
                Visit Knowledge Truth →
              </a>
              <p className="text-[13px] text-muted-foreground">
                Every video on this channel was generated by LogicMate
              </p>
            </div>
          </div>
        </section>
      )}

      {agent.isComingSoon && (
        <section className="border-b px-6 py-8" style={{ background: `${agent.color}08`, borderColor: `${agent.color}20` }}>
          <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-xl border text-xl"
                style={{ background: `${agent.color}15`, borderColor: `${agent.color}30` }}
              >
                🚀
              </div>
              <div>
                <p className="mb-0.5 text-[15px] font-semibold text-foreground">
                  This agent is coming soon
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
              style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)` }}
            >
              Join waitlist <ArrowRight size={14} />
            </Button>
          </div>
        </section>
      )}

      {/* Demo video */}
      {agent.demoVideoUrl && embedUrl && (
        <section className="border-b bg-card px-6 py-16">
          <div className="mx-auto max-w-[800px] text-center">
            <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold text-foreground">
              See it in action
            </h2>
            <p className="mb-8 text-base text-muted-foreground">
              A real video generated by this agent — from trend discovery to YouTube upload.
            </p>

            <div className="relative overflow-hidden rounded-2xl border pb-[56.25%] shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
              <iframe
                src={embedUrl}
                title={`${agent.name} demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full border-0"
              />
            </div>

            <a
              href={agent.demoVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground no-underline"
            >
              <ExternalLink size={13} /> Watch on YouTube
            </a>
          </div>
        </section>
      )}

      {agent.capabilities?.length > 0 && (
        <section className="border-b px-6 py-16">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-10 text-center">
              <h2 className="mb-2 text-[clamp(22px,3vw,36px)] font-bold text-foreground">
                {isAr ? `ما يفعله ${(isAr && agent.name_ar) ? agent.name_ar : agent.name}` : `What ${agent.name} does`}
              </h2>
              <p className="text-[15px] text-muted-foreground">
                {isAr ? "يتم التعامل مع كل شيء تلقائياً — لا يلزم أي عمل يدوي." : "Everything handled automatically — no manual work required."}
              </p>
            </div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {((isAr && agent.capabilities_ar?.length) ? agent.capabilities_ar : agent.capabilities).map((cap) => (
                <div key={cap} className="flex items-center gap-2.5 rounded-[10px] border bg-foreground/[0.015] px-4 py-3.5">
                  <div className="size-2 shrink-0 rounded-full" style={{ background: agent.color }} />
                  <span className="text-[13px] font-medium text-foreground">
                    {cap}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {agent.features?.length > 0 && (
        <section className="border-b px-6 py-20">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                {isAr ? "كل شيء مشمول" : "Everything included"}
              </h2>
              <p className="text-base text-muted-foreground">
                {isAr ? "لا حاجة لأدوات إضافية. كل شيء يعمل داخل الوكيل." : "No extra tools needed. Everything runs inside the agent."}
              </p>
            </div>

            <div ref={featuresRef} className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {agent.features.map((feature) => (
                <div key={feature.title} className="rounded-xl border bg-foreground/[0.015] p-5.5">
                  <div className="mb-3 text-2xl">
                    {feature.icon}
                  </div>
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
      {agent.howItWorks?.length > 0 && (
        <section className="border-b bg-card px-6 py-20">
          <div className="mx-auto max-w-[800px]">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                {isAr ? "كيف يعمل" : "How it works"}
              </h2>
              <p className="text-base text-muted-foreground">
                {isAr ? "من الإعداد إلى الأتمتة الكاملة في أقل من 10 دقائق." : "From setup to fully automated in under 10 minutes."}
              </p>
            </div>

            <div className="flex flex-col">
              {agent.howItWorks.map((step, i) => (
                <div key={step.step} className={cn("relative flex gap-5", i < agent.howItWorks.length - 1 && "pb-8")}>
                  {i < agent.howItWorks.length - 1 && (
                    <div
                      className="absolute top-11 bottom-0 left-4.75 w-0.5"
                      style={{ background: `${agent.color}30` }}
                    />
                  )}
                  <div
                    className="z-1 flex size-10 shrink-0 items-center justify-center rounded-full border-2"
                    style={{ background: `${agent.color}15`, borderColor: `${agent.color}40` }}
                  >
                    <span className="font-mono text-xs font-bold" style={{ color: agent.color }}>
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

      {/* Testimonials */}
      {agent.testimonials?.length > 0 && (
        <section className="border-b px-6 py-20">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                {isAr ? "ماذا يقول المستخدمون" : "What creators say"}
              </h2>
            </div>
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {agent.testimonials.map((t) => (
                <div key={t.name} className="rounded-xl border bg-foreground/[0.015] p-5.5">
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
                      style={{ background: `${agent.color}20`, borderColor: `${agent.color}30`, color: agent.color }}
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {agent.pricing && (
        <section className="border-b bg-card px-6 py-20">
          <div className="mx-auto max-w-[900px] text-center">
            <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
              {isAr ? "تسعير بسيط" : "Simple pricing"}
            </h2>
            <p className="mb-12 text-base text-muted-foreground">
              {isAr ? "خطة واحدة. كل شيء مشمول. إلغاء في أي وقت." : "One plan. Everything included. Cancel anytime."}
            </p>

            <div
              className={cn("mx-auto grid grid-cols-1 gap-4", agent.pricing?.hasCustomPlan ? "sm:grid-cols-3" : "sm:grid-cols-2")}
              style={{ maxWidth: agent.pricing?.hasCustomPlan ? "900px" : "640px" }}
            >
              {/* Monthly */}
              <div className="flex flex-col rounded-2xl border bg-background p-7 text-left">
                <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">{isAr ? "شهري" : "Monthly"}</p>
                <div className="mb-5">
                  <span className="text-4xl font-extrabold text-foreground">${agent.pricing.monthly}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mb-5 text-[13px] text-muted-foreground">{isAr ? "يُحسب شهرياً. إلغاء في أي وقت." : "Billed monthly. Cancel anytime."}</p>
                <ul className="mb-6 flex-1 list-none p-0">
                  {agent.pricing.features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 py-1.5 text-[13px] text-muted-foreground">
                      <CheckCircle2 size={13} className="shrink-0 text-[#22c55e]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button nativeButton={false} variant="outline" render={<Link href={getStartedHref} />} className="w-full">
                  {agent.badge === "Live" ? (isAuthenticated ? (isAr ? "إضافة للوحة التحكم" : "Add to dashboard") : (isAr ? "ابدأ" : "Get started")) : (isAr ? "انضم للقائمة" : "Join waitlist")}
                </Button>
              </div>

              {/* Annual */}
              <div className="relative flex flex-col rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/8 to-[#6d28d9]/4 p-7 text-left shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-[#6d28d9] px-4 py-1 text-[11px] font-bold whitespace-nowrap text-white">
                  ⭐ {isAr ? "الأكثر شيوعاً" : "Most Popular"}
                </div>
                <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-[#a78bfa] uppercase">{isAr ? "سنوي" : "Annual"}</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-foreground">${agent.pricing.annual}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mb-5 text-xs font-semibold text-[#22c55e]">
                  Save ${(agent.pricing.monthly - agent.pricing.annual) * 12}/year — billed annually
                </p>
                <ul className="mb-6 flex-1 list-none p-0">
                  {agent.pricing.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 py-1.5 text-[13px] text-foreground">
                      <CheckCircle2 size={13} className="shrink-0 text-[#22c55e]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button nativeButton={false} render={<Link href={getStartedHref} />} className="w-full gap-1.5 shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
                  {agent.badge === "Live" ? (isAuthenticated ? (isAr ? "إضافة للوحة التحكم" : "Add to dashboard") : (isAr ? "ابدأ التجربة المجانية" : "Start free trial")) : (isAr ? "انضم للقائمة" : "Join waitlist")}
                  <ArrowRight size={14} />
                </Button>
                <p className="mt-2.5 text-center text-[11px] text-muted-foreground">{isAr ? "لا حاجة لبطاقة ائتمان" : "No credit card required"}</p>
              </div>

              {/* Enterprise */}
              {agent.pricing?.hasCustomPlan && (
                <div className="flex flex-col rounded-2xl border bg-background p-7 text-left">
                  <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">{isAr ? "مؤسسي" : "Enterprise"}</p>
                  <div className="mb-5">
                    <span className="text-4xl font-extrabold text-foreground">Custom</span>
                  </div>
                  <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                    {agent.pricing.customLabel || "Need a tailored solution for your team or business?"}
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
      {agent.faq?.length > 0 && (
        <section className="border-b px-6 py-20">
          <div className="mx-auto max-w-[680px]">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                {isAr ? "الأسئلة الشائعة" : "Frequently asked questions"}
              </h2>
            </div>
            {agent.faq.map((item) => (
              <FaqItem key={item.question} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="px-6 py-20">
        <div
          className="mx-auto max-w-[600px] rounded-[20px] border p-14 text-center"
          style={{ background: `${agent.color}08`, borderColor: `${agent.color}20` }}
        >
          <div className="mb-4 text-4xl">{agent.icon}</div>
          <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold text-foreground">
            {isAr ? `هل أنت مستعد لنشر ${(isAr && agent.name_ar) ? agent.name_ar : agent.name}؟` : `Ready To Deploy ${agent.name}?`}
          </h2>
          <p className="mb-7 text-base leading-[1.7] text-muted-foreground">
            {agent.badge === "Live"
              ? (isAr ? "ابدأ في دقائق. لا يلزم إعداد تقني." : "Get started in minutes. No technical setup required.")
              : (isAr ? "انضم للقائمة واحصل على خصم 40% عند الإطلاق." : "Join the waitlist and get 40% off when we launch.")
            }
          </p>
          <Button nativeButton={false} render={<Link href={getStartedHref} />} className="gap-2 rounded-[10px] px-8 py-6 text-[15px] shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
            {agent.badge === "Live"
              ? (isAuthenticated ? (isAr ? "إضافة للوحة التحكم" : "Add to my dashboard") : (isAr ? "ابدأ مجاناً" : "Start free"))
              : (isAr ? "انضم للقائمة" : "Join waitlist")
            }
            <ArrowRight size={15} />
          </Button>
        </div>
      </section>
    </div>
  );
}
