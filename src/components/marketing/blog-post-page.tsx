"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { CmsPage } from "./cms-page";
import { ArrowLeft, Clock, Eye, Calendar, Loader2 } from "lucide-react";

interface BlogPost {
  _id: string;
  title: string;
  title_ar?: string;
  slug: string;
  excerpt: string;
  excerpt_ar?: string;
  content: string;
  content_ar?: string;
  category: string;
  tags: string[];
  authorName: string;
  publishedAt: string;
  readTimeMinutes: number;
  viewCount: number;
}

export function BlogPostPage({ slug }: { slug: string }) {
  const { isAr } = useLang();
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-base text-foreground">Post not found</p>
        <Link href="/blog" className="text-sm text-primary no-underline">
          {isAr ? "رجوع للمدونة" : "Back to blog"}
        </Link>
      </div>
    );
  }

  const title = (isAr && post.title_ar) ? post.title_ar : post.title;
  const excerpt = (isAr && post.excerpt_ar) ? post.excerpt_ar : post.excerpt;
  const content = (isAr && post.content_ar) ? post.content_ar : post.content;

  return (
    <CmsPage title={title} subtitle={excerpt}>
      {/* Back + meta */}
      <div dir={isAr ? "rtl" : "ltr"} className="mb-8">
        <Link href="/blog" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground no-underline">
          <ArrowLeft className="size-3" /> {isAr ? "كل المقالات" : "All posts"}
        </Link>

        <div className="flex flex-wrap items-center gap-4 border-b py-3.5">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" /> {post.readTimeMinutes} {isAr ? "د قراءة" : "min read"}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3" /> {post.viewCount} views
          </span>
          <span className="text-xs text-muted-foreground">By {post.authorName}</span>
        </div>
      </div>

      {/* Content */}
      <div
        dir={isAr ? "rtl" : "ltr"}
        dangerouslySetInnerHTML={{ __html: content || (isAr ? "<p>المحتوى قادم قريباً.</p>" : "<p>Content coming soon.</p>") }}
        className="text-base leading-[1.8] text-muted-foreground [&_a]:text-primary [&_code]:rounded [&_code]:bg-card [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[17px] [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mb-2 [&_ol]:mb-4 [&_ol]:ps-6 [&_p]:mb-4 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-card [&_pre]:p-4 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:ps-6"
      />

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2 border-t pt-6">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </CmsPage>
  );
}
