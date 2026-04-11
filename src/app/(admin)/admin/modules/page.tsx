import type { Metadata } from "next";
import { AdminModules } from "@/components/admin/admin-modules";

export const metadata: Metadata = { title: "Modules — Admin" };

export default function AdminModulesPage() {
  return <AdminModules />;
}