"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import {
  Loader2, CheckCircle2, XCircle, Clock,
  RefreshCw, Terminal, ChevronLeft, ChevronRight,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface PipelineRun {
  _id: string;
  runId: string;
  status: string;
  moduleType: string;
  niche?: string;
  currentStep?: number;
  totalSteps?: number;
  title?: string;
  youtubeUrl?: string;
  errorMessage?: string;
  logs?: string[];
  cost?: number;
  createdAt: string;
  updatedAt: string;
  agentId?: string;
}

// ── Normalize status from DB ──────────────────────────────────
function normalizeStatus(status: string): string {
  // DB stores "complete" but we use "completed" internally
  if (status === "complete" || status === "uploaded") return "completed";
  if (status === "running" || status === "generating_clips") return "running";
  if (status === "failed" || status === "error") return "failed";
  if (status === "pending" || status === "starting") return "pending";
  return status;
}

// ── Log Drawer ────────────────────────────────────────────────
function LogDrawer({ run, onClose }: { run: PipelineRun; onClose: () => void }) {
  const [logs, setLogs] = useState<string[]>(run.logs || []);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const status = normalizeStatus(run.status);
  const isRunning = status === "running";

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pipeline-runs/${run.runId}`);
      setLogs(res.data?.logs || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    if (isRunning) {
      const interval = setInterval(fetchLogs, 8000);
      return () => clearInterval(interval);
    }
  }, [run.runId, isRunning]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[75vh] w-full max-w-[720px] gap-0 rounded-t-2xl border border-white/8 bg-[#0d0d0d] p-0 [&_svg]:text-[#737373]"
      >
        <div className="flex items-center justify-between border-b border-white/6 px-4.5 py-3.5">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-[#a78bfa]" />
            <span className="text-[13px] font-semibold text-[#e5e5e5]">Pipeline Logs</span>
            <span className="text-[11px] text-[#525252]">— {run.runId}</span>
            {isRunning && (
              <span className="animate-pulse rounded bg-[#22c55e]/15 px-1.75 py-0.5 text-[9px] font-bold text-[#22c55e]">LIVE</span>
            )}
          </div>
          <button
            onClick={fetchLogs}
            className="mr-9 flex items-center gap-1 rounded-md border border-white/8 px-2.5 py-1 text-[11px] text-[#737373]"
          >
            {loading ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />} Refresh
          </button>
        </div>
        <div className="flex-1 overflow-auto px-4.5 py-4 font-mono">
          {logs.length === 0 ? (
            <p className="text-xs text-[#525252]">No logs yet...</p>
          ) : (
            logs.map((log, i) => {
              const isError   = log.includes("❌") || log.toLowerCase().includes("error") || log.includes("failed");
              const isSuccess = log.includes("✓") || log.includes("✅") || log.includes("complete");
              const isStep    = log.includes("[Step");
              const isCost    = log.includes("💰");
              return (
                <div
                  key={i}
                  className={cn(
                    "mb-0.5 text-xs leading-[1.7]",
                    isError ? "text-[#fca5a5]" : isCost ? "text-[#fbbf24]" : isSuccess ? "text-[#86efac]" : isStep ? "text-[#c4b5fd]" : "text-[#a3a3a3]"
                  )}
                >
                  <span className="mr-2 text-[#404040] select-none">
                    {String(i + 1).padStart(3, " ")}
                  </span>
                  {log}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const map: Record<string, { className: string; icon: React.ReactNode; label: string }> = {
    running:   { className: "bg-[#22c55e]/12 text-[#22c55e]", icon: <Loader2 size={10} className="animate-spin" />, label: "Running" },
    completed: { className: "bg-[#22c55e]/12 text-[#22c55e]", icon: <CheckCircle2 size={10} />, label: "Completed" },
    failed:    { className: "bg-destructive/12 text-destructive", icon: <XCircle size={10} />, label: "Failed" },
    pending:   { className: "bg-[#f59e0b]/12 text-[#f59e0b]", icon: <Clock size={10} />, label: "Pending" },
  };
  const s = map[normalized] || map.pending;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-2.25 py-0.75 text-[11px] font-semibold", s.className)}>
      {s.icon} {s.label}
    </span>
  );
}

// ── Module type options ───────────────────────────────────────
const MODULE_TYPES = [
  { value: "all",        label: "All Agents" },
  { value: "youtube",    label: "YouTube" },
  { value: "instagram",  label: "Instagram" },
  { value: "podcast",    label: "Podcast" },
  { value: "realestate", label: "Real Estate" },
];

// ── Main Page ─────────────────────────────────────────────────
export default function PipelineLogsPage() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  // Pagination + filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [moduleFilter, setModuleFilter] = useState("all");
  const limit = 10;

  const fetchRuns = async (p = page, filter = moduleFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: limit.toString(),
        ...(filter !== "all" && { moduleType: filter }),
      });
      const res = await api.get(`/pipeline-runs/my?${params}`);
      const isArray = Array.isArray(res.data);
      setRuns(isArray ? res.data : (res.data?.data || []));
      const t = isArray ? res.data.length : (res.data?.total || 0);
      setTotal(t);
      setTotalPages(Math.ceil(t / limit));
    } catch {
      toast.error("Failed to load pipeline runs");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRuns(1, moduleFilter);
    setPage(1);
  }, [moduleFilter]);

  useEffect(() => {
    fetchRuns(page, moduleFilter);
    const interval = setInterval(() => fetchRuns(page, moduleFilter), 30000);
    return () => clearInterval(interval);
  }, [page]);

  const handleRetry = async (run: PipelineRun) => {
    if (!run.agentId) {
      toast.error("Cannot retry — module ID not found");
      return;
    }
    setRetrying(run._id);
    try {
      await api.post(`/usermodules/${run.agentId}/run`);
      toast.success("Pipeline restarted!");
      fetchRuns(page, moduleFilter);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to retry");
    }
    setRetrying(null);
  };

  const stats = {
    total,
    completed: runs.filter(r => normalizeStatus(r.status) === "completed").length,
    failed:    runs.filter(r => normalizeStatus(r.status) === "failed").length,
    running:   runs.filter(r => normalizeStatus(r.status) === "running").length,
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-[860px] p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Pipeline Logs</h1>
          <p className="text-[13px] text-muted-foreground">Track all your pipeline runs</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Module filter */}
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="cursor-pointer rounded-lg border bg-background px-3 py-1.75 text-xs text-foreground outline-none"
          >
            {MODULE_TYPES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {/* Refresh */}
          <Button variant="outline" size="sm" onClick={() => fetchRuns(page, moduleFilter)} className="gap-1">
            <RefreshCw size={12} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Runs",  value: total,          color: "#a78bfa" },
          { label: "Completed",   value: stats.completed, color: "#22c55e" },
          { label: "Failed",      value: stats.failed,    color: "#ef4444" },
          { label: "Running",     value: stats.running,   color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border bg-card px-4 py-3.5">
            <p className="mb-0.5 text-[22px] font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Run List */}
      {loading && runs.length === 0 ? (
        <div className="flex justify-center p-12">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Terminal size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No pipeline runs yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {runs.map((run) => {
            const status    = normalizeStatus(run.status);
            const isRunning = status === "running";
            const isFailed  = status === "failed";
            const isDone    = status === "completed";
            const isPending = status === "pending";

            return (
              <div
                key={run._id}
                className={cn(
                  "rounded-xl border bg-card px-4.5 py-4",
                  isFailed ? "border-destructive/20" : isRunning && "border-[#22c55e]/20"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Status + type */}
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={run.status} />
                      <span className="rounded px-2 py-0.5 text-[11px] font-semibold text-[#a78bfa]" style={{ background: "rgba(124,58,237,0.08)" }}>
                        {run.moduleType || "youtube"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {run.niche || "general"}
                      </span>
                    </div>

                    {/* Video title */}
                    {run.title && (
                      <p className="mb-1 overflow-hidden text-[13px] font-semibold text-ellipsis whitespace-nowrap text-foreground">
                        "{run.title}"
                      </p>
                    )}

                    {/* Error message */}
                    {isFailed && run.errorMessage && (
                      <p className="mb-1 overflow-hidden text-xs text-ellipsis whitespace-nowrap text-[#fca5a5]">
                        ❌ {run.errorMessage.slice(0, 120)}
                      </p>
                    )}

                    {/* Step progress bar */}
                    {isRunning && run.currentStep != null && run.totalSteps != null && run.totalSteps > 0 && (
                      <div className="mt-2">
                        <div className="mb-1 flex justify-between">
                          <span className="text-[11px] text-muted-foreground">Step {run.currentStep}/{run.totalSteps}</span>
                        </div>
                        <div className="h-0.75 rounded-sm bg-border">
                          <div
                            className="h-full rounded-sm bg-[#22c55e] transition-[width] duration-500 ease-out"
                            style={{ width: `${(run.currentStep / run.totalSteps) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Meta — date + cost */}
                    <p className="mt-1.5 text-[11px] text-muted-foreground">
                      {formatDate(run.createdAt)}
                      {run.cost ? ` · $${run.cost.toFixed(2)}` : ""}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 flex-col gap-1.5">
                    {/* View / Live Logs — always visible */}
                    <Button variant="outline" size="sm" onClick={() => setSelectedRun(run)} className="gap-1 text-[11px] text-muted-foreground">
                      <Terminal size={11} /> {isRunning ? "Live Logs" : "View Logs"}
                    </Button>

                    {/* Watch on YouTube — completed only */}
                    {isDone && run.youtubeUrl && (
                      <a
                        href={run.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/8 px-3 py-1.5 text-[11px] text-destructive no-underline"
                      >
                        <FaYoutube size={11} /> Watch
                      </a>
                    )}

                    {/* Retry — failed or stuck pending */}
                    {(isFailed || isPending) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(run)}
                        disabled={retrying === run._id}
                        className="gap-1 border-primary/30 bg-primary/8 text-[11px] text-[#a78bfa]"
                      >
                        {retrying === run._id
                          ? <><Loader2 size={10} className="animate-spin" /> Retrying...</>
                          : <><RefreshCw size={10} /> Retry</>}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between rounded-[10px] border bg-card px-4 py-3">
          <span className="text-xs text-muted-foreground">
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} runs
          </span>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <Button
                key={p}
                variant={p === page ? "outline" : "ghost"}
                size="icon"
                onClick={() => setPage(p)}
                className={p === page ? "border-primary bg-primary/15 text-[#a78bfa]" : ""}
              >
                {p}
              </Button>
            ))}
            <Button variant="ghost" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Log Drawer */}
      {selectedRun && (
        <LogDrawer run={selectedRun} onClose={() => setSelectedRun(null)} />
      )}
    </div>
  );
}
