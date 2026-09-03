"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { CmsPage } from "./cms-page";
import { Loader2 } from "lucide-react";

export function LegalPage({ slug }: { slug: string }) {
  const { isAr } = useLang();
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  const title = (isAr && page?.title_ar) ? page.title_ar : (page?.title || slug);
  const subtitle = (isAr && page?.subtitle_ar) ? page.subtitle_ar : page?.subtitle;
  const content = (isAr && page?.content_ar) ? page.content_ar : page?.content;

  return (
    <CmsPage title={title} subtitle={subtitle}>
      {content && (
        <div
          dir={isAr ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{ __html: content }}
          className="text-[15px] leading-[1.8] text-muted-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mb-1.5 [&_ol]:mb-3.5 [&_ol]:pl-5 [&_p]:mb-3.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-3.5 [&_ul]:pl-5"
        />
      )}
    </CmsPage>
  );
}
