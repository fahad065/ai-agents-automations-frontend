"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { ShoppingBag, Settings2, Rocket, BarChart3, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesSection() {
  const { colors, isDark } = useTheme();
  const { lang, isAr } = useLang();

  const STEPS = [
    {
      n: "01", icon: ShoppingBag, color: "#7c3aed",
      title: tr("step1Title", lang),
      description: tr("step1Desc", lang),
      preview: [
        { label: isAr ? "أتمتة يوتيوب" : "YouTube Automation", sub: isAr ? "المحتوى والتواصل الاجتماعي" : "Content & Social", color: "#ef4444", icon: "🎬", badge: isAr ? "مباشر" : "Live" },
        { label: isAr ? "مسار العقارات" : "Real Estate Pipeline", sub: isAr ? "العقارات" : "Real Estate", color: "#3b82f6", icon: "🏡", badge: isAr ? "مسار" : "Pipeline" },
        { label: isAr ? "توليد العملاء" : "Lead Generation", sub: isAr ? "التسويق" : "Marketing", color: "#f59e0b", icon: "📣", badge: isAr ? "مباشر" : "Live" },
        { label: isAr ? "مبيعات واتساب" : "WhatsApp Sales", sub: isAr ? "العقارات" : "Real Estate", color: "#22c55e", icon: "💬", badge: isAr ? "مباشر" : "Live" },
      ],
    },
    {
      n: "02", icon: Settings2, color: "#3b82f6",
      title: tr("step2Title", lang),
      description: tr("step2Desc", lang),
      preview: [
        { label: "🇦🇪 " + (isAr ? "الإمارات العربية المتحدة" : "United Arab Emirates"), sub: isAr ? "أسواق العربية والإنجليزية" : "Arabic + English markets", color: "#7c3aed", icon: "", badge: isAr ? "نشط" : "Active" },
        { label: "🇰🇪 " + (isAr ? "كينيا" : "Kenya"), sub: isAr ? "أسواق السواحيلية والإنجليزية" : "Swahili + English markets", color: "#22c55e", icon: "", badge: isAr ? "نشط" : "Active" },
        { label: isAr ? "التخصص: العقارات" : "Niche: Real Estate", sub: isAr ? "مبيعات وإيجارات العقارات" : "Property sales & rentals", color: "#3b82f6", icon: "", badge: "" },
        { label: isAr ? "الجدول: يومي 9ص" : "Schedule: Daily 9am", sub: isAr ? "تشغيل تلقائي" : "Automated runs", color: "#f59e0b", icon: "", badge: "" },
      ],
    },
    {
      n: "03", icon: Rocket, color: "#22c55e",
      title: tr("step3Title", lang),
      description: tr("step3Desc", lang),
      preview: [
        { label: isAr ? "البحث عن المواضيع" : "Researching topics", sub: isAr ? "تحليل الاتجاهات بالذكاء الاصطناعي" : "AI-powered trend analysis", color: "#7c3aed", icon: "🔍", badge: isAr ? "يعمل" : "Running" },
        { label: isAr ? "إنشاء المحتوى" : "Generating content", sub: "GPT-4 + custom prompts", color: "#22c55e", icon: "✍️", badge: isAr ? "يعمل" : "Running" },
        { label: isAr ? "إنشاء المرئيات" : "Creating visuals", sub: "Seedance + Canva", color: "#ef4444", icon: "🎨", badge: isAr ? "يعمل" : "Running" },
        { label: isAr ? "النشر والمشاركة" : "Publishing & posting", sub: "YouTube, Instagram, WhatsApp", color: "#f59e0b", icon: "📤", badge: isAr ? "تم" : "Done" },
      ],
    },
    {
      n: "04", icon: BarChart3, color: "#f59e0b",
      title: tr("step4Title", lang),
      description: tr("step4Desc", lang),
      preview: [
        { label: isAr ? "تشغيلات المسار: 124" : "Pipeline runs: 124", sub: isAr ? "آخر 30 يوماً" : "Last 30 days", color: "#7c3aed", icon: "📊", badge: "" },
        { label: isAr ? "معدل النجاح: 98%" : "Success rate: 98%", sub: isAr ? "عبر جميع الوكلاء" : "Across all agents", color: "#22c55e", icon: "✅", badge: "" },
        { label: isAr ? "تكلفة API: $4.20" : "API cost: $4.20", sub: isAr ? "هذا الشهر، بالتكلفة الفعلية" : "This month, at cost", color: "#f59e0b", icon: "💰", badge: "" },
        { label: isAr ? "التشغيل التالي: 9:00 ص" : "Next run: 9:00 AM", sub: isAr ? "مجدول يومياً" : "Scheduled daily", color: "#3b82f6", icon: "⏰", badge: "" },
      ],
    },
  ];
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 30, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
      });
    }, sectionRef);

    const interval = setInterval(() => setActive((p) => (p + 1) % STEPS.length), 4000);
    return () => { ctx.revert(); clearInterval(interval); };
  }, []);

  const step = STEPS[active];

  return (
    <section ref={sectionRef} style={{
      padding: "100px 24px",
      background: colors.bg,
      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <div ref={titleRef} style={{ textAlign: "center", marginBottom: "72px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            border: "1px solid rgba(124,58,237,0.3)",
            background: "rgba(124,58,237,0.08)",
            color: "#a78bfa", padding: "5px 14px",
            borderRadius: "9999px", fontSize: "12px",
            fontWeight: 500, marginBottom: "20px",
          }}>
            {tr("howItWorks", lang)}
          </span>
          <h2 style={{
            fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 800,
            color: colors.text, marginBottom: "14px",
            letterSpacing: "-0.03em", lineHeight: 1.1,
          }}>
            {isAr ? "من الصفر إلى الأتمتة" : "From zero to automated"}<br />{isAr ? "في 4 خطوات" : "in 4 steps"}
          </h2>
          <p style={{
            color: colors.textMuted, fontSize: "clamp(15px, 2vw, 17px)",
            maxWidth: "500px", margin: "0 auto", lineHeight: 1.65,
          }}>
            {tr("featuresSubtitle", lang)}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px",
          alignItems: "start",
        }}>
          {/* Step list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === active;
              return (
                <button key={s.n} onClick={() => setActive(i)} style={{
                  display: "flex", alignItems: "flex-start", gap: "14px",
                  padding: "16px 18px", borderRadius: "12px", width: "100%",
                  background: isActive ? `${s.color}0c` : "transparent",
                  border: `1px solid ${isActive ? s.color + "30" : "transparent"}`,
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.25s",
                }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
                    background: isActive ? `${s.color}18` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                    border: `1px solid ${isActive ? s.color + "35" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s",
                  }}>
                    <Icon size={17} color={isActive ? s.color : colors.textMuted} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{
                        fontFamily: "monospace", fontSize: "10px", fontWeight: 700,
                        color: isActive ? s.color : colors.textMuted, opacity: isActive ? 1 : 0.5,
                      }}>{s.n}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: isActive ? colors.text : colors.textMuted }}>
                        {s.title}
                      </span>
                    </div>
                    <p style={{
                      fontSize: "13px", color: colors.textMuted, lineHeight: 1.55,
                      maxHeight: isActive ? "80px" : "0", overflow: "hidden",
                      transition: "max-height 0.35s ease",
                    }}>
                      {s.description}
                    </p>
                  </div>
                  <ChevronRight size={13} color={isActive ? s.color : colors.textMuted}
                    style={{ flexShrink: 0, marginTop: "4px", opacity: isActive ? 1 : 0.35, transition: "all 0.2s" }} />
                </button>
              );
            })}

            {/* Progress dots */}
            <div style={{ display: "flex", gap: "5px", padding: "12px 18px" }}>
              {STEPS.map((_, i) => (
                <div key={i} onClick={() => setActive(i)} style={{
                  height: "3px",
                  width: i === active ? "28px" : "6px",
                  borderRadius: "2px",
                  background: i === active ? STEPS[active].color : (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"),
                  transition: "all 0.3s", cursor: "pointer",
                }} />
              ))}
            </div>
          </div>

          {/* Preview panel */}
          <div style={{
            background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
            borderRadius: "16px", padding: "28px",
            backdropFilter: "blur(8px)",
            boxShadow: `0 0 60px ${step.color}08`,
            transition: "box-shadow 0.4s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{
                width: "42px", height: "42px", borderRadius: "11px",
                background: `${step.color}15`, border: `1px solid ${step.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <step.icon size={20} color={step.color} />
              </div>
              <div>
                <p style={{ fontSize: "10px", color: colors.textMuted, marginBottom: "2px", opacity: 0.6 }}>{tr("step", lang)} {step.n}</p>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: colors.text }}>{step.title}</h3>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {step.preview.map((item, i) => (
                <div key={i} style={{
                  padding: "12px", borderRadius: "9px",
                  background: `${step.color}08`,
                  border: `1px solid ${step.color}18`,
                  transition: "all 0.3s",
                }}>
                  {item.icon && <div style={{ fontSize: "16px", marginBottom: "6px" }}>{item.icon}</div>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px", marginBottom: "2px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: colors.text, lineHeight: 1.3 }}>{item.label}</p>
                    {item.badge && (
                      <span style={{
                        fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px",
                        background: `${item.color}18`, color: item.color, flexShrink: 0,
                      }}>{item.badge}</span>
                    )}
                  </div>
                  <p style={{ fontSize: "11px", color: colors.textMuted }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
