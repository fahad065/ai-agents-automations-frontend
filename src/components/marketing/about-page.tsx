"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { CmsPage } from "./cms-page";
import { Loader2, Heart, Zap, Shield, Users } from "lucide-react";

interface PageData {
  title: string;
  subtitle: string;
  content: string;
  teamMembers: { name: string; role: string; bio: string; avatar: string }[];
}

const VALUES = [
  { icon: Heart, color: "#ef4444", label: "Transparent", desc: "We tell you exactly what our agents do, what they cost, and how they work." },
  { icon: Zap, color: "#f59e0b", label: "Efficient", desc: "Quality over quantity. 10 agents that work perfectly beats 100 that work poorly." },
  { icon: Shield, color: "#22c55e", label: "Secure", desc: "Your API keys are AES-256 encrypted. Your content is yours. We never train on your data." },
  { icon: Users, color: "#7c3aed", label: "Accessible", desc: "AI automation should not cost thousands per month. We keep prices low." },
];

export function AboutPage() {
  const { colors } = useTheme();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/about`)
      .then((r) => r.json())
      .then(setPage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <CmsPage title={page?.title || "About NexAgent"} subtitle={page?.subtitle} maxWidth="900px">

      {/* Content */}
      {page?.content && (
        <div
          dangerouslySetInnerHTML={{ __html: page.content }}
          style={{
            fontSize: "16px", lineHeight: 1.8,
            color: colors.textMuted, marginBottom: "64px",
          }}
        />
      )}

      {/* Values */}
      <div style={{ marginBottom: "64px" }}>
        <h2 style={{
          fontSize: "24px", fontWeight: 700,
          color: colors.text, marginBottom: "24px",
        }}>
          Our values
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}>
          {VALUES.map((v) => {
            const IconComponent = v.icon;
            return (
              <div key={v.label} style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px", padding: "20px",
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: `${v.color}15`,
                  border: `1px solid ${v.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "12px",
                }}>
                  <IconComponent size={18} color={v.color} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
                  {v.label}
                </p>
                <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team */}
      {page?.teamMembers && page.teamMembers.length > 0 && (
        <div>
          <h2 style={{
            fontSize: "24px", fontWeight: 700,
            color: colors.text, marginBottom: "24px",
          }}>
            The team
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {page.teamMembers.map((member) => (
              <div key={member.name} style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px", padding: "24px",
                display: "flex", gap: "16px",
              }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "50%",
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: 700, color: "#a78bfa",
                  flexShrink: 0,
                }}>
                  {member.avatar}
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: colors.text, marginBottom: "2px" }}>
                    {member.name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 500, marginBottom: "8px" }}>
                    {member.role}
                  </p>
                  <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </CmsPage>
  );
}