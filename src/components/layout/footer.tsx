"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const SOCIALS = [
  { icon: FaTwitter, href: "https://twitter.com/logicmate", label: "X / Twitter" },
  { icon: FaInstagram, href: "https://instagram.com/logicmate", label: "Instagram" },
  { icon: FaLinkedin, href: "https://linkedin.com/company/logicmate", label: "LinkedIn" },
];

export function Footer() {
  const { colors, isDark } = useTheme();
  const { lang, isAr } = useLang();

  const LINKS = {
    [tr("footerProduct", lang)]: [
      { label: isAr ? "القطاعات" : "Industries", href: "/industries" },
      { label: isAr ? "الوكلاء الذكيون" : "AI Agents", href: "/agents" },
      { label: isAr ? "الأتمتة" : "Automations", href: "/automations" },
      { label: isAr ? "الشات بوت" : "Chatbots", href: "/chatbots" },
      { label: isAr ? "الأسعار" : "Pricing", href: "/pricing" },
    ],
    [tr("footerCompany", lang)]: [
      { label: isAr ? "عن الشركة" : "About", href: "/about" },
      { label: isAr ? "المدونة" : "Blog", href: "/blog" },
      { label: isAr ? "تواصل معنا" : "Contact", href: "/contact" },
      { label: isAr ? "الأسئلة الشائعة" : "FAQ", href: "/faq" },
    ],
    [tr("footerLegal", lang)]: [
      { label: isAr ? "سياسة الخصوصية" : "Privacy Policy", href: "/privacy" },
      { label: isAr ? "شروط الخدمة" : "Terms of Service", href: "/terms" },
      { label: isAr ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy", href: "/cookies" },
      { label: isAr ? "سياسة الاسترداد" : "Refund Policy", href: "/refund" },
    ],
  };
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  return (
    <footer style={{
      borderTop: `1px solid ${border}`,
      background: colors.bg,
      padding: "72px 24px 40px",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

        {/* Top grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "48px", marginBottom: "64px",
        }}>

          {/* Brand */}
          <div style={{ minWidth: "200px" }}>
            <Link href="/" style={{
              display: "inline-flex", alignItems: "center", gap: "9px",
              textDecoration: "none", marginBottom: "16px",
            }}>
              <div style={{
                width: "30px", height: "30px", borderRadius: "8px",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <img src="/icon.svg" width="30" height="30" style={{ borderRadius: "8px" }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: "15px", color: colors.text }}>
                Logic<span style={{ color: "#a78bfa" }}>Mate</span>
              </span>
            </Link>
            <p style={{
              color: colors.textMuted, fontSize: "13px",
              lineHeight: 1.75, maxWidth: "220px", marginBottom: "24px",
            }}>
              {tr("footerDesc", lang)}
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label} style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: `1px solid ${border}`,
                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: colors.textMuted, textDecoration: "none",
                  }}>
                    <Icon size={13} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p style={{
                color: colors.text, fontSize: "12px",
                fontWeight: 700, marginBottom: "16px",
                letterSpacing: "0.05em", textTransform: "uppercase",
              }}>
                {group}
              </p>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {items.map((item) => (
                  <li key={item.label} style={{ marginBottom: "10px" }}>
                    <Link href={item.href} style={{
                      color: colors.textMuted, fontSize: "13px",
                      textDecoration: "none", lineHeight: 1,
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
          borderTop: `1px solid ${border}`,
          paddingTop: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{ color: colors.textMuted, fontSize: "12px" }}>
            © {new Date().getFullYear()} LogicMate. {tr("footerAllRightsReserved", lang)}
          </p>
        </div>
      </div>
    </footer>
  );
}
