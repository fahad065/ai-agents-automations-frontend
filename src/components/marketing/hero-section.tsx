"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ArrowRight, Sparkles, Bot, Zap, BarChart3 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function HeroSection() {
  const { colors, isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const orb1 = useRef<HTMLDivElement>(null);
  const orb2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(orb1.current, { y: -40, x: 20, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(orb2.current, { y: 30, x: -20, duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2 });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.from(badgeRef.current, { opacity: 0, y: 24, duration: 0.6, ease: "power3.out" })
        .from(h1Ref.current, { opacity: 0, y: 40, duration: 0.9, ease: "power3.out" }, "-=0.3")
        .from(subRef.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" }, "-=0.4")
        .from(ctaRef.current, { opacity: 0, y: 24, duration: 0.6, ease: "power3.out" }, "-=0.4")
        .from(mockupRef.current, { opacity: 0, y: 40, duration: 0.8, ease: "power3.out" }, "-=0.3");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", background: colors.bg, paddingTop: "80px",
    }}>
      {/* Background orbs */}
      <div ref={orb1} style={{
        position: "absolute", top: "15%", left: "10%",
        width: "600px", height: "600px",
        background: isDark ? "rgba(124,58,237,0.07)" : "rgba(124,58,237,0.05)",
        borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none",
      }} />
      <div ref={orb2} style={{
        position: "absolute", bottom: "10%", right: "10%",
        width: "500px", height: "500px",
        background: isDark ? "rgba(167,139,250,0.05)" : "rgba(167,139,250,0.04)",
        borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none",
      }} />

      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }} />

      <div style={{
        position: "relative", zIndex: 10,
        maxWidth: "860px", margin: "0 auto",
        padding: "40px 24px 80px", textAlign: "center",
      }}>

        {/* Badge */}
        <div ref={badgeRef} style={{ marginBottom: "28px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: "1px solid rgba(124,58,237,0.35)",
            background: "rgba(124,58,237,0.08)",
            color: "#a78bfa",
            padding: "7px 18px", borderRadius: "9999px",
            fontSize: "13px", fontWeight: 500,
          }}>
            <Sparkles size={13} />
            Introducing NexAgent — AI automation for everyone
          </span>
        </div>

        {/* Headline */}
        <h1 ref={h1Ref} style={{
          fontSize: "clamp(40px, 7vw, 80px)",
          fontWeight: 800, lineHeight: 1.08,
          letterSpacing: "-0.03em",
          color: colors.text, marginBottom: "24px",
        }}>
          Automate your entire
          <br />
          <span style={{
            background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            business with AI agents
          </span>
        </h1>

        {/* Subtitle */}
        <p ref={subRef} style={{
          fontSize: "18px", lineHeight: 1.7,
          color: colors.textMuted,
          maxWidth: "580px", margin: "0 auto 40px",
        }}>
          Deploy intelligent agents that handle content creation, social media,
          marketing, and more — running 24/7 without you lifting a finger.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} style={{
          display: "flex", flexWrap: "wrap",
          gap: "12px", justifyContent: "center", marginBottom: "40px",
        }}>
          <Link href="/auth/signup" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", padding: "14px 32px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 24px rgba(124,58,237,0.35)",
          }}>
            Start for free <ArrowRight size={16} />
          </Link>
          <Link href="#automations" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: `1px solid ${colors.border}`,
            color: colors.textMuted, padding: "14px 32px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 500, textDecoration: "none",
            background: colors.bgCard,
          }}>
            Explore agents
          </Link>
        </div>

        {/* Trust badges */}
        <p style={{ fontSize: "13px", color: colors.textSubtle, marginBottom: "64px" }}>
          No credit card required · Cancel anytime · 98% pipeline success rate
        </p>

        {/* Dashboard mockup */}
        <div ref={mockupRef} style={{
          border: `1px solid ${colors.border}`,
          borderRadius: "16px",
          background: colors.bgCard,
          padding: "6px",
          boxShadow: isDark
            ? "0 0 80px rgba(124,58,237,0.12), 0 32px 64px rgba(0,0,0,0.4)"
            : "0 0 80px rgba(124,58,237,0.08), 0 32px 64px rgba(0,0,0,0.08)",
        }}>
          {/* Fake browser bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 14px",
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840" }} />
            <div style={{
              flex: 1, height: "24px", borderRadius: "6px",
              background: colors.bgSecondary,
              margin: "0 12px",
              display: "flex", alignItems: "center",
              paddingLeft: "10px",
            }}>
              <span style={{ fontSize: "11px", color: colors.textSubtle }}>
                app.nexagent.ai/dashboard
              </span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div style={{
            padding: "24px",
            background: isDark ? "#0d0d0d" : "#f8f8f8",
            borderRadius: "10px", minHeight: "340px",
          }}>

            {/* Top stats row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px", marginBottom: "20px",
            }}>
              {[
                { label: "Active agents", value: "12", icon: Bot, color: "#7c3aed" },
                { label: "Tasks completed", value: "4,821", icon: Zap, color: "#22c55e" },
                { label: "Hours saved", value: "382h", icon: BarChart3, color: "#3b82f6" },
                { label: "Success rate", value: "98.2%", icon: BarChart3, color: "#f59e0b" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "10px", padding: "14px",
                }}>
                  <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "6px" }}>
                    {stat.label}
                  </p>
                  <p style={{ fontSize: "20px", fontWeight: 700, color: colors.text }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Agent list */}
            <div style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: "10px", overflow: "hidden",
            }}>
              {[
                { name: "YouTube Automation", status: "Running", progress: 72, color: "#ef4444" },
                { name: "Social Media Agent", status: "Scheduled", progress: 100, color: "#3b82f6" },
                { name: "Marketing Agent", status: "Running", progress: 45, color: "#22c55e" },
              ].map((agent, i) => (
                <div key={agent.name} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px",
                  borderBottom: i < 2 ? `1px solid ${colors.border}` : "none",
                }}>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    background: `${agent.color}18`,
                    border: `1px solid ${agent.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bot size={14} color={agent.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>
                        {agent.name}
                      </span>
                      <span style={{
                        fontSize: "11px", fontWeight: 500,
                        color: agent.status === "Running" ? "#22c55e" : "#f59e0b",
                      }}>
                        {agent.status}
                      </span>
                    </div>
                    <div style={{
                      height: "4px", borderRadius: "2px",
                      background: colors.bgSecondary, overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%", width: `${agent.progress}%`,
                        background: agent.color, borderRadius: "2px",
                        transition: "width 1s ease",
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
        position: "absolute", bottom: 0, left: 0, right: 0, height: "160px",
        background: `linear-gradient(to top, ${colors.bg}, transparent)`,
        pointerEvents: "none",
      }} />
    </section>
  );
}