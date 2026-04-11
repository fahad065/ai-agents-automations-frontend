import type { Metadata } from "next";
import { DashboardAgentDetail } from "@/components/dashboard/agent-detail";

export const metadata: Metadata = { title: "Agent Detail — NexAgent" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params;
  return <DashboardAgentDetail agentId={id} />;
}