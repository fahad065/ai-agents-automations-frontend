"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { industryName, industryDesc } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    agents: ["WhatsApp Sales Agent", "Real Estate Pipeline", "Lead Generation", "Real Estate Lead Bot"],
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
    agents: ["Product Description AI", "Review Responder", "Social Commerce Agent", "E-commerce Support Bot"],
    desc: "Automate product listings, customer reviews and social selling.",
  },
  {
    icon: "🏥", label: "Healthcare",
    slug: "healthcare", color: "#22c55e",
    agents: ["Patient Communication", "Appointment Reminder", "Health Content Agent", "Clinic Appointment Bot"],
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
    agents: ["Guest Communication", "Review Management", "Social Media Agent", "Restaurant Chatbot", "Hotel Concierge Bot"],
    desc: "Delight guests before, during and after their stay with automated outreach.",
  },
  {
    icon: "🎓", label: "Education",
    slug: "education", color: "#f97316",
    agents: ["Course Marketing", "Student Engagement", "Content Creator", "Education Enrolment Bot"],
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
  const { isDark } = useTheme();
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

  return (
    <section ref={sectionRef} dir={isAr ? "rtl" : "ltr"} className={cn("border-t bg-background px-6 py-25", isDark ? "border-white/7" : "border-black/7")}>
      <div className="mx-auto max-w-[1200px]">
        <div ref={titleRef} className="mb-16 max-w-[560px]">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-3.5 py-1.5 text-xs font-medium text-primary">
            {isAr ? "12 قطاعاً، منصة واحدة" : "12 industries, one platform"}
          </span>
          <h2 className="mb-4 text-[clamp(30px,4.5vw,48px)] leading-[1.1] font-extrabold tracking-[-0.03em] text-foreground">
            {isAr ? "منصة واحدة،" : "One platform,"}
            <br />
            <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
              {isAr ? "12 قطاعاً." : "12 industries."}
            </span>
          </h2>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            {isAr
              ? "وكلاء وأتمتة وشات بوتات جاهزة مصممة لقطاعك — وليس أدوات عامة تحتاج لتخصيصها بنفسك."
              : "Pre-built agents, automations, and chatbots tailored to your industry — not generic tools you have to customise yourself."
            }
          </p>
        </div>

        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {NICHES.map((n) => {
            const isHovered = hovered === n.slug;
            return (
              <Link
                href={`/industries/${n.slug}`}
                className="niche-card block rounded-[14px] border p-5 no-underline transition-all"
                key={n.slug}
                onMouseEnter={() => setHovered(n.slug)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isHovered ? `${n.color}08` : undefined,
                  borderColor: isHovered ? n.color + "30" : undefined,
                  boxShadow: isHovered ? `0 0 30px ${n.color}10` : undefined,
                }}
              >
                <div className="mb-2.5 flex items-center gap-2.5">
                  <div
                    className="flex size-[38px] shrink-0 items-center justify-center rounded-[9px] border text-lg"
                    style={{ background: `${n.color}12`, borderColor: `${n.color}25` }}
                  >
                    {n.icon}
                  </div>
                  <p className="text-sm font-bold text-foreground">{industryName(n.slug, lang)}</p>
                </div>

                <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                  {industryDesc(n.slug, lang) || n.desc}
                </p>

                <div className="flex flex-wrap gap-1">
                  {n.agents.slice(0, 3).map(a => (
                    <span
                      key={a}
                      className="rounded border px-1.75 py-0.5 text-[10px] font-medium"
                      style={{ background: `${n.color}10`, color: n.color, borderColor: `${n.color}20` }}
                    >{a}</span>
                  ))}
                  {n.agents.length > 3 && (
                    <span className={cn("rounded px-1.75 py-0.5 text-[10px] text-muted-foreground", isDark ? "bg-white/6" : "bg-black/5")}>
                      +{n.agents.length - 3} {isAr ? "أكثر" : "more"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button nativeButton={false} variant="outline" render={<Link href="/industries" />} className="gap-2">
            {isAr ? "تصفح كل القطاعات" : "Browse all industries"} <ArrowRight size={14} />
          </Button>
        </div>
      </div>
    </section>
  );
}
