// Loaded by src/instrumentation.ts when NEXT_RUNTIME === "nodejs" (SSR,
// route handlers, server actions). One shared DSN across
// client/server/edge — see src/instrumentation-client.ts for why.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_DSN ? 0.1 : 0,
});
