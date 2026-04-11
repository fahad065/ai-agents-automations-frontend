"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Suspense } from "react";

function CallbackContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();
  const { colors } = useTheme();

  useEffect(() => {
    const token = params.get("token");
    const refresh = params.get("refresh");

    if (!token || !refresh) {
      router.push("/auth/login?error=oauth_failed");
      return;
    }

    const finalise = async () => {
        try {
            localStorage.setItem("accessToken", token);
            localStorage.setItem("refreshToken", refresh);
        
            // Set cookie for middleware
            document.cookie = `accessToken=${token}; path=/; max-age=900; SameSite=Lax`;
        
            const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
            });
        
            const user = res.data?.user || res.data;
            setAuth(user, token, refresh);
        
            // Small delay to ensure cookie is set
            await new Promise((r) => setTimeout(r, 100));
        
            if (user.role === "admin") {
            router.push("/admin");
            } else {
            router.push("/dashboard");
            }
        } catch {
            router.push("/auth/login?error=oauth_failed");
        }
    };

    finalise();
  }, [params, router, setAuth]);

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: "16px",
      background: colors.bg,
    }}>
      <Loader2 size={32} color="#7c3aed"
        style={{ animation: "spin 1s linear infinite" }} />
      <p style={{ color: colors.textMuted, fontSize: "14px" }}>
        Completing sign in...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={32} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}