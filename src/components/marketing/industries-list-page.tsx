"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr, industryName, industryDesc } from "@/lib/translations";
import { ArrowRight, Bot, Zap } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

const INDUSTRIES = [
  { slug: "content_social",   icon: "🎬", label: "Content & Social",  color: "#7c3aed", agents: ["YouTube Automation", "Instagram Reels Agent", "Arabic Content Agent"], desc: "Post to every platform, every day, in any language — without lifting a finger." },
  { slug: "real_estate",      icon: "🏡", label: "Real Estate",        color: "#3b82f6", agents: ["WhatsApp Sales Agent", "Real Estate Pipeline", "Lead Generation"], desc: "Qualify leads on WhatsApp and follow up 24/7 across UAE and Kenyan markets." },
  { slug: "marketing",        icon: "📣", label: "Marketing",          color: "#f59e0b", agents: ["Lead Generation Automation", "Email Marketing", "Content Repurposing"], desc: "Build automated funnels that generate, nurture and convert leads at scale." },
  { slug: "ecommerce_retail", icon: "🛒", label: "E-commerce",         color: "#ef4444", agents: ["Product Description AI", "Review Responder", "Social Commerce Agent"], desc: "Automate product listings, customer reviews and social selling." },
  { slug: "healthcare",       icon: "🏥", label: "Healthcare",         color: "#22c55e", agents: ["Patient Communication", "Appointment Reminder", "Health Content Agent"], desc: "HIPAA-aware agents for patient outreach and healthcare content." },
  { slug: "hr_recruitment",   icon: "👥", label: "HR & Recruitment",   color: "#8b5cf6", agents: ["Job Posting Agent", "Candidate Screener", "Onboarding Automation"], desc: "Post jobs, screen CVs and onboard new hires — all automated." },
  { slug: "hospitality",      icon: "🏨", label: "Hospitality",        color: "#06b6d4", agents: ["Guest Communication", "Review Management", "Social Media Agent"], desc: "Delight guests before, during and after their stay." },
  { slug: "education",        icon: "🎓", label: "Education",          color: "#f97316", agents: ["Course Marketing", "Student Engagement", "Content Creator"], desc: "Grow enrollments and keep students engaged with AI-driven content." },
  { slug: "logistics",        icon: "🚚", label: "Logistics",          color: "#84cc16", agents: ["Shipment Notifications", "Client Reporting", "Route Optimization"], desc: "Keep clients informed and operations moving without manual updates." },
  { slug: "finance",          icon: "💹", label: "Finance",            color: "#10b981", agents: ["Market Digest Agent", "Client Reporting", "Compliance Content"], desc: "Automated market insights, reports and compliant financial content." },
  { slug: "agriculture",      icon: "🌾", label: "Agriculture",        color: "#84cc16", agents: ["Crop Advice Agent", "Market Price Tracker", "Farmer Outreach"], desc: "Reach rural markets with localised, actionable agricultural intelligence." },
  { slug: "internal_copilot", icon: "⚙️", label: "Internal Tools",    color: "#a78bfa", agents: ["Customer Support Agent", "Internal Copilot", "Knowledge Base Bot"], desc: "AI copilots that support your internal teams and customer service." },
];

export function IndustriesListPage() {
  const { colors, isDark } = useTheme();
  const { lang, isAr } = useLang();
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }} dir={isAr ? "rtl" : "ltr"}>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 100px", position: "relative" }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "700px", height: "400px",
          background: "rgba(124,58,237,0.06)",
          borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none",
        }} />

        {/* Breadcrumb */}
        <div style={{ paddingTop: "110px", marginBottom: "32px", position: "relative" }}>
          <BreadcrumbNav items={[{ label: "Industries" }]} />
        </div>

        {/* Hero */}
        <div style={{ marginBottom: "56px", textAlign: "center", position: "relative" }}>
          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 62px)", fontWeight: 800,
            color: colors.text, marginBottom: "16px",
            letterSpacing: "-0.04em", lineHeight: 1.05,
          }}>
            {isAr ? "ذكاء اصطناعي مصمم لقطاعك." : "AI built for your industry."}
            <br />
            <span style={{
              backgroundImage: "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>{isAr ? "ليس للتقنية فحسب." : "Not just for tech."}</span>
          </h1>
          <p style={{ fontSize: "17px", color: colors.textMuted, lineHeight: 1.7, maxWidth: "500px", margin: "0 auto" }}>
            {tr("industriesSubtitle", lang)}
          </p>
        </div>

      {/* Grid */}
      <div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}>
          {INDUSTRIES.map((ind) => (
            <IndustryCard key={ind.slug} industry={ind} isDark={isDark} colors={colors} border={border} lang={lang} isAr={isAr} />
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

function IndustryCard({ industry, isDark, colors, border, lang, isAr }: {
  industry: typeof INDUSTRIES[0];
  isDark: boolean;
  colors: { text: string; textMuted: string };
  border: string;
  lang: import("@/lib/translations").Lang;
  isAr: boolean;
}) {
  const label = industryName(industry.slug, lang);
  const desc = industryDesc(industry.slug, lang) || industry.desc;

  return (
    <Link href={`/industries/${industry.slug}`} style={{ textDecoration: "none" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = `${industry.color}35`;
        el.style.background = `${industry.color}06`;
        el.style.boxShadow = `0 0 28px ${industry.color}12`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = border;
        el.style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)";
        el.style.boxShadow = "none";
      }}
    >
      <div style={{
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
        border: `1px solid ${border}`,
        borderRadius: "16px", padding: "24px",
        transition: "all 0.2s", height: "100%",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
          <div style={{
            width: "46px", height: "46px", borderRadius: "11px",
            background: `${industry.color}12`, border: `1px solid ${industry.color}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "21px", flexShrink: 0,
          }}>
            {industry.icon}
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: colors.text, marginBottom: "3px" }}>
              {label}
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: industry.color }}>
                <Bot size={10} /> Agents
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "11px", color: industry.color, opacity: 0.7 }}>
                <Zap size={10} /> Automations
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "14px", flex: 1 }}>
          {desc}
        </p>

        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "14px" }}>
          {industry.agents.slice(0, 3).map((a) => (
            <span key={a} style={{
              fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
              background: `${industry.color}10`, color: industry.color,
              border: `1px solid ${industry.color}20`,
            }}>
              {a}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: industry.color, fontSize: "12px", fontWeight: 600 }}>
          {tr("viewBundle", lang)} <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}
