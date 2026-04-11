import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/overview";

export const metadata: Metadata = {
  title: "Dashboard — NexAgent",
  description: "Manage your AI automation agents and monitor pipeline runs.",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}