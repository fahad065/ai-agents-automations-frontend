"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import {
  LayoutDashboard, Bot, Zap, Play, Key,
  Settings, CreditCard, Menu, X, Sun, Moon,
  LogOut, ChevronRight, Bell, Shield, AlertTriangle, Loader2
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Pipeline Monitor", href: "/dashboard/pipeline", icon: Play },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

// ─── Logout Dialog ────────────────────────────────────────────

function LogoutDialog({
  open, onCancel, onConfirm, loading,
}: {
  open: boolean; onCancel: () => void; onConfirm: () => void; loading: boolean;
}) {
  const { colors } = useTheme();
  if (!open) return null;

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "16px", padding: "28px",
            width: "100%", maxWidth: "360px", margin: "24px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <h2 style={{
            fontSize: "17px", fontWeight: 700, color: colors.text,
            textAlign: "center", marginBottom: "8px",
          }}>
            Sign out?
          </h2>
          <p style={{
            fontSize: "14px", color: colors.textMuted,
            textAlign: "center", lineHeight: 1.6, marginBottom: "24px",
          }}>
            You will be signed out of your NexAgent account and redirected to the homepage.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
                fontWeight: 500, cursor: "pointer", border: `1px solid ${colors.border}`,
                background: colors.bg, color: colors.text, transition: "all 0.2s",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
                fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                border: "1px solid rgba(239,68,68,0.3)",
                background: loading ? "rgba(239,68,68,0.4)" : "#ef4444",
                color: "white", display: "flex", alignItems: "center",
                justifyContent: "center", gap: "6px", transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "14px", height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white",
                    borderRadius: "50%", animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }} />
                  Signing out...
                </>
              ) : (
                <><LogOut size={14} /> Sign out</>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Main Shell ───────────────────────────────────────────────

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // ─── Notifications state ──────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/notifications/unread-count");
      setUnreadCount(res.data.count || 0);
    } catch {}
  };

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get("/notifications?limit=15");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
    setNotifLoading(false);
  };

  const handleBellClick = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const clearAll = async () => {
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const notifIcon: Record<string, string> = {
    pipeline_started: "🚀", pipeline_complete: "✅", pipeline_failed: "❌",
    agent_created: "🤖", agent_deleted: "🗑️", api_key_added: "🔑",
    api_key_deleted: "⚠️", user_registered: "👤", system_alert: "🔔",
  };

  const notifAccent: Record<string, string> = {
    pipeline_complete: "#22c55e", pipeline_failed: "#ef4444",
    pipeline_started: "#7c3aed", api_key_deleted: "#f59e0b",
    user_registered: "#3b82f6",
  };

  // Solid panel colors — no transparency issues
  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
  const panelDivider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const panelText = isDark ? "#e5e5e5" : "#111111";
  const panelMuted = isDark ? "#737373" : "#6b7280";
  const panelSubtle = isDark ? "#525252" : "#9ca3af";
  const panelHover = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const panelUnread = isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)";
  const panelIconRead = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const panelIconReadBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  // ─── Logout ───────────────────────────────────────────────

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      const { api: apiLib } = await import("@/lib/api");
      await apiLib.post("/auth/logout");
    } catch {}
    clearAuth();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    setLogoutLoading(false);
    setShowLogoutDialog(false);
    router.push("/");
  };

  const sidebarWidth = collapsed ? "64px" : "220px";

  // ─── Sidebar ──────────────────────────────────────────────

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "20px 0" : "20px",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: `1px solid ${colors.border}`, minHeight: "64px",
      }}>
        {!collapsed && (
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Zap size={14} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: "15px", fontWeight: 700, color: colors.text }}>
              Nex<span style={{ color: "#a78bfa" }}>Agent</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div style={{
            width: "28px", height: "28px", borderRadius: "7px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={14} color="white" strokeWidth={2.5} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="desktop-collapse-btn"
          style={{
            width: "24px", height: "24px", borderRadius: "6px",
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: colors.textMuted, flexShrink: 0,
          }}
        >
          <ChevronRight size={12} style={{
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.3s",
          }} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: "12px 8px",
        display: "flex", flexDirection: "column", gap: "2px", overflowY: "auto",
      }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center",
                gap: "10px", padding: collapsed ? "10px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "8px", textDecoration: "none",
                background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                color: isActive ? "#a78bfa" : colors.textMuted,
                border: `1px solid ${isActive ? "rgba(124,58,237,0.2)" : "transparent"}`,
                transition: "all 0.2s", fontSize: "14px", fontWeight: isActive ? 500 : 400,
              }}
            >
              <IconComponent size={16} style={{ flexShrink: 0 }} />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${colors.border}` }}>
        {user?.role === "admin" && (
          <Link
            href="/admin"
            title={collapsed ? "Admin Panel" : undefined}
            style={{
              width: "100%", padding: collapsed ? "9px 0" : "9px 12px",
              display: "flex", alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: "10px", borderRadius: "8px", textDecoration: "none",
              color: "#a78bfa", fontSize: "13px", marginBottom: "4px",
              background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <Shield size={16} style={{ flexShrink: 0 }} />
            {!collapsed && "Admin Panel"}
          </Link>
        )}
        <button
          onClick={toggleTheme}
          title={collapsed ? (isDark ? "Light mode" : "Dark mode") : undefined}
          style={{
            width: "100%", padding: collapsed ? "9px 0" : "9px 12px",
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "10px", borderRadius: "8px", background: "transparent", border: "none",
            cursor: "pointer", color: colors.textMuted, fontSize: "13px", marginBottom: "2px",
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (isDark ? "Light mode" : "Dark mode")}
        </button>
        {!collapsed && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px",
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            borderRadius: "8px", marginBottom: "4px",
          }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, fontSize: "12px", fontWeight: 700, color: "#a78bfa",
            }}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: "13px", fontWeight: 500, color: colors.text,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {user?.name || "User"}
              </p>
              <p style={{
                fontSize: "11px", color: colors.textMuted,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {user?.email || ""}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowLogoutDialog(true)}
          title={collapsed ? "Sign out" : undefined}
          style={{
            width: "100%", padding: collapsed ? "9px 0" : "9px 12px",
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "10px", borderRadius: "8px", background: "transparent", border: "none",
            cursor: "pointer", color: "#ef4444", fontSize: "13px",
          }}
        >
          <LogOut size={16} />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>

        {/* Desktop sidebar */}
        <aside className="desktop-sidebar" style={{
          width: sidebarWidth, flexShrink: 0,
          background: colors.bgCard, borderRight: `1px solid ${colors.border}`,
          transition: "width 0.3s ease", overflow: "hidden",
          position: "sticky", top: 0, height: "100vh",
        }}>
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside className="mobile-sidebar" style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: "240px", zIndex: 101,
          background: colors.bgCard, borderRight: `1px solid ${colors.border}`,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}>
          <SidebarContent />
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Top bar */}
          <header style={{
            height: "60px", display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "0 24px",
            borderBottom: `1px solid ${colors.border}`,
            background: colors.bgCard, position: "sticky", top: 0, zIndex: 50,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  background: colors.bgCard, border: `1px solid ${colors.border}`,
                  display: "none", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: colors.text,
                }}
              >
                {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              <span style={{ fontSize: "15px", fontWeight: 600, color: colors.text }}>
                {navItems.find((n) =>
                  pathname === n.href ||
                  (n.href !== "/dashboard" && pathname.startsWith(n.href))
                )?.label || "Dashboard"}
              </span>
            </div>

            {/* Right side */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

              {/* ─── Notification bell ─────────────────────── */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button
                  onClick={handleBellClick}
                  style={{
                    width: "34px", height: "34px", borderRadius: "8px",
                    background: notifOpen
                      ? (isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)")
                      : colors.bgCard,
                    border: notifOpen
                      ? "1px solid rgba(124,58,237,0.3)"
                      : `1px solid ${colors.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    color: notifOpen ? "#a78bfa" : colors.textMuted,
                    position: "relative", transition: "all 0.2s",
                  }}
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <div style={{
                      position: "absolute", top: "-5px", right: "-5px",
                      minWidth: "17px", height: "17px", borderRadius: "9999px",
                      background: "#ef4444", color: "white",
                      fontSize: "10px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 4px", border: `2px solid ${colors.bgCard}`,
                    }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </button>

                {/* ─── Notifications panel ─────────────────── */}
                {notifOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "44px",
                    width: "360px", maxHeight: "500px",
                    background: panelBg,
                    border: `1px solid ${panelBorder}`,
                    borderRadius: "14px",
                    boxShadow: isDark
                      ? "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)"
                      : "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                    zIndex: 200,
                    display: "flex", flexDirection: "column", overflow: "hidden",
                  }}>

                    {/* Panel header */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: panelBg,
                      borderBottom: `1px solid ${panelDivider}`,
                      flexShrink: 0,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, color: panelText, margin: 0 }}>
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span style={{
                            fontSize: "11px", fontWeight: 600,
                            padding: "2px 8px", borderRadius: "9999px",
                            background: "rgba(239,68,68,0.12)", color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.2)",
                          }}>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            style={{
                              fontSize: "11px", color: "#a78bfa",
                              background: "none", border: "none", cursor: "pointer",
                              padding: "4px 8px", borderRadius: "6px",
                              transition: "background 0.15s",
                            }}
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            style={{
                              fontSize: "11px", color: panelMuted,
                              background: "none", border: "none", cursor: "pointer",
                              padding: "4px 8px", borderRadius: "6px",
                            }}
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Notifications list */}
                    <div style={{ overflowY: "auto", flex: 1, background: panelBg }}>
                      {notifLoading ? (
                        <div style={{ padding: "40px", textAlign: "center" }}>
                          <Loader2 size={22} color="#7c3aed"
                            style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div style={{ padding: "48px 24px", textAlign: "center" }}>
                          <div style={{
                            width: "44px", height: "44px", borderRadius: "12px",
                            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 12px",
                          }}>
                            <Bell size={20} color={panelMuted} />
                          </div>
                          <p style={{ fontSize: "14px", fontWeight: 500, color: panelText, marginBottom: "4px" }}>
                            No notifications yet
                          </p>
                          <p style={{ fontSize: "12px", color: panelMuted }}>
                            Events like pipeline runs and API key changes will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif, i) => {
                          const accent = notifAccent[notif.type] || "#7c3aed";
                          return (
                            <div
                              key={notif._id}
                              onClick={() => {
                                if (!notif.isRead) markAsRead(notif._id);
                                if (notif.actionUrl) {
                                  router.push(notif.actionUrl);
                                  setNotifOpen(false);
                                }
                              }}
                              style={{
                                display: "flex", gap: "12px", padding: "13px 16px",
                                borderBottom: i < notifications.length - 1
                                  ? `1px solid ${panelDivider}` : "none",
                                background: notif.isRead ? "transparent" : panelUnread,
                                cursor: notif.actionUrl ? "pointer" : "default",
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) => {
                                if (notif.actionUrl) {
                                  (e.currentTarget as HTMLDivElement).style.background =
                                    notif.isRead ? panelHover : panelUnread;
                                }
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLDivElement).style.background =
                                  notif.isRead ? "transparent" : panelUnread;
                              }}
                            >
                              {/* Icon */}
                              <div style={{
                                width: "36px", height: "36px", borderRadius: "9px",
                                background: notif.isRead
                                  ? panelIconRead
                                  : `${accent}18`,
                                border: `1px solid ${notif.isRead ? panelIconReadBorder : `${accent}30`}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "17px", flexShrink: 0,
                              }}>
                                {notif.icon || notifIcon[notif.type] || "🔔"}
                              </div>

                              {/* Content */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  display: "flex", alignItems: "flex-start",
                                  justifyContent: "space-between", gap: "8px",
                                }}>
                                  <p style={{
                                    fontSize: "13px",
                                    fontWeight: notif.isRead ? 400 : 600,
                                    color: panelText,
                                    marginBottom: "3px", lineHeight: 1.4,
                                  }}>
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <div style={{
                                      width: "7px", height: "7px", borderRadius: "50%",
                                      background: "#7c3aed", flexShrink: 0, marginTop: "5px",
                                    }} />
                                  )}
                                </div>
                                <p style={{
                                  fontSize: "12px", color: panelMuted,
                                  lineHeight: 1.5, marginBottom: "5px",
                                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                  {notif.message}
                                </p>
                                <p style={{ fontSize: "11px", color: panelSubtle }}>
                                  {new Date(notif.createdAt).toLocaleString("en-GB", {
                                    day: "numeric", month: "short",
                                    hour: "2-digit", minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar */}
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, color: "#a78bfa", cursor: "pointer",
              }}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
            {children}
          </main>
        </div>
      </div>

      <LogoutDialog
        open={showLogoutDialog}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
        loading={logoutLoading}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .desktop-collapse-btn { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-sidebar { display: none !important; }
        }
      `}</style>
    </>
  );
}