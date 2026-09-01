import type { Metadata } from "next";
import { ChatbotDetailPage } from "@/components/marketing/chatbot-detail-page";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    const res = await fetch(`${apiUrl}/modules/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { title: "Chatbot — LogicMate" };
    const chatbot = await res.json();
    return {
      title: `${chatbot.name} — LogicMate`,
      description: chatbot.description,
      openGraph: {
        title: `${chatbot.name} — LogicMate`,
        description: chatbot.description,
      },
    };
  } catch {
    return { title: "Chatbot — LogicMate" };
  }
}

export default async function ChatbotTemplatePage({ params }: Props) {
  const { slug } = await params;
  return <ChatbotDetailPage slug={slug} />;
}
