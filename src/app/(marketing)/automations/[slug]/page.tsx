import type { Metadata } from "next";
import { AutomationDetailPage } from "@/components/marketing/automation-detail-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/automations/templates/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { title: "Automation — NexAgent" };
    const automation = await res.json();
    return {
      title: `${automation.name} — NexAgent`,
      description: automation.description,
      openGraph: {
        title: `${automation.name} — NexAgent`,
        description: automation.description,
      },
    };
  } catch {
    return { title: "Automation — NexAgent" };
  }
}

export default async function AutomationPage({ params }: Props) {
  const { slug } = await params;
  return <AutomationDetailPage slug={slug} />;
}