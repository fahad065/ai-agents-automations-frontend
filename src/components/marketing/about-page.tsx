"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { Heart, Zap, Shield, Users, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AboutPageData {
  title?: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;
  content?: string;
  content_ar?: string;
}

export function AboutPage() {
  const { isAr } = useLang();
  const [page, setPage] = useState<AboutPageData | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    fetch(`${apiUrl}/cms/pages/about`)
      .then((r) => r.json())
      .then(setPage)
      .catch(() => {});
  }, []);

  const cmsTitle = page ? ((isAr && page.title_ar) ? page.title_ar : page.title) : null;
  const cmsSubtitle = page ? ((isAr && page.subtitle_ar) ? page.subtitle_ar : page.subtitle) : null;
  const cmsContent = page ? ((isAr && page.content_ar) ? page.content_ar : page.content) : null;

  const VALUES = [
    {
      icon: Heart, color: "#ef4444",
      label: isAr ? "شفافية تامة" : "Radical transparency",
      desc: isAr
        ? "نقولك بالضبط ما يسوّيه كل وكيل، وكم يكلّف، وكيف يشتغل. ما في صناديق سوداء. ما في رسوم خفية."
        : "We tell you exactly what our agents do, what they cost to run, and how they work. No black boxes. No hidden fees.",
    },
    {
      icon: Zap, color: "#f59e0b",
      label: isAr ? "الجودة فوق الكمية" : "Quality over quantity",
      desc: isAr
        ? "20 وحدة تشتغل بكفاءة أحسن من 100 تشتغل بشكل رديء. كل وكيل أو أتمتة أو شات بوت نطلقه يكون مُختبَراً في بيئة الإنتاج قبل ما يوصلك."
        : "20+ modules that work perfectly beats 100 that work poorly. Every agent, automation, and chatbot we ship is production-tested before it reaches you.",
    },
    {
      icon: Shield, color: "#22c55e",
      label: isAr ? "بياناتك، دائماً" : "Your data, always",
      desc: isAr
        ? "مفاتيح API مشفّرة بتشفير AES-256. محتواك ملكك. ما نستخدم بيانات عملك لتدريب الأنظمة."
        : "Your API keys are AES-256 encrypted. Your content belongs to you. We never train models on your business data.",
    },
    {
      icon: Users, color: "#7c3aed",
      label: isAr ? "مصمم لكل الأسواق" : "Built for every market",
      desc: isAr
        ? "أتمتة ذكاء اصطناعي مصممة لأعمال الإمارات وكينيا، وأيضاً للشركات الدولية حول العالم، مع دعم اللغة العربية واستراتيجيات محتوى خاصة بكل سوق."
        : "AI automation built not only for UAE and Kenyan businesses, but for international businesses everywhere — with Arabic language support and market-specific content strategies.",
    },
  ];

  const TIMELINE = [
    { year: "2023", event: isAr ? "تأسست في دبي. بدأنا بوكيل أتمتة يوتيوب واحد." : "Founded in Dubai. Started with a single YouTube automation agent." },
    { year: "2024 Q1", event: isAr ? "توسعنا لـ 4 وكلاء ذكاء اصطناعي. أول 50 مستخدم على المنصة." : "Expanded to 4 AI agents. First 50 users onboarded." },
    { year: "2024 Q3", event: isAr ? "أضفنا خطوط أتمتة العقارات والتسويق، وتوسعنا فيما وراء إنشاء المحتوى." : "Expanded into Real Estate and Marketing automation, growing beyond content creation." },
    { year: "2025", event: isAr ? "13 وكيل في 12 قطاع، تخدم أعمالاً في أسواق متعددة حول العالم." : "13 agents across 12 industries, serving businesses across multiple markets worldwide." },
    { year: "2026", event: isAr ? "أطلقنا الشات بوتات — 9 قوالب جاهزة عبر الموقع وواتساب وإنستقرام. المنصة الآن أكثر من 20 وكيلاً وأتمتة وشات بوت، تخدم أعمالاً حول العالم." : "Launched chatbots — 9 ready-made templates across website, WhatsApp and Instagram. The platform is now 20+ agents, automations and chatbots strong, serving businesses worldwide." },
  ];

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative mx-auto max-w-3xl overflow-hidden px-6 pt-30 pb-20 text-center">
        <div className="pointer-events-none absolute top-[40%] left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[100px]" />
        <span className="relative mb-7 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-4 py-1.5 text-[13px] font-medium text-primary">
          {isAr ? "قصتنا" : "Our story"}
        </span>
        {!page ? (
          <Loader2 className="relative mx-auto mb-6 size-7 animate-spin text-primary" />
        ) : (
          <>
            <h1 className="relative mb-6 text-[clamp(36px,5.5vw,64px)] leading-[1.05] font-extrabold tracking-tight text-foreground">
              {cmsTitle || (isAr ? "لوجيك ميت" : "LogicMate")}
            </h1>
            <p className="relative mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
              {cmsSubtitle || (isAr ? "بنينا منصة الوكلاء اللي كنا نتمنى توجد." : "We built the agent platform we wished existed.")}
            </p>
          </>
        )}
      </section>

      {/* CMS body content (if set by admin) */}
      {cmsContent && (
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div
            dir={isAr ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: cmsContent }}
            className="text-[15px] leading-[1.8] text-muted-foreground [&_h2]:my-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_li]:mb-2 [&_ol]:mb-4 [&_ol]:ps-6 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:ps-6"
          />
        </section>
      )}

      {/* Mission statement */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-[18px] border border-primary/[0.18] bg-primary/[0.03] p-10 sm:p-12">
          <div className="pointer-events-none absolute -top-15 -right-15 size-[250px] rounded-full bg-primary/[0.08] blur-[60px]" />
          <p className="mb-4 text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
            {isAr ? "مهمتنا" : "Our mission"}
          </p>
          <p className="text-[clamp(18px,2.5vw,22px)] leading-relaxed font-semibold text-foreground">
            {isAr
              ? '"نخلي أتمتة الذكاء الاصطناعي في متناول أي عمل تجاري، أينما كان — مو بس اللي عندهم فرق هندسية وميزانيات ضخمة."'
              : '"Make AI automation accessible to every business, anywhere in the world — not just the ones with engineering teams and six-figure budgets."'}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="mb-3 text-[clamp(24px,3.5vw,36px)] font-extrabold tracking-tight text-foreground">
          {isAr ? "ما نؤمن فيه" : "What we stand for"}
        </h2>
        <p className="mb-9 text-[15px] leading-relaxed text-muted-foreground">
          {isAr
            ? "هذي مو قيم مكتوبة على الجدار، هذي قرارات نتخذها كل يوم."
            : "These are not corporate values on a poster. They're decisions we make every day."}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.label} className="rounded-2xl border bg-foreground/[0.015] p-6">
                <div
                  className="mb-3.5 flex size-10 items-center justify-center rounded-[10px] border"
                  style={{ background: `${v.color}12`, borderColor: `${v.color}25` }}
                >
                  <Icon size={18} color={v.color} />
                </div>
                <p className="mb-2 text-sm font-bold text-foreground">{v.label}</p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl border-t px-6 pt-16 pb-20">
        <h2 className="mb-12 text-center text-[clamp(24px,3.5vw,36px)] font-extrabold tracking-tight text-foreground">
          {isAr ? "كيف وصلنا لهنا" : "How we got here"}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-5">
          {TIMELINE.map((t, i) => {
            const isLast = i === TIMELINE.length - 1;
            return (
              <div
                key={t.year}
                className="rounded-2xl border p-7 text-center"
                style={isLast ? { borderColor: "rgba(124,58,237,0.35)" } : undefined}
              >
                <div
                  className="mx-auto mb-3.5 flex size-9 items-center justify-center rounded-full border-2 text-sm font-extrabold"
                  style={{
                    background: isLast ? "rgba(124,58,237,0.15)" : undefined,
                    borderColor: isLast ? "#7c3aed" : "rgba(124,58,237,0.25)",
                    color: isLast ? "#a78bfa" : undefined,
                  }}
                >
                  <span className={isLast ? "" : "text-muted-foreground"}>{i + 1}</span>
                </div>
                <p className="mb-2 text-[13px] font-bold text-primary">{t.year}</p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{t.event}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-[18px] border bg-foreground/[0.015] p-10 text-center sm:p-12">
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-foreground">
            {isAr ? "جاهز تبدأ؟" : "Ready to get started?"}
          </h2>
          <p className="mb-7 text-[15px] leading-relaxed text-muted-foreground">
            {isAr
              ? "انشر أول وكيل ذكاء اصطناعي في دقائق. تجربة مجانية 30 يوم، ما في حاجة لبطاقة ائتمان."
              : "Deploy your first AI agent in minutes. 30-day free trial, no credit card required."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button nativeButton={false} render={<Link href="/auth/signup" />} className="gap-2 py-5">
              {isAr ? "ابدأ مجاناً" : "Start for free"} <ArrowRight className="size-3.5" />
            </Button>
            <Button nativeButton={false} variant="outline" render={<Link href="/contact" />} className="py-5">
              {isAr ? "كلّمنا" : "Talk to us"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
