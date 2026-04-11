"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Menu, X, Zap } from "lucide-react";

const navLinks = [
  { label: "Automations", href: "/automations" },
  { label: "Agents", href: "/agents" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { isDark, toggleTheme, colors } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navStyle: React.CSSProperties = {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    height: "64px",
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    transition: "all 0.3s ease",
    background: scrolled ? colors.navBg : "transparent",
    backdropFilter: scrolled ? "blur(20px)" : "none",
    borderBottom: scrolled
      ? `1px solid ${colors.border}`
      : "1px solid transparent",
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto", width: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* Logo */}
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: "10px",
            textDecoration: "none",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={16} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: "17px", fontWeight: 700,
              color: colors.text, letterSpacing: "-0.01em",
            }}>
              Nex<span style={{ color: "#a78bfa" }}>Agent</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
          }} className="desktop-nav">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} style={{
                  padding: "8px 14px", borderRadius: "8px",
                  fontSize: "14px", fontWeight: 500,
                  textDecoration: "none",
                  color: isActive ? "#a78bfa" : colors.textMuted,
                  background: isActive ? "rgba(124,58,237,0.1)" : "transparent",
                  transition: "all 0.2s",
                }}>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: "36px", height: "36px", borderRadius: "8px",
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: colors.textMuted,
                transition: "all 0.2s",
              }}
            >
              {isDark
                ? <Sun size={15} />
                : <Moon size={15} />
              }
            </button>

            {/* Sign in */}
            <Link href="/auth/login" style={{
              padding: "8px 16px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500,
              textDecoration: "none",
              color: colors.textMuted,
              border: `1px solid ${colors.border}`,
              background: "transparent",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}>
              Sign in
            </Link>

            {/* Get started */}
            <Link href="/auth/signup" style={{
              padding: "8px 18px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 600,
              textDecoration: "none", color: "white",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              whiteSpace: "nowrap",
              boxShadow: "0 0 20px rgba(124,58,237,0.3)",
            }}>
              Get started
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: "none",
                width: "36px", height: "36px", borderRadius: "8px",
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: colors.text,
              }}
              className="mobile-menu-btn"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: "64px", left: 0, right: 0,
          zIndex: 999,
          background: colors.navBg,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${colors.border}`,
          padding: "16px 24px",
        }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{
              display: "block", padding: "12px 0",
              fontSize: "15px", fontWeight: 500,
              textDecoration: "none", color: colors.textMuted,
              borderBottom: `1px solid ${colors.border}`,
            }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <Link href="/auth/login" style={{
              flex: 1, padding: "10px", borderRadius: "8px",
              textAlign: "center", fontSize: "14px", fontWeight: 500,
              textDecoration: "none", color: colors.text,
              border: `1px solid ${colors.border}`,
            }}>Sign in</Link>
            <Link href="/auth/signup" style={{
              flex: 1, padding: "10px", borderRadius: "8px",
              textAlign: "center", fontSize: "14px", fontWeight: 600,
              textDecoration: "none", color: "white",
              background: "#7c3aed",
            }}>Get started</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}