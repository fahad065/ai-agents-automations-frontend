"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import {
  CheckCircle2, XCircle, Clock,
  ChevronLeft, ChevronRight, Loader2,
  ExternalLink, Filter,
} from "lucide-react";

interface PipelineLog {
  _id: string;
  title: string;
  status: string;
  youtubeUrl?: string;
  errorMessage?: string;
  createdAt: string;
  userId: { name: string; email: string } | null;
  agentId: { name: string } | null;
}

const STATUS_OPTIONS = [
  "draft", "script_ready", "video_queued",
  "generating_clips", "assembling_video",
  "uploading", "uploaded", "failed",
];

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  uploaded: { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  failed: { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  uploading: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  assembling_video: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  generating_clips: { color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  script_ready: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  video_queued: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  draft: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

export function AdminPipelines() {
  const { colors } = useTheme();
  const [logs, setLogs] = useState<PipelineLog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "20",
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await api.get(`/admin/pipelines?${params}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const inputStyle = {
    padding: "8px 12px", borderRadius: "8px",
    fontSize: "13px", border: `1px solid ${colors.border}`,
    background: colors.bg, color: colors.text, outline: "none",
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
          Pipeline Logs
        </h1>
        <p style={{ fontSize: "14px", color: colors.textMuted }}>
          {total} total pipeline runs across all users.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Filter size={14} color={colors.textMuted} />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={inputStyle}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: "12px", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "3fr 1fr 1fr 1fr 100px",
          padding: "12px 16px",
          borderBottom: `1px solid ${colors.border}`,
          background: colors.bgSecondary,
        }}>
          {["Title", "Status", "User", "Agent", "Date"].map((h) => (
            <p key={h} style={{ fontSize: "11px", fontWeight: 600, color: colors.textMuted }}>
              {h}
            </p>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <Loader2 size={24} color="#7c3aed"
              style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ color: colors.textMuted }}>No pipeline logs found</p>
          </div>
        ) : logs.map((log, i) => {
          const sc = STATUS_COLORS[log.status] || STATUS_COLORS.draft;
          return (
            <div
              key={log._id}
              style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr 1fr 1fr 100px",
                padding: "12px 16px", alignItems: "center",
                borderBottom: i < logs.length - 1 ? `1px solid ${colors.border}` : "none",
              }}
            >
              {/* Title */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <p style={{
                    fontSize: "13px", fontWeight: 500, color: colors.text,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {log.title}
                  </p>
                  {log.youtubeUrl && (
                    <a href={log.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: "#a78bfa", flexShrink: 0 }}>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
                {log.errorMessage && (
                  <p style={{
                    fontSize: "11px", color: "#ef4444",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    marginTop: "2px",
                  }}>
                    {log.errorMessage}
                  </p>
                )}
              </div>

              {/* Status */}
              <span style={{
                fontSize: "11px", fontWeight: 600, padding: "3px 8px",
                borderRadius: "9999px", display: "inline-block", width: "fit-content",
                background: sc.bg, color: sc.color,
              }}>
                {log.status.replace(/_/g, " ")}
              </span>

              {/* User */}
              <div style={{ minWidth: 0 }}>
                {log.userId ? (
                  <>
                    <p style={{
                      fontSize: "12px", color: colors.text,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {log.userId.name}
                    </p>
                    <p style={{
                      fontSize: "10px", color: colors.textMuted,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {log.userId.email}
                    </p>
                  </>
                ) : (
                  <p style={{ fontSize: "12px", color: colors.textMuted }}>Unknown</p>
                )}
              </div>

              {/* Agent */}
              <p style={{
                fontSize: "12px", color: colors.textMuted,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {log.agentId?.name || "—"}
              </p>

              {/* Date */}
              <p style={{ fontSize: "11px", color: colors.textMuted }}>
                {new Date(log.createdAt).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginTop: "16px",
        }}>
          <p style={{ fontSize: "13px", color: colors.textMuted }}>
            Page {page} of {totalPages} · {total} runs
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                ...inputStyle, display: "flex", alignItems: "center",
                gap: "4px", cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                ...inputStyle, display: "flex", alignItems: "center",
                gap: "4px", cursor: page === totalPages ? "not-allowed" : "pointer",
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}