import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { lookupContent, NOT_FOUND_METADATA } from "@/lib/fetch-content";
import { serviceDetailHref, type ServiceTypeKey } from "@/config/service-types";

interface ServiceSummary {
  type: string;
  name: string;
  description?: string;
}

const lookupService = (slug: string) => lookupContent<ServiceSummary>(`/services/${slug}`, 3600);

export async function serviceMetadata(slug: string, fallbackTitle: string): Promise<Metadata> {
  const result = await lookupService(slug);
  if (result.state === "missing") return NOT_FOUND_METADATA;
  if (result.state !== "found") return { title: fallbackTitle };
  const { name, description } = result.data;
  return {
    title: name,
    description,
    openGraph: { title: `${name} — LogicMate`, description },
  };
}

// 404 for a slug that doesn't exist; permanent redirect when the service
// exists but belongs to another type (e.g. /agents/<a chatbot's slug>), so
// every service has exactly one URL.
export async function ensureServiceRoute(slug: string, expected: ServiceTypeKey): Promise<void> {
  const result = await lookupService(slug);
  if (result.state === "missing") notFound();
  if (result.state === "found" && result.data.type !== expected) {
    permanentRedirect(serviceDetailHref(result.data.type, slug));
  }
}
