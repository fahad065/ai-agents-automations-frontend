import type { Metadata } from "next";
import { ProfilePage } from "@/components/dashboard/profile-page";

export const metadata: Metadata = {
  title: "Profile — LogicMate",
  description: "Your personal information and content preferences.",
};

export default function Page() {
  return <ProfilePage />;
}
