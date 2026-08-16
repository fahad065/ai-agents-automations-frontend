"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { industryName, industryDesc } from "@/lib/translations";

gsap.registerPlugin(ScrollTrigger);

const NICHES = [
  {
    icon: "🎬", label: "Content & Social",
    slug: "content_social", color: "#7c3aed",
    agents: ["YouTube Automation", "Instagram Reels Agent", "TikTok Agent", "Arabic Content Agent", "Podcast Agent"],
    desc: "Post to every platform, every day, in any language — without lifting a finger.",
  },
  {
    icon: "🏡", label: "Real Estate",
    slug: "real_estate", color: "#3b82f6",
    agents: ["WhatsApp Sales Agent", "Real Estate Pipeline", "Lead Generation"],
    desc: "Qualify leads on WhatsApp and follow up 24/7 across UAE and Kenyan markets.",
  },
  {
    icon: "📣", label: "Marketing",
    slug: "marketing", color: "#f59e0b",
    agents: ["Lead Generation Automation", "Email Marketing", "Content Repurposing"],
    desc: "Build automated funnels that generate, nurture and convert leads at scale.",
  },
  {
    icon: "🛒", label: "E-commerce",
    slug: "ecommerce_retail", color: "#ef4444",
    agents: ["Product Description AI", "Review Responder", "Social Commerce Agent"],
    desc: "Automate product listings, customer reviews and social selling.",
  },
  {
    icon: "🏥", label: "Healthcare",
    slug: "healthcare", color: "#22c55e",
    agents: ["Patient Communication", "Appointment Reminder", "Health Content Agent"],
    desc: "HIPAA-aware agents for patient outreach and healthcare content.",
  },
  {
    icon: "👥", label: "HR & Recruitment",
    slug: "hr_recruitment", color: "#8b5cf6",
    agents: ["Job Posting Agent", "Candidate Screener", "Onboarding Automation"],
    desc: "Post jobs, screen CVs and onboard new hires — all automated.",
  },
  {
    icon: "🏨", label: "Hospitality",
    slug: "hospitality", color: "#06b6d4",
    agents: ["Guest Communication", "Review Management", "Social Media Agent"],
    desc: "Delight guests before, during and after their stay with automated outreach.",
  },
  {
    icon: "🎓", label: "Education",
    slug: "education", color: "#f97316",
    agents: ["Course Marketing", "Student Engagement", "Content Creator"],
    desc: "Grow enrollments and keep students engaged with AI-driven content.",
  },
  {
    icon: "🚚", label: "Logistics",
    slug: "logistics", color: "#84cc16",
    agents: ["Shipment Notifications", "Client Reporting", "Route Optimization Agent"],
    desc: "Keep clients informed and operations moving without manual updates.",
  },
  {
    icon: "💹", label: "Finance",
    slug: "finance", color: "#10b981",
    agents: ["Market Digest Agent", "Client Reporting", "Compliance Content"],
    desc: "Automated market insights, reports and compliant financial content.",
  },
  {
    icon: "🌾", label: "Agriculture",
    slug: "agriculture", color: "#a3e635",
    agents: ["Crop Advice Agent", "Market Price Tracker", "Farmer Outreach"],
    desc: "Reach rural markets with localised, actionable agricultural intelligence.",
  },
  {
    icon: "⚙️", label: "Internal Tools",
    slug: "internal_copilot", color: "#a78bfa",
    agents: ["Customer Support Agent", "Internal Copilot", "Knowledge Base Bot"],
    desc: "AI copilots that support your internal teams and customer service.",
  },
];

export function NichesSection() {
  const { colors, isDark } = useTheme();
  const { lang, isAr } = useLang();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: titleRef.current, start: "top 90%", once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const hoverBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";

  return (
    <section ref={sectionRef} dir={isAr ? "rtl" : "ltr"} style={{
      padding: "100px 24px",
      background: colors.bg,
      borderTop: `1px solid ${border}`,
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <div ref={titleRef} style={{ marginBottom: "64px", maxWidth: "560px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            border: "1px solid rgba(124,58,237,0.3)",
            background: "rgba(124,58,237,0.08)",
            color: "#a78bfa", padding: "5px 14px",
            borderRadius: "9999px", fontSize: "12px",
            fontWeight: 500, marginBottom: "20px",
          }}>
            {isAr ? "12 قطاعاً، منصة واحدة" : "12 industries, one platform"}
          </span>
          <h2 style={{
            fontSize: "clamp(30px, 4.5vw, 48px)", fontWeight: 800,
            color: colors.text, letterSpacing: "-0.03em", lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            {isAr ? "منصة واحدة،" : "One platform,"}
            <br />
            <span style={{
              background: "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>{isAr ? "12 قطاعاً." : "12 industries."}</span>
          </h2>
          <p style={{ fontSize: "15px", color: colors.textMuted, lineHeight: 1.65 }}>
            {isAr
              ? "وكلاء جاهزون مصممون لقطاعك — وليس أدوات عامة تحتاج لتخصيصها بنفسك."
              : "Pre-built agents tailored to your industry — not generic tools you have to customise yourself."
            }
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "10px",
        }}>
          {NICHES.map((n) => {
            const isHovered = hovered === n.slug;
            return (
              <Link
                href={`/industries/${n.slug}`}
                className="niche-card"
                key={n.slug}
                onMouseEnter={() => setHovered(n.slug)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "block", textDecoration: "none",
                  padding: "20px", borderRadius: "14px",
                  background: isHovered ? `${n.color}08` : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"),
                  border: `1px solid ${isHovered ? n.color + "30" : border}`,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isHovered ? `0 0 30px ${n.color}10` : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "9px",
                    background: `${n.color}12`, border: `1px solid ${n.color}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", flexShrink: 0,
                  }}>
                    {n.icon}
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text }}>{industryName(n.slug, lang)}</p>
                </div>

                <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "12px" }}>
                  {industryDesc(n.slug, lang) || n.desc}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {n.agents.slice(0, 3).map(a => (
                    <span key={a} style={{
                      fontSize: "10px", padding: "2px 7px", borderRadius: "4px",
                      background: `${n.color}10`, color: n.color, fontWeight: 500,
                      border: `1px solid ${n.color}20`,
                    }}>{a}</span>
                  ))}
                  {n.agents.length > 3 && (
                    <span style={{
                      fontSize: "10px", padding: "2px 7px", borderRadius: "4px",
                      background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                      color: colors.textMuted,
                    }}>+{n.agents.length - 3} {isAr ? "أكثر" : "more"}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Link href="/industries" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: `1px solid ${border}`,
            color: colors.textMuted, padding: "12px 24px", borderRadius: "9px",
            fontSize: "14px", fontWeight: 500, textDecoration: "none",
            background: "transparent",
            transition: "all 0.2s",
          }}>
            {isAr ? "تصفح كل القطاعات" : "Browse all industries"} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
