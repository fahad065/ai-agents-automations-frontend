"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { ArrowRight, Zap, Loader2, Search } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

interface AutomationTemplate {
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
  pricing?: { monthly: number; annual: number };
}

const formatCategory = (val: string) =>
  val === "all" ? "All automations" :
  val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function AutomationsListPage() {
  const { colors, isDark } = useTheme();
  const { isAr } = useLang();
  const [automations, setAutomations] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const fetchAutomations = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/modules?moduleType=automation`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAutomations(data.data || data);
    } catch {
      setError("Failed to load automations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const categories = ["all", ...Array.from(new Set(automations.map((a) => a.category)))];
  const filtered = automations.filter((a) => {
    const matchesSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === "all" || a.category === category);
  });

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>

      {/* Breadcrumb */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "90px 24px 0" }}>
        <BreadcrumbNav items={[{ label: "Automations" }]} />
      </div>

      {/* Hero */}
      <section style={{
        padding: "24px 24px 56px", textAlign: "center",
        maxWidth: "720px", margin: "0 auto", position: "relative",
      }}>
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
          <Zap size={12} /> {isAr ? "سوق الأتمتة" : "Automation Marketplace"}
        </div>
        <h1 style={{
          fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 800,
          color: colors.text, marginBottom: "18px",
          letterSpacing: "-0.04em", lineHeight: 1.05,
        }}>
          {isAr ? "أتمتة أي سير عمل." : "Automate any workflow."}
          <br />
          <span style={{
            background: "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>{isAr ? "انشر في دقائق." : "Deploy in minutes."}</span>
        </h1>
        <p style={{
          fontSize: "17px", color: colors.textMuted,
          maxWidth: "500px", margin: "0 auto 40px", lineHeight: 1.7,
        }}>
          {isAr
            ? "مسارات أتمتة جاهزة للمحتوى والتسويق والمبيعات والمزيد. بدون كود. بدون إعداد. فقط فعّل وانطلق."
            : "Pre-built automation pipelines for content, marketing, sales and more. No code. No setup. Just activate and go."}
        </p>

        {/* Search */}
        <div style={{ maxWidth: "460px", margin: "0 auto", position: "relative" }}>
          <Search size={15} color={colors.textMuted} style={{
            position: "absolute", left: "16px", top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
          }} />
          <input
            placeholder={isAr ? "ابحث عن أتمتة..." : "Search automations..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "13px 16px 13px 44px",
              borderRadius: "11px", fontSize: "14px",
              border: `1px solid ${border}`,
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
          marginBottom: "36px", justifyContent: "center",
        }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} style={{
              padding: "7px 16px", borderRadius: "9999px",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
              border: `1px solid ${category === cat ? "rgba(124,58,237,0.4)" : border}`,
              background: category === cat ? "rgba(124,58,237,0.1)" : "transparent",
              color: category === cat ? "#a78bfa" : colors.textMuted,
              transition: "all 0.15s",
            }}>
              {formatCategory(cat)}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <Loader2 size={32} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: colors.textMuted, fontSize: "14px" }}>Loading automations...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ color: "#ef4444", fontSize: "14px", marginBottom: "16px" }}>{error}</p>
            <button onClick={fetchAutomations} style={{
              padding: "9px 20px", borderRadius: "8px",
              background: "#7c3aed", color: "white",
              border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
            }}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p style={{ fontSize: "12px", color: colors.textMuted, marginBottom: "20px", textAlign: "center", opacity: 0.6 }}>
              {filtered.length} automation{filtered.length !== 1 ? "s" : ""} available
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: "12px",
            }}>
              {filtered.map((automation) => (
                <Link key={automation._id} href={`/automations/${automation.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                      border: `1px solid ${border}`,
                      borderRadius: "14px", padding: "22px",
                      height: "100%", transition: "all 0.2s",
                      cursor: "pointer", display: "flex", flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderColor = `${automation.color}30`;
                      el.style.background = `${automation.color}06`;
                      el.style.boxShadow = `0 0 30px ${automation.color}10`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.borderColor = border;
                      el.style.background = isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)";
                      el.style.boxShadow = "none";
                    }}
                  >
                    {/* Header */}
                    <div style={{
                      display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", marginBottom: "14px",
                    }}>
                      <div style={{
                        width: "44px", height: "44px", borderRadius: "11px",
                        background: `${automation.color}12`, border: `1px solid ${automation.color}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px", flexShrink: 0,
                      }}>
                        {automation.icon}
                      </div>
                      <span style={{
                        fontSize: "10px", fontWeight: 600,
                        padding: "3px 9px", borderRadius: "9999px",
                        background: automation.badge === "Live"
                          ? "rgba(34,197,94,0.1)" : `${automation.color}12`,
                        color: automation.badge === "Live" ? "#22c55e" : automation.color,
                        border: `1px solid ${automation.badge === "Live" ? "rgba(34,197,94,0.2)" : automation.color + "25"}`,
                      }}>
                        {automation.badge || "Active"}
                      </span>
                    </div>

                    <h2 style={{ fontSize: "15px", fontWeight: 700, color: colors.text, marginBottom: "6px", lineHeight: 1.3 }}>
                      {(isAr && automation.name_ar) ? automation.name_ar : automation.name}
                    </h2>

                    {((isAr && automation.tagline_ar) ? automation.tagline_ar : automation.tagline) && (
                      <p style={{ fontSize: "12px", color: automation.color, fontWeight: 500, marginBottom: "8px" }}>
                        {(isAr && automation.tagline_ar) ? automation.tagline_ar : automation.tagline}
                      </p>
                    )}

                    <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "14px", flex: 1 }}>
                      {(isAr && automation.description_ar) ? automation.description_ar : automation.description}
                    </p>

                    {/* Capability tags */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "14px" }}>
                      {automation.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} style={{
                          fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                          background: `${automation.color}10`, color: automation.color,
                          border: `1px solid ${automation.color}20`,
                        }}>
                          {cap}
                        </span>
                      ))}
                      {automation.capabilities.length > 3 && (
                        <span style={{
                          fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                          color: colors.textMuted,
                        }}>
                          +{automation.capabilities.length - 3}
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      paddingTop: "12px",
                      borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: automation.color, display: "flex", alignItems: "center", gap: "4px" }}>
                        {isAr ? "عرض التفاصيل" : "View details"} <ArrowRight size={12} />
                      </span>
                      {automation.pricing?.monthly ? (
                        <span style={{ fontSize: "11px", color: colors.textMuted }}>
                          from ${automation.pricing.monthly}/mo
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <p style={{ color: colors.textMuted, fontSize: "15px" }}>
                  {isAr ? "لم يُعثر على أتمتة مطابقة لبحثك." : "No automations found matching your search."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
