import type { Metadata } from "next";
import { AgentsListPage } from "@/components/marketing/agents-list-page";

export const metadata: Metadata = {
  title: "AI Agents",
  description: "Browse LogicMate's AI agents. Automate YouTube, Instagram Reels, Arabic content, TikTok and more with AI-powered agents.",
  openGraph: {
    title: "AI Agents — LogicMate",
    description: "Deploy AI agents that automate your content creation. YouTube, Instagram, Arabic content and more.",
    url: "https://www.logicmate.io/agents",
  },
};

export default function AgentsPage() {
  return <AgentsListPage />;
}