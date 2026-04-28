import type { Metadata } from "next";
import { FaqPage } from "@/components/marketing/faq-page";
export const metadata: Metadata = {
  title: "FAQ — LogicMate",
  description: "Frequently asked questions about LogicMate AI automation platform.",
};
export default function Faq() { return <FaqPage />; }