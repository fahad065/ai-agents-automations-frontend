import type { Metadata } from "next";
import { FaqPage } from "@/components/marketing/faq-page";
export const metadata: Metadata = {
  title: "FAQ — NexAgent",
  description: "Frequently asked questions about NexAgent AI automation platform.",
};
export default function Faq() { return <FaqPage />; }