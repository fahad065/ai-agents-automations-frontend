// Next.js's native client-instrumentation hook — auto-loaded in the
// browser bundle before the app renders, no manual import needed anywhere.
// Uses NEXT_PUBLIC_SENTRY_DSN (not a plain SENTRY_DSN) because Next.js
// only inlines NEXT_PUBLIC_*-prefixed env vars into the client bundle at
// build time; anything else is invisible to browser code. The same value
// is reused for the server/edge configs too (see sentry.server.config.ts)
// rather than keeping two DSNs in sync — a DSN is a write-only, safe-to-
// expose credential (it can submit events, it can't read your account),
// so there's no actual downside to one shared public value.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_DSN ? 0.1 : 0,
  // Session Replay wasn't asked for and has its own cost/quota — leave it
  // off explicitly rather than accepting the SDK's default.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

// Required export for the SDK to instrument App Router client-side
// navigations (tracks route transitions as spans/breadcrumbs).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
