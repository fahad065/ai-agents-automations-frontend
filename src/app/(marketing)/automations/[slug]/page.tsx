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
    const res = await fetch(`${apiUrl}/modules/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { title: "Automation — LogicMate" };
    const automation = await res.json();
    return {
      title: `${automation.name} — LogicMate`,
      description: automation.description,
      openGraph: {
        title: `${automation.name} — LogicMate`,
        description: automation.description,
      },
    };
  } catch {
    return { title: "Automation — LogicMate" };
  }
}

export default async function AutomationPage({ params }: Props) {
  const { slug } = await params;
  return <AutomationDetailPage slug={slug} />;
}