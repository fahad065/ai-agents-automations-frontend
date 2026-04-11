"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { CmsPage } from "./cms-page";
import { Loader2 } from "lucide-react";

export function LegalPage({ slug }: { slug: string }) {
  const { colors } = useTheme();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/${slug}`)
      .then((r) => r.json())
      .then(setPage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <CmsPage title={page?.title || slug} subtitle={page?.subtitle}>
      {page?.content && (
        <div
          dangerouslySetInnerHTML={{ __html: page.content }}
          style={{
            fontSize: "15px", lineHeight: 1.8,
            color: colors.textMuted,
          }}
        />
      )}
      <style>{`
        h2 { font-size: 20px; font-weight: 700; color: ${colors.text}; margin: 32px 0 12px; }
        h3 { font-size: 16px; font-weight: 600; color: ${colors.text}; margin: 24px 0 8px; }
        p { margin-bottom: 14px; }
        ul, ol { padding-left: 20px; margin-bottom: 14px; }
        li { margin-bottom: 6px; }
        strong { color: ${colors.text}; font-weight: 600; }
      `}</style>
    </CmsPage>
  );
}