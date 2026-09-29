"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { useAuthStore } from "@/store/auth.store";

// Tags every client-side Sentry event (error.tsx/global-error.tsx catches,
// or anything captured manually) with the logged-in user's identity, so a
// dashboard crash is attributable to a specific tenant instead of an
// anonymous browser session — the frontend counterpart to the backend's
// TenantSentryInterceptor (see backend CLAUDE.md). Renders nothing; only
// runs inside the authenticated dashboard shell, so marketing-site visitors
// never get an identity attached.
export function SentryUserSync() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?._id) {
      Sentry.setUser({ id: user._id, email: user.email });
      Sentry.setTag("tenantUserId", user._id);
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return null;
}
