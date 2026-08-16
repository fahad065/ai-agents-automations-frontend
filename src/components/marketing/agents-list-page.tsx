"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { ArrowRight, Bot, Loader2, Search } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

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
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  isActive: boolean;
  pricing?: { monthly: number; annual: number };
}

const formatCategory = (val: string) =>
  val === "all" ? "All agents" :
  val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export function AgentsListPage() {
  const { colors, isDark } = useTheme();
  const { isAr } = useLang();
  const [agents, setAgents] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/modules?moduleType=agent`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAgents(data.data || data);
    } catch {
      setError("Failed to load agents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const categories = [
    "all",
    ...Array.from(new Set(agents.map((a) => a.category))),
  ];

  const filtered = agents.filter((a) => {
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || a.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>

      {/* Breadcrumb */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "90px 24px 0" }}>
        <BreadcrumbNav items={[{ label: "Agents" }]} />
      </div>

      {/* Hero */}
      <section style={{ padding: "24px 24px 56px", textAlign: "center", maxWidth: "720px", margin: "0 auto", position: "relative" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px", height: "500px",
          background: "rgba(124,58,237,0.06)",
          borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none",
        }} />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          border: "1px solid rgba(124,58,237,0.3)",
          background: "rgba(124,58,237,0.08)",
          color: "#a78bfa", padding: "6px 16px",
          borderRadius: "9999px", fontSize: "13px",
          fontWeight: 500, marginBottom: "24px",
        }}>
          <Bot size={12} /> {isAr ? "سوق الوكلاء الذكيين" : "AI Agent Marketplace"}
        </div>
        <h1 style={{
          fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 800,
          color: colors.text, marginBottom: "18px",
          letterSpacing: "-0.04em", lineHeight: 1.05,
        }}>
          {isAr ? "وكلاء مصممون لـ" : "Agents built for"}
          <br />
          <span style={{
            background: "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>{isAr ? "قطاعك." : "your industry."}</span>
        </h1>
        <p style={{
          fontSize: "17px", color: colors.textMuted,
          maxWidth: "500px", margin: "0 auto 40px", lineHeight: 1.7,
        }}>
          {isAr ? "وكلاء ذكاء اصطناعي متخصصون في مجالك. اشترك، اضبط الإعدادات، ودعهم يعملون 24/7." : "Specialised AI agents trained on your niche. Subscribe, configure, and let them run 24/7."}
        </p>

        {/* Search */}
        <div style={{ maxWidth: "460px", margin: "0 auto", position: "relative" }}>
          <Search size={15} color={colors.textMuted} style={{
            position: "absolute", left: "16px", top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
          }} />
          <input
            placeholder={isAr ? "ابحث عن وكيل..." : "Search agents..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "13px 16px 13px 44px",
              borderRadius: "11px", fontSize: "14px",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              color: colors.text, outline: "none",
              boxSizing: "border-box" as const, fontFamily: "inherit",
            }}
          />
        </div>
      </section>

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 96px" }}>

        {/* Category filters */}
        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap",
          marginBottom: "32px", justifyContent: "center",
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "7px 16px", borderRadius: "9999px",
                fontSize: "13px", fontWeight: 500,
                cursor: "pointer", transition: "all 0.2s",
                border: `1px solid ${category === cat
                  ? "rgba(124,58,237,0.4)" : colors.border}`,
                background: category === cat
                  ? "rgba(124,58,237,0.1)" : "transparent",
                color: category === cat ? "#a78bfa" : colors.textMuted,
              }}
            >
              {formatCategory(cat)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <Loader2 size={32} color="#7c3aed"
              style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: colors.textMuted }}>Loading agents...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>
              {error}
            </p>
            <button
              onClick={fetchAgents}
              style={{
                padding: "9px 20px", borderRadius: "8px",
                background: "#7c3aed", color: "white",
                border: "none", cursor: "pointer", fontSize: "14px",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* Agents grid */}
        {!loading && !error && (
          <>
            <p style={{
              fontSize: "13px", color: colors.textMuted,
              marginBottom: "20px", textAlign: "center",
            }}>
              {filtered.length} agent{filtered.length !== 1 ? "s" : ""} available
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}>
              {filtered.map((agent) => (
                <Link
                  key={agent._id}
                  href={`/agents/${agent.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{
                    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                    borderRadius: "14px", padding: "22px",
                    height: "100%", transition: "all 0.2s",
                    cursor: "pointer", display: "flex", flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${agent.color}30`;
                    (e.currentTarget as HTMLDivElement).style.background = `${agent.color}06`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${agent.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
                    (e.currentTarget as HTMLDivElement).style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                  >
                    {/* Header */}
                    <div style={{
                      display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", marginBottom: "16px",
                    }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "12px",
                        background: `${agent.color}15`,
                        border: `1px solid ${agent.color}30`,
                        display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "22px",
                      }}>
                        {agent.icon}
                      </div>
                      <span style={{
                        fontSize: "11px", fontWeight: 600,
                        padding: "3px 10px", borderRadius: "9999px",
                        background: agent.badge === "Live"
                          ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.08)",
                        color: agent.badge === "Live" ? "#22c55e" : colors.textMuted,
                        border: `1px solid ${agent.badge === "Live"
                          ? "rgba(34,197,94,0.2)" : colors.border}`,
                      }}>
                        {agent.badge}
                      </span>
                    </div>

                    <h2 style={{
                      fontSize: "17px", fontWeight: 700,
                      color: colors.text, marginBottom: "6px",
                    }}>
                      {(isAr && agent.name_ar) ? agent.name_ar : agent.name}
                    </h2>

                    {((isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline) && (
                      <p style={{
                        fontSize: "13px", color: agent.color,
                        fontWeight: 500, marginBottom: "10px",
                      }}>
                        {(isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline}
                      </p>
                    )}

                    <p style={{
                      fontSize: "13px", color: colors.textMuted,
                      lineHeight: 1.6, marginBottom: "16px",
                    }}>
                      {(isAr && agent.description_ar) ? agent.description_ar : agent.description}
                    </p>

                    {/* Capabilities */}
                    <div style={{
                      display: "flex", flexWrap: "wrap",
                      gap: "6px", marginBottom: "18px",
                    }}>
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} style={{
                          fontSize: "11px", padding: "3px 8px",
                          borderRadius: "9999px",
                          background: colors.bgSecondary,
                          border: `1px solid ${colors.border}`,
                          color: colors.textMuted,
                        }}>
                          {cap}
                        </span>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <span style={{
                          fontSize: "11px", padding: "3px 8px",
                          borderRadius: "9999px",
                          background: colors.bgSecondary,
                          border: `1px solid ${colors.border}`,
                          color: colors.textMuted,
                        }}>
                          +{agent.capabilities.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Price + CTA */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      {agent.pricing ? (
                        <div>
                          <span style={{
                            fontSize: "20px", fontWeight: 700, color: colors.text,
                          }}>
                            ${agent.pricing.monthly}
                          </span>
                          <span style={{ fontSize: "12px", color: colors.textMuted }}>
                            /mo
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "13px", color: colors.textMuted }}>
                          Pricing TBA
                        </span>
                      )}
                      <div style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        fontSize: "13px", fontWeight: 500, color: agent.color,
                      }}>
                        {isAr ? "عرض التفاصيل" : "View details"} <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <p style={{ color: colors.textMuted, fontSize: "15px" }}>
                  {isAr ? "لم يُعثر على وكلاء مطابقين لبحثك." : "No agents found matching your search."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}