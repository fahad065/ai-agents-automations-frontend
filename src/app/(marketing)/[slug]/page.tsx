import type { Metadata } from "next";
import { GenericCmsPage } from "@/components/marketing/generic-page";

interface Props { params: Promise<{ slug: string }>; }

// Catch-all for any admin-created CMS page whose slug doesn't match one of
// the literal route folders at this level (about, contact, privacy, ...).
// Next.js always prefers a literal segment over a dynamic one, so this
// never shadows /about, /blog, /pricing, etc. — it only engages for a
// genuinely new slug created from /dashboard/cms.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/cms/content/page/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return { title: "LogicMate" };
    const page = await res.json();
    return { title: page.metaTitle || page.title, description: page.metaDescription };
  } catch {
    return { title: "LogicMate" };
  }
}

export default async function DynamicCmsRoute({ params }: Props) {
  const { slug } = await params;
  return <GenericCmsPage slug={slug} />;
}
