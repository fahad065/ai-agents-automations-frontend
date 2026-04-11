"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  Dumbbell,
  ShoppingBag,
  GraduationCap,
  ArrowRight,
  Zap,
  LucideIcon,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  features: string[];
  href: string;
}

const automations: ModuleCardProps[] = [
  {
    icon: Zap,
    title: "YouTube Automation",
    description:
      "Generate videos, extract shorts, create thumbnails and upload to YouTube automatically on a schedule.",
    badge: "Live",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
    features: [
      "Trend discovery",
      "AI scriptwriting",
      "Seedance video gen",
      "Auto upload",
    ],
    href: "/automations/youtube",
  },
  {
    icon: TrendingUp,
    title: "Social Media Automation",
    description:
      "Create and schedule content across Instagram, Twitter, LinkedIn and TikTok automatically.",
    badge: "Coming soon",
    badgeColor: "bg-white/5 text-zinc-500 border-zinc-700/30",
    features: [
      "Multi-platform",
      "AI captions",
      "Hashtag research",
      "Best time posting",
    ],
    href: "/automations/social",
  },
];

const agents: ModuleCardProps[] = [
  {
    icon: Brain,
    title: "Dark Psychology Agent",
    description:
      "Specialised AI agent trained on dark psychology content strategy, hooks, and audience retention.",
    badge: "Live",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
    features: [
      "Script writing",
      "Trend analysis",
      "Hook generation",
      "SEO optimization",
    ],
    href: "/agents/dark-psychology",
  },
  {
    icon: Dumbbell,
    title: "Fitness Coach Agent",
    description:
      "AI fitness coaching — workout plans, nutrition advice, and progress tracking content.",
    badge: "Coming soon",
    badgeColor: "bg-white/5 text-zinc-500 border-zinc-700/30",
    features: [
      "Workout plans",
      "Nutrition advice",
      "Progress tracking",
      "Video scripts",
    ],
    href: "/agents/fitness",
  },
  {
    icon: ShoppingBag,
    title: "Marketing Agent",
    description:
      "End-to-end marketing campaigns — copy, creatives, scheduling, and performance analysis.",
    badge: "Coming soon",
    badgeColor: "bg-white/5 text-zinc-500 border-zinc-700/30",
    features: ["Ad copy", "Email campaigns", "A/B testing", "Analytics"],
    href: "/agents/marketing",
  },
  {
    icon: GraduationCap,
    title: "Education Agent",
    description:
      "Create educational content, course materials, and explainer videos automatically.",
    badge: "Coming soon",
    badgeColor: "bg-white/5 text-zinc-500 border-zinc-700/30",
    features: [
      "Course creation",
      "Quiz generation",
      "Explainer videos",
      "Slide decks",
    ],
    href: "/agents/education",
  },
];

function ModuleCard({
  icon: IconComponent,
  title,
  description,
  badge,
  badgeColor,
  features,
  href,
}: ModuleCardProps) {
  return (
    <Link href={href} className="block group">
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding: "24px",
          height: "100%",
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        className="group-hover:border-brand-500/30"
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "rgba(109,40,217,0.15)",
              border: "1px solid rgba(109,40,217,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconComponent size={18} color="#9966ff" />
          </div>
          <span
            className={badgeColor}
            style={{
              fontSize: "11px",
              padding: "3px 10px",
              borderRadius: "9999px",
              border: "1px solid",
              fontWeight: 500,
            }}
          >
            {badge}
          </span>
        </div>

        <h3
          style={{
            color: "white",
            fontWeight: 600,
            fontSize: "17px",
            marginBottom: "8px",
            transition: "color 0.2s",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: "#707070",
            fontSize: "13px",
            lineHeight: 1.6,
            marginBottom: "16px",
          }}
        >
          {description}
        </p>

        <ul style={{ marginBottom: "20px", listStyle: "none" }}>
          {features.map((f) => (
            <li
              key={f}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#505050",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  background: "#6d28d9",
                  flexShrink: 0,
                }}
              />
              {f}
            </li>
          ))}
        </ul>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "12px",
            color: "#9966ff",
          }}
        >
          Learn more <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}

export function MarketplaceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const automationsRef = useRef<HTMLDivElement>(null);
  const agentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 85%",
        },
      });

      if (automationsRef.current?.children) {
        gsap.from(Array.from(automationsRef.current.children), {
          opacity: 0,
          y: 40,
          duration: 0.6,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: automationsRef.current,
            start: "top 85%",
          },
        });
      }

      if (agentsRef.current?.children) {
        gsap.from(Array.from(agentsRef.current.children), {
          opacity: 0,
          y: 40,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: agentsRef.current,
            start: "top 85%",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="marketplace"
      ref={sectionRef}
      style={{ padding: "96px 16px", background: "#050505" }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div ref={titleRef} style={{ textAlign: "center", marginBottom: "64px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              border: "1px solid rgba(109,40,217,0.3)",
              background: "rgba(109,40,217,0.1)",
              color: "#9966ff",
              padding: "4px 14px",
              borderRadius: "9999px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            <Zap size={12} />
            Marketplace
          </div>
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              color: "white",
              marginBottom: "16px",
            }}
          >
            Automations & AI Agents
          </h2>
          <p
            style={{
              color: "#505050",
              fontSize: "17px",
              maxWidth: "560px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Pick the modules that fit your workflow. Each one is a complete
            AI-powered system — plug in your niche and let it run.
          </p>
        </div>

        {/* Automations */}
        <div style={{ marginBottom: "64px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ color: "white", fontSize: "18px", fontWeight: 600 }}>
              Automations
            </h3>
            <div
              style={{
                height: "1px",
                flex: 1,
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <Link
              href="/automations"
              style={{
                fontSize: "13px",
                color: "#9966ff",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div
            ref={automationsRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {automations.map((item) => (
              <ModuleCard key={item.title} {...item} />
            ))}
          </div>
        </div>

        {/* Agents */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ color: "white", fontSize: "18px", fontWeight: 600 }}>
              AI Agents
            </h3>
            <div
              style={{
                height: "1px",
                flex: 1,
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <Link
              href="/agents"
              style={{
                fontSize: "13px",
                color: "#9966ff",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div
            ref={agentsRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {agents.map((item) => (
              <ModuleCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}