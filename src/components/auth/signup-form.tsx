"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthWrapper } from "./auth-wrapper";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";
import { GoogleButton } from "./google-button";
import { AuthDivider } from "./divider";
import { authApi } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/hooks/use-theme";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirm?: string;
  general?: string;
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { setAuth } = useAuthStore();
  const { colors } = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const loginHref = redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : "/auth/login";

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";
    if (!password || password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password))
      errs.password = "Password needs an uppercase letter and a number";
    if (password !== confirm)
      errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});

    try {
        const name = `${firstName.trim()} ${lastName.trim()}`.trim();
        const res = await authApi.register({ name, email: email.trim(), password });
        setAuth(res.user, res.accessToken, res.refreshToken);
        localStorage.setItem("accessToken", res.accessToken);
        localStorage.setItem("refreshToken", res.refreshToken);
        document.cookie = `accessToken=${res.accessToken}; path=/; max-age=900; SameSite=Lax`;
        // Tokens are valid immediately — verification doesn't need to gate
        // access. Go straight to wherever they were headed (or the
        // dashboard) instead of an intermediate "check your inbox" page;
        // a persistent banner (verify-email-banner.tsx) reminds them to
        // verify until they do, without blocking anything they can already
        // do with a real session.
        router.push(redirect || "/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper
      title="Create your account"
      subtitle="Start automating your business with AI agents"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref={loginHref}
    >
      <GoogleButton label="Sign up with Google" redirect={redirect} />
      <AuthDivider label="or sign up with email" />

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

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <FormField
              label="First name"
              placeholder="Jane"
              value={firstName}
              onChange={setFirstName}
              error={errors.firstName}
              autoComplete="given-name"
              disabled={loading}
            />
          </div>
          <div style={{ flex: 1 }}>
            <FormField
              label="Last name"
              placeholder="Doe"
              value={lastName}
              onChange={setLastName}
              error={errors.lastName}
              autoComplete="family-name"
              disabled={loading}
            />
          </div>
        </div>
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
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
          disabled={loading}
        />
        <FormField
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
          autoComplete="new-password"
          disabled={loading}
        />

        {/* Password strength */}
        {password.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
              {[
                password.length >= 8,
                /[A-Z]/.test(password),
                /[0-9]/.test(password),
                /[^A-Za-z0-9]/.test(password),
              ].map((met, i) => (
                <div key={i} style={{
                  flex: 1, height: "3px", borderRadius: "2px",
                  background: met ? "#22c55e" : colors.border,
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <p style={{ fontSize: "11px", color: colors.textMuted }}>
              {password.length < 8 ? "Too short" :
                !/[A-Z]/.test(password) ? "Add an uppercase letter" :
                !/[0-9]/.test(password) ? "Add a number" :
                !/[^A-Za-z0-9]/.test(password) ? "Add a special character for stronger password" :
                "Strong password"}
            </p>
          </div>
        )}

        <SubmitButton label="Create account" loading={loading} />

        <p style={{
          fontSize: "11px", color: colors.textMuted,
          textAlign: "center", marginTop: "16px", lineHeight: 1.6,
        }}>
          By creating an account you agree to our{" "}
          <a href="/terms" style={{ color: "#a78bfa" }}>Terms</a> and{" "}
          <a href="/privacy" style={{ color: "#a78bfa" }}>Privacy Policy</a>
        </p>
      </form>
    </AuthWrapper>
  );
}