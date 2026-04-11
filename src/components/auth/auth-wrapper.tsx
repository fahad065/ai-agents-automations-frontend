"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { Zap, Sun, Moon } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthWrapper({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthWrapperProps) {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <div style={{
      minHeight: "100vh",
      background: colors.bg,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 24px",
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: "8px",
          textDecoration: "none",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={15} color="white" strokeWidth={2.5} />
          </div>
          <span style={{
            fontSize: "16px", fontWeight: 700, color: colors.text,
          }}>
            Nex<span style={{ color: "#a78bfa" }}>Agent</span>
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: colors.textMuted,
          }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{
              fontSize: "clamp(22px, 4vw, 28px)",
              fontWeight: 700, color: colors.text,
              marginBottom: "8px",
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: "14px", color: colors.textMuted, lineHeight: 1.6,
            }}>
              {subtitle}
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: "16px",
            padding: "32px",
          }}>
            {children}
          </div>

          {/* Footer */}
          <p style={{
            textAlign: "center", marginTop: "20px",
            fontSize: "14px", color: colors.textMuted,
          }}>
            {footerText}{" "}
            <Link href={footerLinkHref} style={{
              color: "#a78bfa", textDecoration: "none", fontWeight: 500,
            }}>
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}