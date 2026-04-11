import type { Metadata } from "next";
import { BlogListPage } from "@/components/marketing/blog-list-page";
export const metadata: Metadata = {
  title: "Blog — NexAgent",
  description: "Tutorials, product updates, case studies and tips from the NexAgent team.",
};
export default function Blog() { return <BlogListPage />; }