"use client";

import Link from "next/link";
import { ArrowRight, Home, LayoutGrid, Mail } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { Button } from "@/components/ui/button";
import { SERVICE_TYPES, ALL_SERVICES_HREF } from "@/config/service-types";

export function NotFoundContent() {
  const { isAr } = useLang();

  return (
    <main className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-background px-6 pt-28 pb-20">
      <div className="pointer-events-none absolute top-1/3 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-[110px]" />

      <div className="relative w-full max-w-[640px] text-center">
        <p className="mb-4 bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-[clamp(84px,18vw,140px)] leading-none font-extrabold tracking-[-0.05em] text-transparent">
          404
        </p>
        <h1 className="mb-3 text-[clamp(24px,4vw,34px)] font-bold tracking-[-0.02em] text-foreground">
          {isAr ? "هذي الصفحة مو موجودة" : "This page doesn't exist"}
        </h1>
        <p className="mx-auto mb-8 max-w-[460px] text-[15px] leading-relaxed text-muted-foreground">
          {isAr
            ? "يمكن الرابط قديم أو فيه خطأ. جرّب واحد من هذي الروابط بدلاً منه."
            : "The link may be old or mistyped. Try one of these instead."}
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <Button nativeButton={false} render={<Link href="/" />} className="gap-2">
            <Home size={15} /> {isAr ? "الصفحة الرئيسية" : "Back to home"}
          </Button>
          <Button nativeButton={false} variant="outline" render={<Link href={ALL_SERVICES_HREF} />} className="gap-2">
            <LayoutGrid size={15} /> {isAr ? "تصفح الخدمات" : "Browse services"}
          </Button>
        </div>

        <div className="grid gap-2.5 text-left sm:grid-cols-3">
          {SERVICE_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.key}
                href={t.href}
                className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 no-underline transition-colors hover:bg-muted/40"
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg border"
                  style={{ background: `${t.color}14`, borderColor: `${t.color}30`, color: t.color }}
                >
                  <Icon size={17} />
                </span>
                <span className="flex-1 text-sm font-semibold text-foreground">{isAr ? t.label_ar : t.label}</span>
                <ArrowRight size={14} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {isAr ? "تحتاج مساعدة؟ " : "Need help? "}
          <Link href="/contact" className="inline-flex items-center gap-1 font-medium text-primary">
            <Mail size={13} /> {isAr ? "تواصل معنا" : "Contact us"}
          </Link>
        </p>
      </div>
    </main>
  );
}
