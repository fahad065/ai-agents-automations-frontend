"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { ArrowRight, Bot, Loader2, Search } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  icon: string;
  color: string;
  badge: string;
  capabilities: string[];
  isActive: boolean;
  pricing?: { monthly: number; annual: number };
}

const formatCategory = (val: string) =>
  val === "all" ? "All agents" :
  val.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export function AgentsListPage() {
  const { isAr } = useLang();
  const [agents, setAgents] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [hovered, setHovered] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/modules?moduleType=agent`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAgents(data.data || data);
    } catch {
      setError("Failed to load agents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const categories = [
    "all",
    ...Array.from(new Set(agents.map((a) => a.category))),
  ];

  const filtered = agents.filter((a) => {
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || a.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1280px] px-6 pt-22.5">
        <BreadcrumbNav items={[{ label: "Agents" }]} />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-[720px] overflow-hidden px-6 pt-6 pb-14 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[100px]" />
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-4 py-1.5 text-[13px] font-medium text-primary">
          <Bot size={12} /> {isAr ? "سوق الوكلاء الذكيين" : "AI Agent Marketplace"}
        </div>
        <h1 className="mb-4.5 text-[clamp(34px,5.5vw,60px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
          {isAr ? "وكلاء مصممون لـ" : "Agents built for"}
          <br />
          <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
            {isAr ? "قطاعك." : "your industry."}
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-[500px] text-[17px] leading-[1.7] text-muted-foreground">
          {isAr ? "وكلاء ذكاء اصطناعي متخصصون في مجالك. اشترك، اضبط الإعدادات، ودعهم يعملون 24/7." : "Specialised AI agents trained on your niche. Subscribe, configure, and let them run 24/7."}
        </p>

        {/* Search */}
        <div className="relative mx-auto max-w-[460px]">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isAr ? "ابحث عن وكيل..." : "Search agents..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-auto rounded-[11px] py-3.25 pr-4 pl-11 text-sm"
          />
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 pb-24">
        {/* Category filters */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-4 py-1.75 text-[13px] font-medium transition-all",
                category === cat ? "border-primary/40 bg-primary/10 text-primary" : "text-muted-foreground"
              )}
            >
              {formatCategory(cat)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-20 text-center">
            <Loader2 size={32} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading agents...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="p-15 text-center">
            <p className="mb-4 text-sm text-destructive">{error}</p>
            <Button onClick={fetchAgents}>Try again</Button>
          </div>
        )}

        {/* Agents grid */}
        {!loading && !error && (
          <>
            <p className="mb-5 text-center text-[13px] text-muted-foreground">
              {filtered.length} agent{filtered.length !== 1 ? "s" : ""} available
            </p>

            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
              {filtered.map((agent) => {
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
                      className="flex h-full cursor-pointer flex-col rounded-[14px] border p-5.5 transition-all"
                      style={{
                        background: isHovered ? `${agent.color}06` : undefined,
                        borderColor: isHovered ? agent.color + "30" : undefined,
                        boxShadow: isHovered ? `0 0 30px ${agent.color}10` : undefined,
                      }}
                    >
                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className="flex size-12 items-center justify-center rounded-xl border text-[22px]"
                          style={{ background: `${agent.color}15`, borderColor: `${agent.color}30` }}
                        >
                          {agent.icon}
                        </div>
                        <span
                          className="rounded-full border px-2.5 py-0.75 text-[11px] font-semibold"
                          style={{
                            background: agent.badge === "Live" ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.08)",
                            color: agent.badge === "Live" ? "#22c55e" : undefined,
                            borderColor: agent.badge === "Live" ? "rgba(34,197,94,0.2)" : undefined,
                          }}
                        >
                          {agent.badge}
                        </span>
                      </div>

                      <h2 className="mb-1.5 text-[17px] font-bold text-foreground">
                        {(isAr && agent.name_ar) ? agent.name_ar : agent.name}
                      </h2>

                      {((isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline) && (
                        <p className="mb-2.5 text-[13px] font-medium" style={{ color: agent.color }}>
                          {(isAr && agent.tagline_ar) ? agent.tagline_ar : agent.tagline}
                        </p>
                      )}

                      <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
                        {(isAr && agent.description_ar) ? agent.description_ar : agent.description}
                      </p>

                      {/* Capabilities */}
                      <div className="mb-4.5 flex flex-wrap gap-1.5">
                        {agent.capabilities.slice(0, 3).map((cap) => (
                          <span key={cap} className="rounded-full border bg-secondary px-2 py-0.75 text-[11px] text-muted-foreground">
                            {cap}
                          </span>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <span className="rounded-full border bg-secondary px-2 py-0.75 text-[11px] text-muted-foreground">
                            +{agent.capabilities.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between">
                        {agent.pricing ? (
                          <div>
                            <span className="text-xl font-bold text-foreground">${agent.pricing.monthly}</span>
                            <span className="text-xs text-muted-foreground">/mo</span>
                          </div>
                        ) : (
                          <span className="text-[13px] text-muted-foreground">Pricing TBA</span>
                        )}
                        <div className="flex items-center gap-1 text-[13px] font-medium" style={{ color: agent.color }}>
                          {isAr ? "عرض التفاصيل" : "View details"} <ArrowRight size={13} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="p-15 text-center">
                <p className="text-[15px] text-muted-foreground">
                  {isAr ? "لم يُعثر على وكلاء مطابقين لبحثك." : "No agents found matching your search."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
