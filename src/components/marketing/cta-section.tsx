"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Bot, Zap, Shield } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

gsap.registerPlugin(ScrollTrigger);

export function CtaSection() {
  const { colors } = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0, y: 30, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section style={{ padding: "96px 24px", background: colors.bg }}>
      <div
        ref={ref}
        style={{
          maxWidth: "800px", margin: "0 auto", textAlign: "center",
          border: `1px solid rgba(124,58,237,0.2)`,
          background: "rgba(124,58,237,0.04)",
          borderRadius: "24px", padding: "clamp(40px, 6vw, 72px) clamp(24px, 5vw, 64px)",
          boxShadow: "0 0 80px rgba(124,58,237,0.08)",
        }}
      >
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          border: "1px solid rgba(124,58,237,0.3)",
          background: "rgba(124,58,237,0.08)",
          color: "#a78bfa", padding: "5px 14px",
          borderRadius: "9999px", fontSize: "12px",
          fontWeight: 500, marginBottom: "20px",
        }}>
          <Zap size={11} /> Start in minutes
        </div>

        <h2 style={{
          fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700,
          color: colors.text, marginBottom: "16px", lineHeight: 1.15,
        }}>
          Ready to automate your business?
        </h2>
        <p style={{
          color: colors.textMuted, fontSize: "clamp(15px, 2vw, 18px)",
          lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 40px",
        }}>
          Deploy your first AI agent in minutes. No technical knowledge required.
          Join thousands of businesses already running on NexAgent.
        </p>

        <div style={{
          display: "flex", flexWrap: "wrap",
          gap: "12px", justifyContent: "center", marginBottom: "32px",
        }}>
          <Link href="/auth/signup" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", padding: "14px 32px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 24px rgba(124,58,237,0.35)",
          }}>
            Get started free <ArrowRight size={16} />
          </Link>
          <Link href="/automations" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: `1px solid ${colors.border}`,
            color: colors.textMuted, padding: "14px 32px",
            borderRadius: "10px", fontSize: "15px",
            fontWeight: 500, textDecoration: "none",
            background: colors.bgCard,
          }}>
            <Bot size={15} /> Browse automations
          </Link>
        </div>

        <div style={{
          display: "flex", flexWrap: "wrap",
          gap: "20px", justifyContent: "center",
        }}>
          {["No credit card required", "Cancel anytime", "SOC 2 compliant"].map((item) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", gap: "6px",
              fontSize: "13px", color: colors.textMuted,
            }}>
              <Shield size={12} color="#7c3aed" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}