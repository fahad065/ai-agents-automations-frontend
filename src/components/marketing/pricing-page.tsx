"use client";

import { useEffect, useState, useCallback } from "react";
import { useLang } from "@/hooks/use-lang";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { Check, ArrowRight, Loader2, Zap, Bot, Package, Star } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";

interface Module {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  moduleType: string;
  pipelineCategory?: string;
  nicheSlug?: string;
  icon: string;
  color: string;
  badge?: string;
  capabilities: string[];
  pricing: {
    monthly: number;
    annual: number;
    features: string[];
    hasCustomPlan?: boolean;
    customLabel?: string;
  };
  isComingSoon: boolean;
}

type FilterType = "all" | "industries" | "agents" | "automations";

const FILTER_TABS_EN = [
  { id: "all" as FilterType,         label: "All",         icon: <Star size={13} /> },
  { id: "industries" as FilterType,  label: "Industries",  icon: <Package size={13} /> },
  { id: "agents" as FilterType,      label: "AI Agents",   icon: <Bot size={13} /> },
  { id: "automations" as FilterType, label: "Automations", icon: <Zap size={13} /> },
];
const FILTER_TABS_AR = [
  { id: "all" as FilterType,         label: "الكل",        icon: <Star size={13} /> },
  { id: "industries" as FilterType,  label: "القطاعات",    icon: <Package size={13} /> },
  { id: "agents" as FilterType,      label: "الوكلاء",     icon: <Bot size={13} /> },
  { id: "automations" as FilterType, label: "الأتمتة",     icon: <Zap size={13} /> },
];

export function PricingPage() {
  const { colors, isDark } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const { lang, isAr } = useLang();

  const fetchModules = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiClient.get<{ data: Module[] }>("/modules");
      setModules((data as any).data || (data as any));
    } catch {
      setError("Failed to load pricing. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [lang]); // re-fetch when lang changes

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const withPricing = modules.filter((m) => m.pricing?.monthly > 0);

  const filtered = withPricing.filter((m) => {
    if (filter === "industries") return m.pipelineCategory === "niche_pipeline";
    if (filter === "agents")     return m.moduleType === "agent" && m.pipelineCategory !== "niche_pipeline";
    if (filter === "automations") return m.moduleType === "automation";
    return true;
  });

  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const annualSaving = 20;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 100px", position: "relative" }}>

        {/* Glow */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "500px",
          background: "rgba(124,58,237,0.06)",
          borderRadius: "50%", filter: "blur(140px)", pointerEvents: "none",
        }} />

        {/* Breadcrumb */}
        <div style={{ paddingTop: "110px", marginBottom: "32px", position: "relative" }}>
          <BreadcrumbNav items={[{ label: "Pricing" }]} />
        </div>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "56px", position: "relative" }}>
          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 64px)", fontWeight: 800,
            color: colors.text, marginBottom: "16px",
            letterSpacing: "-0.04em", lineHeight: 1.05,
          }}>
            {isAr ? "تسعير بسيط وشفاف." : "Simple, transparent pricing."}
            <br />
            <span style={{
              backgroundImage: "linear-gradient(135deg, #c4b5fd, #a78bfa, #7c3aed)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {isAr ? "ادفع فقط مقابل ما تستخدمه." : "Pay only for what you use."}
            </span>
          </h1>
          <p style={{
            fontSize: "17px", color: colors.textMuted,
            maxWidth: "500px", margin: "0 auto 40px", lineHeight: 1.7,
          }}>
            {isAr
              ? "اشترك في وكلاء فردية أو أتمتة كاملة أو حزم قطاعية متكاملة. كل خطة تشمل 30 يوم تجريب مجاني."
              : "Subscribe to individual agents, full automations, or complete industry bundles. Every plan includes a 30-day free trial."
            }
          </p>

          {/* Billing toggle */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            border: `1px solid ${border}`,
            borderRadius: "10px", padding: "4px",
          }}>
            {(["monthly", "annual"] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: "8px 20px", borderRadius: "7px",
                fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none",
                background: billing === b
                  ? (isDark ? "rgba(124,58,237,0.3)" : "#ffffff")
                  : "transparent",
                color: billing === b ? (isDark ? "#c4b5fd" : "#7c3aed") : colors.textMuted,
                boxShadow: billing === b ? "0 1px 6px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                {b === "monthly" ? (isAr ? "شهري" : "Monthly") : (isAr ? "سنوي" : "Annual")}
                {b === "annual" && (
                  <span style={{
                    fontSize: "10px", padding: "1px 6px", borderRadius: "4px",
                    background: "rgba(34,197,94,0.15)", color: "#22c55e",
                    fontWeight: 700,
                  }}>
                    -{annualSaving}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex", gap: "6px", marginBottom: "36px",
          justifyContent: "center", flexWrap: "wrap",
        }}>
          {(isAr ? FILTER_TABS_AR : FILTER_TABS_EN).map((tab) => (
            <button key={tab.id} onClick={() => setFilter(tab.id)} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 18px", borderRadius: "9999px",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
              border: `1px solid ${filter === tab.id ? "rgba(124,58,237,0.4)" : border}`,
              background: filter === tab.id ? "rgba(124,58,237,0.1)" : "transparent",
              color: filter === tab.id ? "#a78bfa" : colors.textMuted,
              transition: "all 0.15s",
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <Loader2 size={30} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ color: colors.textMuted, fontSize: "14px" }}>Loading pricing...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ color: "#ef4444", marginBottom: "14px" }}>{error}</p>
            <button onClick={fetchModules} style={{
              padding: "9px 20px", borderRadius: "8px",
              background: "#7c3aed", color: "white", border: "none", cursor: "pointer", fontWeight: 600,
            }}>Try again</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Count */}
            <p style={{ textAlign: "center", fontSize: "12px", color: colors.textMuted, marginBottom: "24px", opacity: 0.6 }}>
              {filtered.length} plan{filtered.length !== 1 ? "s" : ""} available
            </p>

            {/* Cards grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: "16px",
            }}>
              {filtered.map((module) => {
                const price = billing === "annual"
                  ? Math.round(module.pricing.monthly * (1 - annualSaving / 100))
                  : module.pricing.monthly;
                const isBundle = module.pipelineCategory === "niche_pipeline";
                const isAuto = module.moduleType === "automation";
                const href = isAuto ? `/automations/${module.slug}` : `/agents/${module.slug}`;

                return (
                  <PricingCard
                    key={module._id}
                    module={module}
                    price={price}
                    billing={billing}
                    isBundle={isBundle}
                    isAuto={isAuto}
                    href={href}
                    isDark={isDark}
                    colors={colors}
                    border={border}
                  />
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <p style={{ color: colors.textMuted }}>No plans available for this filter.</p>
              </div>
            )}

            {/* Bottom CTA */}
            <div style={{
              marginTop: "80px", padding: "48px 40px",
              background: isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.04)",
              border: `1px solid rgba(124,58,237,0.2)`,
              borderRadius: "20px", textAlign: "center",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                width: "500px", height: "300px",
                background: "rgba(124,58,237,0.08)",
                borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none",
              }} />
              <div style={{ position: "relative" }}>
                <h3 style={{
                  fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 800,
                  color: colors.text, letterSpacing: "-0.03em", marginBottom: "12px",
                }}>
                  {isAr ? "تحتاج خطة مخصصة؟" : "Need a custom plan?"}
                </h3>
                <p style={{ fontSize: "15px", color: colors.textMuted, marginBottom: "28px", maxWidth: "440px", margin: "0 auto 28px", lineHeight: 1.65 }}>
                  {isAr
                    ? "تشغّل قطاعات متعددة أو تبني مسار مخصص؟ تحدث معنا وسنبني الحزمة المناسبة لفريقك."
                    : "Running multiple industries or building a custom pipeline? Talk to us and we'll build the right package for your team."
                  }
                </p>
                <Link href="/contact" style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  padding: "13px 28px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white", fontSize: "14px", fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 4px 24px rgba(124,58,237,0.35)",
                }}>
                  {isAr ? "تحدث معنا" : "Talk to us"} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PricingCard({ module, price, billing, isBundle, isAuto, href, isDark, colors, border }: {
  module: Module;
  price: number;
  billing: "monthly" | "annual";
  isBundle: boolean;
  isAuto: boolean;
  href: string;
  isDark: boolean;
  colors: { text: string; textMuted: string; bg: string };
  border: string;
}) {
  const [hovered, setHovered] = useState(false);

  const typeLabel = isBundle ? "Industry Bundle" : isAuto ? "Automation" : "AI Agent";
  const typeColor = isBundle ? "#f59e0b" : isAuto ? "#a78bfa" : module.color;
  const TypeIcon = isBundle ? Package : isAuto ? Zap : Bot;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `${module.color}06`
          : (isDark ? "rgba(255,255,255,0.02)" : "#ffffff"),
        border: `1px solid ${hovered ? module.color + "35" : border}`,
        borderRadius: "16px", padding: "28px",
        transition: "all 0.2s",
        display: "flex", flexDirection: "column",
        boxShadow: hovered
          ? `0 8px 40px ${module.color}12`
          : (isDark ? "none" : "0 1px 4px rgba(0,0,0,0.06)"),
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Bundle spotlight */}
      {isBundle && (
        <div style={{
          position: "absolute", top: "-30px", right: "-30px",
          width: "120px", height: "120px",
          background: `${module.color}15`,
          borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none",
        }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: `${module.color}12`, border: `1px solid ${module.color}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", flexShrink: 0,
          }}>
            {module.icon}
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: colors.text, marginBottom: "4px", lineHeight: 1.2 }}>
              {module.name}
            </h3>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              fontSize: "10px", fontWeight: 600, padding: "2px 8px",
              borderRadius: "9999px",
              background: `${typeColor}12`, color: typeColor,
              border: `1px solid ${typeColor}25`,
            }}>
              <TypeIcon size={9} /> {typeLabel}
            </span>
          </div>
        </div>

        {module.badge === "Popular" || module.badge === "Hot" ? (
          <span style={{
            fontSize: "10px", fontWeight: 700, padding: "3px 9px",
            borderRadius: "9999px",
            background: "rgba(234,179,8,0.15)", color: "#eab308",
            border: "1px solid rgba(234,179,8,0.25)",
          }}>
            ⭐ {module.badge}
          </span>
        ) : null}
      </div>

      {/* Tagline */}
      {module.tagline && (
        <p style={{ fontSize: "12px", color: module.color, fontWeight: 500, marginBottom: "8px" }}>
          {module.tagline}
        </p>
      )}

      {/* Price */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: "6px",
        marginBottom: "20px", paddingBottom: "20px",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      }}>
        <span style={{
          fontSize: "40px", fontWeight: 800, color: colors.text,
          letterSpacing: "-0.04em", lineHeight: 1,
        }}>
          ${price}
        </span>
        <div style={{ paddingBottom: "4px" }}>
          <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.2 }}>
            / month
          </p>
          {billing === "annual" && (
            <p style={{ fontSize: "10px", color: "#22c55e", fontWeight: 600 }}>
              billed annually
            </p>
          )}
        </div>
      </div>

      {/* Features */}
      <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px", flex: 1 }}>
        {(module.pricing.features || module.capabilities || []).slice(0, 5).map((feat: string, i: number) => (
          <li key={i} style={{
            display: "flex", alignItems: "flex-start", gap: "9px",
            marginBottom: "10px",
          }}>
            <div style={{
              width: "16px", height: "16px", borderRadius: "50%",
              background: `${module.color}15`, border: `1px solid ${module.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: "1px",
            }}>
              <Check size={9} color={module.color} strokeWidth={3} />
            </div>
            <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>
              {feat}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div style={{ display: "flex", gap: "8px" }}>
        <Link href="/auth/signup" style={{
          flex: 1, padding: "11px", borderRadius: "9px", textAlign: "center",
          background: module.color, color: "white",
          fontSize: "13px", fontWeight: 600, textDecoration: "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
          transition: "opacity 0.15s",
        }}>
          Start free trial <ArrowRight size={12} />
        </Link>
        <Link href={href} style={{
          padding: "11px 14px", borderRadius: "9px",
          border: `1px solid ${border}`,
          background: "transparent",
          fontSize: "12px", fontWeight: 500, color: colors.textMuted,
          textDecoration: "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          whiteSpace: "nowrap",
        }}>
          Details
        </Link>
      </div>

      {module.isComingSoon && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: "16px",
          background: isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(2px)",
        }}>
          <span style={{
            fontSize: "13px", fontWeight: 600, color: colors.textMuted,
            border: `1px solid ${border}`, padding: "8px 18px", borderRadius: "9999px",
            background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
          }}>
            Coming soon
          </span>
        </div>
      )}
    </div>
  );
}
