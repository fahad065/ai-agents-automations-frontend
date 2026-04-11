"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard, Bot, Zap, Activity,
  Key, Settings, CreditCard, LogOut,
  Menu, X, Sun, Moon, ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Automations", href: "/dashboard/automations", icon: Zap },
  { label: "Pipeline", href: "/dashboard/pipeline", icon: Activity },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Collapse sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; max-age=0";
    router.push("/auth/login");
  };

  const sidebarWidth = sidebarOpen ? "240px" : "64px";

  const SidebarContent = () => (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      {/* Logo */}
      <div style={{
        padding: sidebarOpen ? "20px 20px 16px" : "20px 12px 16px",
        borderBottom: `1px solid ${colors.border}`,
        display: "flex", alignItems: "center",
        justifyContent: sidebarOpen ? "space-between" : "center",
      }}>
        {sidebarOpen && (
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: "8px",
            textDecoration: "none",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Zap size={14} color="white" strokeWidth={2.5} />
            </div>
            <span style={{
              fontSize: "15px", fontWeight: 700, color: colors.text,
            }}>
              Nex<span style={{ color: "#a78bfa" }}>Agent</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: "28px", height: "28px", borderRadius: "6px",
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: colors.textMuted, flexShrink: 0,
          }}
        >
          {sidebarOpen
            ? <ChevronRight size={13} style={{ transform: "rotate(180deg)" }} />
            : <ChevronRight size={13} />
          }
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={!sidebarOpen ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center",
                gap: "10px", padding: "9px 12px",
                borderRadius: "8px", marginBottom: "2px",
                textDecoration: "none",
                background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                border: `1px solid ${isActive ? "rgba(124,58,237,0.25)" : "transparent"}`,
                color: isActive ? "#a78bfa" : colors.textMuted,
                transition: "all 0.15s",
                justifyContent: sidebarOpen ? "flex-start" : "center",
              }}
            >
              <IconComponent size={17} style={{ flexShrink: 0 }} />
              {sidebarOpen && (
                <span style={{ fontSize: "13px", fontWeight: 500 }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — user + actions */}
      <div style={{
        padding: "12px 8px",
        borderTop: `1px solid ${colors.border}`,
      }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={!sidebarOpen ? (isDark ? "Light mode" : "Dark mode") : undefined}
          style={{
            display: "flex", alignItems: "center",
            gap: "10px", padding: "9px 12px",
            borderRadius: "8px", marginBottom: "4px",
            background: "transparent", border: "none",
            cursor: "pointer", color: colors.textMuted,
            width: "100%",
            justifyContent: sidebarOpen ? "flex-start" : "center",
          }}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
          {sidebarOpen && (
            <span style={{ fontSize: "13px", fontWeight: 500 }}>
              {isDark ? "Light mode" : "Dark mode"}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={!sidebarOpen ? "Sign out" : undefined}
          style={{
            display: "flex", alignItems: "center",
            gap: "10px", padding: "9px 12px",
            borderRadius: "8px", marginBottom: "8px",
            background: "transparent", border: "none",
            cursor: "pointer", color: colors.textMuted,
            width: "100%",
            justifyContent: sidebarOpen ? "flex-start" : "center",
          }}
        >
          <LogOut size={17} />
          {sidebarOpen && (
            <span style={{ fontSize: "13px", fontWeight: 500 }}>Sign out</span>
          )}
        </button>

        {/* User avatar */}
        {sidebarOpen ? (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px",
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
          }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0,
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <p style={{
                fontSize: "13px", fontWeight: 500, color: colors.text,
                whiteSpace: "nowrap", overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {user?.name || "User"}
              </p>
              <p style={{
                fontSize: "11px", color: colors.textMuted,
                whiteSpace: "nowrap", overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {user?.email || ""}
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "white",
            margin: "0 auto",
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      display: "flex", minHeight: "100vh", background: colors.bg,
    }}>
      {/* Desktop sidebar */}
      <aside style={{
        width: sidebarWidth, flexShrink: 0,
        background: colors.bg,
        borderRight: `1px solid ${colors.border}`,
        position: "fixed", top: 0, left: 0, bottom: 0,
        zIndex: 100, transition: "width 0.25s ease",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}
        className="desktop-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 199,
          }}
        />
      )}

      {/* Mobile sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: mobileOpen ? 0 : "-280px",
        width: "260px", bottom: 0,
        background: colors.bg,
        borderRight: `1px solid ${colors.border}`,
        zIndex: 200, transition: "left 0.25s ease",
        display: "flex", flexDirection: "column",
      }}
        className="mobile-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarWidth,
        minHeight: "100vh",
        transition: "margin-left 0.25s ease",
      }}
        className="dashboard-main"
      >
        {/* Mobile topbar */}
        <div style={{
          display: "none", alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: `1px solid ${colors.border}`,
          background: colors.bg,
          position: "sticky", top: 0, zIndex: 50,
        }}
          className="mobile-topbar"
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: colors.text,
            }}
          >
            <Menu size={16} />
          </button>
          <span style={{ fontSize: "15px", fontWeight: 700, color: colors.text }}>
            Nex<span style={{ color: "#a78bfa" }}>Agent</span>
          </span>
          <div style={{ width: "36px" }} />
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-topbar { display: flex !important; }
          .dashboard-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}