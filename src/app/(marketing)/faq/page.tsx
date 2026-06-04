import type { Metadata } from "next";
import { FaqPage } from "@/components/marketing/faq-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about LogicMate AI automation platform. Learn about pricing, API keys, pipelines and more.",
  openGraph: {
    title: "FAQ — LogicMate",
    description: "Answers to common questions about LogicMate.",
    url: "https://www.logicmate.io/faq",
  },
};

export default function Faq() { 
  return <FaqPage />; 
}