import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata: Metadata = { title: "Admin Overview — NexAgent" };

export default function AdminPage() {
  return <AdminOverview />;
}