"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  AlertTriangle, Bot, ChevronLeft, ChevronRight, Clock, Loader2, MessageCircle,
  Package, Plus, RefreshCw, Search, Settings2, Shield, User, XCircle, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CreateChatbotModal, TEMPLATES } from "./create-chatbot-modal";

// Admin: every service every client is subscribed to — chatbots, agents
// and automations — in one list. All three are rows of the same
// `userservices` collection, so they share one page. Chatbot rows open
// their settings page (knowledge base, channels, billing); every row has
// Manage (extend trial / free forever / cancel). Data comes from the two
// admin lists the backend already has: /chatbots/admin/all (adds the
// needs-setup flags and message usage) and /userservices (agents and
// automations).

type Kind = "chatbot" | "agent" | "automation";

interface Row {
  id: string;
  kind: Kind;
  ownerName: string;
  ownerEmail: string;
  serviceName: string;
  name: string;
  emoji: string;
  tier?: string;
  monthlyFee: number;
  status: string;
  botStatus?: string;
  trialEndDate?: string;
  renewsAt?: string;
  isFreeForever: boolean;
  needsSetup: boolean;
  setupIssues: string[];
  messages30d?: number;
  createdAt: string;
}

const TEMPLATE_BY_KEY = Object.fromEntries(TEMPLATES.map((t) => [t.key, t]));

const STATUS: Record<string, { label: string; color: string }> = {
  trial: { label: "Trial", color: "#f59e0b" },
  active: { label: "Active", color: "#22c55e" },
  paused: { label: "Paused", color: "#3b82f6" },
  past_due: { label: "Past due", color: "#ef4444" },
  suspended: { label: "Suspended", color: "#ef4444" },
  cancelled: { label: "Cancelled", color: "#6b7280" },
};

const KIND: Record<Kind, { label: string; icon: typeof Bot }> = {
  chatbot: { label: "Chatbot", icon: MessageCircle },
  agent: { label: "Agent", icon: Bot },
  automation: { label: "Automation", icon: Zap },
};

const BOT_STATUS: Record<string, string> = { active: "Live", draft: "Draft", inactive: "Off" };

const PAGE_SIZE = 15;

function chatbotRow(b: any): Row {
  const t = TEMPLATE_BY_KEY[b.template];
  const owner = b.userId && typeof b.userId === "object" ? b.userId : {};
  return {
    id: b._id,
    kind: "chatbot",
    ownerName: owner.name || "Unknown",
    ownerEmail: owner.email || "",
    serviceName: t ? `${t.name} Chatbot` : "Chatbot",
    name: b.name,
    emoji: t?.emoji || "🤖",
    tier: b.billing?.tier,
    monthlyFee: b.billing?.monthlyFee || 0,
    status: b.billing?.status || "trial",
    botStatus: b.status,
    trialEndDate: b.billing?.trialEndsAt,
    renewsAt: b.billing?.nextBillingDate,
    isFreeForever: !!b.billing?.isFreeForever,
    needsSetup: !!b.needsSetup,
    setupIssues: [
      b.setupFlags?.noOpenAiKey && "No AI key on file",
      b.setupFlags?.whatsappPending && "WhatsApp enabled, not connected",
      b.setupFlags?.instagramPending && "Instagram enabled, not connected",
    ].filter(Boolean) as string[],
    messages30d: b.usage?.messages30d,
    createdAt: b.createdAt,
  };
}

function pipelineRow(s: any): Row {
  const owner = s.userId && typeof s.userId === "object" ? s.userId : {};
  return {
    id: s._id,
    kind: s.moduleType === "automation" ? "automation" : "agent",
    ownerName: owner.name || "Unknown",
    ownerEmail: owner.email || "",
    serviceName: s.moduleName || s.name,
    name: s.name,
    emoji: (s.moduleId && typeof s.moduleId === "object" && s.moduleId.icon) || (s.moduleType === "automation" ? "⚡" : "🤖"),
    tier: s.plan?.tier,
    monthlyFee: s.plan?.monthlyFee || 0,
    // The pipeline API shows an unpaid trial as "expired"; this page uses
    // the stored status name.
    status: s.status === "expired" ? "past_due" : s.status,
    trialEndDate: s.trialEndDate,
    renewsAt: s.nextRenewalDate,
    isFreeForever: !!s.isFreeForever,
    needsSetup: false,
    setupIssues: [],
    createdAt: s.createdAt,
  };
}

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

function planLabel(r: Row) {
  if (r.isFreeForever) return "Free forever";
  const tier = r.tier ? r.tier[0].toUpperCase() + r.tier.slice(1) : "";
  const fee = r.monthlyFee ? `$${r.monthlyFee}/mo` : "";
  return [tier, fee].filter(Boolean).join(" · ") || "—";
}

// ── Manage ───────────────────────────────────────────────────
function ManageModal({ row, onClose, onDone }: { row: Row; onClose: () => void; onDone: () => void }) {
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const act = async (key: string, call: () => Promise<unknown>, okMsg: string) => {
    setBusy(key);
    try {
      await call();
      toast.success(okMsg);
      onDone();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Something went wrong");
    }
    setBusy(null);
  };

  const st = STATUS[row.status] || STATUS.cancelled;
  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage subscription</DialogTitle>
          </DialogHeader>
          <p className="-mt-3 text-xs text-muted-foreground">{row.ownerName} · {row.serviceName}{row.name !== row.serviceName ? ` · ${row.name}` : ""}</p>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-b py-3">
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: `${st.color}1a`, color: st.color }}>{st.label}</span>
            <span className="text-xs text-muted-foreground">{planLabel(row)}</span>
            {row.trialEndDate && <span className="text-xs text-muted-foreground">Trial ends {fmtDate(row.trialEndDate)}</span>}
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-lg border bg-background p-3.5">
              <p className="mb-2.5 text-[13px] font-medium text-foreground">Extend trial</p>
              <div className="flex items-center gap-2">
                <Input type="number" value={days} min={1} max={365} onChange={(e) => setDays(parseInt(e.target.value) || 0)} className="w-20" />
                <span className="text-xs text-muted-foreground">days</span>
                <Button
                  variant="outline" size="sm" className="ml-auto gap-1.5" disabled={!!busy || days < 1}
                  onClick={() => act("extend", () => api.patch(`/userservices/${row.id}/extend-trial`, { days }), `Trial extended by ${days} days`)}
                >
                  {busy === "extend" ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />} Extend
                </Button>
              </div>
            </div>

            <Button
              variant="outline" className="justify-center gap-2" disabled={row.isFreeForever || !!busy}
              onClick={() => act("free", () => api.patch(`/userservices/${row.id}/free-forever`), "Free forever access granted")}
            >
              {busy === "free" ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              {row.isFreeForever ? "Already free forever" : "Grant free forever access"}
            </Button>

            {row.status !== "cancelled" && (
              <Button
                variant="outline" disabled={!!busy} onClick={() => setConfirmCancel(true)}
                className="justify-center gap-2 border-destructive/20 bg-destructive/[0.06] text-destructive hover:bg-destructive/15 hover:text-destructive"
              >
                {busy === "cancel" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Cancel subscription
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              {row.serviceName} for {row.ownerName} will be cancelled{row.kind === "chatbot" ? " and the chatbot stops answering customers" : ""}. Its settings and history are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setConfirmCancel(false); act("cancel", () => api.patch(`/userservices/${row.id}/cancel`), "Subscription cancelled"); }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Cancel subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────
export function CustomerServicesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [needsSetupOnly, setNeedsSetupOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Row | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard/modules");
  }, [user, router]);

  const load = async () => {
    setLoading(true);
    const [bots, pipes] = await Promise.allSettled([
      api.get("/chatbots/admin/all"),
      api.get("/userservices", { params: { limit: 1000 } }),
    ]);
    const next: Row[] = [];
    if (bots.status === "fulfilled") next.push(...(bots.value.data?.data || bots.value.data || []).map(chatbotRow));
    else toast.error("Couldn't load chatbots");
    if (pipes.status === "fulfilled") next.push(...(pipes.value.data?.data || []).map(pipelineRow));
    else toast.error("Couldn't load agents and automations");
    next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRows(next);
    setLoading(false);
  };

  useEffect(() => { if (user?.role === "admin") load(); }, [user?.role]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) =>
      (kind === "all" || r.kind === kind) &&
      (status === "all" || r.status === status) &&
      (!needsSetupOnly || r.needsSetup) &&
      (!q || [r.ownerName, r.ownerEmail, r.serviceName, r.name].some((v) => v.toLowerCase().includes(q))),
    );
  }, [rows, search, kind, status, needsSetupOnly]);

  useEffect(() => { setPage(1); }, [search, kind, status, needsSetupOnly]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const shown = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const needsSetupCount = rows.filter((r) => r.needsSetup).length;

  const stats = [
    { label: "Total", value: rows.length, color: "#7c3aed" },
    { label: "Active / trial", value: rows.filter((r) => r.status === "active" || r.status === "trial").length, color: "#22c55e" },
    { label: "Past due", value: rows.filter((r) => r.status === "past_due" || r.status === "suspended").length, color: "#ef4444" },
    { label: "Needs setup", value: needsSetupCount, color: "#f59e0b" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Customer Services</h1>
          <p className="text-sm text-muted-foreground">Every chatbot, agent and automation your clients are subscribed to.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} className="gap-1.5"><RefreshCw size={13} /> Refresh</Button>
          <Button onClick={() => setShowCreate(true)} className="gap-1.5"><Plus size={15} /> New chatbot for a client</Button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card px-4 py-3.5">
            <p className="mb-1.5 text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border bg-card p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={13} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search client, email or service..." className="pl-7.5" />
        </div>
        <Combobox
          value={kind} onChange={(v) => setKind(v || "all")} className="min-w-[150px]"
          options={[
            { value: "all", label: "All types" },
            { value: "chatbot", label: "Chatbots", icon: <MessageCircle className="size-4" /> },
            { value: "agent", label: "Agents", icon: <Bot className="size-4" /> },
            { value: "automation", label: "Automations", icon: <Zap className="size-4" /> },
          ]}
        />
        <Combobox
          value={status} onChange={(v) => setStatus(v || "all")} className="min-w-[150px]"
          options={[{ value: "all", label: "All statuses" }, ...Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label }))]}
        />
        <button
          onClick={() => setNeedsSetupOnly((v) => !v)}
          disabled={needsSetupCount === 0 && !needsSetupOnly}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold disabled:opacity-40",
            needsSetupOnly ? "border-amber-500 bg-amber-500/10 text-amber-600" : "text-muted-foreground",
          )}
        >
          <AlertTriangle size={12} /> Needs setup ({needsSetupCount})
        </button>
        <span className="ml-auto text-xs text-muted-foreground">{visible.length} results</span>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-[1.6fr_2fr_110px_130px_100px_110px_190px] gap-2.5 border-b bg-background px-4.5 py-2.5">
              {["Client", "Service", "Type", "Plan", "Status", "Trial ends", ""].map((h) => (
                <span key={h} className="text-[11px] font-semibold text-muted-foreground">{h}</span>
              ))}
            </div>

            {loading ? (
              <div className="p-15 text-center"><Loader2 size={24} className="mx-auto animate-spin text-primary" /></div>
            ) : shown.length === 0 ? (
              <div className="p-15 text-center">
                <Package size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{rows.length ? "Nothing matches these filters." : "No client has subscribed to a service yet."}</p>
              </div>
            ) : (
              shown.map((r, i) => {
                const st = STATUS[r.status] || STATUS.cancelled;
                const K = KIND[r.kind];
                const soon = r.status === "trial" && r.trialEndDate && new Date(r.trialEndDate).getTime() < now + 5 * 86400000;
                return (
                  <div
                    key={r.id}
                    data-testid="customer-service-row"
                    data-kind={r.kind}
                    className={cn(
                      "grid grid-cols-[1.6fr_2fr_110px_130px_100px_110px_190px] items-center gap-2.5 px-4.5 py-3 hover:bg-background",
                      i < shown.length - 1 && "border-b",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-[13px] font-medium text-foreground"><User size={11} className="shrink-0 text-muted-foreground" /> {r.ownerName}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{r.ownerEmail || "—"}</p>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <span className="text-lg">{r.emoji}</span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground">{r.name}</p>
                        <p className="flex flex-wrap items-center gap-x-1.5 truncate text-[11px] text-muted-foreground">
                          {r.name !== r.serviceName && <span>{r.serviceName}</span>}
                          {r.botStatus && <span>· {BOT_STATUS[r.botStatus] || r.botStatus}</span>}
                          {r.messages30d !== undefined && <span>· {r.messages30d} msgs / 30d</span>}
                        </p>
                        {r.needsSetup && (
                          <span title={r.setupIssues.join(" · ")} className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                            <AlertTriangle size={9} /> Needs setup
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-1 rounded-md bg-primary/[0.08] px-2 py-0.75 text-[11px] font-semibold text-[#a78bfa]">
                      <K.icon size={11} /> {K.label}
                    </span>

                    <span className="text-xs text-muted-foreground">{planLabel(r)}</span>

                    <span className="inline-block w-fit rounded-full px-2 py-0.75 text-[11px] font-semibold" style={{ background: `${st.color}1a`, color: st.color }}>{st.label}</span>

                    <p className={cn("text-[11px]", soon ? "font-medium text-amber-500" : "text-muted-foreground")}>
                      {r.status === "trial" ? fmtDate(r.trialEndDate) : "—"}
                    </p>

                    <div className="flex justify-end gap-1.5">
                      {r.kind === "chatbot" && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => router.push(`/dashboard/chatbots/${r.id}`)}>
                          <Settings2 size={12} /> Configure
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setSelected(r)}>Manage</Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {pages > 1 && (
        <div className="mt-3.5 flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={13} /></Button>
            <span className="px-2 py-1.5 text-xs text-muted-foreground">{page} / {pages}</span>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}><ChevronRight size={13} /></Button>
          </div>
        </div>
      )}

      {selected && <ManageModal row={selected} onClose={() => setSelected(null)} onDone={load} />}
      {showCreate && (
        <CreateChatbotModal
          isAdmin
          onClose={() => setShowCreate(false)}
          onCreated={(id) => { setShowCreate(false); router.push(`/dashboard/chatbots/${id}`); }}
        />
      )}
    </div>
  );
}
