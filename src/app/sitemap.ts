import { MetadataRoute } from "next";
import { SERVICE_TYPES, SERVICE_TYPE_BY_KEY, serviceDetailHref, type ServiceTypeKey } from "@/config/service-types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.logicmate.io";

  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/services`, priority: 0.9, changeFrequency: "weekly" as const },
    ...SERVICE_TYPES.map((t) => ({ url: `${baseUrl}${t.href}`, priority: 0.9, changeFrequency: "weekly" as const })),
    { url: `${baseUrl}/pricing`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/about`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/contact`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/blog`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/faq`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${baseUrl}/privacy`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/terms`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/refund`, priority: 0.3, changeFrequency: "yearly" as const },
    { url: `${baseUrl}/cookies`, priority: 0.3, changeFrequency: "yearly" as const },
  ].map(page => ({ ...page, lastModified: new Date() }));

  // One canonical detail URL per service (agents, automations and chatbots).
  let servicePages: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.logicmate.io/api/v1";
    const res = await fetch(`${apiUrl}/services?limit=200`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      servicePages = (data.data || [])
        .filter((s: any) => SERVICE_TYPE_BY_KEY[s.type as ServiceTypeKey])
        .map((s: any) => ({
          url: `${baseUrl}${serviceDetailHref(s.type, s.slug)}`,
          lastModified: new Date(s.updatedAt || s.createdAt || Date.now()),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
    }
  } catch {}

  return [...staticPages, ...servicePages];
}
