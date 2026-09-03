"use client";

import { useState } from "react";
import Link from "next/link";
import { GeistSans } from "geist/font/sans";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = (): boolean => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      // Backend always returns a generic success message whether or not
      // the email exists — deliberately doesn't reveal which emails are
      // registered, so we never branch on the response here.
      await authApi.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
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

          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                <Mail size={24} className="text-primary" />
              </div>
              <h1 className="mb-2 text-xl font-semibold">Check your email</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If an account exists for{" "}
                <strong className="text-foreground">{email}</strong>, we&apos;ve sent
                a password reset link. It expires in 1 hour.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Didn&apos;t get it? Check spam, or{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="font-medium text-primary hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-xl font-semibold">Reset your password</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                    disabled={loading}
                    aria-invalid={!!error}
                  />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Send reset link"}
                </Button>
              </form>
            </>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4">
              Sign in
            </Link>
          </p>
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
