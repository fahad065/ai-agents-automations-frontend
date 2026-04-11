import type { Metadata } from "next";
import { AutomationsClient } from "@/components/dashboard/automations-client";

export const metadata: Metadata = { title: "Automations — NexAgent" };

export default function AutomationsPage() {
  return <AutomationsClient />;
}