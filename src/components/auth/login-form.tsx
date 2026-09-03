"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { Bot, Sparkles, ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authApi } from "@/lib/auth";
import { useAuthStore } from "@/store/auth.store";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const FEATURES = [
  {
    icon: Bot,
    title: "20+ ready-made modules",
    text: "AI agents, automations and chatbots you can deploy in minutes.",
  },
  {
    icon: Sparkles,
    title: "30-day free trial",
    text: "Full platform access from day one — no credit card required.",
  },
  {
    icon: ShieldCheck,
    title: "Bring your own API keys",
    text: "You connect your own OpenAI/provider keys — we never hold or bill for your usage.",
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const signupHref = redirect ? `/auth/signup?redirect=${encodeURIComponent(redirect)}` : "/auth/signup";

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
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);
      document.cookie = `accessToken=${res.accessToken}; path=/; max-age=900; SameSite=Lax`;
      router.push(redirect || "/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid email or password";
      setErrors({ general: msg });
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const url = redirect
      ? `${apiUrl}/auth/google?redirect=${encodeURIComponent(redirect)}`
      : `${apiUrl}/auth/google`;
    window.location.href = url;
  };

  return (
    <div className={`${GeistSans.className} flex min-h-screen items-center justify-center bg-background px-6 py-16 md:px-10`}>
      <div className="grid w-full max-w-5xl items-center gap-16 md:grid-cols-2">
        {/* Left — brand / marketing copy. Hidden below md; the card's own
            logo (below) covers the "back to landing page" affordance on
            mobile. */}
        <div className="hidden max-w-md md:block">
          <Link href="/" className="mb-8 flex w-fit items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800">
              <img src="/icon.svg" width={26} height={26} className="rounded-lg" alt="" />
            </div>
            <span className="text-base font-bold text-foreground">
              Logic<span className="text-primary">Mate</span>
            </span>
          </Link>

          <h1 className="mb-4 text-2xl font-semibold md:text-3xl">
            Welcome back!
          </h1>
          <p className="mb-10 text-muted-foreground">
            Sign in to keep managing your AI agents, automations and chatbots — all in one dashboard.
          </p>

          <ul className="space-y-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.title} className="flex gap-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-foreground" />
                  <div>
                    <p className="font-medium">{f.title}</p>
                    <p className="text-sm text-muted-foreground">{f.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right — form card */}
        <div className="w-full">
        <div className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-card p-8 shadow-sm">
          <Link href="/" className="mb-6 flex w-fit items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800">
              <img src="/icon.svg" width={26} height={26} className="rounded-lg" alt="" />
            </div>
            <span className="text-base font-bold text-foreground">
              Logic<span className="text-primary">Mate</span>
            </span>
          </Link>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {errors.general && (
              <div className="rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-3.5 accent-primary"
                />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href={signupHref} className="font-medium text-primary underline underline-offset-4">
                Sign up free
              </Link>
            </p>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
