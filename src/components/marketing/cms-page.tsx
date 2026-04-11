"use client";

import { useTheme } from "@/hooks/use-theme";

interface CmsPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function CmsPage({ title, subtitle, children, maxWidth = "760px" }: CmsPageProps) {
  const { colors } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      {/* Header */}
      <section style={{
        padding: "100px 24px 48px",
        borderBottom: `1px solid ${colors.border}`,
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800,
            color: colors.text, marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: "16px", color: colors.textMuted, lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <div style={{
        maxWidth, margin: "0 auto",
        padding: "56px 24px 96px",
      }}>
        {children}
      </div>
    </div>
  );
}

// Renders HTML content from CMS with proper styling
export function CmsContent({ html }: { html: string }) {
  const { colors } = useTheme();

  return (
    <>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        style={{ color: colors.textMuted }}
      />
      <style>{`
        .cms-content h2 {
          font-size: 22px;
          font-weight: 700;
          color: ${colors.text};
          margin: 32px 0 12px;
        }
        .cms-content h3 {
          font-size: 17px;
          font-weight: 600;
          color: ${colors.text};
          margin: 24px 0 8px;
        }
        .cms-content p {
          font-size: 15px;
          line-height: 1.8;
          color: ${colors.textMuted};
          margin-bottom: 16px;
        }
        .cms-content ul, .cms-content ol {
          padding-left: 20px;
          margin-bottom: 16px;
        }
        .cms-content li {
          font-size: 15px;
          line-height: 1.8;
          color: ${colors.textMuted};
          margin-bottom: 6px;
        }
        .cms-content strong {
          color: ${colors.text};
          font-weight: 600;
        }
        .cms-content a {
          color: #a78bfa;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}