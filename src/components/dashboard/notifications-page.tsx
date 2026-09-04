"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Bell, Loader2, CheckCircle2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [clearOpen, setClearOpen] = useState(false);
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
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const deleteNotif = async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setTotal((t) => t - 1);
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  const clearAll = async () => {
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setTotal(0);
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear notifications");
    }
    setClearOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {total} total · {unreadCount} unread
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllRead} className="text-[#a78bfa]">
              Mark all read
            </Button>
          )}
          {total > 0 && (
            <Button
              variant="outline"
              onClick={() => setClearOpen(true)}
              className="border-destructive/20 bg-destructive/6 text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="overflow-hidden rounded-xl border bg-card">
        {loading ? (
          <div className="p-15 text-center">
            <Loader2 size={24} className="mx-auto animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-15 text-center">
            <Bell size={36} className="mx-auto mb-4 text-muted-foreground" />
            <p className="mb-1.5 text-[15px] font-medium text-foreground">
              No notifications
            </p>
            <p className="text-[13px] text-muted-foreground">
              Pipeline events, API changes and system alerts appear here.
            </p>
          </div>
        ) : (
          notifications.map((notif, i) => {
            const accent = NOTIF_COLORS[notif.type] || "#7c3aed";
            return (
              <div
                key={notif._id}
                className={cn(
                  "flex gap-3.5 border-b px-5 py-4 transition-colors last:border-b-0",
                  !notif.isRead && "bg-primary/[0.04]",
                  notif.actionUrl ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => {
                  if (!notif.isRead) markAsRead(notif._id);
                  if (notif.actionUrl) router.push(notif.actionUrl);
                }}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex size-10.5 shrink-0 items-center justify-center rounded-[10px] border text-xl",
                    notif.isRead && "bg-secondary"
                  )}
                  style={!notif.isRead ? { background: `${accent}15`, borderColor: `${accent}25` } : undefined}
                >
                  {notif.icon || NOTIF_ICONS[notif.type] || "🔔"}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("mb-1 text-sm leading-tight text-foreground", !notif.isRead && "font-semibold")}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <div className="mt-1.25 size-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="mb-1.5 text-[13px] leading-normal text-muted-foreground">
                    {notif.message}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(notif.createdAt).toLocaleString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-start gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="flex size-7 items-center justify-center rounded-md border bg-background text-[#22c55e]"
                    >
                      <CheckCircle2 size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif._id)}
                    className="flex size-7 items-center justify-center rounded-md border border-destructive/15 bg-transparent text-destructive"
                  >
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
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">
            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={14} />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes all {total} notification{total !== 1 ? "s" : ""}. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearAll} className="bg-destructive text-white hover:bg-destructive/90">
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
