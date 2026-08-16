"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { apiClient } from "@/lib/api-client";
import { ArrowRight, Bot, Zap, Package, Loader2, CheckCircle2, X, Info } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { tr, industryName, industryDesc } from "@/lib/translations";

interface Module {
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
  moduleType: "agent" | "automation";
  pipelineCategory?: "standalone" | "niche_pipeline";
  nicheSlug?: string;
  components?: Array<{ name: string; description: string; icon: string; color?: string }>;
  pricing?: { monthly: number; annual: number };
  pricingFeatures_ar?: string[];
}

const INDUSTRY_ICONS: Record<string, { icon: string; color: string }> = {
  real_estate:       { icon: "🏡", color: "#3b82f6" },
  content_social:    { icon: "🎬", color: "#7c3aed" },
  healthcare:        { icon: "🏥", color: "#22c55e" },
  hr_recruitment:    { icon: "👥", color: "#8b5cf6" },
  ecommerce_retail:  { icon: "🛒", color: "#ef4444" },
  marketing:         { icon: "📣", color: "#f59e0b" },
  hospitality:       { icon: "🏨", color: "#06b6d4" },
  education:         { icon: "🎓", color: "#f97316" },
  logistics:         { icon: "🚚", color: "#84cc16" },
  agriculture:       { icon: "🌾", color: "#84cc16" },
  finance:           { icon: "💹", color: "#10b981" },
  internal_copilot:  { icon: "⚙️", color: "#a78bfa" },
};

export function IndustryDetailPage({ slug }: { slug: string }) {
  const { colors, isDark } = useTheme();
  const { lang, isAr } = useLang();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [infoModule, setInfoModule] = useState<Module | null>(null);

  const icons = INDUSTRY_ICONS[slug] || { icon: "⚡", color: "#7c3aed" };
  const meta = {
    label: industryName(slug, lang),
    icon: icons.icon,
    color: icons.color,
    desc: industryDesc(slug, lang),
  };
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  const fetchModules = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await apiClient.get<{ data: Module[] }>("/modules", { nicheSlug: slug });
      setModules((data as any).data || (data as any));
    } catch {
      setError("Failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [slug, lang]); // re-fetch when lang changes

  useEffect(() => { fetchModules(); }, [fetchModules]);

  const pipeline = modules.find((m) => m.pipelineCategory === "niche_pipeline");
  const agents = modules.filter((m) => m.moduleType === "agent" && m.pipelineCategory !== "niche_pipeline");
  const automations = modules.filter((m) => m.moduleType === "automation" && m.pipelineCategory !== "niche_pipeline");

  const mName = (m: Module) => (isAr && m.name_ar) ? m.name_ar : m.name;
  const mTagline = (m: Module) => (isAr && m.tagline_ar) ? m.tagline_ar : m.tagline;
  const mDesc = (m: Module) => (isAr && m.description_ar) ? m.description_ar : m.description;
  const mCaps = (m: Module): string[] => (isAr && m.capabilities_ar?.length) ? m.capabilities_ar : m.capabilities;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }} dir={isAr ? "rtl" : "ltr"}>

      {/* Info modal */}
      {infoModule && (
        <InfoModal module={infoModule} onClose={() => setInfoModule(null)} isDark={isDark} colors={colors} isAr={isAr} lang={lang} />
      )}

      {/* Hero */}
      <section style={{ padding: "110px 24px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "700px", height: "400px",
          background: `${meta.color}10`,
          borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
          <div style={{ marginBottom: "28px" }}>
            <BreadcrumbNav items={[
              { label: "Industries", href: "/industries" },
              { label: meta.label },
            ]} />
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: `1px solid ${meta.color}30`, background: `${meta.color}10`,
            color: meta.color, padding: "7px 16px",
            borderRadius: "9999px", fontSize: "13px", fontWeight: 600,
            marginBottom: "20px",
          }}>
            <span style={{ fontSize: "16px" }}>{meta.icon}</span>
            {meta.label}
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 62px)", fontWeight: 800,
            color: colors.text, marginBottom: "18px",
            letterSpacing: "-0.04em", lineHeight: 1.05,
          }}>
            {isAr ? "أدوات ذكاء اصطناعي لـ" : "AI tools built for"}<br />
            <span style={{
              backgroundImage: `linear-gradient(135deg, ${meta.color}, ${meta.color}80)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {meta.label}.
            </span>
          </h1>

          <p style={{
            fontSize: "17px", color: colors.textMuted,
            maxWidth: "520px", lineHeight: 1.7, marginBottom: "28px",
          }}>
            {meta.desc}
          </p>

          {/* Counts */}
          {!loading && (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {pipeline && (
                <Chip icon={<Package size={13} color={meta.color} />} label={isAr ? "حزمة كاملة واحدة" : "1 complete bundle"} color={meta.color} isDark={isDark} />
              )}
              {agents.length > 0 && (
                <Chip icon={<Bot size={13} color={meta.color} />} label={isAr ? `${agents.length} وكيل` : `${agents.length} agent${agents.length !== 1 ? "s" : ""}`} color={meta.color} isDark={isDark} />
              )}
              {automations.length > 0 && (
                <Chip icon={<Zap size={13} color={meta.color} />} label={isAr ? `${automations.length} أتمتة` : `${automations.length} automation${automations.length !== 1 ? "s" : ""}`} color={meta.color} isDark={isDark} />
              )}
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 100px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <Loader2 size={30} color={meta.color} style={{ animation: "spin 1s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ color: colors.textMuted, fontSize: "14px" }}>{isAr ? `جاري تحميل أدوات ${meta.label}...` : `Loading ${meta.label} tools...`}</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && !loading && (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p style={{ color: "#ef4444", marginBottom: "14px" }}>{isAr ? tr("failedToLoad", "ar") : error}</p>
            <button onClick={fetchModules} style={{
              padding: "9px 20px", borderRadius: "8px",
              background: meta.color, color: "white", border: "none", cursor: "pointer", fontWeight: 600,
            }}>{tr("tryAgain", lang)}</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Pipeline Bundle */}
            {pipeline && (
              <section style={{ marginBottom: "56px" }}>
                <SectionLabel icon={<Package size={14} color={meta.color} />} label="Complete Bundle" color={meta.color} />
                <div style={{
                  background: `${meta.color}06`,
                  border: `1px solid ${meta.color}25`,
                  borderRadius: "16px", padding: "32px",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: "-40px", right: "-40px",
                    width: "180px", height: "180px",
                    background: `${meta.color}12`,
                    borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none",
                  }} />
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "18px", flexWrap: "wrap" }}>
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "13px",
                      background: `${meta.color}15`, border: `1px solid ${meta.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "26px", flexShrink: 0,
                    }}>
                      {pipeline.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: 800, color: colors.text, letterSpacing: "-0.02em" }}>
                          {mName(pipeline)}
                        </h3>
                        <span style={{
                          fontSize: "10px", fontWeight: 700, padding: "3px 10px",
                          borderRadius: "9999px",
                          background: `${meta.color}15`, color: meta.color,
                          border: `1px solid ${meta.color}30`,
                          textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>
                          {tr("fullBundle", lang)}
                        </span>
                      </div>
                      {mTagline(pipeline) && (
                        <p style={{ fontSize: "13px", color: meta.color, fontWeight: 500, marginBottom: "8px" }}>
                          {mTagline(pipeline)}
                        </p>
                      )}
                      <p style={{ fontSize: "14px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "20px", maxWidth: "560px" }}>
                        {mDesc(pipeline)}
                      </p>

                      {pipeline.components && pipeline.components.length > 0 && (
                        <div style={{ marginBottom: "22px" }}>
                          <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px", fontWeight: 600 }}>
                            {tr("whatsIncluded", lang)}
                          </p>
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                            gap: "8px",
                          }}>
                            {pipeline.components.map((comp, i) => (
                              <div key={i} style={{
                                display: "flex", alignItems: "flex-start", gap: "10px",
                                padding: "11px 13px", borderRadius: "9px",
                                background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                                border: `1px solid ${border}`,
                              }}>
                                <span style={{ fontSize: "17px", flexShrink: 0 }}>{comp.icon}</span>
                                <div>
                                  <p style={{ fontSize: "12px", fontWeight: 600, color: colors.text, marginBottom: "2px" }}>{comp.name}</p>
                                  <p style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.4 }}>{comp.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!pipeline.components?.length && mCaps(pipeline).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                          {mCaps(pipeline).map((cap) => (
                            <span key={cap} style={{
                              display: "flex", alignItems: "center", gap: "5px",
                              fontSize: "11px", padding: "4px 10px", borderRadius: "6px",
                              background: `${meta.color}10`, color: meta.color,
                              border: `1px solid ${meta.color}20`,
                            }}>
                              <CheckCircle2 size={10} /> {cap}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                        <Link href={`/agents/${pipeline.slug}`} style={{
                          display: "inline-flex", alignItems: "center", gap: "7px",
                          padding: "10px 20px", borderRadius: "9px",
                          background: meta.color, color: "white",
                          fontSize: "14px", fontWeight: 600, textDecoration: "none",
                        }}>
                          {tr("getBundle", lang)} <ArrowRight size={14} />
                        </Link>
                        {pipeline.pricing?.monthly && (
                          <span style={{ fontSize: "13px", color: colors.textMuted }}>
                            {tr("fromPerMonth", lang)} ${pipeline.pricing.monthly}{tr("perMonth", lang)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Agents */}
            {agents.length > 0 && (
              <section style={{ marginBottom: "56px" }}>
                <SectionLabel icon={<Bot size={14} color={meta.color} />} label={`${tr("aiAgents", lang)} (${agents.length})`} color={meta.color} />
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                  gap: "10px",
                }}>
                  {agents.map((m) => (
                    <ModuleCard key={m._id} module={m} isDark={isDark} colors={colors} border={border}
                      onInfo={() => setInfoModule(m)} lang={lang} isAr={isAr} />
                  ))}
                </div>
              </section>
            )}

            {/* Automations */}
            {automations.length > 0 && (
              <section style={{ marginBottom: "56px" }}>
                <SectionLabel icon={<Zap size={14} color={meta.color} />} label={`${tr("automationsLabel", lang)} (${automations.length})`} color={meta.color} />
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                  gap: "10px",
                }}>
                  {automations.map((m) => (
                    <ModuleCard key={m._id} module={m} isDark={isDark} colors={colors} border={border}
                      onInfo={() => setInfoModule(m)} lang={lang} isAr={isAr} />
                  ))}
                </div>
              </section>
            )}

            {modules.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 24px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>{meta.icon}</div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "10px" }}>
                  {tr("comingSoon", lang)}
                </h3>
                <p style={{ fontSize: "14px", color: colors.textMuted, maxWidth: "400px", margin: "0 auto 24px" }}>
                  {isAr ? `نبني أدوات ذكاء اصطناعي لـ ${meta.label}. تحقق قريباً.` : `We're building AI tools for ${meta.label}. Check back soon.`}
                </p>
                <Link href="/industries" style={{
                  display: "inline-block", padding: "11px 24px", borderRadius: "9px",
                  background: meta.color, color: "white",
                  fontSize: "14px", fontWeight: 600, textDecoration: "none",
                }}>
                  {tr("browseOther", lang)}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "16px" }}>
      {icon}
      <span style={{ fontSize: "12px", fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label}
      </span>
    </div>
  );
}

function Chip({ icon, label, color, isDark }: { icon: React.ReactNode; label: string; color: string; isDark: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "6px",
      padding: "5px 12px", borderRadius: "9999px",
      background: `${color}10`, border: `1px solid ${color}25`,
      fontSize: "12px", color, fontWeight: 500,
    }}>
      {icon} {label}
    </div>
  );
}

function ModuleCard({ module, isDark, colors, border, onInfo, lang, isAr }: {
  module: Module;
  isDark: boolean;
  colors: { text: string; textMuted: string; bg: string };
  border: string;
  onInfo: () => void;
  lang: import("@/lib/translations").Lang;
  isAr: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const href = module.moduleType === "automation"
    ? `/automations/${module.slug}`
    : `/agents/${module.slug}`;
  const name = (isAr && module.name_ar) ? module.name_ar : module.name;
  const tagline = (isAr && module.tagline_ar) ? module.tagline_ar : module.tagline;
  const desc = (isAr && module.description_ar) ? module.description_ar : module.description;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? `${module.color}06`
          : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"),
        border: `1px solid ${hovered ? module.color + "30" : border}`,
        borderRadius: "13px", padding: "20px",
        transition: "all 0.2s",
        display: "flex", flexDirection: "column",
        boxShadow: hovered ? `0 0 20px ${module.color}10` : "none",
        position: "relative",
      }}
    >
      {/* Info button */}
      <button
        onClick={(e) => { e.stopPropagation(); onInfo(); }}
        title="More info"
        style={{
          position: "absolute", top: "14px", right: "14px",
          width: "24px", height: "24px", borderRadius: "50%",
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: `1px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: colors.textMuted,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = `${module.color}15`;
          el.style.borderColor = `${module.color}30`;
          el.style.color = module.color;
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
          el.style.borderColor = border;
          el.style.color = colors.textMuted;
        }}
      >
        <Info size={12} />
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px", paddingRight: "28px" }}>
        <div style={{
          width: "42px", height: "42px", borderRadius: "10px",
          background: `${module.color}12`, border: `1px solid ${module.color}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "19px", flexShrink: 0,
        }}>
          {module.icon}
        </div>
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: colors.text, marginBottom: "3px", lineHeight: 1.3 }}>
            {name}
          </h3>
          {module.moduleType === "automation" && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "3px",
              fontSize: "10px", fontWeight: 600, padding: "1px 7px",
              borderRadius: "9999px",
              background: "rgba(124,58,237,0.1)", color: "#a78bfa",
              border: "1px solid rgba(124,58,237,0.2)",
            }}>
              <Zap size={8} /> Automation
            </span>
          )}
        </div>
      </div>

      {tagline && (
        <p style={{ fontSize: "11px", color: module.color, fontWeight: 500, marginBottom: "6px" }}>
          {tagline}
        </p>
      )}

      <p style={{ fontSize: "12px", color: colors.textMuted, lineHeight: 1.65, marginBottom: "14px", flex: 1 }}>
        {desc?.length > 100 ? desc.slice(0, 100) + "…" : desc}
      </p>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: "12px",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
      }}>
        <Link href={href} style={{
          fontSize: "12px", fontWeight: 600, color: module.color,
          display: "flex", alignItems: "center", gap: "4px",
          textDecoration: "none",
        }}>
          {tr("viewDetails", lang)} <ArrowRight size={11} />
        </Link>
        {module.pricing?.monthly ? (
          <span style={{ fontSize: "11px", color: colors.textMuted }}>
            from ${module.pricing.monthly}/mo
          </span>
        ) : null}
      </div>
    </div>
  );
}

function InfoModal({ module, onClose, isDark, colors, isAr, lang }: {
  module: Module;
  onClose: () => void;
  isDark: boolean;
  colors: { text: string; textMuted: string; bg: string };
  isAr: boolean;
  lang: import("@/lib/translations").Lang;
}) {
  const name = (isAr && module.name_ar) ? module.name_ar : module.name;
  const tagline = (isAr && module.tagline_ar) ? module.tagline_ar : module.tagline;
  const desc = (isAr && module.description_ar) ? module.description_ar : module.description;
  const caps: string[] = (isAr && module.capabilities_ar?.length) ? module.capabilities_ar : module.capabilities;
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const href = module.moduleType === "automation"
    ? `/automations/${module.slug}`
    : `/agents/${module.slug}`;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{
        background: isDark ? "#111111" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        borderRadius: "16px", padding: "28px",
        maxWidth: "480px", width: "100%",
        boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
        position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "16px", right: "16px",
          width: "28px", height: "28px", borderRadius: "7px",
          background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: colors.textMuted,
        }}>
          <X size={14} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "11px",
            background: `${module.color}12`, border: `1px solid ${module.color}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px", flexShrink: 0,
          }}>
            {module.icon}
          </div>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: colors.text, marginBottom: "3px" }}>
              {name}
            </h3>
            <span style={{
              fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px",
              background: module.badge === "Live" ? "rgba(34,197,94,0.1)" : `${module.color}12`,
              color: module.badge === "Live" ? "#22c55e" : module.color,
              border: `1px solid ${module.badge === "Live" ? "rgba(34,197,94,0.2)" : module.color + "25"}`,
            }}>
              {module.badge || tr("active", lang)}
            </span>
          </div>
        </div>

        {tagline && (
          <p style={{ fontSize: "13px", color: module.color, fontWeight: 500, marginBottom: "10px" }}>
            {tagline}
          </p>
        )}

        <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.7, marginBottom: "18px" }}>
          {desc}
        </p>

        {caps?.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, marginBottom: "8px" }}>
              {tr("capabilities", lang)}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {caps.map((cap) => (
                <span key={cap} style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  fontSize: "11px", padding: "3px 9px", borderRadius: "5px",
                  background: `${module.color}10`, color: module.color,
                  border: `1px solid ${module.color}20`,
                }}>
                  <CheckCircle2 size={9} /> {cap}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <Link href={href} style={{
            flex: 1, padding: "11px", borderRadius: "9px", textAlign: "center",
            background: module.color, color: "white",
            fontSize: "14px", fontWeight: 600, textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}>
            {tr("viewDetails", lang)} <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
