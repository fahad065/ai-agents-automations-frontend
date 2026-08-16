"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { Bot, Zap, Globe, Clock } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function StatsSection() {
  const { colors, isDark } = useTheme();
  const { lang, isAr } = useLang();

  const STATS = [
    {
      icon: Bot, color: "#7c3aed",
      value: "13+", label: isAr ? "وكلاء الذكاء الاصطناعي والأتمتة" : "AI Agents & Automations",
      sub: isAr ? "المحتوى، العقارات، التسويق والمزيد" : "Content, real estate, marketing and more",
    },
    {
      icon: Zap, color: "#22c55e",
      value: "100%", label: isAr ? "أتمتة شاملة من البداية للنهاية" : "End-to-end automated",
      sub: isAr ? "من البحث إلى النشر — بدون أي عمل يدوي" : "From research to publishing — zero manual work",
    },
    {
      icon: Globe, color: "#3b82f6",
      value: "12", label: isAr ? "القطاعات المدعومة" : "Industries supported",
      sub: isAr ? "دعم المحتوى العربي، أسواق الإمارات وكينيا" : "Arabic content support, UAE & Kenya markets",
    },
    {
      icon: Clock, color: "#f59e0b",
      value: "30", label: isAr ? "يوم تجريب مجاني" : "Days free trial",
      sub: isAr ? "بدون بطاقة ائتمان. بدون مخاطر. إلغاء في أي وقت." : "No credit card. No risk. Cancel anytime.",
    },
  ];
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(Array.from(sectionRef.current?.querySelectorAll(".stat-card") || []), {
        y: 24, duration: 0.6, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{
      padding: "80px 24px",
      background: colors.bg,
      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Label */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "12px", color: colors.textMuted, opacity: 0.6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {tr("builtForResults", lang)}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1px",
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          borderRadius: "18px", overflow: "hidden",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
        }}>
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="stat-card" key={stat.label} style={{
                textAlign: "center", padding: "40px 24px",
                background: colors.bg,
                position: "relative",
              }}>
                {/* Glow */}
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "120px", height: "120px",
                  background: `${stat.color}08`,
                  borderRadius: "50%", filter: "blur(30px)",
                  pointerEvents: "none",
                }} />

                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `${stat.color}12`, border: `1px solid ${stat.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <Icon size={20} color={stat.color} />
                </div>

                <div style={{
                  fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 800,
                  lineHeight: 1, marginBottom: "8px",
                  letterSpacing: "-0.03em",
                  backgroundImage: `linear-gradient(135deg, ${colors.text}, ${stat.color}aa)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  {stat.value}
                </div>

                <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.5, maxWidth: "180px", margin: "0 auto" }}>
                  {stat.sub}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
