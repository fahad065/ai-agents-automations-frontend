"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { CmsPage, CmsContent } from "./cms-page";
import { Loader2 } from "lucide-react";

// Renders any admin-created CMS page by slug — the generic counterpart to
// the 7 structural pages (about/contact/privacy/terms/cookies/faq/refund),
// which each have their own dedicated route file. A page created from
// /dashboard/cms with a slug not matching any of those literal folders
// falls through to this catch-all (see app/(marketing)/[slug]/page.tsx),
// so a brand-new page is live with zero code changes.
export function GenericCmsPage({ slug }: { slug: string }) {
  const { isAr } = useLang();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/content/page/${slug}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setPage(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-base text-foreground">{isAr ? "الصفحة غير موجودة" : "Page not found"}</p>
        <Link href="/" className="text-sm text-primary no-underline">
          {isAr ? "رجوع للرئيسية" : "Back to home"}
        </Link>
      </div>
    );
  }

  const title = (isAr && page.title_ar) ? page.title_ar : page.title;
  const subtitle = (isAr && page.subtitle_ar) ? page.subtitle_ar : page.subtitle;
  const content = (isAr && page.content_ar) ? page.content_ar : page.content;

  return (
    <CmsPage title={title} subtitle={subtitle}>
      {content && (
        <div dir={isAr ? "rtl" : "ltr"}>
          <CmsContent html={content} />
        </div>
      )}
    </CmsPage>
  );
}
