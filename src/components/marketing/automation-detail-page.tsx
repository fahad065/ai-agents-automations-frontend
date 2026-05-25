"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, Star, ChevronDown, ChevronUp,
  CheckCircle2, Play, Loader2, ExternalLink,
  ArrowLeft,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface AutomationTemplate {
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
  heroStats: { label: string; value: string }[];
  features: { title: string; description: string; icon: string }[];
  howItWorks: { step: string; title: string; description: string }[];
  testimonials: { name: string; role: string; avatar: string; text: string; rating: number }[];
  pricing: { monthly: number; annual: number; features: string[]; hasCustomPlan?: boolean; customLabel?: string };
  faq: { question: string; answer: string }[];
  integrations: { name: string; icon: string; description: string }[];
  demoVideoUrl?: string;
  isComingSoon?: boolean;
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      border: `1px solid ${colors.border}`,
      borderRadius: "10px", overflow: "hidden", marginBottom: "8px",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "16px 20px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          background: colors.bgCard, border: "none",
          cursor: "pointer", textAlign: "left", gap: "12px",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 500, color: colors.text }}>
          {question}
        </span>
        {open
          ? <ChevronUp size={16} color={colors.textMuted} style={{ flexShrink: 0 }} />
          : <ChevronDown size={16} color={colors.textMuted} style={{ flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div style={{
          padding: "0 20px 16px", background: colors.bgCard,
          borderTop: `1px solid ${colors.border}`,
        }}>
          <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7, paddingTop: "12px" }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function AutomationDetailPage({ slug }: { slug: string }) {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const [automation, setAutomation] = useState<AutomationTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAutomation = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        const res = await fetch(`${apiUrl}/modules/${slug}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setAutomation(data);
      } catch {
        setError("Automation not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchAutomation();
  }, [slug]);

  useEffect(() => {
    if (!automation) return;
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" });
      if (featuresRef.current?.children) {
        gsap.from(Array.from(featuresRef.current.children), {
          opacity: 0, y: 24, duration: 0.5, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: featuresRef.current, start: "top 85%" },
        });
      }
    });
    return () => ctx.revert();
  }, [automation]);

  if (loading) {
    return (
      <div style={{
        minHeight: "60vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "16px",
      }}>
        <Loader2 size={32} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ color: colors.textMuted }}>Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !automation) {
    return (
      <div style={{
        minHeight: "60vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: "16px",
      }}>
        <p style={{ fontSize: "18px", color: colors.text }}>Automation not found</p>
        <Link href="/automations" style={{ color: "#a78bfa", textDecoration: "none" }}>
          Browse all automations
        </Link>
      </div>
    );
  }

  const embedUrl = automation.demoVideoUrl
    ? automation.demoVideoUrl
        .replace("youtu.be/", "www.youtube.com/embed/")
        .replace("watch?v=", "embed/")
    : "";

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} style={{ padding: "100px 24px 64px", borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Link href="/automations" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: colors.textMuted, textDecoration: "none",
            fontSize: "13px", marginBottom: "32px",
          }}>
            <ArrowLeft size={14} /> All automations
          </Link>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "48px", alignItems: "center",
          }}>
            {/* Left */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px",
                  background: `${automation.color}15`,
                  border: `1px solid ${automation.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "26px",
                }}>
                  {automation.icon}
                </div>
                <span style={{
                  fontSize: "12px", fontWeight: 600,
                  padding: "4px 12px", borderRadius: "9999px",
                  background: automation.badge === "Live"
                    ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.08)",
                  color: automation.badge === "Live" ? "#22c55e" : colors.textMuted,
                  border: `1px solid ${automation.badge === "Live"
                    ? "rgba(34,197,94,0.2)" : colors.border}`,
                }}>
                  {automation.badge}
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
                color: colors.text, marginBottom: "12px",
                letterSpacing: "-0.02em", lineHeight: 1.1,
              }}>
                {automation.name}
              </h1>

              {automation.tagline && (
                <p style={{ fontSize: "18px", color: automation.color, fontWeight: 500, marginBottom: "16px" }}>
                  {automation.tagline}
                </p>
              )}

              <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "32px" }}>
                {automation.description}
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/auth/signup"}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "white", padding: "13px 28px", borderRadius: "10px",
                    fontSize: "15px", fontWeight: 600, textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                  }}
                >
                  {automation.badge === "Live"
                    ? (isAuthenticated ? "Open dashboard" : "Get started free")
                    : "Join waitlist"
                  }
                  <ArrowRight size={15} />
                </Link>

                {automation.demoVideoUrl && (
                  <a
                    href={automation.demoVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      border: `1px solid ${colors.border}`,
                      color: colors.textMuted, padding: "13px 28px",
                      borderRadius: "10px", fontSize: "15px",
                      fontWeight: 500, textDecoration: "none",
                      background: colors.bgCard,
                    }}
                  >
                    <Play size={14} /> Watch demo
                  </a>
                )}
              </div>
            </div>

            {/* Hero stats */}
            {automation.heroStats?.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {automation.heroStats.map((stat) => (
                  <div key={stat.label} style={{
                    background: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px", padding: "20px", textAlign: "center",
                  }}>
                    <p style={{
                      fontSize: "26px", fontWeight: 800, color: automation.color,
                      lineHeight: 1, marginBottom: "6px",
                    }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "12px", color: colors.textMuted }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      {automation.isComingSoon && (
        <section style={{
          padding: "32px 24px",
          background: `${automation.color}08`,
          borderBottom: `1px solid ${automation.color}20`,
        }}>
          <div style={{
            maxWidth: "1100px", margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: `${automation.color}15`, border: `1px solid ${automation.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", flexShrink: 0,
              }}>
                🚀
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: colors.text, marginBottom: "2px" }}>
                  This automation is coming soon
                </p>
                <p style={{ fontSize: "13px", color: colors.textMuted }}>
                  We're actively building this. Join the waitlist to get notified and receive 40% off at launch.
                </p>
              </div>
            </div>
            <Link href="/auth/signup" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: `linear-gradient(135deg, ${automation.color}, ${automation.color}cc)`,
              color: "white", padding: "11px 24px", borderRadius: "10px",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              Join waitlist <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* Demo video */}
      {automation.demoVideoUrl && embedUrl && (
        <section style={{
          padding: "64px 24px",
          borderBottom: `1px solid ${colors.border}`,
          background: colors.bgCard,
        }}>
          <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{
              fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700,
              color: colors.text, marginBottom: "12px",
            }}>
              See it in action
            </h2>
            <p style={{ fontSize: "16px", color: colors.textMuted, marginBottom: "32px" }}>
              A real example of this automation running end to end.
            </p>
            <div style={{
              position: "relative", paddingBottom: "56.25%",
              borderRadius: "14px", overflow: "hidden",
              border: `1px solid ${colors.border}`,
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            }}>
              <iframe
                src={embedUrl}
                title={`${automation.name} demo`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: "100%", height: "100%", border: "none",
                }}
              />
            </div>
            <a
              href={automation.demoVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                marginTop: "16px", color: colors.textMuted,
                fontSize: "13px", textDecoration: "none",
              }}
            >
              <ExternalLink size={13} /> Watch on YouTube
            </a>
          </div>
        </section>
      )}

      {/* Capabilities */}
      {automation.capabilities?.length > 0 && (
        <section style={{ padding: "64px 24px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{
                fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700,
                color: colors.text, marginBottom: "8px",
              }}>
                What {automation.name} does
              </h2>
              <p style={{ fontSize: "15px", color: colors.textMuted }}>
                Everything handled automatically — no manual work required.
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "12px",
            }}>
              {automation.capabilities.map((cap) => (
                <div key={cap} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "10px", padding: "14px 16px",
                }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: automation.color, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: "13px", color: colors.text, fontWeight: 500 }}>
                    {cap}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {automation.features?.length > 0 && (
        <section style={{ padding: "80px 24px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                Everything included
              </h2>
              <p style={{ fontSize: "16px", color: colors.textMuted }}>
                No extra tools needed. The automation handles everything.
              </p>
            </div>
            <div ref={featuresRef} style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}>
              {automation.features.map((feature) => (
                <div key={feature.title} style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px", padding: "22px",
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>{feature.icon}</div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.7 }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      {automation.howItWorks?.length > 0 && (
        <section style={{
          padding: "80px 24px",
          background: colors.bgCard,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                How it works
              </h2>
              <p style={{ fontSize: "16px", color: colors.textMuted }}>
                Up and running in under 10 minutes.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {automation.howItWorks.map((step, i) => (
                <div key={step.step} style={{
                  display: "flex", gap: "20px",
                  paddingBottom: i < automation.howItWorks.length - 1 ? "32px" : 0,
                  position: "relative",
                }}>
                  {i < automation.howItWorks.length - 1 && (
                    <div style={{
                      position: "absolute", left: "19px", top: "44px",
                      width: "2px", bottom: 0,
                      background: `${automation.color}30`,
                    }} />
                  )}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: `${automation.color}15`,
                    border: `2px solid ${automation.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, zIndex: 1,
                  }}>
                    <span style={{
                      fontSize: "12px", fontWeight: 700,
                      color: automation.color, fontFamily: "monospace",
                    }}>
                      {step.step}
                    </span>
                  </div>
                  <div style={{ paddingTop: "6px" }}>
                    <h3 style={{
                      fontSize: "16px", fontWeight: 600,
                      color: colors.text, marginBottom: "6px",
                    }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7 }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Integrations */}
      {automation.integrations?.length > 0 && (
        <section style={{ padding: "80px 24px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                Integrations
              </h2>
              <p style={{ fontSize: "16px", color: colors.textMuted }}>
                Works with the tools you already use.
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "12px",
            }}>
              {automation.integrations.map((integration) => (
                <div key={integration.name} style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px", padding: "16px", textAlign: "center",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{integration.icon}</div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "4px" }}>
                    {integration.name}
                  </p>
                  <p style={{ fontSize: "11px", color: colors.textMuted }}>
                    {integration.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {automation.testimonials?.length > 0 && (
        <section style={{
          padding: "80px 24px",
          background: colors.bgCard,
          borderBottom: `1px solid ${colors.border}`,
        }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                What users say
              </h2>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}>
              {automation.testimonials.map((t) => (
                <div key={t.name} style={{
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "12px", padding: "22px",
                }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={13} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{
                    fontSize: "14px", color: colors.textMuted,
                    lineHeight: 1.7, marginBottom: "16px",
                  }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: `${automation.color}20`,
                      border: `1px solid ${automation.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, color: automation.color,
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: "12px", color: colors.textMuted }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {automation.pricing && (
        <section style={{ padding: "80px 24px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{
              fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
              color: colors.text, marginBottom: "12px",
            }}>
              Simple pricing
            </h2>
            <p style={{ fontSize: "16px", color: colors.textMuted, marginBottom: "48px" }}>
              One plan. Everything included. Cancel anytime.
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: automation.pricing?.hasCustomPlan
                ? "repeat(3, 1fr)"
                : "repeat(2, 1fr)",
              gap: "16px",
              maxWidth: automation.pricing?.hasCustomPlan ? "900px" : "640px",
              margin: "0 auto",
            }}>

              {/* Monthly */}
              <div style={{
                background: colors.bg, border: `1px solid ${colors.border}`,
                borderRadius: "16px", padding: "28px",
                textAlign: "left", display: "flex", flexDirection: "column",
              }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: colors.textMuted, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly</p>
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "40px", fontWeight: 800, color: colors.text }}>${automation.pricing.monthly}</span>
                  <span style={{ fontSize: "14px", color: colors.textMuted }}>/mo</span>
                </div>
                <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px" }}>Billed monthly. Cancel anytime.</p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px", flex: 1 }}>
                  {automation.pricing.features.slice(0, 5).map((feature) => (
                    <li key={feature} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", fontSize: "13px", color: colors.textMuted }}>
                      <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  border: `1px solid ${colors.border}`, background: colors.bgCard,
                  color: colors.text, padding: "12px", borderRadius: "10px",
                  fontSize: "14px", fontWeight: 600, textDecoration: "none",
                }}>
                  {automation.badge === "Live" ? (isAuthenticated ? "Open dashboard" : "Get started") : "Join waitlist"}
                </Link>
              </div>

              {/* Annual — highlighted */}
              <div style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(109,40,217,0.04))",
                border: "2px solid rgba(124,58,237,0.4)",
                borderRadius: "16px", padding: "28px",
                textAlign: "left", display: "flex", flexDirection: "column",
                position: "relative", boxShadow: "0 0 40px rgba(124,58,237,0.1)",
              }}>
                <div style={{
                  position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white", padding: "4px 16px", borderRadius: "9999px",
                  fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
                }}>
                  ⭐ Most Popular
                </div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#a78bfa", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Annual</p>
                <div style={{ marginBottom: "4px" }}>
                  <span style={{ fontSize: "40px", fontWeight: 800, color: colors.text }}>${automation.pricing.annual}</span>
                  <span style={{ fontSize: "14px", color: colors.textMuted }}>/mo</span>
                </div>
                <p style={{ fontSize: "12px", color: "#22c55e", marginBottom: "20px", fontWeight: 600 }}>
                  Save ${(automation.pricing.monthly - automation.pricing.annual) * 12}/year — billed annually
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px", flex: 1 }}>
                  {automation.pricing.features.map((feature) => (
                    <li key={feature} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", fontSize: "13px", color: colors.text }}>
                      <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={isAuthenticated ? "/dashboard" : "/auth/signup"} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white", padding: "12px", borderRadius: "10px",
                  fontSize: "14px", fontWeight: 600, textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                }}>
                  {automation.badge === "Live" ? (isAuthenticated ? "Open dashboard" : "Start free trial") : "Join waitlist"}
                  <ArrowRight size={14} />
                </Link>
                <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "10px", textAlign: "center" }}>No credit card required</p>
              </div>

              {/* Enterprise */}
              {automation.pricing?.hasCustomPlan && (
                <div style={{
                  background: colors.bg, border: `1px solid ${colors.border}`,
                  borderRadius: "16px", padding: "28px",
                  textAlign: "left", display: "flex", flexDirection: "column",
                }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: colors.textMuted, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Enterprise</p>
                  <div style={{ marginBottom: "20px" }}>
                    <span style={{ fontSize: "40px", fontWeight: 800, color: colors.text }}>Custom</span>
                  </div>
                  <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px", lineHeight: 1.6 }}>
                    {automation.pricing.customLabel || "Need a tailored solution for your team or business?"}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px", flex: 1 }}>
                    {["Custom pipeline configuration", "Dedicated support", "SLA guarantee", "Custom integrations", "Team management"].map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", fontSize: "13px", color: colors.textMuted }}>
                        <CheckCircle2 size={13} color="#7c3aed" style={{ flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="mailto:hello@logicmate.io" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.06)",
                    color: "#a78bfa", padding: "12px", borderRadius: "10px",
                    fontSize: "14px", fontWeight: 600, textDecoration: "none",
                  }}>
                    Contact us →
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {automation.faq?.length > 0 && (
        <section style={{ padding: "80px 24px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                Frequently asked questions
              </h2>
            </div>
            {automation.faq.map((item) => (
              <FaqItem key={item.question} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{
          maxWidth: "600px", margin: "0 auto", textAlign: "center",
          background: `${automation.color}08`,
          border: `1px solid ${automation.color}20`,
          borderRadius: "20px", padding: "56px 40px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>{automation.icon}</div>
          <h2 style={{
            fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700,
            color: colors.text, marginBottom: "12px",
          }}>
            Ready to deploy {automation.name}?
          </h2>
          <p style={{
            fontSize: "16px", color: colors.textMuted,
            marginBottom: "28px", lineHeight: 1.7,
          }}>
            {automation.badge === "Live"
              ? "Get started in minutes. No technical setup required."
              : "Join the waitlist and get 40% off when we launch."
            }
          </p>
          <Link
            href={isAuthenticated ? "/dashboard" : "/auth/signup"}
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "white", padding: "14px 32px", borderRadius: "10px",
              fontSize: "15px", fontWeight: 600, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
            }}
          >
            {automation.badge === "Live"
              ? (isAuthenticated ? "Open dashboard" : "Start free")
              : "Join waitlist"
            }
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}