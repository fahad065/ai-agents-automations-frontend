"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { ChevronDown, ChevronUp, Search, Loader2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
  order: number;
}

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

export function FaqPage() {
  const { isAr } = useLang();
  const [pageData, setPageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/faq`)
      .then((r) => r.json())
      .then((data) => setPageData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const rawItems: FaqItem[] = (isAr && pageData?.faqItems_ar?.length)
    ? pageData.faqItems_ar
    : (pageData?.faqItems || []);
  const faqItems = [...rawItems].sort((a, b) => a.order - b.order);

  const filtered = faqItems.filter((item) =>
    !search ||
    item.question.toLowerCase().includes(search.toLowerCase()) ||
    item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative mx-auto max-w-2xl overflow-hidden px-6 pt-30 pb-16 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[80px]" />
        <span className="relative mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-4 py-1.5 text-[13px] font-medium text-primary">
          FAQ
        </span>
        <h1 className="relative mb-4 text-[clamp(32px,5vw,52px)] leading-[1.1] font-extrabold tracking-tight text-foreground">
          {isAr ? "أسئلة وإجابات" : "Questions answered."}
        </h1>
        <p className="relative text-[17px] leading-relaxed text-muted-foreground">
          {isAr
            ? "كل شي تحتاج تعرفه عن لوجيك ميت — كيف يشتغل، كم يكلف، وما تتوقعه."
            : "Everything you need to know about LogicMate — how it works, what it costs, and what to expect."}
        </p>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        {/* Search */}
        <div className="relative mb-9">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-[15px] -translate-y-1/2 text-muted-foreground rtl:right-4 rtl:left-auto" />
          <Input
            placeholder={isAr ? "ابحث في الأسئلة..." : "Search questions..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            dir={isAr ? "rtl" : "ltr"}
            className="h-auto rounded-[11px] py-3.5 pr-4 pl-11 text-sm rtl:pr-11 rtl:pl-4"
          />
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="mx-auto size-7 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {filtered.map((item) => (
              <FaqRow key={item.question} {...item} />
            ))}

            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">
                  {isAr ? `لا توجد أسئلة تطابق "${search}"` : `No questions match "${search}"`}
                </p>
                <Button onClick={() => setSearch("")}>{isAr ? "مسح البحث" : "Clear search"}</Button>
              </div>
            )}

            {/* Still have questions */}
            <div className="mt-12 rounded-2xl border bg-foreground/[0.015] p-8 text-center">
              <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.12]">
                <MessageCircle className="size-5 text-primary" />
              </div>
              <p className="mb-2 text-base font-bold text-foreground">
                {isAr ? "عندك أسئلة ثانية؟" : "Still have questions?"}
              </p>
              <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
                {isAr ? "فريقنا يرد خلال 24 ساعة في أيام العمل." : "Our team replies within 24 hours on business days."}
              </p>
              <Button nativeButton={false} render={<Link href="/contact" />}>
                {isAr ? "تواصل مع الدعم" : "Contact support"}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
