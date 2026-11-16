// The API returns services grouped (2026-11-16): content / seo / display /
// pipeline / pricing (see backend service.schema.ts). Page components were
// written against one flat object, so every fetch site runs the response
// through toServiceView() once and the components keep reading
// `agent.tagline`, `agent.icon`, `agent.pricingTiers`… unchanged. Saving goes
// the other way in admin-modules.tsx, which builds the grouped payload.
export function toServiceView<T = any>(s: any): T {
  if (!s || typeof s !== "object") return s;
  const { content = {}, seo = {}, display = {}, pipeline = {}, pricing, ...rest } = s;
  return {
    ...rest,
    ...content,
    ...seo,
    ...display,
    ...pipeline,
    pricing,
    pricingTiers: pricing?.tiers || [],
  } as T;
}

export const toServiceViews = <T = any>(list: any[] | undefined | null): T[] =>
  (list || []).map((s) => toServiceView<T>(s));

// The public pill on a service card/page. `badge` was dropped on 2026-11-16 —
// status is the single source: active → "Live", coming_soon → "Coming Soon".
export function serviceStatusLabel(status: string | undefined, isAr = false): string {
  if (status === "coming_soon") return isAr ? "قريباً" : "Coming Soon";
  if (status === "inactive") return isAr ? "غير متاح" : "Unavailable";
  return isAr ? "متاح الآن" : "Live";
}

// Reverse of toServiceView(): flat admin-form fields → the grouped body that
// POST/PATCH /services expects. Mirrors the backend's SERVICE_FIELD_GROUPS.
const GROUPS: Record<string, string[]> = {
  content: ["tagline", "tagline_ar", "description", "description_ar", "capabilities", "capabilities_ar",
    "heroStats", "featureCards", "howItWorks", "faq", "demoVideoUrl", "brochureUrl"],
  seo: ["metaTitle", "metaTitle_ar", "metaDescription", "metaDescription_ar"],
  display: ["icon", "color", "sortOrder", "platforms"],
  pipeline: ["pipelineType", "pipelineCategory", "components", "requiredApiKeys", "defaultConfig"],
};

export function toServicePayload(flat: Record<string, any>): Record<string, any> {
  const { pricingTiers, pricing, ...rest } = flat;
  const out: Record<string, any> = {};
  const grouped = new Set(Object.values(GROUPS).flat());
  for (const [key, value] of Object.entries(rest)) if (!grouped.has(key)) out[key] = value;
  for (const [group, keys] of Object.entries(GROUPS)) {
    const obj = Object.fromEntries(keys.filter((k) => rest[k] !== undefined).map((k) => [k, rest[k]]));
    if (Object.keys(obj).length) out[group] = obj;
  }
  if (pricing || pricingTiers) out.pricing = { ...(pricing || {}), ...(pricingTiers && { tiers: pricingTiers }) };
  return out;
}
