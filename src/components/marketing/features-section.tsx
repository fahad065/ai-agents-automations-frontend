"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import {
  Search, Wand2, Upload, BarChart3,
  ChevronRight, Play,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    step: "01",
    icon: Search,
    color: "#7c3aed",
    title: "Pick your automation",
    description: "Browse our marketplace of pre-built AI automations and agents. Each one is ready to deploy — no setup required.",
    detail: "Choose from YouTube automation, social media scheduling, email marketing, e-commerce management and more. Every automation comes pre-configured with best practices built in.",
    visual: {
      type: "cards",
      items: ["YouTube Automation", "Social Media Agent", "Email Marketing", "E-commerce Bot"],
    },
  },
  {
    step: "02",
    icon: Wand2,
    color: "#3b82f6",
    title: "Configure your agent",
    description: "Tell the agent your niche, goals and preferences. It learns your brand voice and adapts to your workflow.",
    detail: "Connect your accounts, set your schedule, define your target audience. The agent handles everything else — content research, creation, optimization and posting.",
    visual: {
      type: "config",
      items: ["Niche: Dark Psychology", "Schedule: Daily 8am", "Voice: Authoritative", "Platform: YouTube"],
    },
  },
  {
    step: "03",
    icon: Upload,
    color: "#22c55e",
    title: "Deploy and run",
    description: "Press run. Your agent starts working immediately — generating content, uploading, scheduling and engaging.",
    detail: "Everything happens automatically. You get email notifications at each milestone. Open your laptop once a week to review — the agent handles the rest 24/7.",
    visual: {
      type: "progress",
      items: ["Generating content", "Creating visuals", "Writing metadata", "Uploading & scheduling"],
    },
  },
  {
    step: "04",
    icon: BarChart3,
    color: "#f59e0b",
    title: "Track and optimise",
    description: "Monitor performance across all your agents from one dashboard. See what's working and scale it.",
    detail: "Real-time analytics on views, engagement, revenue and ROI. The agent learns from performance data and continuously improves its output over time.",
    visual: {
      type: "stats",
      items: ["Views: 48.2K", "Revenue: $284", "Engagement: 6.8%", "Growth: +142%"],
    },
  },
];

function VisualPanel({
  visual, color, active,
}: {
  visual: (typeof steps)[0]["visual"];
  color: string;
  active: boolean;
}) {
  const { colors } = useTheme();

  return (
    <div style={{
      background: colors.bgCard,
      border: `1px solid ${active ? color + "40" : colors.border}`,
      borderRadius: "14px", padding: "24px",
      transition: "all 0.4s",
      boxShadow: active ? `0 0 30px ${color}15` : "none",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "10px",
      }}>
        {visual.items.map((item, i) => (
          <div key={i} style={{
            background: active ? `${color}10` : colors.bgSecondary,
            border: `1px solid ${active ? color + "25" : colors.border}`,
            borderRadius: "8px", padding: "12px",
            fontSize: "12px", fontWeight: 500,
            color: active ? color : colors.textMuted,
            transition: "all 0.3s",
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: active ? color : colors.textSubtle,
              flexShrink: 0,
            }} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const { colors } = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
      });
    }, sectionRef);

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3500);

    return () => {
      ctx.revert();
      clearInterval(interval);
    };
  }, []);

  const active = steps[activeStep];

  return (
    <section
      ref={sectionRef}
      style={{
        padding: "96px 24px",
        background: colors.bg,
        borderTop: `1px solid ${colors.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        <div ref={titleRef} style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            border: "1px solid rgba(124,58,237,0.3)",
            background: "rgba(124,58,237,0.08)",
            color: "#a78bfa", padding: "4px 14px",
            borderRadius: "9999px", fontSize: "12px",
            fontWeight: 500, marginBottom: "16px",
          }}>
            <Play size={11} /> How it works
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700,
            color: colors.text, marginBottom: "12px",
          }}>
            From zero to automated in 4 steps
          </h2>
          <p style={{
            color: colors.textMuted, fontSize: "clamp(15px, 2vw, 17px)",
            maxWidth: "520px", margin: "0 auto", lineHeight: 1.6,
          }}>
            No technical knowledge needed. Deploy your first agent in under 10 minutes.
          </p>
        </div>

        {/* Steps layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px",
          alignItems: "start",
        }}>

          {/* Left — step list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {steps.map((step, i) => {
              const IconComponent = step.icon;
              const isActive = i === activeStep;
              return (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(i)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "16px",
                    padding: "18px 20px", borderRadius: "12px",
                    background: isActive ? `${step.color}10` : "transparent",
                    border: `1px solid ${isActive ? step.color + "30" : "transparent"}`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.3s", width: "100%",
                  }}
                >
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: isActive ? `${step.color}20` : colors.bgCard,
                    border: `1px solid ${isActive ? step.color + "40" : colors.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.3s",
                  }}>
                    <IconComponent size={18} color={isActive ? step.color : colors.textMuted} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 700,
                        color: isActive ? step.color : colors.textSubtle,
                        fontFamily: "monospace",
                      }}>
                        {step.step}
                      </span>
                      <span style={{
                        fontSize: "14px", fontWeight: 600,
                        color: isActive ? colors.text : colors.textMuted,
                      }}>
                        {step.title}
                      </span>
                    </div>
                    <p style={{
                      fontSize: "13px", color: colors.textMuted,
                      lineHeight: 1.5,
                      maxHeight: isActive ? "80px" : "0",
                      overflow: "hidden",
                      transition: "max-height 0.4s ease",
                    }}>
                      {step.description}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    color={isActive ? step.color : colors.textSubtle}
                    style={{ flexShrink: 0, marginTop: "4px", transition: "color 0.3s" }}
                  />
                </button>
              );
            })}
          </div>

          {/* Right — visual panel */}
          <div>
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: "16px", padding: "28px",
              marginBottom: "16px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: `${active.color}15`,
                  border: `1px solid ${active.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <active.icon size={20} color={active.color} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "2px" }}>
                    Step {active.step}
                  </p>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.text }}>
                    {active.title}
                  </h3>
                </div>
              </div>
              <p style={{
                fontSize: "14px", color: colors.textMuted,
                lineHeight: 1.7, marginBottom: "20px",
              }}>
                {active.detail}
              </p>
              <VisualPanel visual={active.visual} color={active.color} active />
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "4px",
                    width: i === activeStep ? "24px" : "6px",
                    borderRadius: "2px",
                    background: i === activeStep ? active.color : colors.border,
                    transition: "all 0.3s",
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveStep(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}