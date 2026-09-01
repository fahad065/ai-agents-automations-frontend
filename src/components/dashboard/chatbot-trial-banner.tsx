"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Clock, AlertTriangle } from "lucide-react";

interface Billing {
  status: "trial" | "awaiting_setup_payment" | "active" | "past_due" | "suspended";
  trialEndsAt?: string;
}

// Per-chatbot trial/billing status banner — separate from the account-level
// TrialBanner (dashboard/trial-banner.tsx), which tracks the user's
// agent/automation trial, not a specific chatbot's. Warns inside the same
// 5-day window as the backend's chatbot-billing.cron.ts, and covers the
// "already lapsed" states that cron flips billing.status into, since the
// chat engine (chat.service.ts) stops answering for any of those.
export function ChatbotTrialBanner({ billing, onGoToBilling }: { billing: Billing; onGoToBilling: () => void }) {
  const { colors } = useTheme();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (billing.status !== "trial" || !billing.trialEndsAt) { setDaysLeft(null); return; }
    setDaysLeft(Math.ceil((new Date(billing.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }, [billing.status, billing.trialEndsAt]);

  const lapsed = billing.status === "awaiting_setup_payment" || billing.status === "past_due" || billing.status === "suspended";
  const trialEndingSoon = billing.status === "trial" && daysLeft !== null && daysLeft <= 5;

  if (!lapsed && !trialEndingSoon) return null;

  const urgent = lapsed || (daysLeft !== null && daysLeft <= 1);
  const accentColor = urgent ? "#ef4444" : "#f59e0b";
  const bgColor = urgent ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)";
  const borderColor = urgent ? "rgba(239,68,68,0.25)" : "rgba(245,158,11,0.25)";

  const title = lapsed
    ? "This chatbot has stopped answering customers"
    : daysLeft !== null && daysLeft <= 0
    ? "Your trial ends today"
    : daysLeft === 1
    ? "⚠️ 1 day left in your free trial"
    : `${daysLeft} days left in your free trial`;

  const subtitle = lapsed
    ? "Billing is unpaid — add a payment to bring it back online."
    : "Add a payment method before it expires so this bot keeps answering customers.";

  return (
    <div style={{
      background: bgColor, border: `1px solid ${borderColor}`,
      borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
      display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: `${accentColor}15`, border: `1px solid ${accentColor}25`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {lapsed ? <AlertTriangle size={15} color={accentColor} /> : <Clock size={15} color={accentColor} />}
      </div>

      <div style={{ flex: 1, minWidth: "200px" }}>
        <p style={{ fontSize: "13px", fontWeight: 600, color: colors.text, marginBottom: "2px" }}>{title}</p>
        <p style={{ fontSize: "12px", color: colors.textMuted }}>{subtitle}</p>
      </div>

      {!lapsed && daysLeft !== null && (
        <div style={{ width: "120px", height: "4px", background: colors.border, borderRadius: "2px", overflow: "hidden", flexShrink: 0 }}>
          <div style={{
            height: "100%",
            width: `${Math.max(0, Math.min(100, (daysLeft / 30) * 100))}%`,
            background: accentColor, borderRadius: "2px", transition: "width 0.3s ease",
          }} />
        </div>
      )}

      <button onClick={onGoToBilling} style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
        color: "#fff", padding: "8px 16px", borderRadius: "8px", border: "none",
        cursor: "pointer", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {lapsed ? "Make a payment" : "View billing"}
      </button>
    </div>
  );
}
