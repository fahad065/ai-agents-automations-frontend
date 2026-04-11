"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { CmsPage } from "./cms-page";
import { ArrowLeft, Clock, Eye, Calendar, Loader2 } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  authorName: string;
  publishedAt: string;
  readTimeMinutes: number;
  viewCount: number;
}

export function BlogPostPage({ slug }: { slug: string }) {
  const { colors } = useTheme();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/blog/${slug}`)
      .then((r) => r.json())
      .then(setPost)
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

  if (!post) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
        <p style={{ color: colors.text, fontSize: "16px" }}>Post not found</p>
        <Link href="/blog" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "14px" }}>
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <CmsPage title={post.title} subtitle={post.excerpt}>
      {/* Back + meta */}
      <div style={{ marginBottom: "32px" }}>
        <Link href="/blog" style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          color: colors.textMuted, textDecoration: "none",
          fontSize: "13px", marginBottom: "20px",
        }}>
          <ArrowLeft size={13} /> All posts
        </Link>

        <div style={{
          display: "flex", flexWrap: "wrap",
          alignItems: "center", gap: "16px",
          padding: "14px 0", borderBottom: `1px solid ${colors.border}`,
        }}>
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "3px 10px",
            borderRadius: "9999px", background: "rgba(124,58,237,0.1)",
            color: "#a78bfa",
          }}>
            {post.category}
          </span>
          <span style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "12px", color: colors.textMuted,
          }}>
            <Calendar size={12} />
            {new Date(post.publishedAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
          <span style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "12px", color: colors.textMuted,
          }}>
            <Clock size={12} /> {post.readTimeMinutes} min read
          </span>
          <span style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "12px", color: colors.textMuted,
          }}>
            <Eye size={12} /> {post.viewCount} views
          </span>
          <span style={{ fontSize: "12px", color: colors.textMuted }}>
            By {post.authorName}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        dangerouslySetInnerHTML={{ __html: post.content || "<p>Content coming soon.</p>" }}
        style={{ fontSize: "16px", lineHeight: 1.8, color: colors.textMuted }}
      />

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{
          marginTop: "40px", paddingTop: "24px",
          borderTop: `1px solid ${colors.border}`,
          display: "flex", flexWrap: "wrap", gap: "8px",
        }}>
          {post.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: "12px", padding: "4px 10px",
              borderRadius: "9999px",
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              color: colors.textMuted,
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <style>{`
        h2 { font-size: 22px; font-weight: 700; color: ${colors.text}; margin: 32px 0 12px; }
        h3 { font-size: 17px; font-weight: 600; color: ${colors.text}; margin: 24px 0 8px; }
        p { margin-bottom: 16px; }
        ul, ol { padding-left: 24px; margin-bottom: 16px; }
        li { margin-bottom: 8px; }
        strong { color: ${colors.text}; font-weight: 600; }
        a { color: #a78bfa; }
        code { background: ${colors.bgCard}; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 14px; }
        pre { background: ${colors.bgCard}; border: 1px solid ${colors.border}; border-radius: 8px; padding: 16px; overflow-x: auto; margin-bottom: 16px; }
      `}</style>
    </CmsPage>
  );
}