"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { ArrowRight, Bot } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface AgentTemplate {
  _id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  pricing?: { monthly: number };
}

export function AgentsSection() {
  const { colors } = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        const res = await fetch(`${apiUrl}/agents/templates`);
        const data = await res.json();
        setAgents(data.slice(0, 4));
      } catch {
        // Keep empty — section will not render
      } finally {
        setLoading(false);
      }
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
          opacity: 0, y: 30, duration: 0.5, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, agents]);

  if (!loading && agents.length === 0) return null;

  return (
    <section ref={sectionRef} style={{
      padding: "96px 24px",
      background: colors.bg,
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        <div ref={titleRef} style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "48px", flexWrap: "wrap", gap: "16px",
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
              <Bot size={11} /> AI Agents
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700,
              color: colors.text, marginBottom: "8px",
            }}>
              Agents built for every niche
            </h2>
            <p style={{ color: colors.textMuted, fontSize: "16px", maxWidth: "480px" }}>
              Specialised AI agents trained on your industry. Plug in and go.
            </p>
          </div>

          <Link href="/agents" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", borderRadius: "10px",
            border: `1px solid ${colors.border}`,
            background: colors.bgCard,
            color: colors.textMuted, fontSize: "14px",
            fontWeight: 500, textDecoration: "none",
          }}>
            View all agents <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: "14px", padding: "24px",
                height: "280px",
                animation: "pulse 1.5s infinite",
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          </div>
        ) : (
          <div ref={gridRef} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}>
            {agents.map((agent) => (
              <Link
                key={agent._id}
                href={`/agents/${agent.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "14px", padding: "24px",
                  transition: "all 0.3s", cursor: "pointer", height: "100%",
                }}>
                  <div style={{
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", marginBottom: "16px",
                  }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "12px",
                      background: `${agent.color}15`,
                      border: `1px solid ${agent.color}30`,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "20px",
                    }}>
                      {agent.icon}
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 600,
                      padding: "3px 10px", borderRadius: "9999px",
                      background: agent.badge === "Live"
                        ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
                      color: agent.badge === "Live" ? "#22c55e" : colors.textMuted,
                      border: `1px solid ${agent.badge === "Live"
                        ? "rgba(34,197,94,0.2)" : colors.border}`,
                    }}>
                      {agent.badge}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: "16px", fontWeight: 600,
                    color: colors.text, marginBottom: "8px",
                  }}>
                    {agent.name}
                  </h3>
                  <p style={{
                    fontSize: "13px", color: colors.textMuted,
                    lineHeight: 1.6, marginBottom: "16px",
                  }}>
                    {agent.description}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, marginBottom: "16px" }}>
                    {agent.capabilities.slice(0, 3).map((c) => (
                      <li key={c} style={{
                        display: "flex", alignItems: "center",
                        gap: "7px", fontSize: "12px",
                        color: colors.textMuted, marginBottom: "6px",
                      }}>
                        <div style={{
                          width: "4px", height: "4px", borderRadius: "50%",
                          background: agent.color, flexShrink: 0,
                        }} />
                        {c}
                      </li>
                    ))}
                  </ul>

                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    fontSize: "13px", fontWeight: 500, color: agent.color,
                  }}>
                    Explore agent <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}