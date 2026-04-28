"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";
import { Bell, Loader2, CheckCircle2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  actionUrl?: string;
  icon?: string;
  createdAt: string;
}

const NOTIF_ICONS: Record<string, string> = {
  pipeline_started: "🚀", pipeline_complete: "✅", pipeline_failed: "❌",
  agent_created: "🤖", api_key_added: "🔑", user_registered: "👤", system_alert: "🔔",
};

const NOTIF_COLORS: Record<string, string> = {
  pipeline_complete: "#22c55e", pipeline_failed: "#ef4444",
  pipeline_started: "#7c3aed", api_key_deleted: "#f59e0b",
  user_registered: "#3b82f6",
};

export function NotificationsPage() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  useEffect(() => { fetchNotifications(); }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications?limit=${limit}&page=${page}`);
      setNotifications(res.data.notifications || []);
      setTotal(res.data.total || 0);
      setTotalPages(Math.ceil((res.data.total || 0) / limit));
    } catch {}
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const deleteNotif = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setTotal((t) => t - 1);
    } catch {}
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setTotal(0);
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>Notifications</h1>
          <p style={{ fontSize: "14px", color: colors.textMuted }}>
            {total} total · {unreadCount} unread
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
              border: `1px solid ${colors.border}`, background: colors.bgCard,
              color: "#a78bfa", fontSize: "13px", fontWeight: 500,
            }}>
              Mark all read
            </button>
          )}
          {total > 0 && (
            <button onClick={clearAll} style={{
              padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
              border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
              color: "#ef4444", fontSize: "13px", fontWeight: 500,
            }}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <Loader2 size={24} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <Bell size={36} color={colors.textMuted} style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: "15px", fontWeight: 500, color: colors.text, marginBottom: "6px" }}>
              No notifications
            </p>
            <p style={{ fontSize: "13px", color: colors.textMuted }}>
              Pipeline events, API changes and system alerts appear here.
            </p>
          </div>
        ) : (
          notifications.map((notif, i) => {
            const accent = NOTIF_COLORS[notif.type] || "#7c3aed";
            return (
              <div key={notif._id} style={{
                display: "flex", gap: "14px", padding: "16px 20px",
                borderBottom: i < notifications.length - 1 ? `1px solid ${colors.border}` : "none",
                background: notif.isRead ? "transparent"
                  : isDark ? "rgba(124,58,237,0.06)" : "rgba(124,58,237,0.03)",
                cursor: notif.actionUrl ? "pointer" : "default",
                transition: "background 0.15s",
              }}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif._id);
                  if (notif.actionUrl) router.push(notif.actionUrl);
                }}
              >
                {/* Icon */}
                <div style={{
                  width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                  background: notif.isRead
                    ? isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"
                    : `${accent}15`,
                  border: `1px solid ${notif.isRead
                    ? isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
                    : `${accent}25`}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px",
                }}>
                  {notif.icon || NOTIF_ICONS[notif.type] || "🔔"}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <p style={{ fontSize: "14px", fontWeight: notif.isRead ? 400 : 600, color: colors.text, marginBottom: "4px", lineHeight: 1.4 }}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0, marginTop: "5px" }} />
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: colors.textMuted, lineHeight: 1.5, marginBottom: "6px" }}>
                    {notif.message}
                  </p>
                  <p style={{ fontSize: "11px", color: colors.textMuted }}>
                    {new Date(notif.createdAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "6px", alignItems: "flex-start", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  {!notif.isRead && (
                    <button onClick={() => markAsRead(notif._id)} style={{
                      width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                      border: `1px solid ${colors.border}`, background: colors.bg,
                      color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <CheckCircle2 size={13} />
                    </button>
                  )}
                  <button onClick={() => deleteNotif(notif._id)} style={{
                    width: "28px", height: "28px", borderRadius: "6px", cursor: "pointer",
                    border: "1px solid rgba(239,68,68,0.15)", background: "transparent",
                    color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Trash2 size={13} />
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
              width: "32px", height: "32px", borderRadius: "7px",
              border: `1px solid ${colors.border}`, background: colors.bgCard,
              color: colors.text, cursor: page === 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: page === 1 ? 0.5 : 1,
            }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
              width: "32px", height: "32px", borderRadius: "7px",
              border: `1px solid ${colors.border}`, background: colors.bgCard,
              color: colors.text, cursor: page === totalPages ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: page === totalPages ? 0.5 : 1,
            }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}