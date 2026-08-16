"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Bot, Shield } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";

gsap.registerPlugin(ScrollTrigger);

export function CtaSection() {
  const { colors, isDark } = useTheme();
  const { lang, isAr } = useLang();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: 40, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section style={{
      padding: "100px 24px",
      background: colors.bg,
      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px", height: "600px",
        background: "rgba(124,58,237,0.06)",
        borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none",
      }} />

      <div ref={ref} style={{
        maxWidth: "780px", margin: "0 auto", textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        {/* Badge */}
        <div style={{ marginBottom: "28px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: "1px solid rgba(124,58,237,0.3)",
            background: "rgba(124,58,237,0.07)",
            color: "#a78bfa", padding: "7px 18px",
            borderRadius: "9999px", fontSize: "13px", fontWeight: 500,
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "pulse-dot 2s infinite" }} />
            {tr("ctaBadge", lang)}
          </span>
        </div>

        <h2 style={{
          fontSize: "clamp(34px, 6vw, 60px)", fontWeight: 800,
          color: colors.text, marginBottom: "20px",
          letterSpacing: "-0.04em", lineHeight: 1.05,
        }}>
          {tr("ctaHeadingLine1", lang)}
          <br />
          <span style={{
            background: "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            {tr("ctaHeadingLine2", lang)}
          </span>
        </h2>

        <p style={{
          color: colors.textMuted, fontSize: "clamp(15px, 2vw, 18px)",
          lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 44px",
        }}>
          {tr("ctaSub", lang)}
        </p>

        {/* CTA buttons */}
        <div style={{
          display: "flex", flexWrap: "wrap",
          gap: "12px", justifyContent: "center", marginBottom: "36px",
        }}>
          <Link href="/auth/signup" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", padding: "15px 36px", borderRadius: "10px",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            boxShadow: "0 4px 32px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.3)",
          }}>
            {tr("ctaPrimary", lang)} <ArrowRight size={16} />
          </Link>
          <Link href="/industries" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
            color: colors.textMuted, padding: "15px 28px",
            borderRadius: "10px", fontSize: "15px",
            fontWeight: 500, textDecoration: "none",
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          }}>
            <Bot size={15} /> {tr("ctaSecondaryIndustries", lang)}
          </Link>
        </div>

        {/* Trust signals */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "center" }}>
          {[
            tr("trustNoCard", lang),
            tr("trust30Day", lang),
            tr("trustCancel", lang),
            tr("trustOwnKeys", lang),
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Shield size={12} color="#7c3aed" />
              <span style={{ fontSize: "13px", color: colors.textMuted }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
      `}</style>
    </section>
  );
}
