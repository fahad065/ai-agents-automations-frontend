"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Loader2, CheckCircle2, XCircle, Clock,
  RefreshCw, Terminal, X,
  AlertTriangle, Play,
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
  totalCost?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  logs?: string[];
}

const STEP_LABELS: Record<number, string> = {
  1: "Researching topics", 2: "Writing script", 3: "Generating voiceover",
  4: "Generating video clips", 5: "Assembling video", 6: "Generating thumbnail",
  7: "Creating Shorts", 8: "Uploading to YouTube", 9: "Complete",
};

const STATUS_CFG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  pending:  { color: "#6b7280", bg: "rgba(107,114,128,0.08)", border: "rgba(107,114,128,0.2)",  label: "Pending" },
  running:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.3)",   label: "Running" },
  complete: { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.3)",    label: "Complete" },
  uploaded: { color: "#22c55e", bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.3)",    label: "Uploaded" },
  failed:   { color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.3)",    label: "Failed" },
};

// ── Log Drawer ────────────────────────────────────────────────
function LogDrawer({ run, onClose, isDark }: { run: PipelineRun; onClose: () => void; isDark: boolean }) {
  const [logs, setLogs] = useState<string[]>(run.logs || []);
  const [refreshing, setRefreshing] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const isRunning = run.status === "running" || run.status === "pending";

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(refreshLogs, 10000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const refreshLogs = async () => {
    setRefreshing(true);
    try {
      const res = await api.get(`/pipeline-runs/${run.runId}`);
      setLogs(res.data?.logs || []);
    } catch {}
    setRefreshing(false);
  };

  const getLogColor = (log: string) => {
    if (log.includes("❌") || log.includes("failed") || log.includes("Error")) return "#f87171";
    if (log.includes("✅") || log.includes("✓") || log.includes("complete") || log.includes("Saved")) return "#4ade80";
    if (log.includes("[Step") || log.includes("━━━")) return "#a78bfa";
    if (log.includes("[TTS]") || log.includes("[Thumbnail]")) return "#60a5fa";
    if (log.includes("[Seedance]")) return "#fb923c";
    if (log.includes("[YouTube]") || log.includes("[Assembler]")) return "#34d399";
    return "#9ca3af";
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 700,
      background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: "900px", height: "65vh",
        background: "#0d0d0d",
        borderRadius: "16px 16px 0 0",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", flexDirection: "column",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Terminal size={14} color="#a78bfa" />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#e5e5e5" }}>Pipeline Logs</span>
            {isRunning && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "2px 7px", borderRadius: "9999px",
                background: "rgba(239,68,68,0.2)", color: "#ef4444",
                fontSize: "10px", fontWeight: 700,
              }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "livePulse 1s infinite" }} />
                LIVE
              </span>
            )}
            <span style={{ fontSize: "10px", color: "#404040", fontFamily: "monospace" }}>
              {run.runId?.slice(-20) || run._id}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={refreshLogs} disabled={refreshing} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#525252", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px",
            }}>
              <RefreshCw size={11} style={refreshing ? { animation: "spin 1s linear infinite" } : {}} />
              Refresh
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#525252" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Title */}
        {run.title && (
          <div style={{ padding: "8px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
            <span style={{ fontSize: "12px", color: "#525252" }}>Video: </span>
            <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 500 }}>{run.title}</span>
          </div>
        )}

        {/* Logs */}
        <div style={{
          flex: 1, overflow: "auto", padding: "14px 20px",
          fontFamily: "'Fira Code', 'Courier New', monospace", fontSize: "12px", lineHeight: 1.8,
        }}>
          {logs.length === 0 ? (
            <div style={{ color: "#404040", padding: "20px 0" }}>
              {isRunning ? "⏳ Waiting for logs... pipeline is starting" : "No logs available for this run"}
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ color: getLogColor(log), padding: "0" }}>
                <span style={{ color: "#303030", userSelect: "none", marginRight: "12px" }}>
                  {String(i + 1).padStart(3, "0")}
                </span>
                {log}
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <span style={{ fontSize: "11px", color: "#404040" }}>
            {logs.length} log entries
            {isRunning && " · Auto-refreshing every 10s"}
          </span>
          {run.youtubeUrl && (
            <a href={run.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "5px 12px", borderRadius: "6px",
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444", fontSize: "11px", fontWeight: 600, textDecoration: "none",
            }}>
              <FaYoutube size={12} /> Watch on YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Run Card ──────────────────────────────────────────────────
function RunCard({ run, onRefresh, colors, isDark }: {
  run: PipelineRun; onRefresh: () => void; colors: any; isDark: boolean;
}) {
  const [showLogs, setShowLogs] = useState(false);
  const cfg = STATUS_CFG[run.status] || STATUS_CFG.pending;
  const isRunning = run.status === "running" || run.status === "pending";
  const step = run.currentStep || 0;
  const pct = step > 0 ? Math.round((step / (run.totalSteps || 9)) * 100) : 0;

  const duration = () => {
    const start = new Date(run.startedAt || run.createdAt);
    const end = run.completedAt ? new Date(run.completedAt) : new Date();
    const mins = Math.floor((end.getTime() - start.getTime()) / 60000);
    return mins < 1 ? "< 1 min" : `${mins} min`;
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${cfg.border}`,
        borderRadius: "12px",
        borderLeft: `3px solid ${cfg.color}`,
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Status row */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "3px 9px", borderRadius: "9999px",
                  background: cfg.bg, color: cfg.color, fontSize: "11px", fontWeight: 700,
                }}>
                  {isRunning && (
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "livePulse 1s infinite" }} />
                  )}
                  {cfg.label}
                </span>
                <span style={{ fontSize: "11px", color: colors.textMuted, textTransform: "capitalize" }}>
                  {run.moduleType} pipeline
                </span>
                {run.niche && (
                  <span style={{ fontSize: "11px", color: colors.textMuted }}>· {run.niche}</span>
                )}
              </div>

              {/* Title */}
              <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "5px" }}>
                {run.title || "Pipeline Run"}
              </p>

              {/* Meta */}
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "11px", color: colors.textMuted }}>
                  {formatDate(run.startedAt || run.createdAt)}
                </span>
                <span style={{ fontSize: "11px", color: colors.textMuted }}>
                  {isRunning ? `Running ${duration()}` : `Took ${duration()}`}
                </span>
                {run.totalCost && (
                  <span style={{ fontSize: "11px", color: colors.textMuted }}>
                    Cost: ~${run.totalCost.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
              {run.youtubeUrl && (
                <a href={run.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: "4px",
                  padding: "6px 10px", borderRadius: "7px",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444", fontSize: "11px", fontWeight: 600, textDecoration: "none",
                }}>
                  <FaYoutube size={12} /> Watch
                </a>
              )}
              <button onClick={() => setShowLogs(true)} style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                padding: "6px 10px", borderRadius: "7px",
                background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                color: "#a78bfa", fontSize: "11px", fontWeight: 600, cursor: "pointer",
              }}>
                <Terminal size={11} /> {isRunning ? "Live Logs" : "View Logs"}
              </button>
            </div>
          </div>

          {/* Progress bar for running */}
          {isRunning && step > 0 && (
            <div style={{ marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 500 }}>
                  Step {step}/9: {STEP_LABELS[step] || "Processing"}
                </span>
                <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: "5px", background: "rgba(245,158,11,0.15)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: "3px", width: `${pct}%`,
                  background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                  transition: "width 1.5s ease",
                }} />
              </div>
            </div>
          )}

          {/* Error */}
          {run.status === "failed" && run.errorMessage && (
            <div style={{
              marginTop: "10px", padding: "8px 12px", borderRadius: "7px",
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
              display: "flex", gap: "8px",
            }}>
              <AlertTriangle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: "1px" }} />
              <p style={{ fontSize: "12px", color: "#ef4444", lineHeight: 1.5 }}>
                {run.errorMessage}
              </p>
            </div>
          )}

          {/* Success */}
          {(run.status === "complete" || run.status === "uploaded") && (
            <div style={{
              marginTop: "10px", padding: "8px 12px", borderRadius: "7px",
              background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <CheckCircle2 size={13} color="#22c55e" />
              <p style={{ fontSize: "12px", color: "#22c55e" }}>
                Video uploaded successfully in {duration()}
              </p>
            </div>
          )}
        </div>
      </div>

      {showLogs && <LogDrawer run={run} onClose={() => setShowLogs(false)} isDark={isDark} />}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export function PipelineLogsPage() {
  const { colors, isDark } = useTheme();
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, running: 0 });
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchRuns = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [runsRes, statsRes] = await Promise.all([
        api.get("/pipeline-runs?limit=20"),
        api.get("/pipeline-runs/stats"),
      ]);
      setRuns(runsRes.data?.data || runsRes.data || []);
      if (statsRes.data) setStats(statsRes.data);
    } catch {}
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    fetchRuns();
    pollRef.current = setInterval(() => fetchRuns(true), 20000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const hasRunning = runs.some(r => r.status === "running" || r.status === "pending");

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Pipeline Logs</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>
            Track your AI pipeline runs in real time.
            {hasRunning && (
              <span style={{ marginLeft: "10px", display: "inline-flex", alignItems: "center", gap: "5px", color: "#f59e0b", fontSize: "13px", fontWeight: 500 }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#f59e0b", display: "inline-block", animation: "livePulse 1s infinite" }} />
                Pipeline running
              </span>
            )}
          </p>
        </div>
        <button onClick={() => fetchRuns()} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
          border: `1px solid ${colors.border}`, background: colors.bg,
          color: colors.textMuted, fontSize: "13px",
        }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Runs", value: stats.total || runs.length, color: "#a78bfa", bg: "rgba(124,58,237,0.08)" },
          { label: "Completed", value: stats.completed || runs.filter(r => r.status === "complete" || r.status === "uploaded").length, color: "#22c55e", bg: "rgba(34,197,94,0.08)" },
          { label: "Failed", value: stats.failed || runs.filter(r => r.status === "failed").length, color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
          { label: "Running", value: stats.running || runs.filter(r => r.status === "running").length, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, border: `1px solid ${s.color}25`,
            borderRadius: "10px", padding: "14px", textAlign: "center",
          }}>
            <p style={{ fontSize: "24px", fontWeight: 700, color: s.color, marginBottom: "2px" }}>{s.value}</p>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Runs */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <Loader2 size={28} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
        </div>
      ) : runs.length === 0 ? (
        <div style={{
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: "12px", padding: "60px 24px", textAlign: "center",
        }}>
          <Play size={40} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>No pipeline runs yet</h2>
          <p style={{ color: colors.textMuted, fontSize: "14px" }}>
            Go to My Modules → Configure & Run to start your first pipeline.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {runs.map(run => (
            <RunCard key={run._id} run={run} onRefresh={() => fetchRuns(true)} colors={colors} isDark={isDark} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}