"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { industryName } from "@/lib/translations";

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

const RUNNING_AGENTS = [
  { name: "YouTube Automation", niche: "Content & Social", status: "Running", progress: 72, color: "#ef4444", icon: "🎬" },
  { name: "WhatsApp Sales Agent", niche: "Real Estate", status: "Scheduled", progress: 100, color: "#22c55e", icon: "🏡" },
  { name: "Lead Generation", niche: "Marketing", status: "Running", progress: 45, color: "#f59e0b", icon: "📣" },
  { name: "Arabic Content Agent", niche: "Content & Social", status: "Completed", progress: 100, color: "#7c3aed", icon: "🎬" },
];

export function HeroSection() {
  const { colors, isDark } = useTheme();
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
    <section ref={containerRef} dir={isAr ? "rtl" : "ltr"} style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", background: colors.bg, paddingTop: "80px",
    }}>

      {/* Noise grain overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: isDark ? 0.4 : 0.15,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px",
      }} />

      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px),
                          linear-gradient(90deg, ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
      }} />

      {/* Background orbs */}
      <div ref={orb1} style={{
        position: "absolute", top: "8%", left: "5%",
        width: "700px", height: "700px",
        background: isDark ? "rgba(124,58,237,0.09)" : "rgba(124,58,237,0.06)",
        borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none",
      }} />
      <div ref={orb2} style={{
        position: "absolute", bottom: "5%", right: "5%",
        width: "600px", height: "600px",
        background: isDark ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.04)",
        borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none",
      }} />
      <div ref={orb3} style={{
        position: "absolute", top: "40%", right: "20%",
        width: "400px", height: "400px",
        background: isDark ? "rgba(167,139,250,0.04)" : "rgba(167,139,250,0.03)",
        borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div style={{
        position: "relative", zIndex: 10,
        maxWidth: "900px", margin: "0 auto",
        padding: "48px 24px 80px", textAlign: "center",
      }}>

        {/* Headline */}
        <h1 ref={h1Ref} style={{
          fontSize: "clamp(44px, 8vw, 88px)",
          fontWeight: 800, lineHeight: 1.04,
          letterSpacing: "-0.04em",
          color: colors.text, marginBottom: "28px",
        }}>
          {isAr ? "عملك لا ينام." : "Your business never sleeps."}
          <br />
          <span style={{
            background: "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #7c3aed 80%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            {isAr ? "وكذلك ذكاؤك الاصطناعي." : "Neither does your AI."}
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={subRef} style={{
          fontSize: "clamp(16px, 2.5vw, 20px)", lineHeight: 1.65,
          color: colors.textMuted,
          maxWidth: "580px", margin: "0 auto 44px",
        }}>
          {isAr
            ? "وكلاء ذكاء اصطناعي وأتمتة جاهزة لكل قطاع — المحتوى، العقارات، الرعاية الصحية والمزيد. اشترك، انشر، ودعها تعمل."
            : "Pre-built AI agents and automations for every industry — content, real estate, healthcare and more. Subscribe, deploy, and let them run."
          }
        </p>

        {/* CTAs */}
        <div ref={ctaRef} style={{
          display: "flex", flexWrap: "wrap",
          gap: "12px", justifyContent: "center", marginBottom: "20px",
        }}>
          <Link href="/auth/signup" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", padding: "15px 36px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 32px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.3)",
          }}>
            {isAr ? "ابدأ مجاناً" : "Start for free"} <ArrowRight size={16} />
          </Link>
          <Link href="/industries" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
            color: colors.textMuted, padding: "15px 28px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 500, textDecoration: "none",
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            backdropFilter: "blur(8px)",
          }}>
            <Play size={14} /> {isAr ? "استكشف القطاعات" : "Explore industries"}
          </Link>
        </div>

        {/* Trust line */}
        <p style={{ fontSize: "13px", color: colors.textSubtle ?? colors.textMuted, marginBottom: "48px", opacity: 0.7 }}>
          {isAr ? "لا بطاقة ائتمانية · تجربة 30 يوم مجاناً · إلغاء في أي وقت" : "No credit card required · 30-day free trial · Cancel anytime"}
        </p>

        {/* Niche pills */}
        <div ref={nichesRef} style={{ marginBottom: "64px" }}>
          <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "14px", opacity: 0.6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {isAr ? "مصمم لـ 12 قطاع" : "Built for 12 industries"}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            {INDUSTRIES.map((n, i) => (
              <Link key={n.label} href={`/industries/${n.slug}`} style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                color: colors.textMuted, textDecoration: "none",
                transition: "all 0.15s",
                animation: `fadeInPill 0.3s ease ${i * 0.04}s both`,
              }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = `${n.color}40`;
                  el.style.color = n.color;
                  el.style.background = `${n.color}08`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
                  el.style.color = colors.textMuted;
                  el.style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
                }}
              >
                <span style={{ fontSize: "11px" }}>{n.icon}</span>
                {industryName(n.slug, lang)}
              </Link>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div ref={mockupRef} style={{
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          borderRadius: "18px",
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.8)",
          padding: "6px",
          boxShadow: isDark
            ? "0 0 0 1px rgba(255,255,255,0.04), 0 0 120px rgba(124,58,237,0.15), 0 48px 80px rgba(0,0,0,0.5)"
            : "0 0 0 1px rgba(0,0,0,0.04), 0 0 80px rgba(124,58,237,0.08), 0 32px 64px rgba(0,0,0,0.08)",
          backdropFilter: "blur(24px)",
        }}>
          {/* Browser chrome */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 16px",
            borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840" }} />
            </div>
            <div style={{
              flex: 1, height: "22px", borderRadius: "5px",
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              margin: "0 8px",
              display: "flex", alignItems: "center", paddingLeft: "10px",
            }}>
              <span style={{ fontSize: "11px", color: colors.textMuted, opacity: 0.6 }}>
                app.logicmate.ai/dashboard/modules
              </span>
            </div>
          </div>

          {/* Dashboard content */}
          <div style={{
            padding: "20px",
            background: isDark ? "#0a0a0a" : "#f4f4f5",
            borderRadius: "12px", minHeight: "320px",
          }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text }}>My Agents</p>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulse-dot 2s infinite" }} />
                <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>4 active</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "16px" }}>
              {[
                { label: "Modules", value: "4", color: "#7c3aed" },
                { label: "Runs today", value: "12", color: "#22c55e" },
                { label: "Success rate", value: "98%", color: "#3b82f6" },
                { label: "Trial days", value: "28", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} style={{
                  background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                  borderRadius: "9px", padding: "12px",
                }}>
                  <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "4px" }}>{s.label}</p>
                  <p style={{ fontSize: "20px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Agent list */}
            <div style={{
              background: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.9)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              borderRadius: "10px", overflow: "hidden",
            }}>
              {RUNNING_AGENTS.map((agent, i) => (
                <div key={agent.name} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "11px 14px",
                  borderBottom: i < RUNNING_AGENTS.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}` : "none",
                }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "7px",
                    background: `${agent.color}18`, border: `1px solid ${agent.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", flexShrink: 0,
                  }}>
                    {agent.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {agent.name}
                      </span>
                      <span style={{
                        fontSize: "10px", fontWeight: 600, flexShrink: 0, marginLeft: "8px",
                        padding: "2px 7px", borderRadius: "4px",
                        background: agent.status === "Running" ? "rgba(34,197,94,0.12)" : agent.status === "Completed" ? "rgba(59,130,246,0.12)" : "rgba(245,158,11,0.12)",
                        color: agent.status === "Running" ? "#22c55e" : agent.status === "Completed" ? "#3b82f6" : "#f59e0b",
                      }}>
                        {agent.status}
                      </span>
                    </div>
                    <div style={{
                      height: "3px", borderRadius: "2px",
                      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)", overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: `${agent.progress}%`,
                        background: `linear-gradient(90deg, ${agent.color}, ${agent.color}cc)`,
                        borderRadius: "2px",
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "200px",
        background: `linear-gradient(to top, ${colors.bg}, transparent)`,
        pointerEvents: "none",
      }} />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
        @keyframes fadeInPill {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
