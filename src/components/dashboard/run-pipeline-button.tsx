"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Play, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface RunStatus {
  status: "idle" | "running" | "complete" | "failed" | "no_runs";
  errorMessage?: string;
  youtubeUrl?: string;
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
  const [lastStatus, setLastStatus] = useState<RunStatus>({ status: "idle" });
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStatus();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await api.get(`/usermodules/${userModuleId}/run-status`);
      const data = res.data;
      setLastStatus({ status: data.status || "idle", ...data });
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
        setLastStatus({ status: data.status || "idle", ...data });
        if (data.status === "complete" || data.status === "uploaded") {
          setRunning(false);
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.success("Pipeline complete! Video uploaded to YouTube ✅");
          onComplete?.();
        } else if (data.status === "failed") {
          setRunning(false);
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.error(`Pipeline failed: ${data.errorMessage || "Unknown error"}`);
        }
      } catch {}
    }, 20000);
  };

  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setLastStatus({ status: "running" });
    try {
      toast.loading("Starting pipeline...", { id: "run" });
      await api.post(`/usermodules/${userModuleId}/run`);
      toast.success("Pipeline started! Takes 15-25 min. Email when done.", { id: "run", duration: 5000 });
      startPolling();
    } catch (err: any) {
      setRunning(false);
      setLastStatus({ status: "failed" });
      toast.error(err?.response?.data?.message || "Failed to start", { id: "run" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <button onClick={handleRun} disabled={running} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
        cursor: running ? "not-allowed" : "pointer", border: "none", width: "100%",
        background: running
          ? "rgba(245,158,11,0.12)"
          : "linear-gradient(135deg, #7c3aed, #6d28d9)",
        color: running ? "#f59e0b" : "white",
        boxShadow: running ? "none" : "0 2px 8px rgba(124,58,237,0.25)",
        transition: "all 0.2s",
      }}>
        {running
          ? <><Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> Running...</>
          : <><Play size={12} /> Run Now</>
        }
      </button>

      {/* Last run status */}
      {lastStatus.status === "complete" && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <CheckCircle2 size={10} color="#22c55e" />
          <span style={{ fontSize: "10px", color: "#22c55e" }}>Last run: Success</span>
        </div>
      )}
      {lastStatus.status === "failed" && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <XCircle size={10} color="#ef4444" />
          <span style={{ fontSize: "10px", color: "#ef4444" }}>Last run: Failed</span>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}