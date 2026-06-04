import type { Metadata } from "next";
import { AutomationsListPage } from "@/components/marketing/automations-list-page";

export const metadata: Metadata = {
  title: "AI Automations",
  description: "Browse LogicMate's AI automations. Automate social media scheduling, email marketing, lead generation, content repurposing and more.",
  openGraph: {
    title: "AI Automations — LogicMate",
    description: "Workflow automations powered by AI. Social media, email marketing, lead generation and more.",
    url: "https://www.logicmate.io/automations",
  },
};

export default function AutomationsPage() {
  return <AutomationsListPage />;
}