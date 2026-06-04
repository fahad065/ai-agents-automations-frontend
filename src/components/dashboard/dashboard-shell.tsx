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
  LogOut, ChevronRight, Bell, Shield, AlertTriangle,
  Loader2, FileText, Users, Package, BarChart3,
  BookOpen, ChevronDown, ArrowRight,
} from "lucide-react";

// ─── Nav structure ────────────────────────────────────────────

const userNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "My Modules", href: "/dashboard/modules", icon: Package },
  { label: "Pipeline Logs", href: "/dashboard/pipeline-logs", icon: FileText },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Billing", href: "/dashboard/payment-instructions", icon: CreditCard },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const adminNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Payment Dashboard", href: "/dashboard/payments", icon: CreditCard },
  { label: "Modules", href: "/dashboard/cms-modules", icon: Bot },
  { label: "My Modules", href: "/dashboard/modules", icon: Package },
  { label: "Pipeline Logs", href: "/dashboard/pipeline-logs", icon: FileText },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: BarChart3 },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Content (CMS)", href: "/dashboard/cms", icon: BookOpen },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

// ─── Profile Completion Banner ────────────────────────────────

function ProfileCompletionBanner({ colors }: { colors: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show on settings page
    if (pathname?.includes("/settings")) { setShow(false); return; }

    // Check session dismissal
    const wasDismissed = sessionStorage.getItem("profile-banner-dismissed");
    if (wasDismissed) return;

    // Fetch profile to check completeness
    api.get("/users/profile").then(res => {
      const u = res.data?.user || res.data;
      const isIncomplete = !u.phoneNumber || !u.country || !u.onboarding?.contentNiche;
      if (isIncomplete) setShow(true);
    }).catch(() => {});
  }, [pathname]);

  const handleDismiss = () => {
    sessionStorage.setItem("profile-banner-dismissed", "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      background: "rgba(124,58,237,0.07)",
      borderBottom: "1px solid rgba(124,58,237,0.2)",
      padding: "9px 24px",
      display: "flex", alignItems: "center", gap: "12px",
      flexShrink: 0,
    }}>
      <AlertTriangle size={13} color="#a78bfa" style={{ flexShrink: 0 }} />
      <p style={{ fontSize: "13px", color: colors.text, flex: 1 }}>
        <strong>Complete your profile</strong> — add your phone number, country and content niche
        for notifications and invoicing.
      </p>
      <button onClick={() => router.push("/dashboard/settings")} style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
        background: "#7c3aed", color: "white", border: "none",
        fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
      }}>
        Complete profile <ArrowRight size={11} />
      </button>
      <button onClick={handleDismiss} style={{
        background: "none", border: "none", cursor: "pointer",
        color: colors.textMuted, padding: "2px", flexShrink: 0,
      }}>
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Logout Dialog ────────────────────────────────────────────

function LogoutDialog({ open, onCancel, onConfirm, loading, isDark }: {
  open: boolean; onCancel: () => void; onConfirm: () => void; loading: boolean; isDark: boolean;
}) {
  const { colors } = useTheme();
  if (!open) return null;

  return (
    <>
      <div onClick={onCancel} style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          background: isDark ? colors.bgCard : "#ffffff",
          border: `1px solid ${colors.border}`,
          borderRadius: "16px", padding: "28px",
          width: "100%", maxWidth: "360px", margin: "24px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: colors.text, textAlign: "center", marginBottom: "8px" }}>
            Sign out?
          </h2>
          <p style={{ fontSize: "14px", color: colors.textMuted, textAlign: "center", lineHeight: 1.6, marginBottom: "24px" }}>
            You will be signed out of your account.
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onCancel} disabled={loading} style={{
              flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px",
              fontWeight: 500, cursor: "pointer", border: `1px solid ${colors.border}`,
              background: colors.bg, color: colors.text,
            }}>Cancel</button>
            <button onClick={onConfirm} disabled={loading} style={{
              flex: 1, padding: "11px", borderRadius: "9px", fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              border: "1px solid rgba(239,68,68,0.3)",
              background: loading ? "rgba(239,68,68,0.4)" : "#ef4444",
              color: "white", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "6px",
            }}>
              {loading
                ? <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} /> Signing out...</>
                : <><LogOut size={14} /> Sign out</>
              }
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── User Profile Dropdown ────────────────────────────────────

function UserDropdown({ user, onLogout, colors, isDark, isAdmin }: {
  user: any; onLogout: () => void; colors: any; isDark: boolean; isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
  const panelDivider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";

  const planLabel = user?.planType === "trial" ? "Free Trial"
    : user?.planType === "free_forever" ? "Free Forever"
    : user?.planType === "paid" ? "Pro" : "Free Trial";

  const planColor = user?.planType === "paid" ? "#22c55e"
    : user?.planType === "free_forever" ? "#3b82f6"
    : "#f59e0b";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "5px 10px 5px 5px", borderRadius: "22px",
        background: open ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent",
        border: `1px solid ${open ? colors.border : "transparent"}`,
        cursor: "pointer", transition: "all 0.2s",
      }}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user?.name || ""} style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700, color: "white", flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: "13px", fontWeight: 500, color: colors.text, lineHeight: 1.2, whiteSpace: "nowrap" }}>
            {user?.name || "User"}
          </p>
          <p style={{ fontSize: "11px", color: colors.textMuted, lineHeight: 1.2 }}>
            {isAdmin ? "Admin" : "Member"}
          </p>
        </div>
        <ChevronDown size={13} color={colors.textMuted}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "46px", width: "230px",
          background: panelBg, border: `1px solid ${panelBorder}`,
          borderRadius: "14px",
          boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.7)" : "0 20px 60px rgba(0,0,0,0.15)",
          zIndex: 200, overflow: "hidden",
        }}>
          <div style={{ padding: "16px", borderBottom: `1px solid ${panelDivider}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", fontWeight: 700, color: "white", flexShrink: 0,
                }}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#e5e5e5" : "#111", marginBottom: "1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: "11px", color: isDark ? "#737373" : "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "4px",
              fontSize: "11px", fontWeight: 600, padding: "3px 10px",
              borderRadius: "9999px", background: `${planColor}15`, color: planColor,
              border: `1px solid ${planColor}25`,
            }}>
              {planLabel}
            </span>
          </div>

          {[
            { label: "Profile & Settings", href: "/dashboard/settings", icon: Settings },
            { label: "Billing", href: "/dashboard/payment-instructions", icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 16px", textDecoration: "none",
                color: isDark ? "#a3a3a3" : "#4b5563", fontSize: "13px",
                transition: "background 0.15s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}

          <div style={{ borderTop: `1px solid ${panelDivider}`, padding: "4px 0" }}>
            <button onClick={() => { setOpen(false); onLogout(); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 16px", background: "none", border: "none",
              color: "#ef4444", fontSize: "13px", cursor: "pointer", textAlign: "left",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
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

  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? adminNavItems : userNavItems;

  // ─── Notifications ────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
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

  // ─── Logout ───────────────────────────────────────────────
  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try { await api.post("/auth/logout"); } catch {}
    clearAuth();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    setLogoutLoading(false);
    setShowLogoutDialog(false);
    router.push("/");
  };

  const currentNav = navItems.find((n) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href)
  );

  const sidebarWidth = collapsed ? "64px" : "230px";

  const panelBg = isDark ? "#161616" : "#ffffff";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.10)";
  const panelDivider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const panelText = isDark ? "#e5e5e5" : "#111111";
  const panelMuted = isDark ? "#737373" : "#6b7280";
  const panelSubtle = isDark ? "#525252" : "#9ca3af";
  const panelUnread = isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)";

  const notifIcon: Record<string, string> = {
    pipeline_started: "🚀", pipeline_complete: "✅", pipeline_failed: "❌",
    agent_created: "🤖", agent_deleted: "🗑️", api_key_added: "🔑",
    api_key_deleted: "⚠️", user_registered: "👤", system_alert: "🔔",
  };

  const notifAccent: Record<string, string> = {
    pipeline_complete: "#22c55e", pipeline_failed: "#ef4444",
    pipeline_started: "#7c3aed", api_key_deleted: "#f59e0b", user_registered: "#3b82f6",
  };

  // ─── Sidebar ──────────────────────────────────────────────
  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? "18px 0" : "18px 16px",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: `1px solid ${colors.border}`, minHeight: "62px",
      }}>
        {!collapsed && (
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "8px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <img src="/icon.svg" width="30" height="30" style={{ borderRadius: "8px" }} />
            </div>
            <div>
              <span style={{ fontSize: "15px", fontWeight: 700, color: colors.text }}>
                Logic<span style={{ color: "#a78bfa" }}>Mate</span>
              </span>
              {isAdmin && (
                <span style={{ display: "block", fontSize: "10px", color: "#a78bfa", fontWeight: 600, letterSpacing: "0.05em", marginTop: "-1px" }}>
                  ADMIN
                </span>
              )}
            </div>
          </Link>
        )}
        {collapsed && (
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img src="/icon.svg" width="30" height="30" style={{ borderRadius: "8px" }} />
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="desktop-collapse-btn" style={{
          width: "22px", height: "22px", borderRadius: "6px",
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: colors.textMuted, flexShrink: 0,
        }}>
          <ChevronRight size={11} style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.3s" }} />
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: "1px", overflowY: "auto" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center",
                gap: "10px", padding: collapsed ? "10px 0" : "9px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "8px", textDecoration: "none",
                background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                color: isActive ? "#a78bfa" : colors.textMuted,
                border: `1px solid ${isActive ? "rgba(124,58,237,0.2)" : "transparent"}`,
                transition: "all 0.15s", fontSize: "14px",
                fontWeight: isActive ? 500 : 400, position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
                  (e.currentTarget as HTMLAnchorElement).style.color = colors.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = colors.textMuted;
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {item.label === "Notifications" && unreadCount > 0 && !collapsed && (
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "1px 6px",
                  borderRadius: "9999px", background: "#ef4444", color: "white",
                  minWidth: "18px", textAlign: "center",
                }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {item.label === "Notifications" && unreadCount > 0 && collapsed && (
                <div style={{
                  position: "absolute", top: "6px", right: "6px",
                  width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444",
                }} />
              )}
            </Link>
          );
        })}
      </nav>
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
          <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)" }}
            onClick={() => setSidebarOpen(false)} />
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
            background: colors.bgCard,
            position: "sticky", top: 0, zIndex: 50,
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            boxShadow: isDark ? "0 1px 0 rgba(255,255,255,0.06)" : "0 1px 0 rgba(0,0,0,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: colors.bgCard, border: `1px solid ${colors.border}`,
                display: "none", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: colors.text,
              }}>
                {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "15px", fontWeight: 600, color: colors.text }}>
                  {currentNav?.label || "Dashboard"}
                </span>
                {isAdmin && (
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px",
                    borderRadius: "9999px", background: "rgba(124,58,237,0.1)",
                    color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)",
                  }}>
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={toggleTheme} title={isDark ? "Switch to light" : "Switch to dark"} style={{
                width: "34px", height: "34px", borderRadius: "8px",
                background: colors.bgCard, border: `1px solid ${colors.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: colors.textMuted, transition: "all 0.2s",
              }}>
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Notification bell */}
              <div ref={notifRef} style={{ position: "relative" }}>
                <button onClick={handleBellClick} style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  background: notifOpen ? (isDark ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.08)") : colors.bgCard,
                  border: notifOpen ? "1px solid rgba(124,58,237,0.3)" : `1px solid ${colors.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: notifOpen ? "#a78bfa" : colors.textMuted,
                  position: "relative", transition: "all 0.2s",
                }}>
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <div style={{
                      position: "absolute", top: "-5px", right: "-5px",
                      minWidth: "17px", height: "17px", borderRadius: "9999px",
                      background: "#ef4444", color: "white", fontSize: "10px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 4px", border: `2px solid ${colors.bgCard}`,
                    }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </div>
                  )}
                </button>

                {notifOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "44px", width: "360px", maxHeight: "500px",
                    background: panelBg, border: `1px solid ${panelBorder}`,
                    borderRadius: "14px",
                    boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.7)" : "0 20px 60px rgba(0,0,0,0.15)",
                    zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 16px", borderBottom: `1px solid ${panelDivider}`, flexShrink: 0,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, color: panelText, margin: 0 }}>Notifications</h3>
                        {unreadCount > 0 && (
                          <span style={{
                            fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "9999px",
                            background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)",
                          }}>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} style={{ fontSize: "11px", color: "#a78bfa", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" }}>
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button onClick={clearAll} style={{ fontSize: "11px", color: panelMuted, background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" }}>
                            Clear all
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ overflowY: "auto", flex: 1 }}>
                      {notifLoading ? (
                        <div style={{ padding: "40px", textAlign: "center" }}>
                          <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
                        </div>
                      ) : notifications.length === 0 ? (
                        <div style={{ padding: "48px 24px", textAlign: "center" }}>
                          <Bell size={28} color={panelMuted} style={{ margin: "0 auto 12px" }} />
                          <p style={{ fontSize: "14px", fontWeight: 500, color: panelText, marginBottom: "4px" }}>No notifications yet</p>
                          <p style={{ fontSize: "12px", color: panelMuted }}>Pipeline runs, API changes and system events appear here.</p>
                        </div>
                      ) : (
                        notifications.map((notif, i) => {
                          const accent = notifAccent[notif.type] || "#7c3aed";
                          return (
                            <div key={notif._id}
                              onClick={() => {
                                if (!notif.isRead) markAsRead(notif._id);
                                if (notif.actionUrl) { router.push(notif.actionUrl); setNotifOpen(false); }
                              }}
                              style={{
                                display: "flex", gap: "12px", padding: "13px 16px",
                                borderBottom: i < notifications.length - 1 ? `1px solid ${panelDivider}` : "none",
                                background: notif.isRead ? "transparent" : panelUnread,
                                cursor: notif.actionUrl ? "pointer" : "default",
                              }}
                            >
                              <div style={{
                                width: "36px", height: "36px", borderRadius: "9px", flexShrink: 0,
                                background: notif.isRead ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)") : `${accent}18`,
                                border: `1px solid ${notif.isRead ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)") : `${accent}30`}`,
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px",
                              }}>
                                {notif.icon || notifIcon[notif.type] || "🔔"}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                                  <p style={{ fontSize: "13px", fontWeight: notif.isRead ? 400 : 600, color: panelText, marginBottom: "3px", lineHeight: 1.4 }}>
                                    {notif.title}
                                  </p>
                                  {!notif.isRead && (
                                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0, marginTop: "5px" }} />
                                  )}
                                </div>
                                <p style={{ fontSize: "12px", color: panelMuted, lineHeight: 1.5, marginBottom: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {notif.message}
                                </p>
                                <p style={{ fontSize: "11px", color: panelSubtle }}>
                                  {new Date(notif.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div style={{ padding: "10px 16px", borderTop: `1px solid ${panelDivider}` }}>
                      <Link href="/dashboard/notifications" onClick={() => setNotifOpen(false)}
                        style={{ fontSize: "13px", color: "#a78bfa", textDecoration: "none", fontWeight: 500 }}>
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ width: "1px", height: "20px", background: colors.border, margin: "0 2px" }} />

              <UserDropdown user={user} onLogout={() => setShowLogoutDialog(true)} colors={colors} isDark={isDark} isAdmin={isAdmin} />
            </div>
          </header>

          {/* ── Profile completion banner ── */}
          <ProfileCompletionBanner colors={colors} />

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
        isDark={isDark}
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