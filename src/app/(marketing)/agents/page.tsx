import type { Metadata } from "next";
import { AgentsListPage } from "@/components/marketing/agents-list-page";

export const metadata: Metadata = {
  title: "AI Agents — NexAgent",
  description:
    "Browse our marketplace of AI agents. Deploy specialised agents for YouTube, fitness, marketing, education and more.",
  openGraph: {
    title: "AI Agents — NexAgent",
    description: "Deploy AI agents that automate your entire business.",
  },
};

export default function AgentsPage() {
  return <AgentsListPage />;
}