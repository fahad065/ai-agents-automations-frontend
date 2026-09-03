"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { MailWarning, X } from "lucide-react";
import { authApi } from "@/lib/auth";
import { toast } from "sonner";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
    <div className="px-4 pt-4">
      <Alert className="border-amber-500/30 bg-amber-500/[0.07] [&>svg]:text-amber-500">
        <MailWarning />
        <AlertTitle>Verify your email</AlertTitle>
        <AlertDescription className="text-foreground/70">
          We sent a link to <strong className="text-foreground">{user.email}</strong>. You can keep exploring, but
          you&apos;ll need to verify before taking a chatbot or module live.
        </AlertDescription>
        <AlertAction>
          <Button size="icon-sm" variant="ghost" onClick={handleDismiss} aria-label="Dismiss">
            <X className="size-3.5" />
          </Button>
        </AlertAction>
        <div className="col-start-2 mt-2.5">
          <Button
            size="sm"
            disabled={resending || resent}
            onClick={handleResend}
            className="bg-amber-500 text-amber-950 hover:bg-amber-500/85"
          >
            {resending ? "Sending…" : resent ? "Sent ✓" : "Resend email"}
          </Button>
        </div>
      </Alert>
    </div>
  );
}
