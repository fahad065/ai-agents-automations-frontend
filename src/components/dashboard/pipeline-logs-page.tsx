"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Loader2, CheckCircle2, XCircle, Clock,
  RefreshCw, Terminal, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { toast } from "sonner";

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
function LogDrawer({ run, onClose, isDark }: { run: PipelineRun; onClose: () => void; isDark: boolean }) {
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
    <div style={{
      position: "fixed", inset: 0, zIndex: 800,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "20px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px", width: "100%", maxWidth: "720px",
        maxHeight: "75vh", display: "flex", flexDirection: "column",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
      }}>
        <div style={{
          padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Terminal size={14} color="#a78bfa" />
            <span style={{ color: "#e5e5e5", fontSize: "13px", fontWeight: 600 }}>Pipeline Logs</span>
            <span style={{ fontSize: "11px", color: "#525252" }}>— {run.runId}</span>
            {isRunning && (
              <span style={{
                fontSize: "9px", padding: "2px 7px", borderRadius: "4px",
                background: "rgba(34,197,94,0.15)", color: "#22c55e", fontWeight: 700,
                animation: "pulse 1.5s ease-in-out infinite",
              }}>LIVE</span>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={fetchLogs} style={{
              padding: "4px 10px", borderRadius: "6px", cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
              color: "#737373", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px",
            }}>
              {loading
                ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} />
                : <RefreshCw size={10} />} Refresh
            </button>
            <button onClick={onClose} style={{
              width: "26px", height: "26px", borderRadius: "6px", cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
              color: "#737373", display: "flex", alignItems: "center", justifyContent: "center",
            }}><X size={12} /></button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "16px 18px", fontFamily: "monospace" }}>
          {logs.length === 0 ? (
            <p style={{ color: "#525252", fontSize: "12px" }}>No logs yet...</p>
          ) : (
            logs.map((log, i) => {
              const isError   = log.includes("❌") || log.toLowerCase().includes("error") || log.includes("failed");
              const isSuccess = log.includes("✓") || log.includes("✅") || log.includes("complete");
              const isStep    = log.includes("[Step");
              const isCost    = log.includes("💰");
              return (
                <div key={i} style={{
                  fontSize: "12px", lineHeight: "1.7", marginBottom: "2px",
                  color: isError ? "#fca5a5" : isCost ? "#fbbf24" : isSuccess ? "#86efac" : isStep ? "#c4b5fd" : "#a3a3a3",
                }}>
                  <span style={{ color: "#404040", marginRight: "8px", userSelect: "none" }}>
                    {String(i + 1).padStart(3, " ")}
                  </span>
                  {log}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const map: Record<string, { color: string; bg: string; icon: any; label: string }> = {
    running:   { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  icon: <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} />, label: "Running" },
    completed: { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  icon: <CheckCircle2 size={10} />, label: "Completed" },
    failed:    { color: "#ef4444", bg: "rgba(239,68,68,0.12)",  icon: <XCircle size={10} />,      label: "Failed" },
    pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: <Clock size={10} />,        label: "Pending" },
  };
  const s = map[normalized] || map.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 9px", borderRadius: "6px",
      background: s.bg, color: s.color, fontSize: "11px", fontWeight: 600,
    }}>
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
  const { colors, isDark } = useTheme();
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

  const inp = {
    padding: "7px 12px", borderRadius: "8px", fontSize: "12px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none", cursor: "pointer",
  };

  return (
    <div style={{ padding: "24px", maxWidth: "860px", margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, margin: "0 0 4px" }}>Pipeline Logs</h1>
          <p style={{ fontSize: "13px", color: colors.textMuted, margin: 0 }}>Track all your pipeline runs</p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {/* Module filter */}
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            style={inp}
          >
            {MODULE_TYPES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {/* Refresh */}
          <button onClick={() => fetchRuns(page, moduleFilter)} style={{
            padding: "7px 12px", borderRadius: "8px", cursor: "pointer",
            border: `1px solid ${colors.border}`, background: "transparent",
            color: colors.textMuted, fontSize: "12px",
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Runs",  value: total,          color: "#a78bfa" },
          { label: "Completed",   value: stats.completed, color: "#22c55e" },
          { label: "Failed",      value: stats.failed,    color: "#ef4444" },
          { label: "Running",     value: stats.running,   color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "14px 16px", borderRadius: "12px",
            background: colors.bgCard, border: `1px solid ${colors.border}`,
          }}>
            <p style={{ fontSize: "22px", fontWeight: 700, color: s.color, margin: "0 0 2px" }}>{s.value}</p>
            <p style={{ fontSize: "11px", color: colors.textMuted, margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Run List */}
      {loading && runs.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "48px" }}>
          <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : runs.length === 0 ? (
        <div style={{
          padding: "48px", textAlign: "center", borderRadius: "12px",
          background: colors.bgCard, border: `1px solid ${colors.border}`,
        }}>
          <Terminal size={32} color={colors.textMuted} style={{ marginBottom: "12px" }} />
          <p style={{ color: colors.textMuted, fontSize: "14px", margin: 0 }}>No pipeline runs yet</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {runs.map((run) => {
            const status    = normalizeStatus(run.status);
            const isRunning = status === "running";
            const isFailed  = status === "failed";
            const isDone    = status === "completed";
            const isPending = status === "pending";

            return (
              <div key={run._id} style={{
                padding: "16px 18px", borderRadius: "12px",
                background: colors.bgCard,
                border: `1px solid ${isFailed ? "rgba(239,68,68,0.2)" : isRunning ? "rgba(34,197,94,0.2)" : colors.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Status + type */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <StatusBadge status={run.status} />
                      <span style={{
                        fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                        borderRadius: "5px", background: "rgba(124,58,237,0.08)", color: "#a78bfa",
                      }}>
                        {run.moduleType || "youtube"}
                      </span>
                      <span style={{ fontSize: "12px", color: colors.textMuted }}>
                        {run.niche || "general"}
                      </span>
                    </div>

                    {/* Video title */}
                    {run.title && (
                      <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        "{run.title}"
                      </p>
                    )}

                    {/* Error message */}
                    {isFailed && run.errorMessage && (
                      <p style={{ fontSize: "12px", color: "#fca5a5", margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        ❌ {run.errorMessage.slice(0, 120)}
                      </p>
                    )}

                    {/* Step progress bar */}
                    {isRunning && run.currentStep != null && run.totalSteps != null && run.totalSteps > 0 && (
                      <div style={{ marginTop: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontSize: "11px", color: colors.textMuted }}>Step {run.currentStep}/{run.totalSteps}</span>
                        </div>
                        <div style={{ height: "3px", borderRadius: "2px", background: isDark ? "#2a2a2a" : "#e5e5e5" }}>
                          <div style={{
                            height: "100%", borderRadius: "2px", background: "#22c55e",
                            width: `${(run.currentStep / run.totalSteps) * 100}%`,
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Meta — date + cost */}
                    <p style={{ fontSize: "11px", color: colors.textMuted, margin: "6px 0 0" }}>
                      {formatDate(run.createdAt)}
                      {run.cost ? ` · $${run.cost.toFixed(2)}` : ""}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                    {/* View / Live Logs — always visible */}
                    <button onClick={() => setSelectedRun(run)} style={{
                      padding: "6px 12px", borderRadius: "7px", cursor: "pointer",
                      border: `1px solid ${colors.border}`, background: "transparent",
                      color: colors.textMuted, fontSize: "11px",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      <Terminal size={11} /> {isRunning ? "Live Logs" : "View Logs"}
                    </button>

                    {/* Watch on YouTube — completed only */}
                    {isDone && run.youtubeUrl && (
                      <a href={run.youtubeUrl} target="_blank" rel="noreferrer" style={{
                        padding: "6px 12px", borderRadius: "7px",
                        border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
                        color: "#ef4444", fontSize: "11px", textDecoration: "none",
                        display: "flex", alignItems: "center", gap: "4px",
                      }}>
                        <FaYoutube size={11} /> Watch
                      </a>
                    )}

                    {/* Retry — failed or stuck pending */}
                    {(isFailed || isPending) && (
                      <button
                        onClick={() => handleRetry(run)}
                        disabled={retrying === run._id}
                        style={{
                          padding: "6px 12px", borderRadius: "7px",
                          cursor: retrying === run._id ? "not-allowed" : "pointer",
                          border: "1px solid rgba(124,58,237,0.3)",
                          background: "rgba(124,58,237,0.08)",
                          color: "#a78bfa", fontSize: "11px",
                          display: "flex", alignItems: "center", gap: "4px",
                          opacity: retrying === run._id ? 0.6 : 1,
                        }}>
                        {retrying === run._id
                          ? <><Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> Retrying...</>
                          : <><RefreshCw size={10} /> Retry</>}
                      </button>
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
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: "16px", padding: "12px 16px",
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "10px",
        }}>
          <span style={{ fontSize: "12px", color: colors.textMuted }}>
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} runs
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: "30px", height: "30px", borderRadius: "7px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                border: `1px solid ${colors.border}`, background: "transparent",
                color: colors.text, display: "flex", alignItems: "center", justifyContent: "center",
                opacity: page === 1 ? 0.4 : 1,
              }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: "30px", height: "30px", borderRadius: "7px", cursor: "pointer",
                border: `1px solid ${p === page ? "#7c3aed" : colors.border}`,
                background: p === page ? "rgba(124,58,237,0.15)" : "transparent",
                color: p === page ? "#a78bfa" : colors.text,
                fontSize: "12px", fontWeight: p === page ? 700 : 400,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: "30px", height: "30px", borderRadius: "7px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                border: `1px solid ${colors.border}`, background: "transparent",
                color: colors.text, display: "flex", alignItems: "center", justifyContent: "center",
                opacity: page === totalPages ? 0.4 : 1,
              }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Log Drawer */}
      {selectedRun && (
        <LogDrawer run={selectedRun} onClose={() => setSelectedRun(null)} isDark={isDark} />
      )}
    </div>
  );
}