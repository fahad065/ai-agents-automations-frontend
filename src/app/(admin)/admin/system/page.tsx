import type { Metadata } from "next";
import { AdminSystem } from "@/components/admin/admin-system";

export const metadata: Metadata = { title: "System — Admin" };

export default function AdminSystemPage() {
  return <AdminSystem />;
}