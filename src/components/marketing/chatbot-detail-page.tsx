"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { useAuthStore } from "@/store/auth.store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, Star, ChevronDown, ChevronUp,
  CheckCircle2, Play, Loader2,
  ArrowLeft,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// Maps a chatbot template module's slug to the Chatbot.template enum the
// backend expects on creation (see chatbot.schema.ts).
const TEMPLATE_ENUM: Record<string, string> = {
  "restaurant-chatbot": "restaurant",
  "real-estate-chatbot": "real_estate",
  "clinic-chatbot": "clinic",
  "ecommerce-chatbot": "ecommerce",
  "gym-chatbot": "gym",
  "education-chatbot": "education",
};

interface ChatbotModule {
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
  capabilities_ar?: string[];
  heroStats: { label: string; value: string }[];
  features: { title: string; description: string; icon: string }[];
  howItWorks: { step: string; title: string; description: string }[];
  testimonials: { name: string; role: string; avatar: string; text: string; rating: number }[];
  faq: { question: string; answer: string }[];
  demoVideoUrl?: string;
  isComingSoon?: boolean;
  // Same pricing shape agents/automations use — admin-edited from the same
  // /dashboard/cms-modules form, not a separate chatbot-only system.
  pricing?: { monthly: number; annual: number; features: string[]; hasCustomPlan?: boolean; customLabel?: string };
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      border: `1px solid ${colors.border}`,
      borderRadius: "10px", overflow: "hidden",
      marginBottom: "8px",
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "16px 20px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          background: colors.bgCard, border: "none",
          cursor: "pointer", textAlign: "left",
          gap: "12px",
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
          padding: "0 20px 16px",
          background: colors.bgCard,
          borderTop: `1px solid ${colors.border}`,
        }}>
          <p style={{
            fontSize: "14px", color: colors.textMuted,
            lineHeight: 1.7, paddingTop: "12px",
          }}>
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

export function ChatbotDetailPage({ slug }: { slug: string }) {
  const { colors, isDark } = useTheme();
  const { isAr } = useLang();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [agent, setAgent] = useState<ChatbotModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        const res = await fetch(`${apiUrl}/modules/${slug}`);
        if (!res.ok) throw new Error("Chatbot template not found");
        const data = await res.json();
        setAgent(data);
        setVideoError(false);
      } catch {
        setError("Chatbot template not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [slug]);

  useEffect(() => {
    if (!agent) return;
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        opacity: 0, y: 30, duration: 0.8, ease: "power3.out",
      });
      if (featuresRef.current?.children) {
        gsap.from(Array.from(featuresRef.current.children), {
          opacity: 0, y: 24, duration: 0.5, stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: featuresRef.current, start: "top 85%" },
        });
      }
    });
    return () => ctx.revert();
  }, [agent]);

  // Picking a pricing card creates the chatbot pre-filled with this template
  // (auto-30-day-trial, billed at module.pricing.monthly — see
  // ChatbotsService.create() on the backend) and takes the owner straight
  // into the config portal to set it up. One plan, everything included —
  // same story as agents/automations, so Monthly and Annual both just start
  // the trial; there's no separate tier to choose between.
  const handleGetStarted = async () => {
    if (!agent) return;
    if (!isAuthenticated) {
      router.push("/auth/signup");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/chatbots", {
        name: agent.name,
        description: agent.description,
        template: TEMPLATE_ENUM[agent.slug] || "custom",
        language: "both",
        moduleSlug: agent.slug,
      });
      const created = res.data?.data || res.data;
      toast.success("Chatbot created — 30-day free trial started!");
      router.push(`/dashboard/chatbots/${created._id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create chatbot");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg }}>
        <Navbar />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "70vh", flexDirection: "column", gap: "16px",
        }}>
          <Loader2 size={32} color="#7c3aed"
            style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ color: colors.textMuted }}>Loading chatbot...</p>
        </div>
        <Footer />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg }}>
        <Navbar />
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "70vh", flexDirection: "column", gap: "16px",
        }}>
          <p style={{ fontSize: "18px", color: colors.text }}>Chatbot template not found</p>
          <Link href="/chatbots" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "14px" }}>
            Browse all chatbots
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} style={{
        padding: "100px 24px 72px",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)",
          width: "600px", height: "400px",
          background: `${agent.color}07`, borderRadius: "50%",
          filter: "blur(80px)", pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <Link href="/chatbots" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: colors.textMuted, textDecoration: "none",
            fontSize: "13px", marginBottom: "40px", opacity: 0.7,
          }}>
            <ArrowLeft size={13} /> {isAr ? "كل الشات بوتات" : "All chatbots"}
          </Link>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "56px", alignItems: "center",
          }}>
            {/* Left */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px",
                  background: `${agent.color}12`, border: `1px solid ${agent.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "26px",
                }}>
                  {agent.icon}
                </div>
                <span style={{
                  fontSize: "11px", fontWeight: 700,
                  padding: "4px 12px", borderRadius: "9999px",
                  background: agent.badge === "Live" ? "rgba(34,197,94,0.1)" : `${agent.color}12`,
                  color: agent.badge === "Live" ? "#22c55e" : agent.color,
                  border: `1px solid ${agent.badge === "Live" ? "rgba(34,197,94,0.2)" : agent.color + "25"}`,
                }}>
                  {agent.badge}
                </span>
              </div>

              <h1 style={{
                fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 800,
                color: colors.text, marginBottom: "14px",
                letterSpacing: "-0.04em", lineHeight: 1.05,
              }}>
                {(isAr && agent.name_ar) ? agent.name_ar : agent.name}
              </h1>

              {((isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline) && (
                <p style={{ fontSize: "18px", color: agent.color, fontWeight: 500, marginBottom: "18px", lineHeight: 1.4 }}>
                  {(isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline}
                </p>
              )}

              <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.75, marginBottom: "36px" }}>
                {(isAr && agent.description_ar) ? agent.description_ar : agent.description}
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <a
                  href="#pricing"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "white", padding: "14px 30px", borderRadius: "10px",
                    fontSize: "15px", fontWeight: 600, textDecoration: "none",
                    boxShadow: "0 4px 24px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.3)",
                  }}
                >
                  {isAr ? "شوف الأسعار" : "See pricing"}
                  <ArrowRight size={15} />
                </a>

                {agent.demoVideoUrl && (
                  <a
                    href={agent.demoVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                      color: colors.textMuted, padding: "14px 24px",
                      borderRadius: "10px", fontSize: "15px",
                      fontWeight: 500, textDecoration: "none",
                      background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    }}
                  >
                    <Play size={14} /> {isAr ? "شاهد العرض" : "Watch demo"}
                  </a>
                )}
              </div>
            </div>

            {/* Right — hero stats */}
            {agent.heroStats?.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {agent.heroStats.map((stat) => (
                  <div key={stat.label} style={{
                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                    borderRadius: "14px", padding: "22px", textAlign: "center",
                  }}>
                    <p style={{
                      fontSize: "30px", fontWeight: 800, color: agent.color,
                      lineHeight: 1, marginBottom: "6px", letterSpacing: "-0.02em",
                    }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: "12px", color: colors.textMuted }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
          
      {agent.isComingSoon && (
        <section style={{
          padding: "32px 24px",
          background: `${agent.color}08`,
          borderBottom: `1px solid ${agent.color}20`,
        }}>
          <div style={{
            maxWidth: "1100px", margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: `${agent.color}15`, border: `1px solid ${agent.color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", flexShrink: 0,
              }}>
                🚀
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: colors.text, marginBottom: "2px" }}>
                  This chatbot template is coming soon
                </p>
                <p style={{ fontSize: "13px", color: colors.textMuted }}>
                  We're actively building this. Join the waitlist to get notified and receive 40% off at launch.
                </p>
              </div>
            </div>
            <Link href="/auth/signup" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: `linear-gradient(135deg, ${agent.color}, ${agent.color}cc)`,
              color: "white", padding: "11px 24px", borderRadius: "10px",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              Join waitlist <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* Demo video — a real recording of this bot answering real questions
          through the live /chat/:embedKey endpoint, not a mockup (see the
          frontend CLAUDE.md marketing-assets section for how these were made). */}
      {agent.demoVideoUrl && (
        <section id="demo" style={{
          padding: "64px 24px",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
          background: colors.bgCard,
        }}>
          <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{
              fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700,
              color: colors.text, marginBottom: "12px",
            }}>
              {isAr ? "شوف كيف يعمل" : "See it in action"}
            </h2>
            <p style={{ fontSize: "16px", color: colors.textMuted, marginBottom: "32px" }}>
              {isAr ? "تسجيل حقيقي للبوت يرد على أسئلة حقيقية." : "A real recording of this bot answering real questions."}
            </p>

            <div style={{
              borderRadius: "14px", overflow: "hidden",
              border: `1px solid ${colors.border}`,
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
              minHeight: videoError ? "0" : undefined,
            }}>
              {videoError ? (
                <div style={{
                  aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center",
                  background: "black", color: "#a3a3a3", fontSize: "13px", flexDirection: "column", gap: "8px",
                }}>
                  <Play size={24} color="#525252" />
                  {isAr ? "تعذر تحميل الفيديو حالياً." : "This video couldn't be loaded right now."}
                  <a href={agent.demoVideoUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a78bfa", fontSize: "12px" }}>
                    {isAr ? "افتح الفيديو مباشرة" : "Open video directly"} →
                  </a>
                </div>
              ) : (
                <video
                  key={agent.demoVideoUrl}
                  src={agent.demoVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  onError={() => setVideoError(true)}
                  style={{ width: "100%", display: "block", aspectRatio: "16/9", background: "black" }}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {agent.capabilities?.length > 0 && (
        <section style={{ padding: "64px 24px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{
                fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 700,
                color: colors.text, marginBottom: "8px",
              }}>
                {isAr ? `ما يفعله ${(isAr && agent.name_ar) ? agent.name_ar : agent.name}` : `What ${agent.name} does`}
              </h2>
              <p style={{ fontSize: "15px", color: colors.textMuted }}>
                {isAr ? "يتم التعامل مع كل شيء تلقائياً — لا يلزم أي عمل يدوي." : "Everything handled automatically — no manual work required."}
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "12px",
            }}>
              {((isAr && agent.capabilities_ar?.length) ? agent.capabilities_ar : agent.capabilities).map((cap) => (
                <div key={cap} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                  borderRadius: "10px", padding: "14px 16px",
                }}>
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: agent.color, flexShrink: 0,
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
      {agent.features?.length > 0 && (
        <section style={{ padding: "80px 24px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                {isAr ? "كل شيء مشمول" : "Everything included"}
              </h2>
              <p style={{ fontSize: "16px", color: colors.textMuted }}>
                {isAr ? "لا حاجة لأدوات إضافية. كل شيء يعمل داخل الوكيل." : "No extra tools needed. Everything runs inside the agent."}
              </p>
            </div>

            <div ref={featuresRef} style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}>
              {agent.features.map((feature) => (
                <div key={feature.title} style={{
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                  borderRadius: "12px", padding: "22px",
                }}>
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>
                    {feature.icon}
                  </div>
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
      {agent.howItWorks?.length > 0 && (
        <section style={{
          padding: "80px 24px",
          background: colors.bgCard,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                {isAr ? "كيف يعمل" : "How it works"}
              </h2>
              <p style={{ fontSize: "16px", color: colors.textMuted }}>
                {isAr ? "من الإعداد إلى الأتمتة الكاملة في أقل من 10 دقائق." : "From setup to fully automated in under 10 minutes."}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {agent.howItWorks.map((step, i) => (
                <div key={step.step} style={{
                  display: "flex", gap: "20px",
                  paddingBottom: i < agent.howItWorks.length - 1 ? "32px" : 0,
                  position: "relative",
                }}>
                  {i < agent.howItWorks.length - 1 && (
                    <div style={{
                      position: "absolute", left: "19px", top: "44px",
                      width: "2px", bottom: 0,
                      background: `${agent.color}30`,
                    }} />
                  )}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: `${agent.color}15`,
                    border: `2px solid ${agent.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, zIndex: 1,
                  }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: agent.color, fontFamily: "monospace" }}>
                      {step.step}
                    </span>
                  </div>
                  <div style={{ paddingTop: "6px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
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

      {/* Testimonials */}
      {agent.testimonials?.length > 0 && (
        <section style={{ padding: "80px 24px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                {isAr ? "ماذا يقول المستخدمون" : "What creators say"}
              </h2>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}>
              {agent.testimonials.map((t) => (
                <div key={t.name} style={{
                  background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                  borderRadius: "12px", padding: "22px",
                }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={13} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "16px" }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: `${agent.color}20`,
                      border: `1px solid ${agent.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700, color: agent.color,
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>
                        {t.name}
                      </p>
                      <p style={{ fontSize: "12px", color: colors.textMuted }}>
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing — same shape as agents/automations: module.pricing, admin-edited from /dashboard/cms-modules */}
      {agent.pricing && agent.pricing.monthly > 0 && (
        <section id="pricing" style={{
          padding: "80px 24px",
          background: colors.bgCard,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
        }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
            <h2 style={{
              fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
              color: colors.text, marginBottom: "12px",
            }}>
              {isAr ? "تسعير بسيط" : "Simple pricing"}
            </h2>
            <p style={{ fontSize: "16px", color: colors.textMuted, marginBottom: "48px" }}>
              {isAr ? "خطة واحدة. كل شيء مشمول — الموقع + واتساب + إنستغرام. إلغاء في أي وقت." : "One plan. Everything included — website + WhatsApp + Instagram. Cancel anytime."}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: agent.pricing?.hasCustomPlan ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
              gap: "16px",
              maxWidth: agent.pricing?.hasCustomPlan ? "900px" : "640px",
              margin: "0 auto",
            }}>

              {/* Monthly */}
              <div style={{
                background: colors.bg, border: `1px solid ${colors.border}`,
                borderRadius: "16px", padding: "28px",
                textAlign: "left", display: "flex", flexDirection: "column",
              }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: colors.textMuted, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{isAr ? "شهري" : "Monthly"}</p>
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "40px", fontWeight: 800, color: colors.text }}>${agent.pricing.monthly}</span>
                  <span style={{ fontSize: "14px", color: colors.textMuted }}>/mo</span>
                </div>
                <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px" }}>{isAr ? "يُحسب شهرياً. إلغاء في أي وقت." : "Billed monthly. Cancel anytime."}</p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px", flex: 1 }}>
                  {agent.pricing.features.slice(0, 5).map((feature) => (
                    <li key={feature} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", fontSize: "13px", color: colors.textMuted }}>
                      <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} disabled={creating} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  border: `1px solid ${colors.border}`, background: colors.bgCard,
                  color: colors.text, padding: "12px", borderRadius: "10px",
                  fontSize: "14px", fontWeight: 600, cursor: creating ? "default" : "pointer",
                  opacity: creating ? 0.7 : 1,
                }}>
                  {creating ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : (isAuthenticated ? (isAr ? "ابدأ" : "Get started") : (isAr ? "ابدأ" : "Get started"))}
                </button>
              </div>

              {/* Annual */}
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
                  ⭐ {isAr ? "الأكثر شيوعاً" : "Most Popular"}
                </div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#a78bfa", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{isAr ? "سنوي" : "Annual"}</p>
                <div style={{ marginBottom: "4px" }}>
                  <span style={{ fontSize: "40px", fontWeight: 800, color: colors.text }}>${agent.pricing.annual}</span>
                  <span style={{ fontSize: "14px", color: colors.textMuted }}>/mo</span>
                </div>
                <p style={{ fontSize: "12px", color: "#22c55e", marginBottom: "20px", fontWeight: 600 }}>
                  Save ${(agent.pricing.monthly - agent.pricing.annual) * 12}/year — billed annually
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px", flex: 1 }}>
                  {agent.pricing.features.map((feature) => (
                    <li key={feature} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", fontSize: "13px", color: colors.text }}>
                      <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button onClick={handleGetStarted} disabled={creating} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "white", padding: "12px", borderRadius: "10px",
                  fontSize: "14px", fontWeight: 600, cursor: creating ? "default" : "pointer",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                  opacity: creating ? 0.7 : 1,
                }}>
                  {creating ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : (
                    <>
                      {isAr ? "ابدأ التجربة المجانية" : "Start free trial"}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
                <p style={{ fontSize: "11px", color: colors.textMuted, marginTop: "10px", textAlign: "center" }}>{isAr ? "لا حاجة لبطاقة ائتمان" : "No credit card required"}</p>
              </div>

              {/* Custom / Enterprise */}
              {agent.pricing?.hasCustomPlan && (
                <div style={{
                  background: colors.bg, border: `1px solid ${colors.border}`,
                  borderRadius: "16px", padding: "28px",
                  textAlign: "left", display: "flex", flexDirection: "column",
                }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: colors.textMuted, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{isAr ? "مؤسسي" : "Enterprise"}</p>
                  <div style={{ marginBottom: "20px" }}>
                    <span style={{ fontSize: "40px", fontWeight: 800, color: colors.text }}>{isAr ? "مخصص" : "Custom"}</span>
                  </div>
                  <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "20px", lineHeight: 1.6 }}>
                    {agent.pricing.customLabel || "Need a tailored solution for your business?"}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px", flex: 1 }}>
                    {["Multiple locations / bots", "Dedicated onboarding", "Custom integrations", "Priority support"].map((f) => (
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
                    {isAr ? "تواصل معنا" : "Contact us"} →
                  </a>
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {agent.faq?.length > 0 && (
        <section style={{ padding: "80px 24px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h2 style={{
                fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 700,
                color: colors.text, marginBottom: "12px",
              }}>
                {isAr ? "الأسئلة الشائعة" : "Frequently asked questions"}
              </h2>
            </div>
            {agent.faq.map((item) => (
              <FaqItem key={item.question} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{
          maxWidth: "600px", margin: "0 auto", textAlign: "center",
          background: `${agent.color}08`,
          border: `1px solid ${agent.color}20`,
          borderRadius: "20px", padding: "56px 40px",
        }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>{agent.icon}</div>
          <h2 style={{
            fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700,
            color: colors.text, marginBottom: "12px",
          }}>
            {isAr ? `جاهز تطلق ${(isAr && agent.name_ar) ? agent.name_ar : agent.name}؟` : `Ready to launch ${agent.name}?`}
          </h2>
          <p style={{ fontSize: "16px", color: colors.textMuted, marginBottom: "28px", lineHeight: 1.7 }}>
            {agent.badge === "Live"
              ? (isAr ? "30 يوم تجربة مجانية. بدون بطاقة ائتمان." : "30-day free trial. No credit card required.")
              : (isAr ? "انضم للقائمة واحصل على خصم 40% عند الإطلاق." : "Join the waitlist and get 40% off when we launch.")
            }
          </p>
          {agent.badge === "Live" ? (
            <a
              href="#pricing"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white", padding: "14px 32px", borderRadius: "10px",
                fontSize: "15px", fontWeight: 600, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              }}
            >
              {isAr ? "شوف الأسعار" : "See pricing"}
              <ArrowRight size={15} />
            </a>
          ) : (
            <Link
              href="/auth/signup"
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "white", padding: "14px 32px", borderRadius: "10px",
                fontSize: "15px", fontWeight: 600, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
              }}
            >
              {isAr ? "انضم للقائمة" : "Join waitlist"}
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}