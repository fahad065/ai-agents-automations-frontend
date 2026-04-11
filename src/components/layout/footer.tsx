"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { Zap } from "lucide-react";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";

const links = {
  Product: [
    { label: "Automations", href: "/automations" },
    { label: "AI Agents", href: "/agents" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  Legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
    { label: "Cookie policy", href: "/cookies" },
  ],
};

const socials = [
  { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
  { icon: FaGithub, href: "https://github.com", label: "GitHub" },
  { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

export function Footer() {
  const { colors } = useTheme();

  return (
    <footer style={{
      borderTop: `1px solid ${colors.border}`,
      background: colors.bg,
      padding: "64px 24px 32px",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Top grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "40px",
          marginBottom: "48px",
        }}>

          {/* Brand col */}
          <div style={{ minWidth: "200px" }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              textDecoration: "none", marginBottom: "14px",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "7px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={14} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 700, color: colors.text, fontSize: "15px" }}>
                Nex<span style={{ color: "#a78bfa" }}>Agent</span>
              </span>
            </Link>
            <p style={{
              color: colors.textMuted, fontSize: "13px",
              lineHeight: 1.7, maxWidth: "220px", marginBottom: "20px",
            }}>
              The AI automation platform for creators and businesses. Deploy agents, not employees.
            </p>

            {/* Socials */}
            <div style={{ display: "flex", gap: "8px" }}>
              {socials.map((s) => {
                const IconComponent = s.icon;
                return (
                  <Link key={s.label} href={s.href} style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    background: colors.bgCard,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: colors.textMuted, textDecoration: "none",
                    transition: "all 0.2s",
                  }}>
                    <IconComponent size={14} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p style={{
                color: colors.text, fontSize: "13px",
                fontWeight: 600, marginBottom: "14px",
              }}>
                {group}
              </p>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {items.map((item) => (
                  <li key={item.label} style={{ marginBottom: "10px" }}>
                    <Link href={item.href} style={{
                      color: colors.textMuted, fontSize: "13px",
                      textDecoration: "none",
                    }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${colors.border}`,
          paddingTop: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          textAlign: "center",
        }}>
          <p style={{ color: colors.textMuted, fontSize: "12px" }}>
            © {new Date().getFullYear()} NexAgent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}