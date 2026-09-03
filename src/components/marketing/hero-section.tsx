"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { industryName } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INDUSTRIES = [
  { label: "Content & Social", icon: "🎬", color: "#7c3aed", slug: "content_social" },
  { label: "Real Estate", icon: "🏡", color: "#3b82f6", slug: "real_estate" },
  { label: "E-commerce", icon: "🛒", color: "#f59e0b", slug: "ecommerce_retail" },
  { label: "Healthcare", icon: "🏥", color: "#22c55e", slug: "healthcare" },
  { label: "Marketing", icon: "📣", color: "#ef4444", slug: "marketing" },
  { label: "HR & Recruitment", icon: "👥", color: "#8b5cf6", slug: "hr_recruitment" },
  { label: "Hospitality", icon: "🏨", color: "#06b6d4", slug: "hospitality" },
  { label: "Education", icon: "🎓", color: "#f97316", slug: "education" },
  { label: "Logistics", icon: "🚚", color: "#84cc16", slug: "logistics" },
  { label: "Finance", icon: "💹", color: "#10b981", slug: "finance" },
  { label: "Agriculture", icon: "🌾", color: "#a3e635", slug: "agriculture" },
  { label: "Internal Tools", icon: "⚙️", color: "#a78bfa", slug: "internal_copilot" },
];

// One row per service pillar (automation, agent, chatbot) so the mockup
// reads as "the whole platform," not just agents.
const RUNNING_AGENTS = [
  { name: "YouTube Automation", niche: "Content & Social", status: "Running", progress: 72, color: "#ef4444", icon: "🎬" },
  { name: "WhatsApp Sales Agent", niche: "Real Estate", status: "Scheduled", progress: 100, color: "#22c55e", icon: "🏡" },
  { name: "Restaurant Chatbot", niche: "Hospitality", status: "Running", progress: 100, color: "#3b82f6", icon: "💬" },
  { name: "Arabic Content Agent", niche: "Content & Social", status: "Completed", progress: 100, color: "#7c3aed", icon: "🎬" },
];

export function HeroSection() {
  const { isDark } = useTheme();
  const { lang, isAr } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const nichesRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);
  const orb3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // The three background orbs used to animate forever (repeat: -1,
      // yoyo: true) — animating position on a large-radius blur() filter
      // element is one of the most expensive things you can ask a mobile
      // browser to do every frame, especially on Safari/WebKit, and it never
      // stopped for as long as the page was open. Reported as a real-device
      // slowness complaint; removed rather than tuned. The orbs still render
      // (static glow), just don't continuously repaint. Revisit with a
      // cheaper technique (e.g. CSS-only, smaller blur radius) in the
      // planned landing-page redesign if the motion is wanted back.
      const tl = gsap.timeline({ delay: 0.1 });
      tl.from(h1Ref.current, { y: 36, duration: 0.8, ease: "power3.out" })
        .from(subRef.current, { y: 20, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .from(ctaRef.current, { y: 20, duration: 0.5, ease: "power3.out" }, "-=0.3")
        .from(nichesRef.current, { y: 16, duration: 0.5, ease: "power3.out" }, "-=0.2")
        .from(mockupRef.current, { y: 48, duration: 0.9, ease: "power3.out" }, "-=0.3");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      dir={isAr ? "rtl" : "ltr"}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background pt-20"
    >
      {/* Noise grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15 dark:opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat", backgroundSize: "128px",
        }}
      />

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px),
                            linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Background orbs */}
      <div
        ref={orb1}
        className="pointer-events-none absolute top-[8%] left-[5%] size-[700px] rounded-full blur-[120px]"
        style={{ background: isDark ? "rgba(124,58,237,0.09)" : "rgba(124,58,237,0.06)" }}
      />
      <div
        ref={orb2}
        className="pointer-events-none absolute right-[5%] bottom-[5%] size-[600px] rounded-full blur-[100px]"
        style={{ background: isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.04)" }}
      />
      <div
        ref={orb3}
        className="pointer-events-none absolute top-[40%] right-[20%] size-[400px] rounded-full blur-[80px]"
        style={{ background: isDark ? "rgba(167,139,250,0.04)" : "rgba(167,139,250,0.03)" }}
      />

      <div className="relative z-10 mx-auto max-w-[1040px] px-6 pt-12 pb-20 text-center">
        {/* Headline — clamp's upper bound and the container width are tuned
            together so "Your business never sleeps." holds one line instead
            of breaking mid-sentence on wide screens; "Neither does your AI."
            stays on its own (intentional) line via the <br/>. */}
        <h1
          ref={h1Ref}
          className="mb-7 font-extrabold tracking-[-0.03em] text-foreground"
          style={{ fontSize: "clamp(38px, 6.4vw, 72px)", lineHeight: 1.08 }}
        >
          {isAr ? "عملك لا ينام." : "Your business never sleeps."}
          <br />
          <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #7c3aed 80%)" }}>
            {isAr ? "وكذلك ذكاؤك الاصطناعي." : "Neither does your AI."}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subRef}
          className="mx-auto mb-11 max-w-[620px] text-muted-foreground"
          style={{ fontSize: "clamp(16px, 2.5vw, 20px)", lineHeight: 1.65 }}
        >
          {isAr
            ? "وكلاء ذكاء اصطناعي وأتمتة وشات بوتات جاهزة لكل قطاع — المحتوى، العقارات، الرعاية الصحية والمزيد. اشترك، فعّلها، ودعها تعمل على مدار الساعة."
            : "Pre-built AI agents, automations, and chatbots for every industry — content, real estate, healthcare and more. Subscribe, deploy, and let them work around the clock."
          }
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="mb-5 flex flex-wrap justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/auth/signup" />}
            className="gap-2 rounded-[10px] px-9 py-6 text-[15px] shadow-[0_4px_32px_rgba(124,58,237,0.4),0_0_0_1px_rgba(124,58,237,0.3)]"
          >
            {isAr ? "ابدأ مجاناً" : "Start for free"} <ArrowRight size={16} />
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/industries" />}
            className="gap-2 rounded-[10px] px-7 py-6 text-[15px] font-medium backdrop-blur-sm"
          >
            <Play size={14} /> {isAr ? "استكشف القطاعات" : "Explore industries"}
          </Button>
        </div>

        {/* Trust line */}
        <p className="mb-12 text-[13px] text-muted-foreground opacity-70">
          {isAr ? "لا بطاقة ائتمانية · تجربة 30 يوم مجاناً · إلغاء في أي وقت" : "No credit card required · 30-day free trial · Cancel anytime"}
        </p>

        {/* Three service pillars */}
        <div className="mb-7 flex flex-wrap justify-center gap-2.5">
          {[
            { icon: "🤖", label: isAr ? "وكلاء ذكاء اصطناعي" : "AI Agents", color: "#7c3aed" },
            { icon: "⚡", label: isAr ? "أتمتة" : "Automations", color: "#22c55e" },
            { icon: "💬", label: isAr ? "شات بوتات" : "Chatbots", color: "#3b82f6" },
          ].map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold"
              style={{ background: `${p.color}0f`, border: `1px solid ${p.color}30`, color: p.color }}
            >
              <span className="text-sm">{p.icon}</span>{p.label}
            </span>
          ))}
        </div>

        {/* Niche pills */}
        <div ref={nichesRef} className="mb-16">
          <p className="mb-3.5 text-xs tracking-[0.06em] text-muted-foreground uppercase opacity-60">
            {isAr ? "مصمم لـ 12 قطاع" : "Built for 12 industries"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {INDUSTRIES.map((n, i) => (
              <Link
                key={n.label}
                href={`/industries/${n.slug}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground no-underline transition-all",
                  isDark ? "border-white/8 bg-white/4" : "border-black/8 bg-black/3"
                )}
                style={{ animation: `fadeInPill 0.3s ease ${i * 0.04}s both` }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = `${n.color}40`;
                  el.style.color = n.color;
                  el.style.background = `${n.color}08`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = "";
                  el.style.color = "";
                  el.style.background = "";
                }}
              >
                <span className="text-[11px]">{n.icon}</span>
                {industryName(n.slug, lang)}
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div
          ref={mockupRef}
          className={cn(
            "rounded-[18px] border p-1.5 backdrop-blur-2xl",
            isDark ? "border-white/8 bg-white/2" : "border-black/8 bg-white/80"
          )}
          style={{
            boxShadow: isDark
              ? "0 0 0 1px rgba(255,255,255,0.04), 0 0 120px rgba(124,58,237,0.15), 0 48px 80px rgba(0,0,0,0.5)"
              : "0 0 0 1px rgba(0,0,0,0.04), 0 0 80px rgba(124,58,237,0.08), 0 32px 64px rgba(0,0,0,0.08)",
          }}
        >
          {/* Browser chrome */}
          <div className={cn("flex items-center gap-2 border-b px-4 py-2.5", isDark ? "border-white/6" : "border-black/6")}>
            <div className="flex gap-1.5">
              <div className="size-2.5 rounded-full bg-[#ff5f57]" />
              <div className="size-2.5 rounded-full bg-[#febc2e]" />
              <div className="size-2.5 rounded-full bg-[#28c840]" />
            </div>
            <div className={cn("mx-2 flex h-[22px] flex-1 items-center rounded-[5px] pl-2.5", isDark ? "bg-white/4" : "bg-black/4")}>
              <span className="text-[11px] text-muted-foreground opacity-60">
                app.logicmate.ai/dashboard/modules
              </span>
            </div>
          </div>

          {/* Dashboard content */}
          <div className={cn("min-h-[320px] rounded-xl p-5", isDark ? "bg-[#0a0a0a]" : "bg-[#f4f4f5]")}>
            {/* Header row */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">My Modules</p>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 animate-[pulse-dot_2s_infinite] rounded-full bg-[#22c55e]" />
                <span className="text-[11px] font-semibold text-[#22c55e]">4 active</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="mb-4 grid grid-cols-4 gap-2.5">
              {[
                { label: "Modules", value: "4", color: "#7c3aed" },
                { label: "Runs today", value: "12", color: "#22c55e" },
                { label: "Success rate", value: "98%", color: "#3b82f6" },
                { label: "Trial days", value: "28", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} className={cn("rounded-[9px] border p-3", isDark ? "border-white/6 bg-white/3" : "border-black/6 bg-white/80")}>
                  <p className="mb-1 text-[11px] text-muted-foreground">{s.label}</p>
                  <p className="text-xl leading-none font-extrabold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Agent list */}
            <div className={cn("overflow-hidden rounded-[10px] border", isDark ? "border-white/6 bg-white/2" : "border-black/6 bg-white/90")}>
              {RUNNING_AGENTS.map((agent, i) => (
                <div
                  key={agent.name}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5",
                    i < RUNNING_AGENTS.length - 1 && (isDark ? "border-b border-white/4" : "border-b border-black/5")
                  )}
                >
                  <div
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-[7px] border text-[13px]"
                    style={{ background: `${agent.color}18`, borderColor: `${agent.color}30` }}
                  >
                    {agent.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="overflow-hidden text-xs font-semibold text-ellipsis whitespace-nowrap text-foreground">
                        {agent.name}
                      </span>
                      <span
                        className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: agent.status === "Running" ? "rgba(34,197,94,0.12)" : agent.status === "Completed" ? "rgba(59,130,246,0.12)" : "rgba(245,158,11,0.12)",
                          color: agent.status === "Running" ? "#22c55e" : agent.status === "Completed" ? "#3b82f6" : "#f59e0b",
                        }}
                      >
                        {agent.status}
                      </span>
                    </div>
                    <div className={cn("h-[3px] overflow-hidden rounded-sm", isDark ? "bg-white/6" : "bg-black/8")}>
                      <div
                        className="h-full rounded-sm"
                        style={{ width: `${agent.progress}%`, background: `linear-gradient(90deg, ${agent.color}, ${agent.color}cc)` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
