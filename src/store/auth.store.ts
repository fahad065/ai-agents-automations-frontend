import { create } from "zustand";
import { persist } from "zustand/middleware";

// Mirrors the backend's grouped user document (2026-11-16): personal
// details under `profile`, sign-in state under `auth`, trial/plan under
// `plan`. The API never returns auth tokens (sanitizeUser on the backend).
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status?: "active" | "inactive";
  profile?: {
    phoneNumber?: string;
    country?: string;
    avatar?: string;
    timezone?: string;
    company?: string;
  };
  auth?: {
    provider?: "local" | "google";
    isEmailVerified?: boolean;
  };
  plan?: {
    planType?: "trial" | "paid" | "free_forever" | "expired";
    isFreeForever?: boolean;
    trialStartDate?: string;
    trialEndDate?: string;
    totalBilled?: number;
  };
  onboarding?: Record<string, string | undefined>;
}

// A user saved in the browser before the regroup has flat fields — move them
// into place so banners/avatar read correctly until /auth/me refreshes it.
function regroupStoredUser(u: any): User | null {
  if (!u || u.auth || u.plan || u.profile) return u;
  const { avatar, phoneNumber, country, timezone, company, provider, isEmailVerified,
    planType, isFreeForever, trialStartDate, trialEndDate, totalBilled, ...rest } = u;
  return {
    ...rest,
    profile: { avatar, phoneNumber, country, timezone, company },
    auth: { provider, isEmailVerified },
    plan: { planType, isFreeForever, trialStartDate, trialEndDate, totalBilled },
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "kt-auth",
      version: 1,
      migrate: (persisted: any) => ({ ...persisted, user: regroupStoredUser(persisted?.user) }),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);