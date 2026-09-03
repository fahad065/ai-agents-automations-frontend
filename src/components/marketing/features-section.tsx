"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { ShoppingBag, Settings2, Rocket, BarChart3, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function FeaturesSection() {
  const { isDark } = useTheme();
  const { lang, isAr } = useLang();

  const STEPS = [
    {
      n: "01", icon: ShoppingBag, color: "#7c3aed",
      title: tr("step1Title", lang),
      description: tr("step1Desc", lang),
      preview: [
        { label: isAr ? "أتمتة يوتيوب" : "YouTube Automation", sub: isAr ? "المحتوى والتواصل الاجتماعي" : "Content & Social", color: "#ef4444", icon: "🎬", badge: isAr ? "مباشر" : "Live" },
        { label: isAr ? "مسار العقارات" : "Real Estate Pipeline", sub: isAr ? "العقارات" : "Real Estate", color: "#3b82f6", icon: "🏡", badge: isAr ? "مسار" : "Pipeline" },
        { label: isAr ? "شات بوت مطعم" : "Restaurant Chatbot", sub: isAr ? "الضيافة" : "Hospitality", color: "#8b5cf6", icon: "💬", badge: isAr ? "مباشر" : "Live" },
        { label: isAr ? "مبيعات واتساب" : "WhatsApp Sales", sub: isAr ? "العقارات" : "Real Estate", color: "#22c55e", icon: "🏡", badge: isAr ? "مباشر" : "Live" },
      ],
    },
    {
      n: "02", icon: Settings2, color: "#3b82f6",
      title: tr("step2Title", lang),
      description: tr("step2Desc", lang),
      preview: [
        { label: "🇦🇪 " + (isAr ? "الإمارات العربية المتحدة" : "United Arab Emirates"), sub: isAr ? "أسواق العربية والإنجليزية" : "Arabic + English markets", color: "#7c3aed", icon: "", badge: isAr ? "نشط" : "Active" },
        { label: "🇰🇪 " + (isAr ? "كينيا" : "Kenya"), sub: isAr ? "أسواق السواحيلية والإنجليزية" : "Swahili + English markets", color: "#22c55e", icon: "", badge: isAr ? "نشط" : "Active" },
        { label: isAr ? "التخصص: العقارات" : "Niche: Real Estate", sub: isAr ? "مبيعات وإيجارات العقارات" : "Property sales & rentals", color: "#3b82f6", icon: "", badge: "" },
        { label: isAr ? "الجدول: يومي 9ص" : "Schedule: Daily 9am", sub: isAr ? "تشغيل تلقائي" : "Automated runs", color: "#f59e0b", icon: "", badge: "" },
      ],
    },
    {
      n: "03", icon: Rocket, color: "#22c55e",
      title: tr("step3Title", lang),
      description: tr("step3Desc", lang),
      preview: [
        { label: isAr ? "البحث عن المواضيع" : "Researching topics", sub: isAr ? "تحليل الاتجاهات بالذكاء الاصطناعي" : "AI-powered trend analysis", color: "#7c3aed", icon: "🔍", badge: isAr ? "يعمل" : "Running" },
        { label: isAr ? "إنشاء المحتوى" : "Generating content", sub: "GPT-4 + custom prompts", color: "#22c55e", icon: "✍️", badge: isAr ? "يعمل" : "Running" },
        { label: isAr ? "إنشاء المرئيات" : "Creating visuals", sub: "Seedance + Canva", color: "#ef4444", icon: "🎨", badge: isAr ? "يعمل" : "Running" },
        { label: isAr ? "النشر والمشاركة" : "Publishing & posting", sub: "YouTube, Instagram, WhatsApp", color: "#f59e0b", icon: "📤", badge: isAr ? "تم" : "Done" },
      ],
    },
    {
      n: "04", icon: BarChart3, color: "#f59e0b",
      title: tr("step4Title", lang),
      description: tr("step4Desc", lang),
      preview: [
        { label: isAr ? "تشغيلات المسار: 124" : "Pipeline runs: 124", sub: isAr ? "آخر 30 يوماً" : "Last 30 days", color: "#7c3aed", icon: "📊", badge: "" },
        { label: isAr ? "معدل النجاح: 98%" : "Success rate: 98%", sub: isAr ? "عبر جميع الوكلاء" : "Across all agents", color: "#22c55e", icon: "✅", badge: "" },
        { label: isAr ? "تكلفة API: $4.20" : "API cost: $4.20", sub: isAr ? "هذا الشهر، بالتكلفة الفعلية" : "This month, at cost", color: "#f59e0b", icon: "💰", badge: "" },
        { label: isAr ? "التشغيل التالي: 9:00 ص" : "Next run: 9:00 AM", sub: isAr ? "مجدول يومياً" : "Scheduled daily", color: "#3b82f6", icon: "⏰", badge: "" },
      ],
    },
  ];
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 30, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
      });
    }, sectionRef);

    const interval = setInterval(() => setActive((p) => (p + 1) % STEPS.length), 4000);
    return () => { ctx.revert(); clearInterval(interval); };
  }, []);

  const step = STEPS[active];

  return (
    <section ref={sectionRef} className={cn("border-t bg-background px-6 py-25", isDark ? "border-white/6" : "border-black/6")}>
      <div className="mx-auto max-w-[1200px]">
        <div ref={titleRef} className="mb-18 text-center">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-3.5 py-1.5 text-xs font-medium text-primary">
            {tr("howItWorks", lang)}
          </span>
          <h2 className="mb-3.5 text-[clamp(30px,4.5vw,48px)] leading-[1.1] font-extrabold tracking-[-0.03em] text-foreground">
            {isAr ? "من الصفر إلى الأتمتة" : "From zero to automated"}<br />{isAr ? "في 4 خطوات" : "in 4 steps"}
          </h2>
          <p className="mx-auto max-w-[500px] text-[clamp(15px,2vw,17px)] leading-relaxed text-muted-foreground">
            {tr("featuresSubtitle", lang)}
          </p>
        </div>

        <div className={cn("rounded-[20px] border p-6", isDark ? "border-white/7 bg-white/1.5" : "border-black/7 bg-black/0.8")}>
          <div className="grid items-start gap-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {/* Step list */}
            <div className="flex flex-col gap-1">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const isActive = i === active;
                return (
                  <button
                    key={s.n}
                    onClick={() => setActive(i)}
                    className="flex w-full items-start gap-3.5 rounded-xl border border-transparent p-4.5 text-left transition-all"
                    style={{
                      background: isActive ? `${s.color}0c` : undefined,
                      borderColor: isActive ? s.color + "30" : undefined,
                    }}
                  >
                    <div
                      className={cn("flex size-[38px] shrink-0 items-center justify-center rounded-[10px] border transition-all", !isActive && (isDark ? "bg-white/4 border-white/8" : "bg-black/3 border-black/8"))}
                      style={isActive ? { background: `${s.color}18`, borderColor: s.color + "35" } : undefined}
                    >
                      <Icon size={17} color={isActive ? s.color : undefined} className={!isActive ? "text-muted-foreground" : undefined} />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="font-mono text-[10px] font-bold"
                          style={{ color: isActive ? s.color : undefined, opacity: isActive ? 1 : 0.5 }}
                        >{s.n}</span>
                        <span className={cn("text-sm font-semibold", isActive ? "text-foreground" : "text-muted-foreground")}>
                          {s.title}
                        </span>
                      </div>
                      <p
                        className="overflow-hidden text-[13px] leading-[1.55] text-muted-foreground transition-[max-height] duration-350 ease-in-out"
                        style={{ maxHeight: isActive ? "80px" : "0" }}
                      >
                        {s.description}
                      </p>
                    </div>
                    <ChevronRight
                      size={13}
                      color={isActive ? s.color : undefined}
                      className={cn("mt-1 shrink-0 transition-all", !isActive && "text-muted-foreground opacity-35")}
                    />
                  </button>
                );
              })}

              {/* Progress dots */}
              <div className="flex gap-1.25 px-4.5 py-3">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setActive(i)}
                    className={cn("h-[3px] cursor-pointer rounded-sm transition-all", i === active ? "w-7" : cn("w-1.5", isDark ? "bg-white/12" : "bg-black/10"))}
                    style={i === active ? { background: STEPS[active].color } : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Preview panel */}
            <div
              className={cn("rounded-2xl border p-7 backdrop-blur-sm transition-shadow duration-400", isDark ? "border-white/7 bg-white/2" : "border-black/7 bg-black/1.5")}
              style={{ boxShadow: `0 0 60px ${step.color}08` }}
            >
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex size-[42px] items-center justify-center rounded-[11px] border"
                  style={{ background: `${step.color}15`, borderColor: `${step.color}30` }}
                >
                  <step.icon size={20} color={step.color} />
                </div>
                <div>
                  <p className="mb-0.5 text-[10px] text-muted-foreground opacity-60">{tr("step", lang)} {step.n}</p>
                  <h3 className="text-[15px] font-bold text-foreground">{step.title}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {step.preview.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-[9px] border p-3 transition-all"
                    style={{ background: `${step.color}08`, borderColor: `${step.color}18` }}
                  >
                    {item.icon && <div className="mb-1.5 text-base">{item.icon}</div>}
                    <div className="mb-0.5 flex items-center justify-between gap-1">
                      <p className="text-xs leading-tight font-semibold text-foreground">{item.label}</p>
                      {item.badge && (
                        <span
                          className="shrink-0 rounded px-1.25 py-0.25 text-[9px] font-bold"
                          style={{ background: `${item.color}18`, color: item.color }}
                        >{item.badge}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
