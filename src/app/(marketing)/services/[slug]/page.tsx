import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgentDetailPage } from "@/components/marketing/agent-detail-page";
import { AutomationDetailPage } from "@/components/marketing/automation-detail-page";
import { ChatbotDetailPage } from "@/components/marketing/chatbot-detail-page";

interface Props {
  params: Promise<{ slug: string }>;
}

interface ServiceSummary {
  type: "agent" | "automation" | "chatbot" | "bundle";
  name: string;
  description?: string;
}

async function getService(slug: string): Promise<ServiceSummary | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  try {
    const res = await fetch(`${apiUrl}/services/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Service — LogicMate" };
  return {
    title: `${service.name} — LogicMate`,
    description: service.description,
    openGraph: { title: `${service.name} — LogicMate`, description: service.description },
  };
}

// One URL scheme for every service; the existing type-specific detail page
// renders the content (/agents/, /automations/ and /chatbots/ URLs keep
// working too).
export default async function ServiceDetailRoute({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  if (service.type === "agent") return <AgentDetailPage slug={slug} />;
  if (service.type === "automation") return <AutomationDetailPage slug={slug} />;
  if (service.type === "chatbot") return <ChatbotDetailPage slug={slug} />;
  notFound();
}
