"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Check, Loader2, MessageCircle, Search, Store, Workflow, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { toServiceViews } from "@/lib/service-view";
import { SERVICE_SLUG_TO_TEMPLATE } from "@/lib/chatbot-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AddChatbotModal, SubscribeModal, type AvailableModule } from "./modules-page";

// Browse Services: every service in the catalog, subscribable from inside
// the dashboard. Chatbots → pick Basic/Pro → 30-day trial → bot settings.
// Agents/automations → the existing setup form → 30-day trial.
// ?open=<slug> opens that service straight away (marketing "Get started"
// links land here after signup).

type Kind = "all" | "chatbot" | "agent" | "automation";

const KIND_TABS: { key: Kind; label: string; icon: typeof Bot }[] = [
  { key: "all", label: "All", icon: Store },
  { key: "chatbot", label: "Chatbots", icon: MessageCircle },
  { key: "agent", label: "AI Agents", icon: Bot },
  { key: "automation", label: "Automations", icon: Workflow },
];

const TYPE_LABEL: Record<string, string> = { chatbot: "Chatbot", agent: "AI Agent", automation: "Automation" };

function startingPrice(m: AvailableModule): number {
  const tierPrices = (m.pricingTiers || []).map((t) => t.monthly).filter((p) => p > 0);
  if (tierPrices.length) return Math.min(...tierPrices);
  return m.pricing?.monthly || 0;
}

export function ServicesMarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<AvailableModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState<Kind>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AvailableModule | null>(null);
  // What the user already has, to label cards "You have this".
  const [ownedTemplates, setOwnedTemplates] = useState<Record<string, number>>({});
  const [ownedModuleIds, setOwnedModuleIds] = useState<Set<string>>(new Set());

  const loadOwned = async () => {
    const [bots, mods] = await Promise.allSettled([api.get("/chatbots"), api.get("/userservices/my")]);
    if (bots.status === "fulfilled") {
      const counts: Record<string, number> = {};
      for (const b of bots.value.data?.data || bots.value.data || []) counts[b.template] = (counts[b.template] || 0) + 1;
      setOwnedTemplates(counts);
    }
    if (mods.status === "fulfilled") {
      const ids = new Set<string>();
      for (const m of mods.value.data?.data || mods.value.data || []) {
        const id = typeof m.moduleId === "object" ? m.moduleId?._id : m.moduleId;
        if (id) ids.add(String(id));
      }
      setOwnedModuleIds(ids);
    }
  };

  useEffect(() => {
    const open = searchParams.get("open");
    Promise.all([api.get("/services?limit=100"), loadOwned()])
      .then(([res]) => {
        const list = toServiceViews<AvailableModule>(res.data?.data).filter((s) => s.status !== "inactive");
        setServices(list);
        if (open) {
          const match = list.find((s) => s.slug === open && s.status === "active");
          if (match) setSelected(match);
          router.replace("/dashboard/services", { scroll: false });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services
      .filter((s) => kind === "all" || s.type === kind)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || (s.tagline || "").toLowerCase().includes(q))
      // Available first, coming soon last.
      .sort((a, b) => Number(a.status === "coming_soon") - Number(b.status === "coming_soon"));
  }, [services, kind, search]);

  const owned = (s: AvailableModule) =>
    s.type === "chatbot" ? (ownedTemplates[SERVICE_SLUG_TO_TEMPLATE[s.slug]] || 0) : ownedModuleIds.has(s._id) ? 1 : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Browse Services</h1>
          <p className="text-sm text-muted-foreground">Every service starts with a 30-day free trial — no credit card needed.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/modules")}>My Services</Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-[10px] border bg-card px-3 py-2.5">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Service type">
          {KIND_TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={kind === t.key}
              onClick={() => setKind(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                kind === t.key ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-[280px]">
          <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="h-8 w-full pl-7.5 text-[13px]" />
        </div>
      </div>

      {loading ? (
        <div className="p-15 text-center"><Loader2 size={28} className="mx-auto animate-spin text-primary" /></div>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border bg-card px-6 py-15 text-center">
          <Store size={36} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No services match your search.</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {visible.map((s) => {
            const comingSoon = s.status === "coming_soon";
            const have = owned(s);
            const price = startingPrice(s);
            return (
              <div key={s._id} className={cn("flex flex-col rounded-xl border bg-card p-4.5", comingSoon && "opacity-70")} data-testid="service-card">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border text-xl" style={{ background: `${s.color}12`, borderColor: `${s.color}25` }}>
                    {s.icon}
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {s.type === "chatbot" ? <MessageCircle size={9} /> : s.type === "agent" ? <Bot size={9} /> : <Zap size={9} />}
                      {TYPE_LABEL[s.type] || s.type}
                    </span>
                    {have > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-[#22c55e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#22c55e]">
                        <Check size={9} /> {s.type === "chatbot" && have > 1 ? `You have ${have}` : "You have this"}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mb-1 text-sm font-semibold text-foreground">{s.name}</p>
                <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{s.tagline || s.description}</p>
                <div className="mt-auto flex items-end justify-between gap-2">
                  <div>
                    {price > 0 ? (
                      <p className="text-sm font-bold text-foreground">
                        {s.pricingTiers && s.pricingTiers.length > 1 && <span className="text-[11px] font-normal text-muted-foreground">From </span>}
                        ${price}<span className="text-[11px] font-normal text-muted-foreground">/mo</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Contact us for pricing</p>
                    )}
                    <p className="text-[10px] text-[#22c55e]">30-day free trial</p>
                  </div>
                  {comingSoon ? (
                    <span className="rounded-md bg-secondary px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground">Coming soon</span>
                  ) : s.type !== "chatbot" && have > 0 ? (
                    <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/modules")}>Open</Button>
                  ) : (
                    <Button size="sm" onClick={() => setSelected(s)}>{s.type === "chatbot" && have > 0 ? "Add another" : "Start free trial"}</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && selected.type === "chatbot" && (
        <AddChatbotModal module={selected} onClose={() => setSelected(null)} onSuccess={loadOwned} />
      )}
      {selected && selected.type !== "chatbot" && (
        <SubscribeModal
          module={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => { setSelected(null); router.push("/dashboard/modules"); }}
        />
      )}
    </div>
  );
}
