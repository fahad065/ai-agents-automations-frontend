"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const refresh = searchParams.get("refresh");
    const error = searchParams.get("error");

    if (error) {
      router.push(`/auth/login?error=${error}`);
      return;
    }

    if (!token || !refresh) {
      router.push("/auth/login?error=missing_tokens");
      return;
    }

    // Store tokens in localStorage
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refresh);

    // Fetch user profile
    api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const user = res.data?.user || res.data;
      setAuth(user, token, refresh);
      router.push("/dashboard");
    }).catch(() => {
      router.push("/auth/login?error=profile_failed");
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: "16px",
      background: "#0a0a0a",
    }}>
      <Loader2 size={32} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
      <p style={{ fontSize: "15px", color: "#6b7280" }}>Signing you in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}