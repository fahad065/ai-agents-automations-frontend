import type { Metadata } from "next";
import { SettingsPage } from "@/components/dashboard/settings-page";

export const metadata: Metadata = {
  title: "Settings — LogicMate",
  description: "Manage your account settings and preferences.",
};

export default function SettingsRoute() {
  return <SettingsPage />;
}