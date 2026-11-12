import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  // The industries pages were retired in favour of /services with an
  // industry filter — keep old links and search results landing somewhere
  // useful instead of a not-found page.
  async redirects() {
    return [
      { source: "/industries", destination: "/services", permanent: true },
      { source: "/industries/:slug", destination: "/services?niche=:slug", permanent: true },
      { source: "/dashboard/industries", destination: "/dashboard/cms-modules", permanent: true },
    ];
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
