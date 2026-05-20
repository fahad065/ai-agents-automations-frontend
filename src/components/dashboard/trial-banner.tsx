"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import { X, Clock, Zap } from "lucide-react";

export function TrialBanner() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    // Check if dismissed today
    const dismissedAt = localStorage.getItem("trial_banner_dismissed");
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt).toDateString();
      const today = new Date().toDateString();
      if (dismissedDate === today) { setDismissed(true); return; }
    }

    // Calculate days left
    if (user.isFreeForever || user.planType !== "trial") return;
    const trialEnd = user.trialEndDate ? new Date(user.trialEndDate) : null;
    if (!trialEnd) return;
    const now = new Date();
    const diff = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff);
  }, [user]);

  if (dismissed || daysLeft === null) return null;
  if (user?.isFreeForever || user?.planType !== "trial") return null;
  if (daysLeft > 25) return null; // Only show when 25 days or less remain

  const isUrgent = daysLeft <= 3;
  const isWarning = daysLeft <= 7;

  const bgColor = isUrgent
    ? "rgba(239,68,68,0.08)"
    : isWarning
    ? "rgba(245,158,11,0.08)"
    : "rgba(124,58,237,0.08)";

  const borderColor = isUrgent
    ? "rgba(239,68,68,0.25)"
    : isWarning
    ? "rgba(245,158,11,0.25)"
    : "rgba(124,58,237,0.25)";

  const accentColor = isUrgent ? "#ef4444" : isWarning ? "#f59e0b" : "#7c3aed";

  const handleDismiss = () => {
    localStorage.setItem("trial_banner_dismissed", new Date().toISOString());
    setDismissed(true);
  };

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "10px",
      padding: "12px 16px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap",
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: `${accentColor}15`,
        border: `1px solid ${accentColor}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Clock size={15} color={accentColor} />
      </div>

      <div style={{ flex: 1, minWidth: "200px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "2px" }}>
          {daysLeft <= 0
            ? "Your trial has expired"
            : daysLeft === 1
            ? "⚠️ Last day of your free trial!"
            : `${daysLeft} days left in your free trial`}
        </p>
        <p style={{ fontSize: "12px", color: colors.textMuted }}>
          {daysLeft <= 0
            ? "Upgrade now to continue using your agents"
            : "Upgrade before your trial ends to keep your agents running"}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{
        width: "120px", height: "4px",
        background: colors.border, borderRadius: "2px",
        overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, (daysLeft / 30) * 100))}%`,
          background: accentColor,
          borderRadius: "2px",
          transition: "width 0.3s ease",
        }} />
      </div>

      <Link href="/dashboard/billing" style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
        color: "#fff", padding: "8px 16px", borderRadius: "8px",
        textDecoration: "none", fontSize: "13px", fontWeight: 600,
        whiteSpace: "nowrap", flexShrink: 0,
        display: "flex", alignItems: "center", gap: "6px",
      }}>
        <Zap size={12} />
        Upgrade now
      </Link>

      {daysLeft > 3 && (
        <button onClick={handleDismiss} style={{
          background: "transparent", border: "none",
          cursor: "pointer", color: colors.textMuted,
          display: "flex", alignItems: "center", padding: "4px",
          flexShrink: 0,
        }}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}