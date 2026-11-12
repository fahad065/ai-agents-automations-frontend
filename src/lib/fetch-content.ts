// Server-side lookup used by the dynamic routes (/[slug], /blog/[slug],
// /agents|automations|chatbots/[slug]) to decide whether to render or 404.
// Only a real 404 from the API means "missing" — if the API is down or
// errors, we still render and let the page's own loading/error UI handle it,
// rather than telling search engines a real page doesn't exist.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export type ContentLookup<T> =
  | { state: "found"; data: T }
  | { state: "missing" }
  | { state: "unknown" };

// Metadata for a route whose content doesn't exist — matches app/not-found.tsx
// so the tab title doesn't fall back to a route-specific default.
export const NOT_FOUND_METADATA = { title: "Page not found", robots: { index: false } };

export async function lookupContent<T = any>(path: string, revalidate = 300): Promise<ContentLookup<T>> {
  try {
    // Same URL + options as the routes' generateMetadata fetch, so Next
    // dedupes them into one request.
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (res.status === 404) return { state: "missing" };
    if (!res.ok) return { state: "unknown" };
    return { state: "found", data: (await res.json()) as T };
  } catch {
    return { state: "unknown" };
  }
}
