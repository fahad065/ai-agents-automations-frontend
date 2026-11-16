"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

// Re-reads the logged-in user from GET /auth/me once per dashboard visit, so
// the copy kept in the browser never goes stale (email just verified in
// another tab, plan changed by an admin, or the user document's shape
// changing — e.g. the 2026-11-16 profile/auth/plan regroup). Renders nothing.
export function RefreshCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get("/auth/me")
      .then((res) => { if (res.data?.user?._id) setUser(res.data.user); })
      .catch(() => {});
  }, [isAuthenticated, setUser]);

  return null;
}
