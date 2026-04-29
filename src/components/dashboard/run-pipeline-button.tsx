// src/components/dashboard/run-pipeline-button.tsx
// Run button with status polling

"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface RunStatus {
  status: "idle" | "running" | "uploaded" | "failed" | "no_runs";
  title?: string;
  error?: string;
  youtubeUrl?: string;
  reelUrl?: string;
}

export function RunPipelineButton({
  userModuleId,
  pipelineType,
  colors,
  onComplete,
}: {
  userModuleId: string;
  pipelineType: string;
  colors: any;
  onComplete?: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<RunStatus>({ status: "idle" });
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch latest run status on mount
  useEffect(() => {
    fetchStatus();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/usermodules/${userModuleId}/run-status`);
      const data = res.data;
      setStatus({ status: data.status || "idle", ...data });
      if (data.status === "running") {
        setRunning(true);
        startPolling();
      }
    } catch {}
  };

  const startPolling = () => {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/usermodules/${userModuleId}/run-status`);
        const data = res.data;
        setStatus({ status: data.status || "idle", ...data });

        if (data.status === "uploaded") {
          setRunning(false);
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.success(`Pipeline complete! ${data.youtubeUrl ? "Video uploaded to YouTube" : "Reel posted to Instagram"}`);
          onComplete?.();
        } else if (data.status === "failed") {
          setRunning(false);
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.error(`Pipeline failed: ${data.error || "Unknown error"}`);
        }
      } catch {}
    }, 15000); // poll every 15 seconds
  };

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setStatus({ status: "running" });

    try {
      toast.loading("Starting pipeline...", { id: "pipeline-start" });
      await api.post(`/usermodules/${userModuleId}/run`);
      toast.success("Pipeline started! This will take 15-25 minutes.", { id: "pipeline-start", duration: 5000 });
      startPolling();
    } catch (err: any) {
      setRunning(false);
      setStatus({ status: "failed", error: err?.response?.data?.message });
      toast.error(err?.response?.data?.message || "Failed to start pipeline", { id: "pipeline-start" });
    }
  };

  const getStatusDisplay = () => {
    switch (status.status) {
      case "running":
        return { color: "#f59e0b", icon: <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />, text: "Running..." };
      case "uploaded":
        return { color: "#22c55e", icon: <CheckCircle2 size={12} />, text: "Last run: Success" };
      case "failed":
        return { color: "#ef4444", icon: <XCircle size={12} />, text: "Last run: Failed" };
      default:
        return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <button
        onClick={handleRun}
        disabled={running}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          padding: "9px 16px", borderRadius: "8px", cursor: running ? "not-allowed" : "pointer",
          background: running
            ? "rgba(245,158,11,0.1)"
            : "linear-gradient(135deg, #7c3aed, #6d28d9)",
          border: running ? "1px solid rgba(245,158,11,0.3)" : "none",
          color: running ? "#f59e0b" : "white",
          fontSize: "13px", fontWeight: 600,
          boxShadow: running ? "none" : "0 4px 12px rgba(124,58,237,0.3)",
          transition: "all 0.2s",
          width: "100%",
        }}
      >
        {running
          ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Running pipeline...</>
          : <><Play size={13} /> Run Now</>
        }
      </button>

      {statusDisplay && (
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ color: statusDisplay.color }}>{statusDisplay.icon}</span>
          <span style={{ fontSize: "11px", color: statusDisplay.color }}>{statusDisplay.text}</span>
          {status.youtubeUrl && (
            <a href={status.youtubeUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "11px", color: "#a78bfa", marginLeft: "4px" }}>
              View video →
            </a>
          )}
        </div>
      )}

      {running && (
        <p style={{ fontSize: "11px", color: colors.textMuted, textAlign: "center" }}>
          Pipeline runs in background. Takes 15-25 min. You'll get an email when done.
        </p>
      )}
    </div>
  );
}