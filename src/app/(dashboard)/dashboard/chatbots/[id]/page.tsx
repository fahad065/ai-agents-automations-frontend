import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const ChatbotConfigPage = dynamic(
  () => import("@/components/dashboard/chatbot-config-page").then((m) => m.ChatbotConfigPage),
  {
    loading: () => (
      <div style={{ padding: "80px", textAlign: "center" }}>
        <Loader2 size={22} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
  }
);

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ChatbotConfigPage id={id} />;
}
