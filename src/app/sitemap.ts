import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.logicmate.io";

  const staticPages = [
    { url: baseUrl, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/agents`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${baseUrl}/automations`, priority: 0.9, changeFrequency: "weekly" as const },
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

  let agentPages: MetadataRoute.Sitemap = [];
  let automationPages: MetadataRoute.Sitemap = [];

  try {
    const apiUrl = "https://api.logicmate.io/api/v1";
    const [agentsRes, automationsRes] = await Promise.all([
      fetch(`${apiUrl}/modules?moduleType=agent&limit=50`, { next: { revalidate: 3600 } }),
      fetch(`${apiUrl}/modules?moduleType=automation&limit=50`, { next: { revalidate: 3600 } }),
    ]);

    if (agentsRes.ok) {
      const data = await agentsRes.json();
      agentPages = (data.data || data || []).map((a: any) => ({
        url: `${baseUrl}/agents/${a.slug}`,
        lastModified: new Date(a.updatedAt || a.createdAt || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }

    if (automationsRes.ok) {
      const data = await automationsRes.json();
      automationPages = (data.data || data || []).map((a: any) => ({
        url: `${baseUrl}/automations/${a.slug}`,
        lastModified: new Date(a.updatedAt || a.createdAt || Date.now()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch {}

  return [...staticPages, ...agentPages, ...automationPages];
}