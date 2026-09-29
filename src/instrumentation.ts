import * as Sentry from "@sentry/nextjs";

// Next.js's native instrumentation hook — runs once per runtime at
// startup, before any request is handled. Dispatches to the right
// Sentry.init() call for that runtime (edge and Node can't share a config
// module directly).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Reports errors from Server Components, Route Handlers, and Server
// Actions that Next.js's own request lifecycle catches — the server-side
// analog of the error.tsx/global-error.tsx boundaries below.
export const onRequestError = Sentry.captureRequestError;
