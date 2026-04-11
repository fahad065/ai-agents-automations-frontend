import type { Metadata } from "next";
import { AgentsPage } from "@/components/dashboard/agents-page";

export const metadata: Metadata = { title: "My Agents — NexAgent" };

export default function DashboardAgentsPage() {
  return <AgentsPage />;
}