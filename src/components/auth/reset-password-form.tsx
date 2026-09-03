"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/auth";

interface FormErrors {
  password?: string;
  confirm?: string;
  general?: string;
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!password || password.length < 8)
      errs.password = "Password must be at least 8 characters";
    else if (!/(?=.*[A-Z])(?=.*[0-9])/.test(password))
      errs.password = "Password needs an uppercase letter and a number";
    if (password !== confirm)
      errs.confirm = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !validate()) return;
    setLoading(true);
    setErrors({});

    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err: any) {
      setErrors({ general: err?.response?.data?.message || "Invalid or expired reset link." });
      setLoading(false);
    }
  };

  return (
    <div className={`${GeistSans.className} flex min-h-screen items-center justify-center bg-background px-6 py-16 md:px-10`}>
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-card p-8 shadow-sm">
          <Link href="/" className="mb-6 flex w-fit items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800">
              <img src="/icon.svg" width={26} height={26} className="rounded-lg" alt="" />
            </div>
            <span className="text-base font-bold text-foreground">
              Logic<span className="text-primary">Mate</span>
            </span>
          </Link>

          {!token ? (
            <div className="text-center">
              <XCircle size={44} className="mx-auto mb-4 text-destructive" />
              <h1 className="mb-2 text-xl font-semibold">Invalid reset link</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                This link is missing its reset token. Request a new one below.
              </p>
              <Link href="/auth/forgot-password">
                <Button type="button" className="w-full">Request a new link</Button>
              </Link>
            </div>
          ) : done ? (
            <div className="text-center">
              <CheckCircle2 size={44} className="mx-auto mb-4 text-emerald-500" />
              <h1 className="mb-2 text-xl font-semibold">Password reset!</h1>
              <p className="text-sm text-muted-foreground">
                Redirecting you to sign in...
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-xl font-semibold">Set a new password</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Choose a new password for your account.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {errors.general && (
                  <div className="space-y-2 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                    <p>{errors.general}</p>
                    <Link href="/auth/forgot-password" className="font-medium underline underline-offset-2">
                      Request a new reset link
                    </Link>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">
                    New password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      disabled={loading}
                      aria-invalid={!!errors.password}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Minimum 8 characters, with an uppercase letter and a number.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm">
                    Confirm password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    aria-invalid={!!errors.confirm}
                  />
                  {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Reset password"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
