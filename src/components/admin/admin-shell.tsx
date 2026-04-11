"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard, Users, Boxes,
  Activity, Settings, LogOut,
  Zap, Menu, X, Sun, Moon,
  ChevronRight, Shield, AlertTriangle, FileText
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Modules", href: "/admin/modules", icon: Boxes },
  { label: "Pipeline Logs", href: "/admin/pipelines", icon: Activity },
  { label: "Content (CMS)", href: "/admin/cms", icon: FileText },
  { label: "System", href: "/admin/system", icon: Settings },
];

function LogoutDialog({
  open,
  onCancel,
  onConfirm,
  loading,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const { colors } = useTheme();

  if (!open) return null;

  return (
    <>
      <div
        onClick={onCancel}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: "16px",
            padding: "28px",
            width: "100%", maxWidth: "360px",
            margin: "24px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          {/* Icon */}
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: "17px", fontWeight: 700,
            color: colors.text, textAlign: "center",
            marginBottom: "8px",
          }}>
            Sign out?
          </h2>

          {/* Subtitle */}
          <p style={{
            fontSize: "14px", color: colors.textMuted,
            textAlign: "center", lineHeight: 1.6,
            marginBottom: "24px",
          }}>
            You will be signed out of the admin panel and redirected to the homepage.
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onCancel}
              disabled={loading}
              style={{
                flex: 1, padding: "11px",
                borderRadius: "9px", fontSize: "14px",
                fontWeight: 500, cursor: "pointer",
                border: `1px solid ${colors.border}`,
                background: colors.bg,
                color: colors.text,
                transition: "all 0.2s",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                flex: 1, padding: "11px",
                borderRadius: "9px", fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                border: "1px solid rgba(239,68,68,0.3)",
                background: loading ? "rgba(239,68,68,0.4)" : "#ef4444",
                color: "white",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: "6px",
                transition: "all 0.2s",
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: "14px", height: "14px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }} />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut size={14} /> Sign out
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      const { api } = await import("@/lib/api");
      await api.post("/auth/logout");
    } catch {}
    clearAuth();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    setLogoutLoading(false);
    setShowLogoutDialog(false);
    router.push("/");
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Logo */}
      <div style={{
        padding: "20px",
        borderBottom: `1px solid ${colors.border}`,
        display: "flex", alignItems: "center", gap: "10px",
        minHeight: "64px",
      }}>
        <div style={{
          width: "28px", height: "28px", borderRadius: "7px",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Zap size={14} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <p style={{ fontSize: "14px", fontWeight: 700, color: colors.text }}>
            Nex<span style={{ color: "#a78bfa" }}>Agent</span>
          </p>
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            fontSize: "10px", color: "#a78bfa", fontWeight: 600,
          }}>
            <Shield size={9} /> Admin Panel
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: "12px 8px",
        display: "flex", flexDirection: "column", gap: "2px",
        overflowY: "auto",
      }}>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center",
                gap: "10px", padding: "9px 12px",
                borderRadius: "8px", textDecoration: "none",
                background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                color: isActive ? "#a78bfa" : colors.textMuted,
                border: `1px solid ${isActive ? "rgba(124,58,237,0.2)" : "transparent"}`,
                fontSize: "14px", fontWeight: isActive ? 500 : 400,
                transition: "all 0.2s",
              }}
            >
              <IconComponent size={15} style={{ flexShrink: 0 }} />
              {item.label}
              {isActive && (
                <ChevronRight size={12} style={{ marginLeft: "auto" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{
        padding: "12px 8px",
        borderTop: `1px solid ${colors.border}`,
      }}>

        {/* My Dashboard link */}
        <Link
          href="/dashboard"
          style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 12px", borderRadius: "8px",
            textDecoration: "none", color: "#a78bfa",
            fontSize: "13px", marginBottom: "4px",
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.15)",
          }}
        >
          <LayoutDashboard size={15} /> My Dashboard
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: "100%", padding: "9px 12px",
            display: "flex", alignItems: "center",
            gap: "10px", borderRadius: "8px",
            background: "transparent", border: "none",
            cursor: "pointer", color: colors.textMuted,
            fontSize: "13px", marginBottom: "2px",
          }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>

        {/* User info */}
        <div style={{
          display: "flex", alignItems: "center",
          gap: "10px", padding: "10px 12px",
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: "8px", marginBottom: "4px",
        }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "rgba(124,58,237,0.2)",
            border: "1px solid rgba(124,58,237,0.3)",
            display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
            fontSize: "12px", fontWeight: 700, color: "#a78bfa",
          }}>
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: "13px", fontWeight: 500, color: colors.text,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {user?.name || "Admin"}
            </p>
            <p style={{
              fontSize: "11px", color: "#a78bfa", fontWeight: 500,
            }}>
              Administrator
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutDialog(true)}
          style={{
            width: "100%", padding: "9px 12px",
            display: "flex", alignItems: "center",
            gap: "10px", borderRadius: "8px",
            background: "transparent", border: "none",
            cursor: "pointer", color: "#ef4444",
            fontSize: "13px",
          }}
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh", background: colors.bg }}>

        {/* Desktop sidebar */}
        <aside
          className="admin-desktop-sidebar"
          style={{
            width: "220px", flexShrink: 0,
            background: colors.bgCard,
            borderRight: `1px solid ${colors.border}`,
            position: "sticky", top: 0, height: "100vh",
          }}
        >
          <SidebarContent />
        </aside>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.6)",
            }}
          />
        )}

        {/* Mobile sidebar */}
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: "240px", zIndex: 101,
          background: colors.bgCard,
          borderRight: `1px solid ${colors.border}`,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}>
          <SidebarContent />
        </aside>

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Top bar */}
          <header style={{
            height: "60px", display: "flex",
            alignItems: "center", justifyContent: "space-between",
            padding: "0 24px",
            borderBottom: `1px solid ${colors.border}`,
            background: colors.bgCard,
            position: "sticky", top: 0, zIndex: 50,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                className="admin-mobile-menu"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                  width: "34px", height: "34px", borderRadius: "8px",
                  background: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  display: "none", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: colors.text,
                }}
              >
                {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              </button>

              <span style={{ fontSize: "15px", fontWeight: 600, color: colors.text }}>
                {navItems.find((n) =>
                  pathname === n.href ||
                  (n.href !== "/admin" && pathname.startsWith(n.href))
                )?.label || "Admin"}
              </span>
            </div>

            {/* Right — admin badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "5px 12px", borderRadius: "9999px",
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(124,58,237,0.2)",
              }}>
                <Shield size={12} color="#a78bfa" />
                <span style={{
                  fontSize: "12px", fontWeight: 600, color: "#a78bfa",
                }}>
                  {user?.name}
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
            {children}
          </main>
        </div>
      </div>

      {/* Logout dialog */}
      <LogoutDialog
        open={showLogoutDialog}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogoutConfirm}
        loading={logoutLoading}
      />

      <style>{`
        @media (max-width: 768px) {
          .admin-desktop-sidebar { display: none !important; }
          .admin-mobile-menu { display: flex !important; }
        }
      `}</style>
    </>
  );
}