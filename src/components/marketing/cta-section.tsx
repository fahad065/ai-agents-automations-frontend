"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Bot, Shield } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function CtaSection() {
  const { isDark } = useTheme();
  const { lang, isAr } = useLang();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        y: 40, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ref.current, start: "top 85%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className={cn("relative overflow-hidden border-t bg-background px-6 py-25", isDark ? "border-white/6" : "border-black/6")}>
      {/* Background glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[100px]" />

      <div ref={ref} className="relative z-10 mx-auto max-w-[780px] text-center">
        {/* Badge */}
        <div className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.07] px-4.5 py-1.75 text-[13px] font-medium text-primary backdrop-blur-sm">
            <span className="size-1.5 animate-[pulse-dot_2s_infinite] rounded-full bg-[#22c55e]" />
            {tr("ctaBadge", lang)}
          </span>
        </div>

        <h2 className="mb-5 text-[clamp(34px,6vw,60px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
          {tr("ctaHeadingLine1", lang)}
          <br />
          <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
            {tr("ctaHeadingLine2", lang)}
          </span>
        </h2>

        <p className="mx-auto mb-11 max-w-[520px] text-[clamp(15px,2vw,18px)] leading-[1.7] text-muted-foreground">
          {tr("ctaSub", lang)}
        </p>

        {/* CTA buttons */}
        <div className="mb-9 flex flex-wrap justify-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/auth/signup" />}
            className="gap-2 rounded-[10px] px-9 py-6 text-[15px] shadow-[0_4px_32px_rgba(124,58,237,0.4),0_0_0_1px_rgba(124,58,237,0.3)]"
          >
            {tr("ctaPrimary", lang)} <ArrowRight size={16} />
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/industries" />}
            className="gap-2 rounded-[10px] px-7 py-6 text-[15px] font-medium"
          >
            <Bot size={15} /> {tr("ctaSecondaryIndustries", lang)}
          </Button>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-6">
          {[
            tr("trustNoCard", lang),
            tr("trust30Day", lang),
            tr("trustCancel", lang),
            tr("trustOwnKeys", lang),
          ].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <Shield size={12} color="#7c3aed" />
              <span className="text-[13px] text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
