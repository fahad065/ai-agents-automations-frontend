import type { Metadata } from "next";
import { AutomationDetailPage } from "@/components/marketing/automation-detail-page";
import { ensureServiceRoute, serviceMetadata } from "@/lib/service-route";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return serviceMetadata(slug, "Automation");
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  await ensureServiceRoute(slug, "automation");
  return <AutomationDetailPage slug={slug} />;
}
