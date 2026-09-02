"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { Heart, Zap, Shield, Users, ArrowRight, Loader2 } from "lucide-react";

interface AboutPageData {
  title?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  content?: string;
  content_ar?: string;
}

export function AboutPage() {
  const { colors, isDark } = useTheme();
  const { isAr } = useLang();
  const [page, setPage] = useState<AboutPageData | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/about`)
      .then((r) => r.json())
      .then(setPage)
      .catch(() => {});
  }, []);

  const cmsTitle = page ? ((isAr && page.title_ar) ? page.title_ar : page.title) : null;
  const cmsSubtitle = page ? ((isAr && page.subtitle_ar) ? page.subtitle_ar : page.subtitle) : null;
  const cmsContent = page ? ((isAr && page.content_ar) ? page.content_ar : page.content) : null;

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const VALUES = [
    {
      icon: Heart, color: "#ef4444",
      label: isAr ? "شفافية تامة" : "Radical transparency",
      desc: isAr
        ? "نقولك بالضبط ما يسوّيه كل وكيل، وكم يكلّف، وكيف يشتغل. ما في صناديق سوداء. ما في رسوم خفية."
        : "We tell you exactly what our agents do, what they cost to run, and how they work. No black boxes. No hidden fees.",
    },
    {
      icon: Zap, color: "#f59e0b",
      label: isAr ? "الجودة فوق الكمية" : "Quality over quantity",
      desc: isAr
        ? "20 وحدة تشتغل بكفاءة أحسن من 100 تشتغل بشكل رديء. كل وكيل أو أتمتة أو شات بوت نطلقه يكون مُختبَراً في بيئة الإنتاج قبل ما يوصلك."
        : "20+ modules that work perfectly beats 100 that work poorly. Every agent, automation, and chatbot we ship is production-tested before it reaches you.",
    },
    {
      icon: Shield, color: "#22c55e",
      label: isAr ? "بياناتك، دائماً" : "Your data, always",
      desc: isAr
        ? "مفاتيح API مشفّرة بتشفير AES-256. محتواك ملكك. ما نستخدم بيانات عملك لتدريب الأنظمة."
        : "Your API keys are AES-256 encrypted. Your content belongs to you. We never train models on your business data.",
    },
    {
      icon: Users, color: "#7c3aed",
      label: isAr ? "مصمم للمنطقة" : "Built for the region",
      desc: isAr
        ? "أتمتة ذكاء اصطناعي مصممة لأعمال الإمارات وكينيا، مع دعم اللغة العربية واستراتيجيات محتوى خاصة بكل سوق."
        : "AI automation built for UAE and Kenyan businesses, with Arabic language support and market-specific content strategies.",
    },
  ];

  const TIMELINE = [
    { year: "2023", event: isAr ? "تأسست في دبي. بدأنا بوكيل أتمتة يوتيوب واحد." : "Founded in Dubai. Started with a single YouTube automation agent." },
    { year: "2024 Q1", event: isAr ? "توسعنا لـ 4 وكلاء ذكاء اصطناعي. أول 50 مستخدم في السوق الإماراتي." : "Expanded to 4 AI agents. First 50 users in the UAE market." },
    { year: "2024 Q3", event: isAr ? "انطلقنا في كينيا. أضفنا خطوط أتمتة العقارات والتسويق." : "Launched in Kenya. Added Real Estate and Marketing pipelines." },
    { year: "2025", event: isAr ? "13 وكيل في 12 قطاع. خليجي أولاً، ونتوسع عالمياً." : "13 agents across 12 industries. GCC-first, expanding globally." },
    { year: "2026", event: isAr ? "أطلقنا الشات بوتات — 9 قوالب جاهزة عبر الموقع وواتساب وإنستقرام. المنصة الآن أكثر من 20 وكيلاً وأتمتة وشات بوت." : "Launched chatbots — 9 ready-made templates across website, WhatsApp and Instagram. The platform is now 20+ agents, automations and chatbots strong." },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} style={{ minHeight: "100vh", background: colors.bg }}>

      {/* Hero */}
      <section style={{
        padding: "120px 24px 80px", maxWidth: "760px",
        margin: "0 auto", textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "40%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px", height: "500px",
          background: "rgba(124,58,237,0.06)",
          borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none",
        }} />
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          border: "1px solid rgba(124,58,237,0.3)",
          background: "rgba(124,58,237,0.08)",
          color: "#a78bfa", padding: "6px 16px", borderRadius: "9999px",
          fontSize: "13px", fontWeight: 500, marginBottom: "28px",
        }}>
          {isAr ? "قصتنا" : "Our story"}
        </span>
        {!page ? (
          <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
        ) : (
          <>
            <h1 style={{
              fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 800,
              letterSpacing: "-0.04em", color: colors.text,
              marginBottom: "24px", lineHeight: 1.05,
            }}>
              {cmsTitle || (isAr ? "لوجيك ميت" : "LogicMate")}
            </h1>
            <p style={{
              fontSize: "18px", lineHeight: 1.75, color: colors.textMuted,
              maxWidth: "580px", margin: "0 auto",
            }}>
              {cmsSubtitle || (isAr ? "بنينا منصة الوكلاء اللي كنا نتمنى توجد." : "We built the agent platform we wished existed.")}
            </p>
          </>
        )}
      </section>

      {/* CMS body content (if set by admin) */}
      {cmsContent && (
        <section style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px 60px" }}>
          <div
            dir={isAr ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: cmsContent }}
            style={{ fontSize: "15px", lineHeight: 1.8, color: colors.textMuted }}
          />
        </section>
      )}

      {/* Mission statement */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{
          background: isDark ? "rgba(124,58,237,0.05)" : "rgba(124,58,237,0.03)",
          border: `1px solid rgba(124,58,237,0.18)`,
          borderRadius: "18px", padding: "40px 48px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "250px", height: "250px",
            background: "rgba(124,58,237,0.08)",
            borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none",
          }} />
          <p style={{
            fontSize: "11px", fontWeight: 700, color: "#a78bfa",
            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px",
          }}>
            {isAr ? "مهمتنا" : "Our mission"}
          </p>
          <p style={{
            fontSize: "clamp(18px, 2.5vw, 22px)", fontWeight: 600,
            color: colors.text, lineHeight: 1.65,
          }}>
            {isAr
              ? '"نجعل أتمتة الذكاء الاصطناعي في متناول كل عمل تجاري في دول الخليج — مو بس اللي عندهم فرق هندسية وميزانيات ضخمة."'
              : '"Make AI automation accessible to every business in the GCC — not just the ones with engineering teams and six-figure budgets."'}
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
        <h2 style={{
          fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800,
          color: colors.text, marginBottom: "12px", letterSpacing: "-0.03em",
        }}>
          {isAr ? "ما نؤمن فيه" : "What we stand for"}
        </h2>
        <p style={{ fontSize: "15px", color: colors.textMuted, marginBottom: "36px", lineHeight: 1.65 }}>
          {isAr
            ? "هذي مو قيم مكتوبة على الجدار، هذي قرارات نتخذها كل يوم."
            : "These are not corporate values on a poster. They're decisions we make every day."}
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}>
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.label} style={{
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                border: `1px solid ${border}`,
                borderRadius: "14px", padding: "24px",
                transition: "border-color 0.2s",
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: `${v.color}12`, border: `1px solid ${v.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "14px",
                }}>
                  <Icon size={18} color={v.color} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text, marginBottom: "8px" }}>
                  {v.label}
                </p>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65 }}>
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section style={{
        maxWidth: "900px", margin: "0 auto", padding: "64px 24px 80px",
        borderTop: `1px solid ${border}`,
      }}>
        <h2 style={{
          fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800,
          color: colors.text, marginBottom: "48px", letterSpacing: "-0.03em",
          textAlign: "center",
        }}>
          {isAr ? "كيف وصلنا لهنا" : "How we got here"}
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "24px",
        }}>
          {TIMELINE.map((t, i) => (
            <div key={t.year} style={{
              textAlign: "center", padding: "28px 20px",
              background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
              border: `1px solid ${i === TIMELINE.length - 1 ? "rgba(124,58,237,0.3)" : border}`,
              borderRadius: "14px",
              position: "relative",
            }}>
              {i === TIMELINE.length - 1 && (
                <div style={{
                  position: "absolute", top: "-1px", left: "-1px", right: "-1px", bottom: "-1px",
                  borderRadius: "14px", border: "1px solid rgba(124,58,237,0.35)",
                  pointerEvents: "none",
                }} />
              )}
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: i === TIMELINE.length - 1 ? "rgba(124,58,237,0.15)" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"),
                border: `2px solid ${i === TIMELINE.length - 1 ? "#7c3aed" : "rgba(124,58,237,0.25)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
                fontSize: "14px", fontWeight: 800,
                color: i === TIMELINE.length - 1 ? "#a78bfa" : colors.textMuted,
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#a78bfa", marginBottom: "8px" }}>
                {t.year}
              </p>
              <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65 }}>
                {t.event}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
          border: `1px solid ${border}`,
          borderRadius: "18px", padding: "48px",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: colors.text, marginBottom: "12px", letterSpacing: "-0.03em" }}>
            {isAr ? "جاهز تبدأ؟" : "Ready to get started?"}
          </h2>
          <p style={{ fontSize: "15px", color: colors.textMuted, marginBottom: "28px", lineHeight: 1.65 }}>
            {isAr
              ? "انشر أول وكيل ذكاء اصطناعي في دقائق. تجربة مجانية 30 يوم، ما في حاجة لبطاقة ائتمان."
              : "Deploy your first AI agent in minutes. 30-day free trial, no credit card required."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", padding: "12px 28px", borderRadius: "9px",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
            }}>
              {isAr ? "ابدأ مجاناً" : "Start for free"} <ArrowRight size={15} />
            </Link>
            <Link href="/contact" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              border: `1px solid ${border}`,
              color: colors.textMuted, padding: "12px 28px", borderRadius: "9px",
              fontSize: "14px", fontWeight: 500, textDecoration: "none",
              background: "transparent",
            }}>
              {isAr ? "كلّمنا" : "Talk to us"}
            </Link>
          </div>
        </div>
      </section>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        h2 { font-size: 20px; font-weight: 700; color: ${colors.text}; margin: 24px 0 10px; }
        ul, ol { padding-${isAr ? "right" : "left"}: 24px; margin-bottom: 16px; }
        li { margin-bottom: 8px; }
        strong { color: ${colors.text}; font-weight: 600; }
      `}</style>
    </div>
  );
}
