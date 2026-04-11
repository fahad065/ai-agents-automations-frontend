import type { Metadata } from "next";
import { AboutPage } from "@/components/marketing/about-page";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/cms/pages/about`, { next: { revalidate: 3600 } });
    const page = await res.json();
    return { title: page.metaTitle, description: page.metaDescription };
  } catch {
    return { title: "About — NexAgent" };
  }
}

export default function About() {
  return <AboutPage />;
}