import type { Metadata } from "next";
import { AboutPage } from "@/components/marketing/about-page";

export const metadata: Metadata = {
  title: "About",
  description: "LogicMate is an AI automation platform built for businesses in the UAE, GCC and beyond. Automate content, leads and operations with AI agents.",
  openGraph: {
    title: "About — LogicMate",
    description: "AI automation platform built for the GCC and beyond. Deploy AI agents for YouTube, Instagram, WhatsApp and more.",
    url: "https://www.logicmate.io/about",
  },
};

export default function About() {
  return <AboutPage />;
}
