import type { Metadata } from "next";
import { ChatbotsPage } from "@/components/marketing/chatbots-page";

export const metadata: Metadata = {
  title: "AI Chatbots",
  description: "Deploy AI chatbots that talk to your customers 24/7 — on your website, WhatsApp, and Instagram. Built for GCC businesses.",
  openGraph: {
    title: "AI Chatbots — LogicMate",
    description: "Customer-facing AI chatbots for your website, WhatsApp, and Instagram. No code, deploy in minutes.",
    url: "https://www.logicmate.io/chatbots",
  },
};

export default function Page() {
  return <ChatbotsPage />;
}
