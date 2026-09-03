"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/hooks/use-theme";
import { useLang } from "@/hooks/use-lang";
import { tr } from "@/lib/translations";
import { ArrowRight, Bot, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface AgentTemplate {
  _id: string;
  name: string;
  name_ar?: string;
  slug: string;
  tagline: string;
  tagline_ar?: string;
  description: string;
  description_ar?: string;
  category: string;
  moduleType: string;
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  pricing?: { monthly: number };
}

export function AgentsSection() {
  const { isDark } = useTheme();
  const { lang, isAr } = useLang();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        // /modules has no combined "agent+automation" filter (only a single
        // moduleType), and its sort is a global sortOrder shared across all
        // module types — chatbot templates also start at sortOrder 1, so an
        // unfiltered fetch can genuinely surface a chatbot here. That would
        // be a real bug, not a cosmetic one: this section links to
        // /agents/:slug, which doesn't exist for a chatbot's slug (those
        // live at /chatbots/:slug) — so it's filtered out client-side.
        const res = await fetch(`${apiUrl}/modules?limit=20`);
        const data = await res.json();
        const list = (data.data || data) as AgentTemplate[];
        setAgents(list.filter((m) => m.moduleType !== "chatbot").slice(0, 6));
      } catch {}
      finally { setLoading(false); }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    if (loading || !agents.length) return;
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        opacity: 0, y: 30, duration: 0.7, ease: "power3.out",
        scrollTrigger: { trigger: titleRef.current, start: "top 85%" },
      });
      if (gridRef.current?.children) {
        gsap.from(Array.from(gridRef.current.children), {
          opacity: 0, y: 24, duration: 0.5, stagger: 0.08, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 85%" },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, [loading, agents]);

  if (!loading && agents.length === 0) return null;

  return (
    <section ref={sectionRef} className={cn("border-t bg-background px-6 py-25", isDark ? "border-white/7" : "border-black/7")}>
      <div className="mx-auto max-w-[1200px]">
        <div ref={titleRef} className="mb-14 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-3.5 py-1.5 text-xs font-medium text-primary">
              <Bot size={11} /> {isAr ? "وكلاء الذكاء الاصطناعي والأتمتة" : "AI Agents & Automations"}
            </div>
            <h2 className="mb-2.5 text-[clamp(28px,4vw,46px)] leading-[1.1] font-extrabold tracking-[-0.03em] text-foreground">
              {isAr ? "جاهز للنشر." : "Ready to deploy."}<br />{isAr ? "مصمم لقطاعك." : "Built for your industry."}
            </h2>
            <p className="max-w-[420px] text-[15px] leading-relaxed text-muted-foreground">
              {isAr ? "اشترك بنقرة واحدة. بدون إعداد تقني. يعمل في دقائق." : "Subscribe in one click. No technical setup. Running in minutes."}
            </p>
          </div>

          <Button nativeButton={false} variant="outline" render={<Link href="/agents" />} className="gap-1.5 whitespace-nowrap">
            {tr("viewAllAgents", lang)} <ArrowRight size={13} />
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={cn("h-[200px] animate-pulse rounded-2xl border p-6", isDark ? "bg-white/2" : "bg-black/1.5")} />
            ))}
          </div>
        ) : (
          <div ref={gridRef} className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {agents.map((agent) => {
              const isHovered = hovered === agent._id;
              return (
                <Link
                  key={agent._id}
                  href={`/agents/${agent.slug}`}
                  className="no-underline"
                  onMouseEnter={() => setHovered(agent._id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className="flex h-full cursor-pointer flex-col rounded-2xl border p-5.5 transition-all"
                    style={{
                      background: isHovered ? `${agent.color}06` : undefined,
                      borderColor: isHovered ? agent.color + "30" : undefined,
                      boxShadow: isHovered ? `0 0 40px ${agent.color}10` : undefined,
                    }}
                  >
                    {/* Card header */}
                    <div className="mb-3.5 flex items-center justify-between">
                      <div
                        className="flex size-[42px] shrink-0 items-center justify-center rounded-[11px] border text-xl"
                        style={{ background: `${agent.color}12`, borderColor: `${agent.color}25` }}
                      >
                        {agent.icon}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {agent.moduleType === "automation" && (
                          <span className="rounded border border-[#22c55e]/20 bg-[#22c55e]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#22c55e]">
                            <Zap size={8} className="mr-0.5 inline" />
                            AUTO
                          </span>
                        )}
                        <span
                          className="rounded-full border px-2.25 py-0.75 text-[10px] font-semibold"
                          style={{
                            background: agent.badge === "Live" ? "rgba(34,197,94,0.1)" : `${agent.color}12`,
                            color: agent.badge === "Live" ? "#22c55e" : agent.color,
                            borderColor: agent.badge === "Live" ? "rgba(34,197,94,0.2)" : agent.color + "25",
                          }}
                        >
                          {agent.badge || "Active"}
                        </span>
                      </div>
                    </div>

                    <h3 className="mb-1.5 text-[15px] leading-tight font-bold text-foreground">
                      {(isAr && agent.name_ar) ? agent.name_ar : agent.name}
                    </h3>

                    {((isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline) && (
                      <p className="mb-3.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                        {(isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline}
                      </p>
                    )}

                    {/* Capabilities */}
                    <ul className="mb-4 list-none p-0">
                      {agent.capabilities.slice(0, 3).map((c) => (
                        <li key={c} className="mb-1.25 flex items-start gap-1.75 text-xs text-muted-foreground">
                          <div className="mt-1.25 size-1 shrink-0 rounded-full" style={{ background: agent.color }} />
                          {c}
                        </li>
                      ))}
                    </ul>

                    <div className={cn("flex items-center justify-between border-t pt-3", isDark ? "border-white/5" : "border-black/5")}>
                      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: agent.color }}>
                        {isAr ? "استكشف" : "Explore"} <ArrowRight size={12} />
                      </span>
                      {agent.pricing?.monthly && (
                        <span className="text-[11px] text-muted-foreground">
                          from ${agent.pricing.monthly}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
