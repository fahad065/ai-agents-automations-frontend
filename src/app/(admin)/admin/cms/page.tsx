import type { Metadata } from "next";
import { AdminCmsPage } from "@/components/admin/admin-cms";
export const metadata: Metadata = { title: "CMS — Admin" };
export default function CmsAdmin() { return <AdminCmsPage />; }