"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) return;
    verifyToken(token);
  }, [token]);

  const verifyToken = async (t: string) => {
    setStatus("verifying");
    try {
      const res = await authApi.verifyEmail(t);
      if (res.data?.accessToken) {
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      }
      setStatus("success");
      setMessage(res.data?.message || "Email verified successfully!");
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.response?.data?.message || "Invalid or expired verification link.");
    }
  };

  const resendEmail = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setResent(true);
    } catch {}
    setResending(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px", padding: "48px 40px",
        width: "100%", maxWidth: "460px", textAlign: "center",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "32px" }}>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9" }}>
            Logic<span style={{ color: "#7c3aed" }}>Mate</span>
          </span>
        </div>

        {/* Verifying */}
        {status === "verifying" && (
          <>
            <Loader2 size={48} color="#7c3aed" style={{ animation: "spin 1s linear infinite", margin: "0 auto 24px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" }}>
              Verifying your email...
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px" }}>Please wait a moment.</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <CheckCircle2 size={52} color="#22c55e" style={{ margin: "0 auto 24px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" }}>
              Email verified! 🎉
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
              {message} Redirecting to your dashboard...
            </p>
            <div style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#22c55e", borderRadius: "2px", animation: "progress 2.5s linear forwards" }} />
            </div>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <XCircle size={52} color="#ef4444" style={{ margin: "0 auto 24px" }} />
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" }}>
              Verification failed
            </h1>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "28px" }}>{message}</p>
            {email && (
              <button onClick={resendEmail} disabled={resending || resent} style={{
                background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                color: "#fff", border: "none", padding: "12px 28px",
                borderRadius: "10px", fontSize: "14px", fontWeight: 600,
                cursor: resending || resent ? "not-allowed" : "pointer",
                marginBottom: "16px", width: "100%",
                opacity: resending || resent ? 0.7 : 1,
              }}>
                {resending ? "Sending..." : resent ? "✓ Email sent!" : "Resend verification email"}
              </button>
            )}
            <Link href="/login" style={{ color: "#7c3aed", fontSize: "14px", textDecoration: "none" }}>
              Back to login →
            </Link>
          </>
        )}

        {/* Idle — check email state */}
        {status === "idle" && (
          <>
            <div style={{
              width: "72px", height: "72px", borderRadius: "18px",
              background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <Mail size={32} color="#7c3aed" />
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#f1f5f9", marginBottom: "8px" }}>
              Check your inbox
            </h1>
            <p style={{ color: "#64748b", fontSize: "15px", lineHeight: 1.7, marginBottom: "28px" }}>
              We sent a verification link to <strong style={{ color: "#a78bfa" }}>{email || "your email"}</strong>.
              Click the link to activate your account.
            </p>
            <div style={{
              background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)",
              borderRadius: "12px", padding: "16px", marginBottom: "24px",
            }}>
              <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                💡 Can't find it? Check your spam folder or resend below.
              </p>
            </div>
            {email && !resent && (
              <button onClick={resendEmail} disabled={resending} style={{
                background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)",
                color: "#a78bfa", padding: "12px 28px", borderRadius: "10px",
                fontSize: "14px", fontWeight: 600, cursor: resending ? "not-allowed" : "pointer",
                width: "100%", marginBottom: "16px",
              }}>
                {resending ? "Sending..." : "Resend verification email"}
              </button>
            )}
            {resent && (
              <p style={{ color: "#22c55e", fontSize: "14px", marginBottom: "16px" }}>
                ✓ New verification email sent!
              </p>
            )}
            <Link href="/login" style={{ color: "#475569", fontSize: "13px", textDecoration: "none" }}>
              Back to login
            </Link>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  );
}