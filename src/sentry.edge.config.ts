// Loaded by src/instrumentation.ts when NEXT_RUNTIME === "edge" — covers
// src/proxy.ts (the dashboard auth-gate middleware) and any edge route
// handlers. Edge and Node runtimes can't share module state, so this is a
// separate Sentry.init() call from sentry.server.config.ts even though
// the options are identical.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_DSN ? 0.1 : 0,
});
