"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface AutomationTemplate {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  pricing?: { monthly: number };
}

export function AutomationsSection() {
  const { colors } = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [automations, setAutomations] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  const maxIndex = Math.max(0, automations.length - visibleCount);

  const fetchAutomations = useCallback(async () => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/automations/templates`, {
        cache: "no-store",
      });
      const data = await res.json();
      setAutomations(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    setCurrent(0);
    if (trackRef.current) gsap.set(trackRef.current, { x: 0 });
  }, [visibleCount]);

  const slide = useCallback((dir: number) => {
    const next = Math.max(0, Math.min(current + dir, maxIndex));
    if (next === current || !wrapperRef.current) return;
    const gap = 16;
    const cardWidth =
      (wrapperRef.current.offsetWidth - (visibleCount - 1) * gap) / visibleCount;
    gsap.to(trackRef.current, {
      x: -(next * (cardWidth + gap)),
      duration: 0.5, ease: "power3.out",
    });
    setCurrent(next);
  }, [current, maxIndex, visibleCount]);

  useEffect(() => {
    if (loading || !automations.length) return;
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, automations]);

  return (
    <section
      id="automations"
      ref={sectionRef}
      style={{ padding: "96px 24px", background: colors.bg }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Header */}
        <div ref={titleRef} style={{ marginBottom: "40px" }}>
          <div style={{
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                border: "1px solid rgba(124,58,237,0.3)",
                background: "rgba(124,58,237,0.08)",
                color: "#a78bfa", padding: "4px 14px",
                borderRadius: "9999px", fontSize: "12px",
                fontWeight: 500, marginBottom: "12px",
              }}>
                <Zap size={11} /> Automations
              </div>
              <h2 style={{
                fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "8px",
              }}>
                Automate any workflow
              </h2>
              <p style={{
                color: colors.textMuted, fontSize: "clamp(14px, 2vw, 16px)",
                maxWidth: "420px",
              }}>
                Pre-built automation pipelines ready to deploy in minutes.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => slide(-1)}
                disabled={current === 0}
                style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  background: colors.bgCard, color: colors.text,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: current === 0 ? "not-allowed" : "pointer",
                  opacity: current === 0 ? 0.35 : 1,
                  transition: "all 0.2s",
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => slide(1)}
                disabled={current >= maxIndex}
                style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  background: colors.bgCard, color: colors.text,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: current >= maxIndex ? "not-allowed" : "pointer",
                  opacity: current >= maxIndex ? 0.35 : 1,
                  transition: "all 0.2s",
                }}
              >
                <ChevronRight size={16} />
              </button>
              <Link href="/automations" style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "8px",
                border: `1px solid ${colors.border}`,
                background: colors.bgCard,
                color: colors.textMuted, fontSize: "13px",
                fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap",
              }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel */}
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${visibleCount}, 1fr)`,
            gap: "16px",
          }}>
            {Array.from({ length: visibleCount }).map((_, i) => (
              <div key={i} style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: "14px", height: "320px",
                animation: "pulse 1.5s infinite",
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        ) : (
          <>
            <div ref={wrapperRef} style={{ overflow: "hidden" }}>
              <div ref={trackRef} style={{ display: "flex", gap: "16px" }}>
                {automations.map((item) => (
                  <Link
                    key={item._id}
                    href={`/automations/${item.slug}`}
                    style={{
                      textDecoration: "none",
                      flexShrink: 0,
                      width: wrapperRef.current
                        ? `${(wrapperRef.current.offsetWidth - (visibleCount - 1) * 16) / visibleCount}px`
                        : "340px",
                      minWidth: "260px",
                    }}
                  >
                    <div style={{
                      background: colors.bgCard,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "14px", padding: "24px",
                      height: "100%", transition: "all 0.3s", cursor: "pointer",
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: "20px",
                      }}>
                        <div style={{
                          width: "44px", height: "44px", borderRadius: "12px",
                          background: `${item.color}15`,
                          border: `1px solid ${item.color}30`,
                          display: "flex", alignItems: "center",
                          justifyContent: "center", fontSize: "20px",
                        }}>
                          {item.icon}
                        </div>
                        <span style={{
                          fontSize: "11px", fontWeight: 600,
                          padding: "3px 10px", borderRadius: "9999px",
                          background: item.badge === "Live"
                            ? "rgba(34,197,94,0.1)" : "rgba(128,128,128,0.08)",
                          color: item.badge === "Live" ? "#22c55e" : colors.textMuted,
                          border: `1px solid ${item.badge === "Live"
                            ? "rgba(34,197,94,0.2)" : colors.border}`,
                        }}>
                          {item.badge}
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: "16px", fontWeight: 600,
                        color: colors.text, marginBottom: "8px",
                      }}>
                        {item.name}
                      </h3>

                      {item.tagline && (
                        <p style={{
                          fontSize: "12px", color: item.color,
                          fontWeight: 500, marginBottom: "8px",
                        }}>
                          {item.tagline}
                        </p>
                      )}

                      <p style={{
                        fontSize: "13px", color: colors.textMuted,
                        lineHeight: 1.6, marginBottom: "16px",
                      }}>
                        {item.description}
                      </p>

                      <ul style={{ listStyle: "none", padding: 0, marginBottom: "16px" }}>
                        {item.capabilities.slice(0, 3).map((cap) => (
                          <li key={cap} style={{
                            display: "flex", alignItems: "center",
                            gap: "8px", fontSize: "12px",
                            color: colors.textMuted, marginBottom: "6px",
                          }}>
                            <div style={{
                              width: "4px", height: "4px", borderRadius: "50%",
                              background: item.color, flexShrink: 0,
                            }} />
                            {cap}
                          </li>
                        ))}
                      </ul>

                      <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                      }}>
                        {item.pricing ? (
                          <span style={{ fontSize: "14px", fontWeight: 700, color: colors.text }}>
                            ${item.pricing.monthly}
                            <span style={{ fontSize: "11px", fontWeight: 400, color: colors.textMuted }}>/mo</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: colors.textMuted }}>Pricing TBA</span>
                        )}
                        <div style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          fontSize: "12px", fontWeight: 500, color: item.color,
                        }}>
                          Learn more <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Dots */}
            {maxIndex > 0 && (
              <div style={{
                display: "flex", justifyContent: "center",
                gap: "6px", marginTop: "24px",
              }}>
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => slide(i - current)}
                    style={{
                      width: i === current ? "22px" : "6px",
                      height: "6px", borderRadius: "3px",
                      background: i === current ? "#7c3aed" : colors.border,
                      border: "none", cursor: "pointer",
                      transition: "all 0.3s", padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}