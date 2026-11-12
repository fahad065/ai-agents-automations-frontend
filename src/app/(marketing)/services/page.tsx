import { Suspense } from "react";
import type { Metadata } from "next";
import { ServicesListPage } from "@/components/marketing/services-list-page";

export const metadata: Metadata = {
  title: "Services",
  description: "Browse every LogicMate service — AI agents, automations and chatbots for your business.",
  openGraph: {
    title: "Services — LogicMate",
    description: "AI agents, automations and chatbots, all in one place.",
    url: "https://www.logicmate.io/services",
  },
};

// Suspense: ServicesListPage reads ?type= via useSearchParams, which needs a
// boundary on a statically prerendered page.
export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesListPage />
    </Suspense>
  );
}
