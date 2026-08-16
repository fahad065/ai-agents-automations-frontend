// Add this component to dashboard-shell.tsx
// Shows a dismissable banner at top of dashboard when profile is incomplete

"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { AlertTriangle, X, ArrowRight } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { api } from "@/lib/api";

export function ProfileCompletionBanner() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show on settings page
    if (pathname?.includes("/settings")) return;
    if (dismissed) return;

    // Check if dismissed in session
    const wasDismissed = sessionStorage.getItem("profile-banner-dismissed");
    if (wasDismissed) return;

    // Fetch profile to check completeness
    api.get("/users/profile").then(res => {
      const u = res.data?.user || res.data;
      const isIncomplete = !u.phoneNumber || !u.country || !u.onboarding?.contentNiche;
      if (isIncomplete) setShow(true);
    }).catch(() => {});
  }, [pathname, dismissed]);

  const handleDismiss = () => {
    sessionStorage.setItem("profile-banner-dismissed", "1");
    setDismissed(true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      background: "rgba(124,58,237,0.07)",
      borderBottom: "1px solid rgba(124,58,237,0.2)",
      padding: "10px 24px",
      display: "flex", alignItems: "center", gap: "12px",
    }}>
      <AlertTriangle size={14} color="#a78bfa" style={{ flexShrink: 0 }} />
      <p style={{ fontSize: "13px", color: colors.text, flex: 1 }}>
        <strong>Complete your profile</strong> — add your phone number, country and content niche
        so we can send you notifications and invoices.
      </p>
      <button onClick={() => router.push("/dashboard/settings")} style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
        background: "#7c3aed", color: "white", border: "none",
        fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
      }}>
        Complete profile <ArrowRight size={11} />
      </button>
      <button onClick={handleDismiss} style={{
        background: "none", border: "none", cursor: "pointer",
        color: colors.textMuted, padding: "2px", flexShrink: 0,
      }}>
        <X size={14} />
      </button>
    </div>
  );
}