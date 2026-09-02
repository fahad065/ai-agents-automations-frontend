"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { AlertTriangle, X } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { authApi } from "@/lib/auth";
import { toast } from "sonner";

// Registration no longer waits on a "check your inbox" page — the user is
// dropped straight into the dashboard (or their intended setup flow) with
// a real session, since the access/refresh tokens are already valid before
// verification. This banner is the reminder that replaces that gate: it
// re-checks the store's isEmailVerified on every dashboard page load and
// keeps nagging (once per session, via sessionStorage, same pattern as
// profile-completion-banner.tsx) until the user actually clicks the link.
// Nothing in the product is blocked by this banner alone — see
// ChatbotsService.update() on the backend for the one place verification
// is actually required (going live), which is intentionally more targeted
// than a full account lock.
export function VerifyEmailBanner() {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("verify-email-banner-dismissed")) setDismissed(true);
  }, []);

  if (!user || user.isEmailVerified || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem("verify-email-banner-dismissed", "1");
    setDismissed(true);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification(user.email);
      setResent(true);
      toast.success("Verification email sent");
    } catch {
      toast.error("Failed to resend — try again in a moment");
    }
    setResending(false);
  };

  return (
    <div style={{
      background: "rgba(245,158,11,0.08)",
      borderBottom: "1px solid rgba(245,158,11,0.25)",
      padding: "10px 24px",
      display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
    }}>
      <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
      <p style={{ fontSize: "13px", color: colors.text, flex: 1, minWidth: "200px" }}>
        <strong>Verify your email</strong> — we sent a link to {user.email}. You can keep exploring, but you'll need to verify before taking a chatbot or module live.
      </p>
      <button onClick={handleResend} disabled={resending || resent} style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "5px 12px", borderRadius: "6px", cursor: resending || resent ? "default" : "pointer",
        background: "#f59e0b", color: "#1a1200", border: "none",
        fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
        opacity: resending ? 0.7 : 1,
      }}>
        {resending ? "Sending..." : resent ? "Sent ✓" : "Resend email"}
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
