"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthWrapper } from "./auth-wrapper";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";
import { GoogleButton } from "./google-button";
import { AuthDivider } from "./divider";
import { authApi } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/hooks/use-theme";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";
    if (!password)
      errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
        const res = await authApi.login({ email: email.trim(), password });
        setAuth(res.user, res.accessToken, res.refreshToken);
        
        // Store in both localStorage AND cookie for middleware
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        document.cookie = `accessToken=${res.accessToken}; path=/; max-age=900; SameSite=Lax`;
        
        // Route based on role
        if (res.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid email or password";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Welcome back"
      subtitle="Sign in to your NexAgent account"
      footerText="Don't have an account?"
      footerLinkText="Sign up free"
      footerLinkHref="/auth/signup"
    >
      <GoogleButton label="Continue with Google" />
      <AuthDivider label="or sign in with email" />

      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "8px", padding: "10px 14px",
            marginBottom: "16px", fontSize: "13px", color: "#ef4444",
          }}>
            {errors.general}
          </div>
        )}

        <FormField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
          autoComplete="email"
          disabled={loading}
        />
        <FormField
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="current-password"
          disabled={loading}
        />

        {/* Remember me + forgot password */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "20px",
        }}>
          <label style={{
            display: "flex", alignItems: "center",
            gap: "8px", cursor: "pointer",
            fontSize: "13px", color: colors.textMuted,
          }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor: "#7c3aed", width: "14px", height: "14px" }}
            />
            Remember me
          </label>
          <Link href="/auth/forgot-password" style={{
            fontSize: "13px", color: "#a78bfa", textDecoration: "none",
          }}>
            Forgot password?
          </Link>
        </div>

        <SubmitButton label="Sign in" loading={loading} />
      </form>
    </AuthWrapper>
  );
}