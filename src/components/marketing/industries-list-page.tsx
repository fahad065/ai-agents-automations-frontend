"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { tr, industryName, industryDesc } from "@/lib/translations";
import { ArrowRight, Bot, Zap } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

const INDUSTRIES = [
  { slug: "content_social",   icon: "🎬", label: "Content & Social",  color: "#7c3aed", agents: ["YouTube Automation", "Instagram Reels Agent", "Arabic Content Agent"], desc: "Post to every platform, every day, in any language — without lifting a finger." },
  { slug: "real_estate",      icon: "🏡", label: "Real Estate",        color: "#3b82f6", agents: ["WhatsApp Sales Agent", "Real Estate Pipeline", "Lead Generation"], desc: "Qualify leads on WhatsApp and follow up 24/7 across UAE, Kenya and international markets." },
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
  const { lang, isAr } = useLang();

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative mx-auto max-w-[1200px] overflow-hidden px-6 pb-25">
        {/* Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[120px]" />

        {/* Breadcrumb */}
        <div className="relative mb-8 pt-27.5">
          <BreadcrumbNav items={[{ label: "Industries" }]} />
        </div>

        {/* Hero */}
        <div className="relative mb-14 text-center">
          <h1 className="mb-4 text-[clamp(36px,5.5vw,62px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
            {isAr ? "ذكاء اصطناعي مصمم لقطاعك." : "AI built for your industry."}
            <br />
            <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
              {isAr ? "ليس للتقنية فحسب." : "Not just for tech."}
            </span>
          </h1>
          <p className="mx-auto max-w-[500px] text-[17px] leading-[1.7] text-muted-foreground">
            {tr("industriesSubtitle", lang)}
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {INDUSTRIES.map((ind) => (
            <IndustryCard key={ind.slug} industry={ind} lang={lang} isAr={isAr} />
          ))}
        </div>
      </div>
    </div>
  );
}

function IndustryCard({ industry, lang, isAr }: {
  industry: typeof INDUSTRIES[0];
  lang: import("@/lib/translations").Lang;
  isAr: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const label = industryName(industry.slug, lang);
  const desc = industryDesc(industry.slug, lang) || industry.desc;

  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="no-underline"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex h-full flex-col rounded-2xl border p-6 transition-all"
        style={{
          background: hovered ? `${industry.color}06` : undefined,
          borderColor: hovered ? industry.color + "35" : undefined,
          boxShadow: hovered ? `0 0 28px ${industry.color}12` : undefined,
        }}
      >
        <div className="mb-3.5 flex items-center gap-3">
          <div
            className="flex size-11.5 shrink-0 items-center justify-center rounded-[11px] border text-[21px]"
            style={{ background: `${industry.color}12`, borderColor: `${industry.color}25` }}
          >
            {industry.icon}
          </div>
          <div>
            <h3 className="mb-0.75 text-[15px] font-bold text-foreground">{label}</h3>
            <div className="flex gap-2.5">
              <span className="flex items-center gap-0.75 text-[11px]" style={{ color: industry.color }}>
                <Bot size={10} /> Agents
              </span>
              <span className="flex items-center gap-0.75 text-[11px] opacity-70" style={{ color: industry.color }}>
                <Zap size={10} /> Automations
              </span>
            </div>
          </div>
        </div>

        <p className="mb-3.5 flex-1 text-[13px] leading-relaxed text-muted-foreground">{desc}</p>

        <div className="mb-3.5 flex flex-wrap gap-1.25">
          {industry.agents.slice(0, 3).map((a) => (
            <span
              key={a}
              className="rounded px-2 py-0.5 text-[10px]"
              style={{ background: `${industry.color}10`, color: industry.color, border: `1px solid ${industry.color}20` }}
            >
              {a}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: industry.color }}>
          {tr("viewBundle", lang)} <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}
