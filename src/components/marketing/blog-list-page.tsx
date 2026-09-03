"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { ArrowRight, Clock, Eye, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function BlogListPage() {
  const { isAr } = useLang();

  const CATEGORY_LABELS: Record<string, string> = {
    all: isAr ? "كل المقالات" : "All posts",
    product: isAr ? "المنتج" : "Product",
    tutorial: isAr ? "الدروس" : "Tutorials",
    "case-study": isAr ? "دراسات الحالة" : "Case studies",
    news: isAr ? "الأخبار" : "News",
    tips: isAr ? "نصائح" : "Tips",
  };
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
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-background">
      {/* Hero */}
      <section className="px-6 pt-25 pb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-3.5 py-1 text-xs font-medium text-primary">
          <BookOpen className="size-2.5" /> {isAr ? "مدونة لوجيك ميت" : "LogicMate Blog"}
        </div>
        <h1 className="mb-3 text-[clamp(32px,5vw,52px)] font-extrabold tracking-tight text-foreground">
          {isAr ? "رؤى ودروس تعليمية" : "Insights and tutorials"}
        </h1>
        <p className="mx-auto max-w-md text-[17px] text-muted-foreground">
          {isAr
            ? "تحديثات المنتج، دروس الأتمتة، دراسات الحالة ونصائح من فريق لوجيك ميت."
            : "Product updates, automation tutorials, case studies and tips from the LogicMate team."}
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        {/* Category tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors",
                category === cat
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto size-7 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="mx-auto mb-4 size-10 text-muted-foreground" />
            <p className="mb-2 text-base text-muted-foreground">
              {isAr ? "لا توجد مقالات منشورة بعد." : "No posts published yet."}
            </p>
            <p className="text-sm text-muted-foreground">
              {isAr ? "تابعنا قريباً — نعمل على محتوى رائع." : "Check back soon — we are working on some great content."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} className="no-underline">
                <div className="h-full overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/30">
                  {/* Cover image placeholder */}
                  <div className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                    <BookOpen className="size-8 text-primary/40" />
                  </div>

                  <div className="p-5">
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        {CATEGORY_LABELS[post.category] || post.category}
                      </span>
                    </div>

                    <h2 className="mb-2 text-base leading-snug font-bold text-foreground">{post.title}</h2>

                    {post.excerpt && (
                      <p className="mb-3.5 text-[13px] leading-relaxed text-muted-foreground">
                        {post.excerpt.slice(0, 120)}
                        {post.excerpt.length > 120 ? "..." : ""}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-2.5" /> {post.readTimeMinutes} {isAr ? "د قراءة" : "min read"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-2.5" /> {post.viewCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        {isAr ? "اقرأ" : "Read"} <ArrowRight className="size-3" />
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
