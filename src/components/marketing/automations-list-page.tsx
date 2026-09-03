"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLang } from "@/hooks/use-lang";
import { ArrowRight, Zap, Loader2, Search } from "lucide-react";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AutomationTemplate {
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
  pricing?: { monthly: number; annual: number };
}

const formatCategory = (val: string) =>
  val === "all" ? "All automations" :
  val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function AutomationsListPage() {
  const { isAr } = useLang();
  const [automations, setAutomations] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [hovered, setHovered] = useState<string | null>(null);

  const fetchAutomations = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      const res = await fetch(`${apiUrl}/modules?moduleType=automation`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAutomations(data.data || data);
    } catch {
      setError("Failed to load automations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAutomations(); }, [fetchAutomations]);

  const categories = ["all", ...Array.from(new Set(automations.map((a) => a.category)))];
  const filtered = automations.filter((a) => {
    const matchesSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === "all" || a.category === category);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1280px] px-6 pt-22.5">
        <BreadcrumbNav items={[{ label: "Automations" }]} />
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-[720px] overflow-hidden px-6 pt-6 pb-14 text-center">
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-[100px]" />
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/[0.08] px-4 py-1.5 text-[13px] font-medium text-primary">
          <Zap size={12} /> {isAr ? "سوق الأتمتة" : "Automation Marketplace"}
        </div>
        <h1 className="mb-4.5 text-[clamp(34px,5.5vw,60px)] leading-[1.05] font-extrabold tracking-[-0.04em] text-foreground">
          {isAr ? "أتمتة أي سير عمل." : "Automate any workflow."}
          <br />
          <span className="bg-gradient-to-br from-[#c4b5fd] via-[#a78bfa] to-[#7c3aed] bg-clip-text text-transparent">
            {isAr ? "انشر في دقائق." : "Deploy in minutes."}
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-[500px] text-[17px] leading-[1.7] text-muted-foreground">
          {isAr
            ? "مسارات أتمتة جاهزة للمحتوى والتسويق والمبيعات والمزيد. بدون كود. بدون إعداد. فقط فعّل وانطلق."
            : "Pre-built automation pipelines for content, marketing, sales and more. No code. No setup. Just activate and go."}
        </p>

        {/* Search */}
        <div className="relative mx-auto max-w-[460px]">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isAr ? "ابحث عن أتمتة..." : "Search automations..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-auto rounded-[11px] py-3.25 pr-4 pl-11 text-sm"
          />
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 pb-24">
        {/* Category filters */}
        <div className="mb-9 flex flex-wrap justify-center gap-2">
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

        {loading && (
          <div className="p-20 text-center">
            <Loader2 size={32} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading automations...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-15 text-center">
            <p className="mb-4 text-sm text-destructive">{error}</p>
            <Button onClick={fetchAutomations}>Try again</Button>
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="mb-5 text-center text-xs text-muted-foreground opacity-60">
              {filtered.length} automation{filtered.length !== 1 ? "s" : ""} available
            </p>

            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
              {filtered.map((automation) => {
                const isHovered = hovered === automation._id;
                return (
                  <Link key={automation._id} href={`/automations/${automation.slug}`} className="no-underline" onMouseEnter={() => setHovered(automation._id)} onMouseLeave={() => setHovered(null)}>
                    <div
                      className="flex h-full cursor-pointer flex-col rounded-[14px] border p-5.5 transition-all"
                      style={{
                        background: isHovered ? `${automation.color}06` : undefined,
                        borderColor: isHovered ? automation.color + "30" : undefined,
                        boxShadow: isHovered ? `0 0 30px ${automation.color}10` : undefined,
                      }}
                    >
                      {/* Header */}
                      <div className="mb-3.5 flex items-start justify-between">
                        <div
                          className="flex size-11 shrink-0 items-center justify-center rounded-[11px] border text-xl"
                          style={{ background: `${automation.color}12`, borderColor: `${automation.color}25` }}
                        >
                          {automation.icon}
                        </div>
                        <span
                          className="rounded-full border px-2.25 py-0.75 text-[10px] font-semibold"
                          style={{
                            background: automation.badge === "Live" ? "rgba(34,197,94,0.1)" : `${automation.color}12`,
                            color: automation.badge === "Live" ? "#22c55e" : automation.color,
                            borderColor: automation.badge === "Live" ? "rgba(34,197,94,0.2)" : automation.color + "25",
                          }}
                        >
                          {automation.badge || "Active"}
                        </span>
                      </div>

                      <h2 className="mb-1.5 text-[15px] leading-tight font-bold text-foreground">
                        {(isAr && automation.name_ar) ? automation.name_ar : automation.name}
                      </h2>

                      {((isAr && automation.tagline_ar) ? automation.tagline_ar : automation.tagline) && (
                        <p className="mb-2 text-xs font-medium" style={{ color: automation.color }}>
                          {(isAr && automation.tagline_ar) ? automation.tagline_ar : automation.tagline}
                        </p>
                      )}

                      <p className="mb-3.5 flex-1 text-xs leading-relaxed text-muted-foreground">
                        {(isAr && automation.description_ar) ? automation.description_ar : automation.description}
                      </p>

                      {/* Capability tags */}
                      <div className="mb-3.5 flex flex-wrap gap-1.25">
                        {automation.capabilities.slice(0, 3).map((cap) => (
                          <span
                            key={cap}
                            className="rounded px-2 py-0.5 text-[10px]"
                            style={{ background: `${automation.color}10`, color: automation.color, border: `1px solid ${automation.color}20` }}
                          >
                            {cap}
                          </span>
                        ))}
                        {automation.capabilities.length > 3 && (
                          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                            +{automation.capabilities.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t pt-3">
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: automation.color }}>
                          {isAr ? "عرض التفاصيل" : "View details"} <ArrowRight size={12} />
                        </span>
                        {automation.pricing?.monthly ? (
                          <span className="text-[11px] text-muted-foreground">from ${automation.pricing.monthly}/mo</span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="p-15 text-center">
                <p className="text-[15px] text-muted-foreground">
                  {isAr ? "لم يُعثر على أتمتة مطابقة لبحثك." : "No automations found matching your search."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
