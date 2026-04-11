import type { Metadata } from "next";
import { AdminPipelines } from "@/components/admin/admin-pipelines";

export const metadata: Metadata = { title: "Pipeline Logs — Admin" };

export default function AdminPipelinesPage() {
  return <AdminPipelines />;
}