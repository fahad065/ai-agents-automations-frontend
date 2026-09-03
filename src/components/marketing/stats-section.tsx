"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { Bot, Zap, Globe, Clock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export function StatsSection() {
  const { isDark } = useTheme();
  const { lang, isAr } = useLang();

  const STATS = [
    {
      icon: Bot, color: "#7c3aed",
      value: "22+", label: isAr ? "وكلاء وأتمتة وشات بوتات" : "Agents, automations & chatbots",
      sub: isAr ? "المحتوى، العقارات، الرعاية الصحية والمزيد" : "Content, real estate, healthcare and more",
    },
    {
      icon: MessageCircle, color: "#3b82f6",
      value: "3", label: isAr ? "قنوات لكل شات بوت" : "Channels per chatbot",
      sub: isAr ? "الموقع، واتساب، وإنستقرام" : "Website, WhatsApp & Instagram",
    },
    {
      icon: Zap, color: "#22c55e",
      value: "100%", label: isAr ? "أتمتة شاملة من البداية للنهاية" : "End-to-end automated",
      sub: isAr ? "من البحث إلى النشر — بدون أي عمل يدوي" : "From research to publishing — zero manual work",
    },
    {
      icon: Globe, color: "#f59e0b",
      value: "12", label: isAr ? "القطاعات المدعومة" : "Industries supported",
      sub: isAr ? "دعم المحتوى العربي، أسواق الإمارات وكينيا" : "Arabic content support, UAE & Kenya markets",
    },
    {
      icon: Clock, color: "#ef4444",
      value: "30", label: isAr ? "يوم تجريب مجاني" : "Days free trial",
      sub: isAr ? "بدون بطاقة ائتمان. بدون مخاطر. إلغاء في أي وقت." : "No credit card. No risk. Cancel anytime.",
    },
  ];
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(Array.from(sectionRef.current?.querySelectorAll(".stat-card") || []), {
        y: 24, duration: 0.6, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="border-t bg-background px-6 py-20">
      <div className="mx-auto max-w-[1100px]">
        {/* Label */}
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.08em] text-muted-foreground uppercase opacity-60">
            {tr("builtForResults", lang)}
          </p>
        </div>

        <div
          className={cn(
            "grid gap-px overflow-hidden rounded-[18px] border",
            isDark ? "border-white/6 bg-white/6" : "border-black/6 bg-black/6"
          )}
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        >
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="stat-card relative bg-background px-6 py-10 text-center" key={stat.label}>
                {/* Glow */}
                <div
                  className="pointer-events-none absolute top-1/2 left-1/2 size-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[30px]"
                  style={{ background: `${stat.color}08` }}
                />

                <div
                  className="mx-auto mb-5 flex size-11 items-center justify-center rounded-xl border"
                  style={{ background: `${stat.color}12`, borderColor: `${stat.color}25` }}
                >
                  <Icon size={20} color={stat.color} />
                </div>

                <div
                  className="mb-2 bg-clip-text text-[clamp(36px,5vw,52px)] leading-none font-extrabold tracking-[-0.03em] text-transparent"
                  style={{ backgroundImage: `linear-gradient(135deg, var(--foreground), ${stat.color}aa)` }}
                >
                  {stat.value}
                </div>

                <p className="mb-1.5 text-sm font-semibold text-foreground">
                  {stat.label}
                </p>
                <p className="mx-auto max-w-[180px] text-xs leading-relaxed text-muted-foreground">
                  {stat.sub}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
