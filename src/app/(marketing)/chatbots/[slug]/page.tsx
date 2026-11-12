import type { Metadata } from "next";
import { ChatbotDetailPage } from "@/components/marketing/chatbot-detail-page";
import { ensureServiceRoute, serviceMetadata } from "@/lib/service-route";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return serviceMetadata(slug, "Chatbot");
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  await ensureServiceRoute(slug, "chatbot");
  return <ChatbotDetailPage slug={slug} />;
}
