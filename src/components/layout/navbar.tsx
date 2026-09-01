"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { Sun, Moon, Menu, X, ChevronDown, Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const pathname = usePathname();
  const { isDark, toggleTheme, colors } = useTheme();
  const { isAr } = useLang();

  const NAV_LINKS = [
    { label: isAr ? "القطاعات" : "Industries", href: "/industries" },
    { label: isAr ? "الشات بوت" : "Chatbots", href: "/chatbots" },
    { label: tr("navAbout", lang as "en" | "ar"), href: "/about" },
    { label: tr("navPricing", lang as "en" | "ar"), href: "/pricing" },
  ];
  const langRef = useRef<HTMLDivElement>(null);

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

            {/* Language selector */}
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

            {/* Theme toggle */}
            <button onClick={toggleTheme} style={{
              width: "34px", height: "34px", borderRadius: "8px",
              background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: colors.textMuted,
            }}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

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
        }}>
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

          {/* Mobile lang row */}
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
        @media (max-width: 900px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
