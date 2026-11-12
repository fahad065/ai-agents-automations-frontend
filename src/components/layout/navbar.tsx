"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { Menu, X, ChevronDown, Globe, ArrowRight, LayoutGrid } from "lucide-react";
import { SERVICE_TYPES, ALL_SERVICES_HREF, isServicesPath } from "@/config/service-types";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

// Hidden, not removed — flip this back to `true` to bring the language
// switcher back (desktop dropdown + mobile row). Everything underneath it
// (useLang, lm_lang localStorage, the lm_lang_change event) is untouched,
// so re-enabling is just this one flag.
const SHOW_LANGUAGE_SELECTOR = false;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const pathname = usePathname();
  const { isDark, colors } = useTheme();
  const { isAr } = useLang();

  // "Services" is a menu (see SERVICE_TYPES), not a plain link — it's the
  // one entry point to everything LogicMate sells.
  const NAV_LINKS = [
    { label: tr("navAbout", lang as "en" | "ar"), href: "/about" },
    { label: tr("navPricing", lang as "en" | "ar"), href: "/pricing" },
  ];
  const servicesLabel = isAr ? "الخدمات" : "Services";
  const langRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  // Small delay so moving the pointer from the trigger into the panel
  // doesn't flicker it shut.
  const scheduleCloseServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 150);
  };

  useEffect(() => {
    setServicesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setServicesOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("lm_lang");
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) setServicesOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectLang = (code: string) => {
    setLang(code);
    localStorage.setItem("lm_lang", code);
    setLangOpen(false);
    window.dispatchEvent(new CustomEvent("lm_lang_change", { detail: code }));
  };

  const border = scrolled ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)") : "transparent";
  const dropdownBg = isDark ? "#111111" : "#ffffff";
  const dropdownBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        height: "64px", display: "flex", alignItems: "center", padding: "0 24px",
        transition: "all 0.3s ease",
        background: scrolled ? (isDark ? "rgba(8,8,8,0.85)" : "rgba(255,255,255,0.85)") : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: `1px solid ${border}`,
      }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto", width: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "9px", textDecoration: "none" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img src="/icon.svg" width="30" height="30" style={{ borderRadius: "8px" }} />
            </div>
            <span style={{ fontSize: "17px", fontWeight: 700, color: colors.text, letterSpacing: "-0.01em" }}>
              Logic<span style={{ color: "#a78bfa" }}>Mate</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {/* Services menu */}
            <div
              ref={servicesRef}
              style={{ position: "relative" }}
              onMouseEnter={openServices}
              onMouseLeave={scheduleCloseServices}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={servicesOpen}
                onClick={() => setServicesOpen((o) => !o)}
                style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "7px 11px 7px 13px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontSize: "14px", fontWeight: 500, fontFamily: "inherit",
                  color: isServicesPath(pathname) || servicesOpen ? "#a78bfa" : colors.textMuted,
                  background: isServicesPath(pathname) ? "rgba(124,58,237,0.1)" : "transparent",
                }}
              >
                {servicesLabel}
                <ChevronDown size={14} style={{ transition: "transform 0.15s", transform: servicesOpen ? "rotate(180deg)" : "none" }} />
              </button>

              {servicesOpen && (
                <div
                  role="menu"
                  style={{
                    position: "absolute", top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
                    width: "380px", padding: "8px",
                    background: dropdownBg, border: `1px solid ${dropdownBorder}`, borderRadius: "14px",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.16)", zIndex: 100,
                  }}
                >
                  {SERVICE_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = pathname === t.href || pathname.startsWith(t.href + "/");
                    return (
                      <Link
                        key={t.key}
                        href={t.href}
                        role="menuitem"
                        className="lm-menu-item"
                        style={{
                          display: "flex", alignItems: "flex-start", gap: "12px",
                          padding: "10px 12px", borderRadius: "10px", textDecoration: "none",
                          background: active ? "rgba(124,58,237,0.08)" : undefined,
                        }}
                      >
                        <span style={{
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          width: "34px", height: "34px", borderRadius: "9px",
                          background: `${t.color}14`, border: `1px solid ${t.color}30`, color: t.color,
                        }}>
                          <Icon size={17} />
                        </span>
                        <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
                            {isAr ? t.label_ar : t.label}
                          </span>
                          <span style={{ fontSize: "12px", lineHeight: 1.45, color: colors.textMuted }}>
                            {isAr ? t.description_ar : t.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                  <div style={{ height: "1px", margin: "6px 4px", background: dropdownBorder }} />
                  <Link
                    href={ALL_SERVICES_HREF}
                    role="menuitem"
                    className="lm-menu-item"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "10px 12px", borderRadius: "10px", textDecoration: "none",
                      fontSize: "13px", fontWeight: 600, color: "#a78bfa",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <LayoutGrid size={15} /> {isAr ? "كل الخدمات" : "View all services"}
                    </span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: "7px 13px", borderRadius: "8px",
                  fontSize: "14px", fontWeight: 500, textDecoration: "none",
                  color: isActive ? "#a78bfa" : colors.textMuted,
                  background: isActive ? "rgba(124,58,237,0.1)" : "transparent",
                  transition: "all 0.15s",
                }}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>

            {/* Language selector — hidden via SHOW_LANGUAGE_SELECTOR, not removed */}
            {SHOW_LANGUAGE_SELECTOR && (
              <div ref={langRef} className="desktop-nav" style={{ position: "relative" }}>
                <button onClick={() => setLangOpen(!langOpen)} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "6px 10px", borderRadius: "8px",
                  background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                  cursor: "pointer", color: colors.text, fontSize: "13px", fontWeight: 500,
                }}>
                  <Globe size={12} color={colors.textMuted} />
                  <span style={{ textTransform: "uppercase" }}>{lang}</span>
                  <ChevronDown size={11} color={colors.textMuted} />
                </button>
                {langOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    background: dropdownBg, border: `1px solid ${dropdownBorder}`,
                    borderRadius: "10px", overflow: "hidden", minWidth: "100px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                    zIndex: 100,
                  }}>
                    {LANGUAGES.map((l) => (
                      <button key={l.code} onClick={() => selectLang(l.code)} style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        width: "100%", padding: "10px 14px",
                        background: lang === l.code ? "rgba(124,58,237,0.08)" : "transparent",
                        border: "none", cursor: "pointer",
                        color: lang === l.code ? "#a78bfa" : colors.text,
                        fontSize: "13px", fontWeight: lang === l.code ? 600 : 400, textAlign: "left",
                      }}>
                        {l.label}
                        {lang === l.code && <span style={{ marginLeft: "auto", fontSize: "10px", color: "#a78bfa" }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sign in */}
            <Link href="/auth/login" className="desktop-nav" style={{
              padding: "7px 14px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500, textDecoration: "none",
              color: colors.textMuted,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              background: "transparent", whiteSpace: "nowrap",
            }}>
              {tr("navSignIn", lang as "en" | "ar")}
            </Link>

            {/* Get started */}
            <Link href="/auth/signup" className="desktop-nav" style={{
              padding: "7px 16px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              color: "white", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              whiteSpace: "nowrap", boxShadow: "0 0 20px rgba(124,58,237,0.3)",
            }}>
              {tr("navGetStarted", lang as "en" | "ar")}
            </Link>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn" style={{
              display: "none", width: "34px", height: "34px", borderRadius: "8px",
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: colors.text,
            }}>
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: "64px", left: 0, right: 0, zIndex: 999,
          background: isDark ? "rgba(8,8,8,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
          padding: "16px 24px 24px",
          maxHeight: "calc(100vh - 64px)", overflowY: "auto",
        }}>
          {/* Services — expandable group */}
          <button
            type="button"
            aria-expanded={mobileServicesOpen}
            onClick={() => setMobileServicesOpen((o) => !o)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
              padding: "13px 0", border: "none", background: "transparent", cursor: "pointer",
              fontSize: "15px", fontWeight: 500, fontFamily: "inherit",
              color: isServicesPath(pathname) ? "#a78bfa" : colors.textMuted,
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            {servicesLabel}
            <ChevronDown size={16} style={{ transition: "transform 0.15s", transform: mobileServicesOpen ? "rotate(180deg)" : "none" }} />
          </button>
          {mobileServicesOpen && (
            <div style={{ padding: "6px 0 8px" }}>
              {SERVICE_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <Link key={t.key} href={t.href} onClick={() => setMobileOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 4px", textDecoration: "none", fontSize: "14px", color: colors.text,
                  }}>
                    <Icon size={16} color={t.color} /> {isAr ? t.label_ar : t.label}
                  </Link>
                );
              })}
              <Link href={ALL_SERVICES_HREF} onClick={() => setMobileOpen(false)} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 4px", textDecoration: "none", fontSize: "14px", fontWeight: 600, color: "#a78bfa",
              }}>
                <LayoutGrid size={16} /> {isAr ? "كل الخدمات" : "View all services"}
              </Link>
            </div>
          )}

          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} style={{
              display: "block", padding: "13px 0",
              fontSize: "15px", fontWeight: 500, textDecoration: "none",
              color: colors.textMuted,
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}>
              {link.label}
            </Link>
          ))}

          {/* Mobile lang row — hidden via SHOW_LANGUAGE_SELECTOR, not removed */}
          {SHOW_LANGUAGE_SELECTOR && (
            <div style={{ display: "flex", gap: "8px", marginTop: "16px", marginBottom: "12px" }}>
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => selectLang(l.code)} style={{
                  padding: "7px 12px", borderRadius: "8px", cursor: "pointer",
                  border: `1px solid ${lang === l.code ? "rgba(124,58,237,0.4)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)")}`,
                  background: lang === l.code ? "rgba(124,58,237,0.1)" : "transparent",
                  color: lang === l.code ? "#a78bfa" : colors.text,
                  fontSize: "13px", fontWeight: 500,
                }}>
                  {l.label.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <Link href="/auth/login" onClick={() => setMobileOpen(false)} style={{
              flex: 1, padding: "11px", borderRadius: "9px", textAlign: "center",
              fontSize: "14px", fontWeight: 500, textDecoration: "none", color: colors.text,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            }}>{tr("navSignIn", lang as "en" | "ar")}</Link>
            <Link href="/auth/signup" onClick={() => setMobileOpen(false)} style={{
              flex: 1, padding: "11px", borderRadius: "9px", textAlign: "center",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              color: "white", background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            }}>{tr("navGetStarted", lang as "en" | "ar")}</Link>
          </div>
        </div>
      )}

      <style>{`
        .lm-menu-item:hover { background: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.035)"}; }
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
