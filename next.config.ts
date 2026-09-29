import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

// Wraps the build to upload source maps to Sentry so stack traces are
// readable instead of pointing at minified bundles. Uploading needs
// SENTRY_AUTH_TOKEN/SENTRY_ORG/SENTRY_PROJECT set — without them the
// plugin just skips that step with a warning (documented behavior, not a
// build failure), so this is safe to ship before those are configured.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
});
