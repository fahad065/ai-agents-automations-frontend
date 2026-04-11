"use client";

import dynamic from "next/dynamic";

const DashboardAutomationsPage = dynamic(
  () => import("@/components/dashboard/dashboard-automations").then(
    (m) => ({ default: m.DashboardAutomationsPage })
  ),
  {
    ssr: false,
    loading: () => null,
  }
);

export function AutomationsClient() {
  return <DashboardAutomationsPage />;
}