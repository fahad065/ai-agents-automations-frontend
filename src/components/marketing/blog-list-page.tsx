"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { ArrowRight, Clock, Eye, Loader2, BookOpen } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags: string[];
  authorName: string;
  publishedAt: string;
  readTimeMinutes: number;
  viewCount: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All posts",
  product: "Product",
  tutorial: "Tutorials",
  "case-study": "Case studies",
  news: "News",
  tips: "Tips",
};

export function BlogListPage() {
  const { colors } = useTheme();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const params = new URLSearchParams({ page: String(page), limit: "9" });
      if (category !== "all") params.set("category", category);
      const res = await fetch(`${apiUrl}/cms/blog?${params}`, { cache: "no-store" });
      const data = await res.json();
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch {}
    setLoading(false);
  }, [page, category]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg }}>
      {/* Hero */}
      <section style={{ padding: "100px 24px 48px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          border: "1px solid rgba(124,58,237,0.3)",
          background: "rgba(124,58,237,0.08)",
          color: "#a78bfa", padding: "4px 14px",
          borderRadius: "9999px", fontSize: "12px",
          fontWeight: 500, marginBottom: "16px",
        }}>
          <BookOpen size={11} /> NexAgent Blog
        </div>
        <h1 style={{
          fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800,
          color: colors.text, marginBottom: "12px",
          letterSpacing: "-0.02em",
        }}>
          Insights and tutorials
        </h1>
        <p style={{ fontSize: "17px", color: colors.textMuted, maxWidth: "480px", margin: "0 auto" }}>
          Product updates, automation tutorials, case studies and tips from the NexAgent team.
        </p>
      </section>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 96px" }}>

        {/* Category tabs */}
        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap",
          marginBottom: "32px", justifyContent: "center",
        }}>
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              style={{
                padding: "7px 16px", borderRadius: "9999px",
                fontSize: "13px", fontWeight: 500,
                cursor: "pointer", transition: "all 0.2s",
                border: `1px solid ${category === cat ? "rgba(124,58,237,0.4)" : colors.border}`,
                background: category === cat ? "rgba(124,58,237,0.1)" : "transparent",
                color: category === cat ? "#a78bfa" : colors.textMuted,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <Loader2 size={28} color="#7c3aed"
              style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <BookOpen size={40} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
            <p style={{ color: colors.textMuted, fontSize: "16px", marginBottom: "8px" }}>
              No posts published yet.
            </p>
            <p style={{ color: colors.textMuted, fontSize: "14px" }}>
              Check back soon — we are working on some great content.
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
          }}>
            {posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: "14px", overflow: "hidden",
                  height: "100%", transition: "all 0.25s", cursor: "pointer",
                }}>
                  {/* Cover image placeholder */}
                  <div style={{
                    height: "160px",
                    background: `linear-gradient(135deg, rgba(124,58,237,0.15), rgba(124,58,237,0.05))`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <BookOpen size={32} color="rgba(124,58,237,0.4)" />
                  </div>

                  <div style={{ padding: "20px" }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: "8px", marginBottom: "10px",
                    }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 600,
                        padding: "2px 8px", borderRadius: "9999px",
                        background: "rgba(124,58,237,0.1)", color: "#a78bfa",
                      }}>
                        {CATEGORY_LABELS[post.category] || post.category}
                      </span>
                    </div>

                    <h2 style={{
                      fontSize: "16px", fontWeight: 700,
                      color: colors.text, marginBottom: "8px",
                      lineHeight: 1.4,
                    }}>
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p style={{
                        fontSize: "13px", color: colors.textMuted,
                        lineHeight: 1.6, marginBottom: "14px",
                      }}>
                        {post.excerpt.slice(0, 120)}
                        {post.excerpt.length > 120 ? "..." : ""}
                      </p>
                    )}

                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        gap: "12px", fontSize: "12px", color: colors.textMuted,
                      }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={11} /> {post.readTimeMinutes} min read
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Eye size={11} /> {post.viewCount}
                        </span>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        fontSize: "12px", color: "#a78bfa",
                      }}>
                        Read <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}