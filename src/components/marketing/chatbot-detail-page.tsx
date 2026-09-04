"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLang } from "@/hooks/use-lang";
import { useAuthStore } from "@/store/auth.store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, Star, ChevronDown, ChevronUp,
  CheckCircle2, Play, Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

// Maps a chatbot template module's slug to the Chatbot.template enum the
// backend expects on creation (see chatbot.schema.ts).
const TEMPLATE_ENUM: Record<string, string> = {
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

interface ChatbotModule {
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
  faq: { question: string; answer: string }[];
  demoVideoUrl?: string;
  isComingSoon?: boolean;
  // Legacy single-plan shape — only its hasCustomPlan/customLabel are still
  // used now (for the Custom/Enterprise card), see pricingTiers below.
  pricing?: { monthly: number; annual: number; features: string[]; hasCustomPlan?: boolean; customLabel?: string };
  // Basic/Pro tiered pricing — see backend CLAUDE.md's "Tiered chatbot
  // pricing" section. Admin-edited per template in SEED_MODULES (not yet
  // in the /dashboard/cms-modules form UI, same gap hasCustomPlan has).
  pricingTiers?: { key: "basic" | "pro"; monthly: number; annual: number; features: string[] }[];
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

export function ChatbotDetailPage({ slug }: { slug: string }) {
  const { isAr } = useLang();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agent, setAgent] = useState<ChatbotModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [videoError, setVideoError] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const autoStartFired = useRef(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        const res = await fetch(`${apiUrl}/modules/${slug}`);
        if (!res.ok) throw new Error("Chatbot template not found");
        const data = await res.json();
        setAgent(data);
        setVideoError(false);
      } catch {
        setError("Chatbot template not found or failed to load.");
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

  // Picking a pricing card creates the chatbot pre-filled with this
  // template and the chosen tier (auto-30-day-trial, billed at that tier's
  // monthly rate — see ChatbotsService.create() on the backend) and takes
  // the owner straight into the config portal to set it up.
  const handleGetStarted = async (tier: "basic" | "pro" = "basic") => {
    if (!agent) return;
    if (!isAuthenticated) {
      const redirectTo = `/chatbots/${agent.slug}?autostart=1&tier=${tier}`;
      router.push(`/auth/signup?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/chatbots", {
        name: agent.name,
        description: agent.description,
        template: TEMPLATE_ENUM[agent.slug] || "custom",
        language: "both",
        moduleSlug: agent.slug,
        tier,
      });
      const created = res.data?.data || res.data;
      toast.success("Chatbot created — 30-day free trial started!");
      router.push(`/dashboard/chatbots/${created._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create chatbot");
    } finally {
      setCreating(false);
    }
  };

  // Captured once, on mount, via the lazy useState initializer — NOT
  // re-read from searchParams on every render. That distinction is the fix
  // for a real bug: the effect below calls router.replace() to strip
  // ?autostart=1 from the URL (so a refresh doesn't re-trigger creation),
  // but that happens *before* handleGetStarted()'s POST + redirect finish —
  // it's a real network round trip, not instant. Re-reading
  // searchParams.get("autostart") live (the previous approach) meant the
  // "hide the marketing page" guard flipped off the moment the URL was
  // replaced, exposing the full marketing page for that in-flight window —
  // exactly the flash a user reported seeing. Snapshotting it once means
  // the guard stays on for the whole autostart lifecycle regardless of
  // what happens to the URL in the meantime.
  const [wasAutostartRequested] = useState(() => searchParams.get("autostart") === "1");

  // A visitor who isn't logged in loses their place at the signup redirect
  // unless we carry it through — ?redirect=/chatbots/slug?autostart=1 flows
  // through signup and back here authenticated, where this effect fires the
  // same creation call automatically instead of making them find this page
  // and click again.
  useEffect(() => {
    if (autoStartFired.current) return;
    if (searchParams.get("autostart") !== "1") return;
    if (!agent || !isAuthenticated) return;
    autoStartFired.current = true;
    const requestedTier = searchParams.get("tier") === "pro" ? "pro" : "basic";
    router.replace(`/chatbots/${slug}`, { scroll: false });
    handleGetStarted(requestedTier);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, isAuthenticated, searchParams]);

  // Without this, a visitor landing here with ?autostart=1 would see the
  // full marketing page (hero, pricing cards, everything) flash on screen
  // for the whole autostart window — jarring when the whole point of
  // autostart is to skip straight to setup. Shown instead of the real page
  // for that entire window; a timeout is the escape hatch for the
  // (shouldn't-happen) case where autostart never actually fires, e.g. a
  // stale/malformed link or the visitor somehow isn't authenticated here.
  const [autostartTimedOut, setAutostartTimedOut] = useState(false);
  useEffect(() => {
    if (!wasAutostartRequested) return;
    const t = setTimeout(() => setAutostartTimedOut(true), 6000);
    return () => clearTimeout(t);
  }, [wasAutostartRequested]);
  const isAutostarting = wasAutostartRequested && !autostartTimedOut;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">Loading chatbot...</p>
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
          <p className="text-lg text-foreground">Chatbot template not found</p>
          <Link href="/chatbots" className="text-sm text-[#a78bfa] no-underline">
            Browse all chatbots
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (isAutostarting) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-muted-foreground">Setting up your chatbot...</p>
        </div>
        <Footer />
      </div>
    );
  }

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
          <Link href="/chatbots" className="mb-10 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground no-underline opacity-70">
            <ArrowLeft size={13} /> {isAr ? "كل الشات بوتات" : "All chatbots"}
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
                <Button nativeButton={false} render={<a href="#pricing" />} className="gap-2 rounded-[10px] px-7.5 py-6 text-[15px] shadow-[0_4px_24px_rgba(124,58,237,0.4),0_0_0_1px_rgba(124,58,237,0.3)]">
                  {isAr ? "شوف الأسعار" : "See pricing"}
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
                  This chatbot template is coming soon
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

      {/* Demo video — a real recording of this bot answering real questions
          through the live /chat/:embedKey endpoint, not a mockup (see the
          frontend CLAUDE.md marketing-assets section for how these were made). */}
      {agent.demoVideoUrl && (
        <section id="demo" className="border-b bg-card px-6 py-16">
          <div className="mx-auto max-w-[700px] text-center">
            <h2 className="mb-3 text-[clamp(24px,3vw,36px)] font-bold text-foreground">
              {isAr ? "شوف كيف يعمل" : "See it in action"}
            </h2>
            <p className="mb-8 text-base text-muted-foreground">
              {isAr ? "تسجيل حقيقي للبوت يرد على أسئلة حقيقية." : "A real recording of this bot answering real questions."}
            </p>

            <div className="overflow-hidden rounded-2xl border shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
              {videoError ? (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-black text-[13px] text-[#a3a3a3]">
                  <Play size={24} className="text-[#525252]" />
                  {isAr ? "تعذر تحميل الفيديو حالياً." : "This video couldn't be loaded right now."}
                  <a href={agent.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#a78bfa]">
                    {isAr ? "افتح الفيديو مباشرة" : "Open video directly"} →
                  </a>
                </div>
              ) : (
                <video
                  key={agent.demoVideoUrl}
                  src={agent.demoVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onError={() => setVideoError(true)}
                  className="block aspect-video w-full bg-black"
                />
              )}
            </div>
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

      {/* Pricing — Basic/Pro tiers (module.pricingTiers), Custom reuses
          module.pricing.hasCustomPlan/customLabel. See backend CLAUDE.md's
          "Tiered chatbot pricing" section. */}
      {agent.pricingTiers && agent.pricingTiers.length > 0 && (() => {
        const basic = agent.pricingTiers!.find((t) => t.key === "basic");
        const pro = agent.pricingTiers!.find((t) => t.key === "pro");
        if (!basic || !pro) return null;
        const priceFor = (t: { monthly: number; annual: number }) => billingCycle === "annual" ? t.annual : t.monthly;
        return (
          <section id="pricing" className="border-b bg-card px-6 py-20">
            <div className="mx-auto max-w-[960px] text-center">
              <h2 className="mb-3 text-[clamp(24px,3vw,40px)] font-bold text-foreground">
                {isAr ? "اختر خطتك" : "Choose your plan"}
              </h2>
              <p className="mb-8 text-base text-muted-foreground">
                {isAr ? "ابدأ بالموقع فقط، أو أضف واتساب وإنستغرام والتحليلات مع خطة Pro. إلغاء في أي وقت." : "Start with website-only, or add WhatsApp, Instagram and analytics with Pro. Cancel anytime."}
              </p>

              {/* Billing cycle toggle */}
              <div className="mb-10 inline-flex items-center gap-1 rounded-full border bg-background p-1">
                {(["monthly", "annual"] as const).map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setBillingCycle(cycle)}
                    className={cn(
                      "rounded-full border-none px-4 py-1.5 text-[13px] font-semibold",
                      billingCycle === cycle ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground",
                    )}
                  >
                    {cycle === "monthly" ? (isAr ? "شهري" : "Monthly") : (isAr ? "سنوي (وفّر ٢٠٪)" : "Annual (save ~20%)")}
                  </button>
                ))}
              </div>

              <div className="mx-auto grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Basic */}
                <div className="flex flex-col rounded-2xl border bg-background p-7 text-left">
                  <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">{isAr ? "أساسي" : "Basic"}</p>
                  <div className="mb-5">
                    <span className="text-4xl font-extrabold text-foreground">${priceFor(basic)}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <p className="mb-5 text-[13px] text-muted-foreground">{isAr ? "الموقع فقط. إلغاء في أي وقت." : "Website widget only. Cancel anytime."}</p>
                  <ul className="mb-6 flex-1 list-none p-0">
                    {basic.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 py-1.5 text-[13px] text-muted-foreground">
                        <CheckCircle2 size={13} className="shrink-0 text-[#22c55e]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" onClick={() => handleGetStarted("basic")} disabled={creating} className="w-full">
                    {creating ? <Loader2 size={14} className="animate-spin" /> : (isAr ? "ابدأ" : "Get started")}
                  </Button>
                </div>

                {/* Pro */}
                <div className="relative flex flex-col rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/8 to-[#6d28d9]/4 p-7 text-left shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-primary to-[#6d28d9] px-4 py-1 text-[11px] font-bold whitespace-nowrap text-white">
                    ⭐ {isAr ? "الأكثر شيوعاً" : "Most Popular"}
                  </div>
                  <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-[#a78bfa] uppercase">{isAr ? "برو" : "Pro"}</p>
                  <div className="mb-5">
                    <span className="text-4xl font-extrabold text-foreground">${priceFor(pro)}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <p className="mb-5 text-[13px] text-muted-foreground">{isAr ? "الموقع + واتساب + إنستغرام + التحليلات." : "Website + WhatsApp + Instagram + Analytics."}</p>
                  <ul className="mb-6 flex-1 list-none p-0">
                    {pro.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 py-1.5 text-[13px] text-foreground">
                        <CheckCircle2 size={13} className="shrink-0 text-[#22c55e]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button onClick={() => handleGetStarted("pro")} disabled={creating} className="w-full gap-1.5 shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
                    {creating ? <Loader2 size={14} className="animate-spin" /> : (
                      <>
                        {isAr ? "ابدأ التجربة المجانية" : "Start free trial"}
                        <ArrowRight size={14} />
                      </>
                    )}
                  </Button>
                  <p className="mt-2.5 text-center text-[11px] text-muted-foreground">{isAr ? "لا حاجة لبطاقة ائتمان" : "No credit card required"}</p>
                </div>

                {/* Custom / Enterprise */}
                <div className="flex flex-col rounded-2xl border bg-background p-7 text-left">
                  <p className="mb-2 text-[13px] font-semibold tracking-[0.05em] text-muted-foreground uppercase">{isAr ? "مؤسسي" : "Custom"}</p>
                  <div className="mb-5">
                    <span className="text-4xl font-extrabold text-foreground">{isAr ? "مخصص" : "Contact us"}</span>
                  </div>
                  <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                    {agent.pricing?.customLabel || "Need custom integrations or multiple bots?"}
                  </p>
                  <ul className="mb-6 flex-1 list-none p-0">
                    {["Everything in Pro", "Custom integrations (CRM/POS)", "Multiple bots, one account", "Dedicated onboarding"].map((f) => (
                      <li key={f} className="flex items-center gap-2 py-1.5 text-[13px] text-muted-foreground">
                        <CheckCircle2 size={13} className="shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="mailto:hello@logicmate.io" className="flex items-center justify-center gap-1.5 rounded-[10px] border border-primary/30 bg-primary/6 p-3 text-sm font-semibold text-[#a78bfa] no-underline">
                    {isAr ? "تواصل معنا" : "Contact us"} →
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

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
            {isAr ? `جاهز تطلق ${(isAr && agent.name_ar) ? agent.name_ar : agent.name}؟` : `Ready to launch ${agent.name}?`}
          </h2>
          <p className="mb-7 text-base leading-[1.7] text-muted-foreground">
            {agent.badge === "Live"
              ? (isAr ? "30 يوم تجربة مجانية. بدون بطاقة ائتمان." : "30-day free trial. No credit card required.")
              : (isAr ? "انضم للقائمة واحصل على خصم 40% عند الإطلاق." : "Join the waitlist and get 40% off when we launch.")
            }
          </p>
          {agent.badge === "Live" ? (
            <Button nativeButton={false} render={<a href="#pricing" />} className="gap-2 rounded-[10px] px-8 py-6 text-[15px] shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
              {isAr ? "شوف الأسعار" : "See pricing"}
              <ArrowRight size={15} />
            </Button>
          ) : (
            <Button nativeButton={false} render={<Link href="/auth/signup" />} className="gap-2 rounded-[10px] px-8 py-6 text-[15px] shadow-[0_4px_20px_rgba(124,58,237,0.35)]">
              {isAr ? "انضم للقائمة" : "Join waitlist"}
              <ArrowRight size={15} />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
