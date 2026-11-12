import type { Metadata } from "next";
import { AgentDetailPage } from "@/components/marketing/agent-detail-page";
import { ensureServiceRoute, serviceMetadata } from "@/lib/service-route";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return serviceMetadata(slug, "AI Agent");
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  await ensureServiceRoute(slug, "agent");
  return <AgentDetailPage slug={slug} />;
}
