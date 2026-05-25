"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { Check, ArrowRight, Loader2, Star } from "lucide-react";

interface Module {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  moduleType: string;
  category: string;
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
  estimatedCostPerRun?: string;
  isComingSoon: boolean;
}

const formatCategory = (val: string) =>
  val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const BILLING_TOGGLE = ["Monthly", "Annual"];

export function PricingPage() {
  const { colors } = useTheme();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<"Monthly" | "Annual">("Annual");
  const [typeFilter, setTypeFilter] = useState<"all" | "agent" | "automation">("all");

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/modules?limit=50`, { cache: "no-store" });
      const data = await res.json();
      setModules(data.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const filtered = modules.filter(m =>
    typeFilter === "all" || m.moduleType === typeFilter
  );

  const getPrice = (m: Module) =>
    billing === "Annual" ? m.pricing?.annual : m.pricing?.monthly;

  const getSaving = (m: Module) => {
    if (!m.pricing?.monthly || !m.pricing?.annual) return null;
    const saving = (m.pricing.monthly - m.pricing.annual) * 12;
    return saving > 0 ? saving : null;
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>

      {/* Hero */}
      <section style={{ padding: "120px 24px 60px", textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.08)",
          color: "#a78bfa", padding: "6px 16px", borderRadius: "9999px",
          fontSize: "13px", fontWeight: 500, marginBottom: "24px",
        }}>
          <Star size={12} /> Simple, transparent pricing
        </span>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800,
          letterSpacing: "-0.03em", color: colors.text, marginBottom: "16px", lineHeight: 1.1,
        }}>
          Pay only for what you use
        </h1>
        <p style={{ fontSize: "18px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "40px" }}>
          Start with a 30-day free trial on any module. No credit card required.
          Bring your own API keys to keep costs low.
        </p>

        {/* Billing toggle */}
        <div style={{
          display: "inline-flex", background: colors.bgCard,
          border: `1px solid ${colors.border}`, borderRadius: "10px", padding: "4px",
          marginBottom: "16px",
        }}>
          {BILLING_TOGGLE.map((b) => (
            <button key={b} onClick={() => setBilling(b as any)} style={{
              padding: "8px 24px", borderRadius: "7px", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", border: "none",
              background: billing === b ? "#7c3aed" : "transparent",
              color: billing === b ? "white" : colors.textMuted,
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              {b}
              {b === "Annual" && (
                <span style={{
                  fontSize: "10px", background: "rgba(34,197,94,0.15)", color: "#22c55e",
                  padding: "2px 6px", borderRadius: "4px",
                }}>Save up to 20%</span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          {(["all", "agent", "automation"] as const).map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
              cursor: "pointer", border: `1px solid ${typeFilter === t ? "#7c3aed" : colors.border}`,
              background: typeFilter === t ? "rgba(124,58,237,0.1)" : "transparent",
              color: typeFilter === t ? "#a78bfa" : colors.textMuted,
            }}>
              {t === "all" ? "All Modules" : t === "agent" ? "🤖 Agents" : "⚡ Automations"}
            </button>
          ))}
        </div>
      </section>

      {/* Free trial banner */}
      <div style={{ maxWidth: "1100px", margin: "0 auto 32px", padding: "0 24px" }}>
        <div style={{
          background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: "12px", padding: "16px 24px",
          display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
        }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
            background: "rgba(124,58,237,0.15)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: "18px",
          }}>
            🎁
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
              30-day free trial on every module
            </p>
            <p style={{ fontSize: "13px", color: colors.textMuted }}>
              Try any agent or automation free for 30 days. No credit card required. Cancel anytime.
            </p>
          </div>
          <Link href="/auth/signup" style={{
            display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px",
            borderRadius: "8px", background: "#7c3aed", color: "white",
            textDecoration: "none", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap",
          }}>
            Start free trial <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Module cards */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px" }}>
        {loading ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <p style={{ fontSize: "16px", color: colors.textMuted }}>No modules available yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {filtered.map((m) => {
              const price = getPrice(m);
              const saving = getSaving(m);
              const isFree = !price || price === 0;

              return (
                <div key={m._id} style={{
                  background: colors.bgCard, border: `1px solid ${colors.border}`,
                  borderRadius: "16px", overflow: "hidden",
                  display: "flex", flexDirection: "column",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${m.color}40`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${m.color}10`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = colors.border;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  {/* Card header */}
                  <div style={{ padding: "24px 24px 0" }}>
                    <div style={{
                      display: "flex", alignItems: "flex-start",
                      justifyContent: "space-between", marginBottom: "14px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                        <div style={{
                          width: "48px", height: "48px", borderRadius: "12px", fontSize: "24px",
                          background: `${m.color}12`, border: `1px solid ${m.color}20`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {m.icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: "15px", fontWeight: 700, color: colors.text,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {m.name}
                          </p>
                          <p style={{ fontSize: "11px", color: colors.textMuted }}>
                            {m.moduleType.charAt(0).toUpperCase() + m.moduleType.slice(1)}
                            {" · "}
                            {formatCategory(m.category)}
                          </p>
                        </div>
                      </div>

                      {/* Single badge — no overlap */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end", flexShrink: 0, marginLeft: "8px" }}>
                        <span style={{
                          fontSize: "10px", fontWeight: 600, padding: "2px 8px",
                          borderRadius: "9999px", whiteSpace: "nowrap",
                          background: m.isComingSoon
                            ? "rgba(245,158,11,0.1)"
                            : m.badge === "Live"
                            ? "rgba(34,197,94,0.1)"
                            : `${m.color}15`,
                          color: m.isComingSoon ? "#f59e0b"
                            : m.badge === "Live" ? "#22c55e"
                            : m.color,
                        }}>
                          {m.isComingSoon ? "Coming Soon" : m.badge || "Active"}
                        </span>
                        {billing === "Annual" && saving && !m.isComingSoon && (
                          <span style={{
                            fontSize: "10px", fontWeight: 600, padding: "2px 8px",
                            borderRadius: "9999px", whiteSpace: "nowrap",
                            background: "rgba(34,197,94,0.1)", color: "#22c55e",
                          }}>
                            Save ${saving}/yr
                          </span>
                        )}
                      </div>
                    </div>

                    {m.tagline && (
                      <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6, marginBottom: "16px" }}>
                        {m.tagline}
                      </p>
                    )}

                    {/* Price */}
                    <div style={{ marginBottom: "20px" }}>
                      {isFree ? (
                        <p style={{ fontSize: "32px", fontWeight: 800, color: "#22c55e" }}>Free</p>
                      ) : (
                        <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                          <span style={{ fontSize: "32px", fontWeight: 800, color: colors.text }}>
                            ${price}
                          </span>
                          <span style={{ fontSize: "13px", color: colors.textMuted }}>/mo</span>
                          {billing === "Annual" && m.pricing?.monthly && (
                            <span style={{
                              fontSize: "12px", color: colors.textMuted,
                              textDecoration: "line-through", marginLeft: "6px",
                            }}>
                              ${m.pricing.monthly}
                            </span>
                          )}
                        </div>
                      )}
                      {m.estimatedCostPerRun && (
                        <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "2px" }}>
                          + ~{m.estimatedCostPerRun} per run (API cost)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: "1px", background: colors.border, margin: "0 24px" }} />

                  {/* Features */}
                  <div style={{ padding: "16px 24px", flex: 1 }}>
                    {billing === "Annual"
                      ? (m.pricing?.features || []).slice(0, 6).map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                            <Check size={13} color="#22c55e" style={{ marginTop: "2px", flexShrink: 0 }} />
                            <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>{f}</span>
                          </div>
                        ))
                      : (m.pricing?.features || []).slice(0, 4).map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                            <Check size={13} color={m.color} style={{ marginTop: "2px", flexShrink: 0 }} />
                            <span style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5 }}>{f}</span>
                          </div>
                        ))
                    }
                    {billing === "Annual" && (m.pricing?.features?.length || 0) > 6 && (
                      <p style={{ fontSize: "12px", color: colors.textMuted, marginTop: "4px" }}>
                        + {(m.pricing?.features?.length || 0) - 6} more features
                      </p>
                    )}
                  </div>

                  {/* Custom pricing note */}
                  {m.pricing?.hasCustomPlan && (
                    <div style={{
                      margin: "0 24px 12px",
                      padding: "10px 14px", borderRadius: "8px",
                      background: "rgba(124,58,237,0.06)",
                      border: "1px solid rgba(124,58,237,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: "8px",
                    }}>
                      <div>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "#a78bfa", marginBottom: "1px" }}>
                          🏢 Enterprise available
                        </p>
                        <p style={{ fontSize: "11px", color: colors.textMuted }}>
                          Custom pricing for teams
                        </p>
                      </div>
                      <a href="mailto:hello@logicmate.io" style={{
                        fontSize: "11px", fontWeight: 600, color: "#a78bfa",
                        textDecoration: "none", whiteSpace: "nowrap",
                        padding: "4px 10px", borderRadius: "6px",
                        border: "1px solid rgba(124,58,237,0.3)",
                        background: "rgba(124,58,237,0.08)",
                      }}>
                        Contact →
                      </a>
                    </div>
                  )}

                  {/* CTA */}
                  <div style={{ padding: "0 24px 24px" }}>
                    {m.isComingSoon ? (
                      <button disabled style={{
                        width: "100%", padding: "12px", borderRadius: "9px",
                        background: colors.border, color: colors.textMuted,
                        border: "none", fontSize: "14px", fontWeight: 600, cursor: "not-allowed",
                      }}>
                        Join Waitlist
                      </button>
                    ) : (
                      <Link href="/auth/signup" style={{
                        display: "block", width: "100%", padding: "12px", borderRadius: "9px",
                        background: `linear-gradient(135deg, ${m.color}, ${m.color}cc)`,
                        color: "white", border: "none", fontSize: "14px", fontWeight: 600,
                        cursor: "pointer", textAlign: "center", textDecoration: "none",
                        boxShadow: `0 4px 14px ${m.color}30`,
                      }}>
                        Start free trial
                      </Link>
                    )}
                    <p style={{ fontSize: "11px", color: colors.textMuted, textAlign: "center", marginTop: "8px" }}>
                      30-day free trial · No credit card
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Enterprise CTA */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{
          background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: "16px", padding: "40px 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "24px",
        }}>
          <div>
            <p style={{ fontSize: "22px", fontWeight: 700, color: colors.text, marginBottom: "8px" }}>
              🏢 Need an enterprise solution?
            </p>
            <p style={{ fontSize: "15px", color: colors.textMuted, maxWidth: "480px", lineHeight: 1.6 }}>
              Custom pipelines, dedicated support, SLA guarantee, team management and white-label options.
              Built for agencies and enterprise clients in the GCC and beyond.
            </p>
          </div>
          <a href="mailto:hello@logicmate.io" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "13px 28px", borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "white", textDecoration: "none",
            fontSize: "15px", fontWeight: 600, whiteSpace: "nowrap",
            boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
          }}>
            Contact us <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        maxWidth: "700px", margin: "0 auto", padding: "0 24px 100px",
        borderTop: `1px solid ${colors.border}`, paddingTop: "60px",
      }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, color: colors.text, textAlign: "center", marginBottom: "40px" }}>
          Frequently asked questions
        </h2>
        {[
          { q: "Do I need my own API keys?", a: "Yes. You connect your own OpenAI, Seedance and other API keys. This keeps costs transparent — you pay APIs directly at cost with no markup from us." },
          { q: "What happens after the free trial?", a: "After 30 days your module pauses. You can upgrade to a paid plan or contact us for an extension. No charges without your consent." },
          { q: "Can I cancel anytime?", a: "Yes. Cancel from your dashboard at any time. Your module will remain active until the end of your billing period." },
          { q: "What does 'per run cost' mean?", a: "Each pipeline run uses AI APIs (OpenAI, Seedance etc.) which have usage costs. These are billed directly to your API accounts — we don't mark them up." },
          { q: "What's the difference between monthly and annual?", a: "Annual billing saves you up to 20% compared to monthly. Both plans include the same features — annual just costs less per month." },
          { q: "Can I use multiple modules?", a: "Yes — subscribe to as many modules as you need. Each has its own 30-day trial and independent billing cycle." },
          { q: "Do you offer custom enterprise plans?", a: "Yes. Contact us at hello@logicmate.io for custom pricing, white-label options, dedicated support and SLA agreements for teams and agencies." },
        ].map(({ q, a }, i) => (
          <div key={i} style={{ padding: "20px 0", borderBottom: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: "15px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>{q}</p>
            <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7 }}>{a}</p>
          </div>
        ))}
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}