"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  FileText, Search, Eye, Trash2, CheckCircle2,
  XCircle, Clock, Loader2, ChevronLeft, ChevronRight,
  ExternalLink, Filter,
} from "lucide-react";

interface PipelineRun {
  _id: string;
  runId: string;
  moduleType: string;
  title?: string;
  status: string;
  currentStep: number;
  totalSteps: number;
  niche?: string;
  youtubeUrl?: string;
  totalCost?: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  userId?: { name: string; email: string };
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any }> = {
  complete:  { color: "#22c55e", bg: "rgba(34,197,94,0.1)", icon: CheckCircle2 },
  failed:    { color: "#ef4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
  running:   { color: "#7c3aed", bg: "rgba(124,58,237,0.1)", icon: Loader2 },
  pending:   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Clock },
  cancelled: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", icon: XCircle },
};

export function PipelineLogsPage() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const limit = 10;

  useEffect(() => { fetchRuns(); }, [page, statusFilter, typeFilter]);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(typeFilter !== "all" && { moduleType: typeFilter }),
      });
      const res = await api.get(`/pipeline-runs?${params}`);
      setRuns(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.pages || 1);
    } catch {}
    setLoading(false);
  };

  const fetchRunLogs = async (run: PipelineRun) => {
    setSelectedRun(run);
    setLogsLoading(true);
    try {
      const res = await api.get(`/pipeline-runs/${run.runId}`);
      setRunLogs(res.data.logs || []);
    } catch {}
    setLogsLoading(false);
  };

  const deleteRun = async (runId: string) => {
    if (!confirm("Delete this pipeline run?")) return;
    try {
      await api.delete(`/pipeline-runs/${runId}`);
      fetchRuns();
    } catch {}
  };

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px", fontSize: "14px",
    border: `1px solid ${colors.border}`, background: colors.bg,
    color: colors.text, outline: "none",
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start) return "-";
    const s = new Date(start);
    const e = end ? new Date(end) : new Date();
    const mins = Math.round((e.getTime() - s.getTime()) / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Pipeline Logs</h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          {isAdmin ? "All pipeline runs across all users." : "Your pipeline run history."}
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap",
        background: colors.bgCard, border: `1px solid ${colors.border}`,
        borderRadius: "10px", padding: "14px 16px", alignItems: "center",
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <Search size={14} color={colors.textMuted} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or niche..."
            style={{ ...inputStyle, width: "100%", paddingLeft: "32px", boxSizing: "border-box" as const }} />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: "140px" }}>
          <option value="all">All Types</option>
          <option value="youtube">YouTube</option>
          <option value="podcast">Podcast</option>
          <option value="marketing">Marketing</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={{ ...inputStyle, minWidth: "130px" }}>
          <option value="all">All Status</option>
          <option value="complete">Complete</option>
          <option value="running">Running</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <span style={{ fontSize: "13px", color: colors.textMuted, marginLeft: "auto" }}>
          {total} total runs
        </span>
      </div>

      {/* Table */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isAdmin ? "2fr 1fr 1fr 1fr 1fr 1fr 100px" : "2fr 1fr 1fr 1fr 1fr 100px",
          gap: "12px", padding: "12px 20px",
          borderBottom: `1px solid ${colors.border}`,
          background: colors.bg,
        }}>
          {["Title / Niche", ...(isAdmin ? ["User"] : []), "Type", "Status", "Duration", "Cost", "Actions"].map((h) => (
            <span key={h} style={{ fontSize: "12px", fontWeight: 600, color: colors.textMuted }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : runs.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <FileText size={32} color={colors.textMuted} style={{ margin: "0 auto 12px" }} />
            <p style={{ color: colors.textMuted, fontSize: "14px" }}>No pipeline runs found</p>
          </div>
        ) : (
          runs.filter(r => !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.niche?.toLowerCase().includes(search.toLowerCase()))
            .map((run, i) => {
              const sc = STATUS_CONFIG[run.status] || STATUS_CONFIG.pending;
              const StatusIcon = sc.icon;
              return (
                <div key={run._id} style={{
                  display: "grid",
                  gridTemplateColumns: isAdmin ? "2fr 1fr 1fr 1fr 1fr 1fr 100px" : "2fr 1fr 1fr 1fr 1fr 100px",
                  gap: "12px", padding: "14px 20px", alignItems: "center",
                  borderBottom: i < runs.length - 1 ? `1px solid ${colors.border}` : "none",
                }}>
                  {/* Title */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {run.title || "Untitled"}
                    </p>
                    <p style={{ fontSize: "11px", color: colors.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {run.niche || run.runId?.slice(0, 12) + "..."}
                    </p>
                  </div>

                  {/* User (admin only) */}
                  {isAdmin && (
                    <p style={{ fontSize: "12px", color: colors.textMuted }}>
                      {(run.userId as any)?.name || "Unknown"}
                    </p>
                  )}

                  {/* Type */}
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "3px 8px", borderRadius: "6px",
                    background: "rgba(124,58,237,0.08)", color: "#a78bfa",
                    display: "inline-block",
                  }}>
                    {run.moduleType}
                  </span>

                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <StatusIcon size={12} color={sc.color}
                      style={run.status === "running" ? { animation: "spin 1s linear infinite" } : undefined} />
                    <span style={{ fontSize: "12px", color: sc.color, fontWeight: 500 }}>
                      {run.status}
                    </span>
                  </div>

                  {/* Duration */}
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>
                    {formatDuration(run.startedAt, run.completedAt)}
                  </p>

                  {/* Cost */}
                  <p style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>
                    ${(run.totalCost || 0).toFixed(2)}
                  </p>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => fetchRunLogs(run)} style={{
                      width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                      border: `1px solid ${colors.border}`, background: colors.bg,
                      color: colors.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Eye size={12} />
                    </button>
                    {run.youtubeUrl && (
                      <a href={run.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{
                        width: "28px", height: "28px", borderRadius: "6px",
                        border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                        color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <ExternalLink size={12} />
                      </a>
                    )}
                    <button onClick={() => deleteRun(run.runId)} style={{
                      width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                      border: "1px solid rgba(239,68,68,0.15)", background: "transparent",
                      color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
          <p style={{ fontSize: "13px", color: colors.textMuted }}>
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
              width: "32px", height: "32px", borderRadius: "7px", cursor: page === 1 ? "not-allowed" : "pointer",
              border: `1px solid ${colors.border}`, background: colors.bgCard,
              color: page === 1 ? colors.textMuted : colors.text,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: page === 1 ? 0.5 : 1,
            }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: "32px", height: "32px", borderRadius: "7px", cursor: "pointer",
                border: `1px solid ${page === p ? "rgba(124,58,237,0.3)" : colors.border}`,
                background: page === p ? "rgba(124,58,237,0.1)" : colors.bgCard,
                color: page === p ? "#a78bfa" : colors.text,
                fontSize: "13px", fontWeight: page === p ? 600 : 400,
              }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
              width: "32px", height: "32px", borderRadius: "7px", cursor: page === totalPages ? "not-allowed" : "pointer",
              border: `1px solid ${colors.border}`, background: colors.bgCard,
              color: page === totalPages ? colors.textMuted : colors.text,
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: page === totalPages ? 0.5 : 1,
            }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Log viewer modal */}
      {selectedRun && (
        <div onClick={() => setSelectedRun(null)} style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "16px", width: "100%", maxWidth: "700px",
            maxHeight: "80vh", display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: colors.text, marginBottom: "2px" }}>
                  {selectedRun.title || "Pipeline Run"}
                </h2>
                <p style={{ fontSize: "12px", color: colors.textMuted }}>
                  {selectedRun.runId} · {selectedRun.status} · ${(selectedRun.totalCost || 0).toFixed(2)}
                </p>
              </div>
              <button onClick={() => setSelectedRun(null)} style={{
                width: "30px", height: "30px", borderRadius: "8px",
                border: `1px solid ${colors.border}`, background: colors.bg,
                color: colors.textMuted, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
            </div>

            {/* Steps progress */}
            <div style={{ padding: "16px 24px", borderBottom: `1px solid ${colors.border}`, display: "flex", gap: "6px" }}>
              {Array.from({ length: selectedRun.totalSteps || 7 }, (_, i) => (
                <div key={i} style={{
                  flex: 1, height: "4px", borderRadius: "2px",
                  background: i < selectedRun.currentStep ? "#7c3aed"
                    : i === selectedRun.currentStep ? "#a78bfa"
                      : colors.border,
                }} />
              ))}
            </div>

            {/* Logs */}
            <div style={{ flex: 1, overflow: "auto", padding: "16px 24px", background: colors.bg, fontFamily: "monospace", fontSize: "12px", lineHeight: 1.8 }}>
              {logsLoading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Loader2 size={20} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
                </div>
              ) : runLogs.length === 0 ? (
                <p style={{ color: colors.textMuted }}>No logs available for this run.</p>
              ) : (
                runLogs.map((log, i) => (
                  <div key={i} style={{
                    color: log.includes("ERROR") || log.includes("❌") ? "#ef4444"
                      : log.includes("✅") || log.includes("complete") || log.includes("✓") ? "#22c55e"
                        : log.includes("STEP") ? "#a78bfa"
                          : colors.textMuted,
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Error message */}
            {selectedRun.errorMessage && (
              <div style={{ padding: "12px 24px", borderTop: `1px solid ${colors.border}`, background: "rgba(239,68,68,0.06)" }}>
                <p style={{ fontSize: "12px", color: "#ef4444" }}>
                  <strong>Error:</strong> {selectedRun.errorMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}