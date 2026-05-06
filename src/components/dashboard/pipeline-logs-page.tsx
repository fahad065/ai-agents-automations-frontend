// src/components/dashboard/pipeline-logs-page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Loader2, CheckCircle2, XCircle, Clock, Play,
  ExternalLink, RefreshCw, AlertTriangle,
} from "lucide-react";
import { FaYoutube } from "react-icons/fa";

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
}

const STEP_LABELS: Record<number, string> = {
  1: "Researching topics",
  2: "Writing script",
  3: "Generating voiceover",
  4: "Generating video clips",
  5: "Assembling video",
  6: "Generating thumbnail",
  7: "Creating Shorts",
  8: "Uploading to YouTube",
  9: "Complete",
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  pending:  { color: "#6b7280", bg: "rgba(107,114,128,0.1)", icon: Clock,         label: "Pending" },
  running:  { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Loader2,       label: "Running" },
  complete: { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   icon: CheckCircle2,  label: "Complete" },
  failed:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: XCircle,       label: "Failed" },
};

function StepProgress({ current, total = 9 }: { current: number; total?: number }) {
  const { colors } = useTheme();
  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", color: colors.textMuted }}>
          Step {current}/{total}: {STEP_LABELS[current] || "Processing..."}
        </span>
        <span style={{ fontSize: "11px", color: "#f59e0b" }}>
          {Math.round((current / total) * 100)}%
        </span>
      </div>
      <div style={{ height: "4px", background: colors.border, borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: "2px",
          width: `${(current / total) * 100}%`,
          background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

function RunCard({ run, onRefresh, colors, isDark }: {
  run: PipelineRun; onRefresh: () => void; colors: any; isDark: boolean;
}) {
  const cfg = STATUS_CONFIG[run.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  const isRunning = run.status === "running";

  const duration = () => {
    const start = new Date(run.startedAt || run.createdAt);
    const end = run.completedAt ? new Date(run.completedAt) : new Date();
    const mins = Math.floor((end.getTime() - start.getTime()) / 60000);
    return mins < 1 ? "< 1 min" : `${mins} min`;
  };

  const formatDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  return (
    <div style={{
      background: colors.bgCard, border: `1px solid ${colors.border}`,
      borderRadius: "12px", padding: "18px", position: "relative",
      borderLeft: `3px solid ${cfg.color}`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            {/* Status badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "3px 8px", borderRadius: "9999px",
              background: cfg.bg, color: cfg.color,
              fontSize: "11px", fontWeight: 600,
            }}>
              <Icon size={10} style={isRunning ? { animation: "spin 1s linear infinite" } : {}} />
              {cfg.label}
            </span>
            {/* Module type */}
            <span style={{ fontSize: "11px", color: colors.textMuted, textTransform: "capitalize" }}>
              {run.moduleType} pipeline
            </span>
          </div>

          {/* Title */}
          <p style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "4px" }}>
            {run.title || run.niche || "Pipeline run"}
          </p>

          {/* Meta */}
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: colors.textMuted }}>
              Started: {formatDate(run.startedAt || run.createdAt)}
            </span>
            {run.completedAt && (
              <span style={{ fontSize: "11px", color: colors.textMuted }}>
                Duration: {duration()}
              </span>
            )}
            {run.totalCost && (
              <span style={{ fontSize: "11px", color: colors.textMuted }}>
                Cost: ~${run.totalCost.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* YouTube link */}
        {run.youtubeUrl && (
          <a href={run.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "6px 10px", borderRadius: "7px", flexShrink: 0,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            color: "#ef4444", fontSize: "12px", fontWeight: 600, textDecoration: "none",
          }}>
            <FaYoutube size={13} />
            Watch
            <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* Step progress for running */}
      {isRunning && run.currentStep && (
        <StepProgress current={run.currentStep} total={run.totalSteps || 9} />
      )}

      {/* Error message */}
      {run.status === "failed" && run.errorMessage && (
        <div style={{
          marginTop: "10px", padding: "8px 12px", borderRadius: "7px",
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
          display: "flex", alignItems: "flex-start", gap: "8px",
        }}>
          <AlertTriangle size={13} color="#ef4444" style={{ marginTop: "1px", flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "#ef4444", lineHeight: 1.5 }}>
            {run.errorMessage}
          </p>
        </div>
      )}

      {/* Complete success */}
      {run.status === "complete" && (
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
  );
}

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
      const data = runsRes.data?.data || runsRes.data || [];
      setRuns(data);
      if (statsRes.data) setStats(statsRes.data);
    } catch {}
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    fetchRuns();
    // Poll every 20 seconds if there's a running pipeline
    pollRef.current = setInterval(() => {
      fetchRuns(true);
    }, 20000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const hasRunning = runs.some(r => r.status === "running");

  const inp = { padding: "8px 12px", borderRadius: "8px", fontSize: "13px", border: `1px solid ${colors.border}`, background: colors.bg, color: colors.text, outline: "none" };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Pipeline Logs</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>
            Track your AI pipeline runs in real time.
            {hasRunning && <span style={{ color: "#f59e0b", marginLeft: "8px" }}>● Pipeline running...</span>}
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
          { label: "Total Runs", value: stats.total, color: "#a78bfa" },
          { label: "Completed", value: stats.completed, color: "#22c55e" },
          { label: "Failed", value: stats.failed, color: "#ef4444" },
          { label: "Running", value: stats.running, color: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "10px", padding: "14px", textAlign: "center",
          }}>
            <p style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Runs list */}
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
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: colors.text, marginBottom: "8px" }}>
            No pipeline runs yet
          </h2>
          <p style={{ color: colors.textMuted, fontSize: "14px" }}>
            Go to My Modules → Configure & Run to start your first pipeline.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {runs.map(run => (
            <RunCard
              key={run._id}
              run={run}
              onRefresh={() => fetchRuns(true)}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}