"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  Play, RefreshCw, CheckCircle2, XCircle,
  Clock, Loader2, Bot, ChevronDown, ChevronUp,
  ExternalLink, Calendar, Zap, AlertCircle,
  Terminal,
} from "lucide-react";

interface Agent {
  _id: string;
  name: string;
  niche?: string;
  status: string;
  templateId: { name: string; slug: string };
}

interface PipelineStep {
  step: number;
  label: string;
  status: "pending" | "running" | "done" | "error";
  detail?: string;
}

// ── Persisted run state (localStorage) ───────────────────────
interface ActiveRun {
  runId: string;
  agentId: string;
  agentName: string;
  niche: string;
  startedAt: number; // timestamp ms
  pipelineType: string; // "youtube" | "fitness" | etc — for future multi-pipeline
}

const STORAGE_KEY = "nexagent_active_runs"; // stores map of agentId → ActiveRun
const MAX_RUN_AGE_HOURS = 4; // auto-clear runs older than 4 hours

function saveActiveRun(run: ActiveRun) {
  try {
    const existing = getActiveRuns();
    existing[run.agentId] = run;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {}
}

function getActiveRuns(): Record<string, ActiveRun> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function clearActiveRun(agentId: string) {
  try {
    const existing = getActiveRuns();
    delete existing[agentId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {}
}

function getActiveRunForAgent(agentId: string): ActiveRun | null {
  const runs = getActiveRuns();
  const run = runs[agentId];
  if (!run) return null;
  // Auto-expire old runs
  const ageHours = (Date.now() - run.startedAt) / 1000 / 3600;
  if (ageHours > MAX_RUN_AGE_HOURS) {
    clearActiveRun(agentId);
    return null;
  }
  return run;
}

// ── Pipeline steps ────────────────────────────────────────────

const PIPELINE_STEPS: PipelineStep[] = [
  { step: 1, label: "Trend discovery", status: "pending" },
  { step: 2, label: "Script & metadata generation", status: "pending" },
  { step: 3, label: "Seedance video clips", status: "pending" },
  { step: 4, label: "TTS voiceover audio", status: "pending" },
  { step: 5, label: "Video assembly + subtitles", status: "pending" },
  { step: 6, label: "Shorts extraction", status: "pending" },
  { step: 7, label: "Thumbnail generation", status: "pending" },
  { step: 8, label: "YouTube upload", status: "pending" },
];

// Cost constants
const CLIP_DURATION_SECONDS = 5;
const SEEDANCE_COST_PER_SECOND = 0.022;
const COST_PER_CLIP = CLIP_DURATION_SECONDS * SEEDANCE_COST_PER_SECOND; // $0.11
const TOTAL_CLIPS = 12;
const TOTAL_SEEDANCE_COST = TOTAL_CLIPS * COST_PER_CLIP; // $1.32

function detectStep(log: string): number | null {
  if (/STEP 1|generating.*clip|seedance|Downloading clip/i.test(log)) return 3;
  if (/STEP 2|voiceover|audio|tts|generate_audio/i.test(log)) return 4;
  if (/STEP 3|assembl|subtitle|whisper/i.test(log)) return 5;
  if (/STEP 4|short|extract/i.test(log)) return 6;
  if (/STEP 5|thumbnail/i.test(log)) return 7;
  if (/STEP 6|STEP 7|upload|youtube/i.test(log)) return 8;
  if (/trend|topic|niche|discover/i.test(log)) return 1;
  if (/script|metadata|generat.*content|title/i.test(log)) return 2;
  return null;
}

type PipelineState = "idle" | "starting" | "running" | "complete" | "error";

export function PipelineMonitor() {
  const { colors } = useTheme();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [pipelineState, setPipelineState] = useState<PipelineState>("idle");
  const [steps, setSteps] = useState<PipelineStep[]>(PIPELINE_STEPS);
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [clipCount, setClipCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [pythonOnline, setPythonOnline] = useState<boolean | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const activeStepRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const clipCountRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  // On mount — fetch agents then check for active runs
  useEffect(() => {
    fetchAgents().then(() => {
      checkPythonHealth();
      fetchRecentRuns();
    });
  }, []);

  // After agents load, check for active runs
  useEffect(() => {
    if (agents.length === 0) return;
    tryReconnectActiveRun();
  }, [agents]);

  const tryReconnectActiveRun = () => {
    // Check all agents for an active run — pick the most recent
    const allRuns = getActiveRuns();
    const agentIds = agents.map((a) => a._id);

    let mostRecentRun: ActiveRun | null = null;
    for (const agentId of agentIds) {
      const run = allRuns[agentId];
      if (!run) continue;
      const ageHours = (Date.now() - run.startedAt) / 1000 / 3600;
      if (ageHours > MAX_RUN_AGE_HOURS) {
        clearActiveRun(agentId);
        continue;
      }
      if (!mostRecentRun || run.startedAt > mostRecentRun.startedAt) {
        mostRecentRun = run;
      }
    }

    if (!mostRecentRun) return;

    // Reconnect to this run
    const run = mostRecentRun;
    setReconnecting(true);
    setSelectedAgent(run.agentId);
    setCurrentRunId(run.runId);
    setPipelineState("running");
    setShowLogs(true);

    // Restore elapsed time
    const elapsedMs = Date.now() - run.startedAt;
    const elapsedSecs = Math.floor(elapsedMs / 1000);
    setElapsedSeconds(elapsedSecs);
    startTimeRef.current = run.startedAt;

    // Restart timer from where it left off
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    addLog(`🔄 Reconnecting to active pipeline...`);
    addLog(`📋 Agent: ${run.agentName} | Niche: ${run.niche}`);
    addLog(`✓ Run ID: ${run.runId}`);
    addLog(`⏱ Pipeline has been running for ${Math.floor(elapsedSecs / 60)} min ${elapsedSecs % 60} sec`);

    // Reconnect SSE
    connectSSE(run.runId, run.agentId);
    startPolling(run.agentId);

    setTimeout(() => setReconnecting(false), 1000);
  };

  const checkPythonHealth = async () => {
    try {
      const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_URL || "http://localhost:8001";
      const res = await fetch(`${pythonUrl}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      setPythonOnline(res.ok);
    } catch {
      setPythonOnline(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get("/agents");
      const active = (res.data || []).filter((a: Agent) => a.status !== "deleted");
      setAgents(active);
      if (active.length > 0) setSelectedAgent(active[0]._id);
      return active;
    } catch {
      return [];
    }
  };

  const fetchRecentRuns = async () => {
    try {
      const res = await api.get("/content-ideas/recent").catch(() => ({ data: [] }));
      setRecentRuns((res.data || []).slice(0, 5));
    } catch {}
  };

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    const cleaned = msg.replace(/\x1b\[[0-9;]*m/g, "").trim();
    if (!cleaned) return;

    setLogs((prev) => [...prev, `[${time}] ${cleaned}`]);

    // Detect individual clip downloads
    if (/clip[_\s-]?\d+.*\.(mp4|saved|done|downloaded|complete)/i.test(cleaned) ||
        /downloaded.*clip[_\s]?\d+/i.test(cleaned) ||
        /clip[_\s]?\d+.*downloaded/i.test(cleaned)) {
      const newCount = Math.min(clipCountRef.current + 1, TOTAL_CLIPS);
      clipCountRef.current = newCount;
      setClipCount(newCount);
      setTotalCost(parseFloat((newCount * COST_PER_CLIP).toFixed(2)));
    }

    // Auto-detect and update pipeline step
    const stepNum = detectStep(cleaned);
    if (stepNum && stepNum > activeStepRef.current) {
      activeStepRef.current = stepNum;
      setSteps((prev) =>
        prev.map((s) => {
          if (s.step < stepNum) return { ...s, status: "done" };
          if (s.step === stepNum) return { ...s, status: "running", detail: cleaned.slice(0, 70) };
          return s;
        })
      );
    }
  }, []);

  const startTimer = (fromTimestamp?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (fromTimestamp) {
      const elapsed = Math.floor((Date.now() - fromTimestamp) / 1000);
      setElapsedSeconds(elapsed);
    } else {
      setElapsedSeconds(0);
    }
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const connectSSE = useCallback((runId: string, agentId: string) => {
    if (abortRef.current) abortRef.current.abort();
    const abortController = new AbortController();
    abortRef.current = abortController;

    const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_URL || "http://localhost:8001";

    fetch(`${pythonUrl}/pipeline/logs/${runId}`, {
      signal: abortController.signal,
    }).then(async (response) => {
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const msg = line.slice(6).trim();
          if (!msg || msg === "heartbeat") continue;

          if (msg === "__PIPELINE_COMPLETE__") {
            clearActiveRun(agentId);
            addLog("✅ Pipeline complete! Video uploaded to YouTube.");
            setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
            setPipelineState("complete");
            setTotalCost(TOTAL_SEEDANCE_COST);
            stopTimer();
            fetchRecentRuns();
            abortController.abort();
            if (pollRef.current) clearInterval(pollRef.current);
            return;
          } else if (msg.startsWith("__PIPELINE_FAILED__")) {
            clearActiveRun(agentId);
            const errMsg = msg.replace("__PIPELINE_FAILED__: ", "");
            addLog(`❌ Error: ${errMsg}`);
            setError(errMsg);
            setPipelineState("error");
            stopTimer();
            setSteps((prev) =>
              prev.map((s) =>
                s.status === "running" ? { ...s, status: "error" } : s
              )
            );
            abortController.abort();
            if (pollRef.current) clearInterval(pollRef.current);
            return;
          } else {
            addLog(msg);
          }
        }
      }
    }).catch((err) => {
      if (err.name !== "AbortError") {
        addLog("⚠️ Log stream disconnected — pipeline still running in background");
        addLog("📧 You will receive an email when the video uploads");
      }
    });

    return abortController;
  }, [addLog]);

  const startPolling = useCallback((agentId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get("/content-ideas/recent");
        const recent = res.data?.[0];
        if (!recent) return;

        if (recent.status === "uploaded") {
          clearActiveRun(agentId);
          setYoutubeUrl(recent.youtubeUrl || "");
          setPipelineState("complete");
          stopTimer();
          setSteps((prev) => prev.map((s) => ({ ...s, status: "done" })));
          setTotalCost(TOTAL_SEEDANCE_COST);
          addLog("✅ Pipeline complete! Video uploaded to YouTube.");
          if (recent.youtubeUrl) addLog(`🎬 YouTube URL: ${recent.youtubeUrl}`);
          clearInterval(pollRef.current!);
          fetchRecentRuns();
        }
      } catch {}
    }, 15000);
  }, [addLog]);

  const resetPipeline = () => {
    // Clear localStorage for selected agent
    if (selectedAgent) clearActiveRun(selectedAgent);
    setPipelineState("idle");
    setSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" })));
    setLogs([]);
    setYoutubeUrl("");
    setElapsedSeconds(0);
    setTotalCost(0);
    setClipCount(0);
    clipCountRef.current = 0;
    setError("");
    setCurrentRunId(null);
    activeStepRef.current = 0;
    stopTimer();
    if (pollRef.current) clearInterval(pollRef.current);
    if (abortRef.current) abortRef.current.abort();
  };

  const runPipeline = async () => {
    if (!selectedAgent) return;

    resetPipeline();
    setPipelineState("starting");
    setShowLogs(true);
    startTimeRef.current = Date.now();
    startTimer();

    setSteps((prev) =>
      prev.map((s) => (s.step === 1 ? { ...s, status: "running" } : s))
    );

    addLog("🚀 Starting pipeline...");

    try {
      const agent = agents.find((a) => a._id === selectedAgent);

      const res = await api.post("/content-ideas/run-full", {
        agentId: selectedAgent,
        niche: agent?.niche || "dark psychology and human behavior",
      });

      const { runId } = res.data;
      setCurrentRunId(runId);
      setPipelineState("running");
      addLog(`✓ Pipeline started — run ID: ${runId}`);

      // Save to localStorage — supports multiple agents
      saveActiveRun({
        runId,
        agentId: selectedAgent,
        agentName: agent?.name || "Unknown",
        niche: agent?.niche || "",
        startedAt: startTimeRef.current,
        pipelineType: agent?.templateId?.slug || "youtube",
      });

      connectSSE(runId, selectedAgent);
      startPolling(selectedAgent);

    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to start pipeline";
      setError(msg);
      setPipelineState("error");
      stopTimer();
      addLog(`❌ Error: ${msg}`);
      if (msg.includes("8001") || msg.includes("Python")) {
        setPythonOnline(false);
      }
    }
  };

  // When user switches agent — check if that agent has an active run
  const handleAgentSelect = (agentId: string) => {
    if (pipelineState === "running" || pipelineState === "starting") return;
    setSelectedAgent(agentId);

    // Check if this agent has an active run
    const activeRun = getActiveRunForAgent(agentId);
    if (activeRun) {
      const ageMin = Math.floor((Date.now() - activeRun.startedAt) / 1000 / 60);
      addLog(`⚡ Found active run for this agent (started ${ageMin} min ago)`);
      addLog(`🔄 Click "Reconnect" to rejoin the pipeline`);
    }
  };

  const stepColors = {
    pending: colors.border,
    running: "#7c3aed",
    done: "#22c55e",
    error: "#ef4444",
  };

  const costLabel = clipCount > 0
    ? `${clipCount}/${TOTAL_CLIPS} clips · $${COST_PER_CLIP.toFixed(2)}/clip`
    : "Est. cost";

  // Check if selected agent has a resumable run
  const resumableRun = selectedAgent ? getActiveRunForAgent(selectedAgent) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
          Pipeline Monitor
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          Run and monitor your AI content pipeline in real time.
        </p>
      </div>

      {/* Reconnecting banner */}
      {reconnecting && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(124,58,237,0.08)",
          border: "1px solid rgba(124,58,237,0.2)",
          borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
        }}>
          <Loader2 size={16} color="#a78bfa"
            style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
          <p style={{ fontSize: "13px", color: "#a78bfa", fontWeight: 500 }}>
            Reconnecting to active pipeline...
          </p>
        </div>
      )}

      {/* Python offline warning */}
      {pythonOnline === false && (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
        }}>
          <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#ef4444" }}>
              Python service offline
            </p>
            <p style={{ fontSize: "12px", color: colors.textMuted }}>
              Start it:{" "}
              <code style={{
                background: colors.bgSecondary, padding: "1px 6px",
                borderRadius: "4px", fontFamily: "monospace", fontSize: "11px",
              }}>
                cd python-services && source venv/bin/activate && python main.py
              </code>
            </p>
          </div>
          <button
            onClick={checkPythonHealth}
            style={{
              padding: "6px 12px", borderRadius: "6px", fontSize: "12px",
              border: `1px solid ${colors.border}`,
              background: colors.bgCard, color: colors.textMuted, cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
      }}>
        {/* Left — controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Agent selector */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "12px", padding: "20px",
          }}>
            <h2 style={{
              fontSize: "14px", fontWeight: 600, color: colors.text,
              marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <Bot size={15} color="#7c3aed" /> Select agent
            </h2>

            {agents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <p style={{ color: colors.textMuted, fontSize: "13px", marginBottom: "12px" }}>
                  No agents found. Create one first.
                </p>
                <a href="/dashboard/agents" style={{ color: "#a78bfa", fontSize: "13px", textDecoration: "none" }}>
                  Go to My Agents →
                </a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {agents.map((agent) => {
                  const hasActiveRun = !!getActiveRunForAgent(agent._id);
                  return (
                    <button
                      key={agent._id}
                      onClick={() => handleAgentSelect(agent._id)}
                      disabled={pipelineState === "running" || pipelineState === "starting"}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px", borderRadius: "8px", cursor: "pointer",
                        background: selectedAgent === agent._id ? "rgba(124,58,237,0.1)" : colors.bg,
                        border: `1px solid ${selectedAgent === agent._id ? "rgba(124,58,237,0.3)" : colors.border}`,
                        textAlign: "left", transition: "all 0.2s",
                      }}
                    >
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "8px",
                        background: "rgba(124,58,237,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        position: "relative",
                      }}>
                        <Bot size={16} color="#a78bfa" />
                        {/* Active run indicator dot */}
                        {hasActiveRun && (
                          <div style={{
                            position: "absolute", top: "-3px", right: "-3px",
                            width: "8px", height: "8px", borderRadius: "50%",
                            background: "#22c55e",
                            border: `2px solid ${colors.bgCard}`,
                            animation: "pulse 1.5s infinite",
                          }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>
                          {agent.name}
                        </p>
                        <p style={{ fontSize: "11px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {agent.niche || agent.templateId?.name}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                        {selectedAgent === agent._id && (
                          <CheckCircle2 size={14} color="#7c3aed" />
                        )}
                        {hasActiveRun && (
                          <span style={{
                            fontSize: "9px", fontWeight: 600,
                            padding: "1px 6px", borderRadius: "9999px",
                            background: "rgba(34,197,94,0.1)", color: "#22c55e",
                          }}>
                            RUNNING
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Run controls */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "12px", padding: "20px",
          }}>
            <h2 style={{
              fontSize: "14px", fontWeight: 600, color: colors.text,
              marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <Calendar size={15} color="#7c3aed" /> Run pipeline
            </h2>

            {pipelineState === "idle" || pipelineState === "error" || pipelineState === "complete" ? (
              <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                {/* Resumable run banner */}
                {resumableRun && pipelineState === "idle" && (
                  <div style={{
                    padding: "10px 14px", borderRadius: "8px",
                    background: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    marginBottom: "4px",
                  }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#22c55e", marginBottom: "2px" }}>
                      Active pipeline detected
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textMuted }}>
                      Started {Math.floor((Date.now() - resumableRun.startedAt) / 1000 / 60)} min ago · {resumableRun.pipelineType}
                    </p>
                    <button
                      onClick={() => {
                        setCurrentRunId(resumableRun.runId);
                        setPipelineState("running");
                        setShowLogs(true);
                        startTimer(resumableRun.startedAt);
                        addLog(`🔄 Reconnecting to run ${resumableRun.runId}...`);
                        connectSSE(resumableRun.runId, resumableRun.agentId);
                        startPolling(resumableRun.agentId);
                      }}
                      style={{
                        marginTop: "8px", padding: "6px 14px",
                        borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                        background: "#22c55e", color: "white", border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Reconnect
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={runPipeline}
                    disabled={!selectedAgent || agents.length === 0 || pythonOnline === false}
                    style={{
                      flex: 1, padding: "12px", borderRadius: "8px",
                      fontSize: "14px", fontWeight: 600,
                      cursor: (!selectedAgent || pythonOnline === false) ? "not-allowed" : "pointer",
                      background: (!selectedAgent || pythonOnline === false)
                        ? "rgba(124,58,237,0.3)"
                        : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                      color: "white", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      boxShadow: (selectedAgent && pythonOnline !== false)
                        ? "0 4px 16px rgba(124,58,237,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <Play size={15} /> Run pipeline now
                  </button>
                  {(pipelineState === "error" || pipelineState === "complete") && (
                    <button
                      onClick={resetPipeline}
                      style={{
                        width: "42px", borderRadius: "8px",
                        border: `1px solid ${colors.border}`,
                        background: colors.bg, color: colors.textMuted,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <RefreshCw size={15} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "12px", borderRadius: "8px",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}>
                <Loader2 size={15} color="#7c3aed"
                  style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                <span style={{ fontSize: "13px", fontWeight: 500, color: "#a78bfa" }}>
                  {pipelineState === "starting" ? "Starting..." : "Running pipeline..."}
                </span>
                <span style={{ fontSize: "12px", color: colors.textMuted, marginLeft: "auto" }}>
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            )}

            {/* Error */}
            {error && pipelineState === "error" && (
              <div style={{
                marginTop: "10px", background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: "8px", padding: "10px 12px",
                fontSize: "12px", color: "#ef4444",
              }}>
                {error}
              </div>
            )}

            {/* Stats */}
            {pipelineState !== "idle" && (
              <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                <div style={{
                  flex: 1, padding: "10px 12px", background: colors.bg,
                  borderRadius: "8px", border: `1px solid ${colors.border}`, textAlign: "center",
                }}>
                  <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "3px" }}>Elapsed</p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: colors.text, fontFamily: "monospace" }}>
                    {formatTime(elapsedSeconds)}
                  </p>
                </div>
                <div style={{
                  flex: 1, padding: "10px 12px", background: colors.bg,
                  borderRadius: "8px", border: `1px solid ${colors.border}`, textAlign: "center",
                }}>
                  <p style={{ fontSize: "11px", color: colors.textMuted, marginBottom: "3px" }}>
                    {costLabel}
                  </p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#f59e0b", fontFamily: "monospace" }}>
                    ${totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent runs */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "12px", padding: "20px",
          }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: colors.text, marginBottom: "14px" }}>
              Recent runs
            </h2>
            {recentRuns.length === 0 ? (
              <p style={{ fontSize: "13px", color: colors.textMuted }}>No runs yet</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recentRuns.map((run) => (
                  <div key={run._id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {run.status === "uploaded"
                      ? <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0 }} />
                      : run.status === "failed"
                        ? <XCircle size={13} color="#ef4444" style={{ flexShrink: 0 }} />
                        : <Clock size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: "12px", color: colors.text, fontWeight: 500,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {run.title}
                      </p>
                      <p style={{ fontSize: "10px", color: colors.textMuted }}>
                        {new Date(run.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {run.youtubeUrl && (
                      <a href={run.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        style={{ color: "#a78bfa", flexShrink: 0 }}>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — steps + logs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Pipeline steps */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "12px", padding: "20px",
          }}>
            <h2 style={{
              fontSize: "14px", fontWeight: 600, color: colors.text,
              marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
            }}>
              <Zap size={15} color="#7c3aed" /> Pipeline steps
            </h2>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {steps.map((step, i) => (
                <div key={step.step} style={{
                  display: "flex", gap: "14px",
                  paddingBottom: i < steps.length - 1 ? "18px" : 0,
                  position: "relative",
                }}>
                  {i < steps.length - 1 && (
                    <div style={{
                      position: "absolute", left: "13px", top: "28px",
                      width: "2px", height: "calc(100% - 10px)",
                      background: step.status === "done" ? "#22c55e" : colors.border,
                      transition: "background 0.5s",
                    }} />
                  )}
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: step.status === "done" ? "#22c55e"
                      : step.status === "running" ? "#7c3aed"
                        : step.status === "error" ? "#ef4444"
                          : colors.bgSecondary,
                    border: `2px solid ${stepColors[step.status]}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, transition: "all 0.4s", zIndex: 1,
                  }}>
                    {step.status === "done" && <CheckCircle2 size={14} color="white" />}
                    {step.status === "running" && (
                      <Loader2 size={12} color="white"
                        style={{ animation: "spin 0.8s linear infinite" }} />
                    )}
                    {step.status === "error" && <XCircle size={14} color="white" />}
                    {step.status === "pending" && (
                      <span style={{ fontSize: "10px", fontWeight: 700, color: colors.textMuted }}>
                        {step.step}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, paddingTop: "4px" }}>
                    <p style={{
                      fontSize: "13px",
                      fontWeight: step.status === "running" ? 600 : 400,
                      color: step.status === "pending" ? colors.textMuted : colors.text,
                      marginBottom: step.detail ? "2px" : 0,
                    }}>
                      {step.label}
                    </p>
                    {step.detail && step.status === "running" && (
                      <p style={{
                        fontSize: "11px", color: colors.textMuted,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        maxWidth: "200px",
                      }}>
                        {step.detail}
                      </p>
                    )}
                  </div>
                  {step.status !== "pending" && (
                    <span style={{
                      fontSize: "11px", fontWeight: 500, paddingTop: "5px", flexShrink: 0,
                      color: step.status === "done" ? "#22c55e"
                        : step.status === "running" ? "#a78bfa"
                          : "#ef4444",
                    }}>
                      {step.status === "done" ? "Done"
                        : step.status === "running" ? "Running..."
                          : "Error"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success */}
          {pipelineState === "complete" && (
            <div style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "12px", padding: "20px", textAlign: "center",
            }}>
              <CheckCircle2 size={32} color="#22c55e" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "15px", fontWeight: 600, color: colors.text, marginBottom: "6px" }}>
                Pipeline complete!
              </p>
              <p style={{ fontSize: "13px", color: colors.textMuted, marginBottom: "16px" }}>
                Your video has been uploaded and scheduled on YouTube.
              </p>
              {youtubeUrl && (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "#ef4444", color: "white",
                    padding: "10px 20px", borderRadius: "8px",
                    fontSize: "13px", fontWeight: 600, textDecoration: "none",
                  }}>
                  <ExternalLink size={14} /> View on YouTube
                </a>
              )}
            </div>
          )}

          {/* Live logs */}
          <div style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "12px", overflow: "hidden",
          }}>
            <button
              onClick={() => setShowLogs(!showLogs)}
              style={{
                width: "100%", padding: "14px 20px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Terminal size={14} color={colors.textMuted} />
                <span style={{ fontSize: "13px", fontWeight: 500, color: colors.text }}>
                  Live logs {logs.length > 0 ? `(${logs.length})` : ""}
                </span>
                {pipelineState === "running" && (
                  <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#22c55e", display: "inline-block",
                    animation: "pulse 1.5s infinite",
                  }} />
                )}
              </div>
              {showLogs
                ? <ChevronUp size={14} color={colors.textMuted} />
                : <ChevronDown size={14} color={colors.textMuted} />}
            </button>

            {showLogs && (
              <div
                ref={logsRef}
                style={{
                  padding: "12px 16px",
                  borderTop: `1px solid ${colors.border}`,
                  height: "280px", overflowY: "auto",
                  fontFamily: "monospace", fontSize: "11px",
                  lineHeight: 1.9, background: colors.bg,
                }}
              >
                {logs.length === 0 ? (
                  <p style={{ color: colors.textMuted, fontSize: "12px" }}>
                    Logs will appear here when pipeline starts...
                  </p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} style={{
                      color: log.includes("❌") || log.includes("Error") || log.includes("ERROR")
                        ? "#ef4444"
                        : log.includes("✅") || log.includes("done") || log.includes("complete") || log.includes("✓")
                          ? "#22c55e"
                          : log.includes("STEP") || log.includes("Step") || log.includes("[CRON]")
                            ? "#a78bfa"
                            : log.includes("⚠️") || log.includes("🔄")
                              ? "#f59e0b"
                              : colors.textMuted,
                    }}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  );
}