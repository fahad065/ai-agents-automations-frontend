"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Ahmed K.", role: "YouTube Creator", avatar: "AK", color: "#7c3aed", text: "Generated 30 videos in my first month. Channel went from 0 to 8k views/day in 6 weeks. The ROI is insane.", rating: 5 },
  { name: "Sarah M.", role: "Content Strategist", avatar: "SM", color: "#3b82f6", text: "The AI thumbnails alone are worth it. Flux backgrounds with bold text — looks completely professional.", rating: 5 },
  { name: "Raj P.", role: "Podcast Host", avatar: "RP", color: "#22c55e", text: "I was skeptical but the OpenAI voice for dark psychology content is perfect. Deep, authoritative. Listeners can't tell it's AI.", rating: 5 },
  { name: "Fatima A.", role: "Digital Marketer", avatar: "FA", color: "#f59e0b", text: "Pipeline runs while I sleep. Wake up to an email — video uploaded, 3 shorts scheduled. Completely unreal.", rating: 5 },
  { name: "Marcus L.", role: "E-commerce Owner", avatar: "ML", color: "#ec4899", text: "$1.32 per video. Making $200/month at 15k views/day. Set it up once and forgot about it.", rating: 5 },
  { name: "Zara H.", role: "Business Coach", avatar: "ZH", color: "#a78bfa", text: "Set up in a weekend. First video live on Tuesday. Already getting client enquiries from YouTube.", rating: 5 },
];

function TestimonialCard(t: typeof testimonials[0]) {
  const { colors } = useTheme();
  return (
    <div style={{
      width: "320px", flexShrink: 0,
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: "14px", padding: "22px 24px",
      margin: "0 8px",
    }}>
      {/* Stars */}
      <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} size={13} color="#f59e0b" fill="#f59e0b" />
        ))}
      </div>

      <p style={{
        color: colors.textMuted, fontSize: "14px",
        lineHeight: 1.7, marginBottom: "18px",
      }}>
        &ldquo;{t.text}&rdquo;
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: `${t.color}20`,
          border: `1px solid ${t.color}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 700, color: t.color, flexShrink: 0,
        }}>
          {t.avatar}
        </div>
        <div>
          <p style={{ color: colors.text, fontSize: "13px", fontWeight: 600 }}>{t.name}</p>
          <p style={{ color: colors.textMuted, fontSize: "12px" }}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const { colors } = useTheme();
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGsap = async () => {
      const { gsap } = await import("gsap");

      const setup = (track: HTMLDivElement | null, dir: number) => {
        if (!track) return;
        const w = track.scrollWidth / 2;
        const anim = gsap.to(track, {
          x: dir * -w, duration: 35,
          ease: "none", repeat: -1,
          modifiers: {
            x: (x) => `${parseFloat(x) % w}px`,
          },
        });
        track.addEventListener("mouseenter", () => anim.pause());
        track.addEventListener("mouseleave", () => anim.resume());
        return anim;
      };

      const a1 = setup(track1Ref.current, 1);
      const a2 = setup(track2Ref.current, -1);
      return () => { a1?.kill(); a2?.kill(); };
    };
    const cleanup = loadGsap();
    return () => { cleanup.then((fn) => fn?.()); };
  }, []);

  const row1 = [...testimonials.slice(0, 3), ...testimonials.slice(0, 3)];
  const row2 = [...testimonials.slice(3), ...testimonials.slice(3)];

  return (
    <section style={{
      padding: "96px 0",
      background: colors.bg,
      borderTop: `1px solid ${colors.border}`,
      overflow: "hidden",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            border: "1px solid rgba(124,58,237,0.3)",
            background: "rgba(124,58,237,0.08)",
            color: "#a78bfa", padding: "4px 14px",
            borderRadius: "9999px", fontSize: "12px",
            fontWeight: 500, marginBottom: "16px",
          }}>
            <Star size={11} /> Testimonials
          </div>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700,
            color: colors.text, marginBottom: "12px",
          }}>
            Loved by creators and businesses
          </h2>
          <p style={{ color: colors.textMuted, fontSize: "16px" }}>
            Real results from real people running on NexAgent
          </p>
        </div>
      </div>

      {/* Row 1 — left to right */}
      <div style={{ position: "relative", marginBottom: "12px" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "120px",
          background: `linear-gradient(to right, ${colors.bg}, transparent)`,
          zIndex: 10, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "120px",
          background: `linear-gradient(to left, ${colors.bg}, transparent)`,
          zIndex: 10, pointerEvents: "none",
        }} />
        <div style={{ overflow: "hidden" }}>
          <div ref={track1Ref} style={{ display: "flex" }}>
            {row1.map((t, i) => <TestimonialCard key={`r1-${i}`} {...t} />)}
          </div>
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "120px",
          background: `linear-gradient(to right, ${colors.bg}, transparent)`,
          zIndex: 10, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "120px",
          background: `linear-gradient(to left, ${colors.bg}, transparent)`,
          zIndex: 10, pointerEvents: "none",
        }} />
        <div style={{ overflow: "hidden" }}>
          <div ref={track2Ref} style={{ display: "flex" }}>
            {row2.map((t, i) => <TestimonialCard key={`r2-${i}`} {...t} />)}
          </div>
        </div>
      </div>
    </section>
  );
}