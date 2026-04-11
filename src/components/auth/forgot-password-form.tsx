"use client";

import { useState } from "react";
import { AuthWrapper } from "./auth-wrapper";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";
import { useTheme } from "@/hooks/use-theme";
import { Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // API call will go here when backend endpoint is ready
      await new Promise((r) => setTimeout(r, 1000));
      setSent(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthWrapper
        title="Check your email"
        subtitle={`We sent a reset link to ${email}`}
        footerText="Remember your password?"
        footerLinkText="Sign in"
        footerLinkHref="/auth/login"
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Mail size={24} color="#a78bfa" />
          </div>
          <p style={{ color: colors.textMuted, fontSize: "14px", lineHeight: 1.7 }}>
            If an account exists for <strong style={{ color: colors.text }}>{email}</strong>,
            you will receive a password reset link shortly.
          </p>
          <p style={{ color: colors.textMuted, fontSize: "13px", marginTop: "12px" }}>
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              onClick={() => setSent(false)}
              style={{
                background: "none", border: "none",
                color: "#a78bfa", cursor: "pointer", fontSize: "13px",
              }}
            >
              try again
            </button>
          </p>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
      footerText="Remember your password?"
      footerLinkText="Back to sign in"
      footerLinkHref="/auth/login"
    >
      <form onSubmit={handleSubmit}>
        <FormField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(v) => { setEmail(v); setError(""); }}
          error={error}
          autoComplete="email"
          disabled={loading}
        />
        <SubmitButton label="Send reset link" loading={loading} />
      </form>
    </AuthWrapper>
  );
}