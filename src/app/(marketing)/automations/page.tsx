import type { Metadata } from "next";
import { AutomationsListPage } from "@/components/marketing/automations-list-page";

export const metadata: Metadata = {
  title: "Automations — NexAgent",
  description:
    "Browse pre-built AI automation pipelines. YouTube, social media, email, e-commerce, content repurposing and podcast — all ready to deploy.",
  openGraph: {
    title: "Automations — NexAgent",
    description: "Pre-built AI automation pipelines ready to deploy in minutes.",
  },
};

export default function AutomationsPage() {
  return <AutomationsListPage />;
}