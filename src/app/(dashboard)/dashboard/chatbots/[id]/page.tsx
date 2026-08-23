import { ChatbotConfigPage } from "@/components/dashboard/chatbot-config-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ChatbotConfigPage id={id} />;
}
