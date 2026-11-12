import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GenericCmsPage } from "@/components/marketing/generic-page";
import { lookupContent, NOT_FOUND_METADATA } from "@/lib/fetch-content";

interface Props { params: Promise<{ slug: string }>; }

interface CmsPage { title: string; metaTitle?: string; metaDescription?: string }

// Catch-all for any admin-created CMS page whose slug doesn't match one of
// the literal route folders at this level (about, contact, privacy, ...).
// Next.js always prefers a literal segment over a dynamic one, so this never
// shadows /about, /blog, /pricing, etc. Because it matches ANY single-segment
// URL, it must 404 when no CMS page exists — otherwise every mistyped URL
// would be served as a 200 "not found" message.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await lookupContent<CmsPage>(`/cms/content/page/${slug}`);
  if (result.state === "missing") return NOT_FOUND_METADATA;
  if (result.state !== "found") return { title: "LogicMate" };
  return { title: result.data.metaTitle || result.data.title, description: result.data.metaDescription };
}

export default async function DynamicCmsRoute({ params }: Props) {
  const { slug } = await params;
  const result = await lookupContent(`/cms/content/page/${slug}`);
  if (result.state === "missing") notFound();
  return <GenericCmsPage slug={slug} />;
}
