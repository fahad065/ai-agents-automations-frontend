"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { CmsPage, CmsContent } from "./cms-page";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
  order: number;
}

// Same accordion row as faq-page.tsx — kept local rather than shared since
// it's ~25 lines and this is the only other place that needs it; revisit
// if a third page ever needs FAQ rendering.
function FaqRow({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "mb-2 overflow-hidden rounded-xl border transition-colors",
        open ? "border-primary/25 bg-primary/[0.04]" : "border-border bg-foreground/[0.015]"
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5.5 py-4.5 text-left"
      >
        <span className="text-sm font-semibold leading-snug text-foreground">{question}</span>
        <div
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
            open ? "bg-primary/15" : "bg-foreground/5"
          )}
        >
          {open ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="border-t px-5.5 pt-4 pb-4.5">
          <p className="text-sm leading-relaxed text-muted-foreground">{answer}</p>
        </div>
      )}
    </div>
  );
}

// Renders any admin-created CMS page by slug — the generic counterpart to
// the 7 structural pages (about/contact/privacy/terms/cookies/faq/refund),
// which each have their own dedicated route file. A page created from
// /dashboard/cms with a slug not matching any of those literal folders
// falls through to this catch-all (see app/(marketing)/[slug]/page.tsx),
// so a brand-new page is live with zero code changes. Also renders an FAQ
// accordion below the content if the page has any faqItems — a generic
// page can carry its own FAQ section independent of the dedicated /faq
// page, which has its own search-enabled renderer and never reaches here.
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
  const faqItems: FaqItem[] = (isAr && page.faqItems_ar?.length ? page.faqItems_ar : page.faqItems) || [];
  const sortedFaq = [...faqItems].sort((a, b) => a.order - b.order);

  return (
    <CmsPage title={title} subtitle={subtitle}>
      {content && (
        <div dir={isAr ? "rtl" : "ltr"}>
          <CmsContent html={content} />
        </div>
      )}
      {sortedFaq.length > 0 && (
        <div dir={isAr ? "rtl" : "ltr"} className={content ? "mt-10" : undefined}>
          {sortedFaq.map((item, i) => (
            <FaqRow key={i} {...item} />
          ))}
        </div>
      )}
    </CmsPage>
  );
}
