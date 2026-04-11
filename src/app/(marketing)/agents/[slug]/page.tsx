import type { Metadata } from "next";
import { AgentDetailPage } from "@/components/marketing/agent-detail-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/agents/templates/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { title: "Agent — NexAgent" };
    const agent = await res.json();
    return {
      title: `${agent.name} — NexAgent`,
      description: agent.description,
      openGraph: {
        title: `${agent.name} — NexAgent`,
        description: agent.description,
      },
    };
  } catch {
    return { title: "Agent — NexAgent" };
  }
}

export default async function AgentPage({ params }: Props) {
  const { slug } = await params;
  return <AgentDetailPage slug={slug} />;
}