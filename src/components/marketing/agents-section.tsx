"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { ArrowRight, Bot, Zap } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface AgentTemplate {
  _id: string;
  name: string;
  name_ar?: string;
  slug: string;
  tagline: string;
  tagline_ar?: string;
  description: string;
  description_ar?: string;
  category: string;
  moduleType: string;
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  pricing?: { monthly: number };
}

export function AgentsSection() {
  const { colors, isDark } = useTheme();
  const { lang, isAr } = useLang();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        const res = await fetch(`${apiUrl}/modules?limit=6`);
        const data = await res.json();
        setAgents((data.data || data).slice(0, 6));
      } catch {}
      finally { setLoading(false); }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    if (loading || !agents.length) return;
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
      });
      if (gridRef.current?.children) {
        gsap.from(Array.from(gridRef.current.children), {
          opacity: 0, y: 24, duration: 0.5, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, agents]);

  if (!loading && agents.length === 0) return null;

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <section ref={sectionRef} style={{
      padding: "100px 24px",
      background: colors.bg,
      borderTop: `1px solid ${border}`,
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <div ref={titleRef} style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "56px", flexWrap: "wrap", gap: "20px",
        }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              border: "1px solid rgba(124,58,237,0.3)",
              background: "rgba(124,58,237,0.08)",
              color: "#a78bfa", padding: "5px 14px",
              borderRadius: "9999px", fontSize: "12px",
              fontWeight: 500, marginBottom: "16px",
            }}>
              <Bot size={11} /> {isAr ? "وكلاء الذكاء الاصطناعي والأتمتة" : "AI Agents & Automations"}
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800,
              color: colors.text, marginBottom: "10px",
              letterSpacing: "-0.03em", lineHeight: 1.1,
            }}>
              {isAr ? "جاهز للنشر." : "Ready to deploy."}<br />{isAr ? "مصمم لقطاعك." : "Built for your industry."}
            </h2>
            <p style={{ color: colors.textMuted, fontSize: "15px", maxWidth: "420px", lineHeight: 1.65 }}>
              {isAr ? "اشترك بنقرة واحدة. بدون إعداد تقني. يعمل في دقائق." : "Subscribe in one click. No technical setup. Running in minutes."}
            </p>
          </div>

          <Link href="/agents" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 20px", borderRadius: "9px",
            border: `1px solid ${border}`,
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            color: colors.textMuted, fontSize: "13px",
            fontWeight: 500, textDecoration: "none",
            whiteSpace: "nowrap",
          }}>
            {tr("viewAllAgents", lang)} <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px",
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                border: `1px solid ${border}`,
                borderRadius: "16px", padding: "24px", height: "200px",
                animation: "pulse 1.5s infinite",
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        ) : (
          <div ref={gridRef} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "12px",
          }}>
            {agents.map((agent) => {
              const isHovered = hovered === agent._id;
              return (
                <Link
                  key={agent._id}
                  href={`/agents/${agent.slug}`}
                  style={{ textDecoration: "none" }}
                  onMouseEnter={() => setHovered(agent._id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div style={{
                    background: isHovered ? `${agent.color}06` : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"),
                    border: `1px solid ${isHovered ? agent.color + "30" : border}`,
                    borderRadius: "16px", padding: "22px",
                    transition: "all 0.2s", cursor: "pointer", height: "100%",
                    display: "flex", flexDirection: "column",
                    boxShadow: isHovered ? `0 0 40px ${agent.color}10` : "none",
                  }}>
                    {/* Card header */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", marginBottom: "14px",
                    }}>
                      <div style={{
                        width: "42px", height: "42px", borderRadius: "11px",
                        background: `${agent.color}12`, border: `1px solid ${agent.color}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px", flexShrink: 0,
                      }}>
                        {agent.icon}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {agent.moduleType === "automation" && (
                          <span style={{
                            fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px",
                            background: "rgba(34,197,94,0.1)", color: "#22c55e",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}>
                            <Zap size={8} style={{ display: "inline", marginRight: "2px" }} />
                            AUTO
                          </span>
                        )}
                        <span style={{
                          fontSize: "10px", fontWeight: 600,
                          padding: "3px 9px", borderRadius: "9999px",
                          background: agent.badge === "Live"
                            ? "rgba(34,197,94,0.1)" : `${agent.color}12`,
                          color: agent.badge === "Live" ? "#22c55e" : agent.color,
                          border: `1px solid ${agent.badge === "Live" ? "rgba(34,197,94,0.2)" : agent.color + "25"}`,
                        }}>
                          {agent.badge || "Active"}
                        </span>
                      </div>
                    </div>

                    <h3 style={{
                      fontSize: "15px", fontWeight: 700,
                      color: colors.text, marginBottom: "6px", lineHeight: 1.3,
                    }}>
                      {(isAr && agent.name_ar) ? agent.name_ar : agent.name}
                    </h3>

                    {((isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline) && (
                      <p style={{
                        fontSize: "12px", color: colors.textMuted,
                        lineHeight: 1.6, marginBottom: "14px", flex: 1,
                      }}>
                        {(isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline}
                      </p>
                    )}

                    {/* Capabilities */}
                    <ul style={{ listStyle: "none", padding: 0, marginBottom: "16px" }}>
                      {agent.capabilities.slice(0, 3).map((c) => (
                        <li key={c} style={{
                          display: "flex", alignItems: "flex-start",
                          gap: "7px", fontSize: "12px",
                          color: colors.textMuted, marginBottom: "5px",
                        }}>
                          <div style={{
                            width: "4px", height: "4px", borderRadius: "50%",
                            background: agent.color, flexShrink: 0, marginTop: "5px",
                          }} />
                          {c}
                        </li>
                      ))}
                    </ul>

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      paddingTop: "12px",
                      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: agent.color, display: "flex", alignItems: "center", gap: "4px" }}>
                        {isAr ? "استكشف" : "Explore"} <ArrowRight size={12} />
                      </span>
                      {agent.pricing?.monthly && (
                        <span style={{ fontSize: "11px", color: colors.textMuted }}>
                          from ${agent.pricing.monthly}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
