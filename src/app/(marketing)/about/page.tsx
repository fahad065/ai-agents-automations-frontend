// import type { Metadata } from "next";
// import { AboutPage } from "@/components/marketing/about-page";

// export async function generateMetadata(): Promise<Metadata> {
//   try {
//     const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
//     const res = await fetch(`${apiUrl}/cms/pages/about`, { next: { revalidate: 3600 } });
//     const page = await res.json();
//     return { title: page.metaTitle, description: page.metaDescription };
//   } catch {
//     return { title: "About — LogicMate" };
//   }
// }

// export default function About() {
//   return <AboutPage />;
// }




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