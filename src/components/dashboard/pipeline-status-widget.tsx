"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { CheckCircle2, XCircle, RefreshCw, ChevronRight, Terminal } from "lucide-react";
import { FaYoutube } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RunStatus {
  status: string;
  currentStep?: number;
  totalSteps?: number;
  title?: string;
  youtubeUrl?: string;
  errorMessage?: string;
  createdAt?: string;
}

const STEP_LABELS: Record<number, string> = {
  1: "Researching topics", 2: "Writing script", 3: "Generating voiceover",
  4: "Generating video clips", 5: "Assembling video", 6: "Generating thumbnail",
  7: "Creating Shorts", 8: "Uploading to YouTube", 9: "Complete",
};

export function PipelineStatusWidget({ userModuleId, colors, onRunNow }: {
  userModuleId: string; colors: any; onRunNow: () => void;
}) {
  const router = useRouter();
  const [run, setRun] = useState<RunStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStatus();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/usermodules/${userModuleId}/run-status`);
      const data = res.data;
      setRun(data);
      if (data.status === "running" || data.status === "pending") {
        if (!pollRef.current) pollRef.current = setInterval(fetchStatus, 15000);
      } else {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      }
    } catch {}
    setLoading(false);
  };

  const handleRetry = async () => {
    toast.loading("Restarting...", { id: "retry" });
    try {
      await api.post(`/usermodules/${userModuleId}/run`);
      toast.success("Pipeline restarted!", { id: "retry", duration: 4000 });
      setTimeout(fetchStatus, 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed", { id: "retry" });
    }
  };

  const getElapsed = () => {
    if (!run?.createdAt) return "";
    const mins = Math.floor((Date.now() - new Date(run.createdAt).getTime()) / 60000);
    return mins < 1 ? "just now" : `${mins} min ago`;
  };

  const getLeft = (step: number) => {
    const mins = Math.round((9 - step) * 2.5);
    return mins <= 0 ? "almost done" : `~${mins} min left`;
  };

  if (loading || !run || run.status === "no_runs") {
    return (
      <div style={{
        padding: "10px 12px", borderRadius: "8px",
        border: `1px solid ${colors.border}`, background: colors.bg,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "12px", color: colors.textMuted }}>No runs yet</span>
        <button onClick={onRunNow} style={{
          fontSize: "11px", color: "#a78bfa", background: "none",
          border: "none", cursor: "pointer", fontWeight: 600,
        }}>Run Now →</button>
      </div>
    );
  }

  if (run.status === "running" || run.status === "pending") {
    const step = run.currentStep || 1;
    const pct = Math.round((step / (run.totalSteps || 9)) * 100);
    return (
      <div style={{
        padding: "12px", borderRadius: "8px",
        border: "1px solid rgba(245,158,11,0.35)",
        background: "rgba(245,158,11,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "2px 8px", borderRadius: "9999px",
              background: "rgba(239,68,68,0.2)", color: "#ef4444",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#ef4444", display: "inline-block",
                animation: "livePulse 1s ease-in-out infinite",
              }} />
              LIVE
            </span>
            <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 500 }}>
              Step {step}/9 · {STEP_LABELS[step] || "Processing"}
            </span>
          </div>
          <span style={{ fontSize: "10px", color: colors.textMuted }}>{getElapsed()}</span>
        </div>
        <div style={{ height: "4px", background: "rgba(245,158,11,0.15)", borderRadius: "2px", overflow: "hidden", marginBottom: "6px" }}>
          <div style={{
            height: "100%", borderRadius: "2px", width: `${pct}%`,
            background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
            transition: "width 1.5s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 600 }}>{pct}%</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "10px", color: colors.textMuted }}>{getLeft(step)}</span>
            <button onClick={() => router.push("/dashboard/pipeline-logs")} style={{
              fontSize: "10px", color: "#a78bfa", background: "none",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "3px",
            }}>
              <Terminal size={10} /> Logs
            </button>
          </div>
        </div>
        <style>{`@keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }`}</style>
      </div>
    );
  }

  if (run.status === "complete" || run.status === "uploaded") {
    return (
      <div style={{
        padding: "10px 12px", borderRadius: "8px",
        border: "1px solid rgba(34,197,94,0.25)",
        background: "rgba(34,197,94,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: run.title ? "5px" : "0" }}>
          <CheckCircle2 size={13} color="#22c55e" />
          <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 600 }}>Last run successful</span>
        </div>
        {run.title && (
          <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            "{run.title}"
          </p>
        )}
        <div style={{ display: "flex", gap: "6px" }}>
          {run.youtubeUrl && (
            <a href={run.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              padding: "5px 10px", borderRadius: "6px",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
              color: "#ef4444", fontSize: "11px", fontWeight: 600, textDecoration: "none",
            }}>
              <FaYoutube size={11} /> Watch
            </a>
          )}
          <button onClick={() => router.push("/dashboard/pipeline-logs")} style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            padding: "5px 10px", borderRadius: "6px",
            background: colors.bg, border: `1px solid ${colors.border}`,
            color: colors.textMuted, fontSize: "11px", cursor: "pointer",
          }}>
            View Logs <ChevronRight size={10} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: "10px 12px", borderRadius: "8px",
      border: "1px solid rgba(239,68,68,0.25)",
      background: "rgba(239,68,68,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <XCircle size={13} color="#ef4444" />
        <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 600 }}>Last run failed</span>
      </div>
      {run.errorMessage && (
        <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "8px", lineHeight: 1.4 }}>
          {run.errorMessage.slice(0, 80)}{run.errorMessage.length > 80 ? "..." : ""}
        </p>
      )}
      <div style={{ display: "flex", gap: "6px" }}>
        <button onClick={handleRetry} style={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          padding: "5px 10px", borderRadius: "6px",
          background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
          color: "#a78bfa", fontSize: "11px", fontWeight: 600, cursor: "pointer",
        }}>
          <RefreshCw size={10} /> Retry
        </button>
        <button onClick={() => router.push("/dashboard/pipeline-logs")} style={{
          display: "inline-flex", alignItems: "center", gap: "4px",
          padding: "5px 10px", borderRadius: "6px",
          background: colors.bg, border: `1px solid ${colors.border}`,
          color: colors.textMuted, fontSize: "11px", cursor: "pointer",
        }}>
          Logs <ChevronRight size={10} />
        </button>
      </div>
    </div>
  );
}