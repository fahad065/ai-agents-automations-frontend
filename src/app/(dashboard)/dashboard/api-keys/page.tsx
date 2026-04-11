import type { Metadata } from "next";
import { ApiKeysPage } from "@/components/dashboard/api-keys-page";

export const metadata: Metadata = {
  title: "API Keys — NexAgent",
  description: "Manage your API keys securely.",
};

export default function ApiKeysRoute() {
  return <ApiKeysPage />;
}