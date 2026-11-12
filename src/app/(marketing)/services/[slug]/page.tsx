import { notFound, permanentRedirect } from "next/navigation";
import { serviceDetailHref, SERVICE_TYPE_BY_KEY, type ServiceTypeKey } from "@/config/service-types";

interface Props {
  params: Promise<{ slug: string }>;
}

// Every service has exactly one detail URL: /agents/<slug>,
// /automations/<slug> or /chatbots/<slug> (see config/service-types.ts).
// /services/<slug> only exists so links using it keep working — it looks up
// the type and permanently redirects, so search engines index one URL.
export default async function ServiceSlugRedirect({ params }: Props) {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  let type: string | undefined;
  try {
    const res = await fetch(`${apiUrl}/services/${slug}`, { next: { revalidate: 3600 } });
    if (res.ok) type = (await res.json()).type;
  } catch {
    // fall through to 404
  }

  if (!type || !SERVICE_TYPE_BY_KEY[type as ServiceTypeKey]) notFound();
  permanentRedirect(serviceDetailHref(type, slug));
}
