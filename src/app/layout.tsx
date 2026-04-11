import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "NexAgent — AI Automation Platform for Businesses",
    template: "%s | NexAgent",
  },
  description:
    "Deploy AI agents that automate your YouTube channel, social media, email marketing, e-commerce and more. No technical knowledge required. Start free.",
  keywords: [
    "AI automation", "AI agents", "YouTube automation",
    "social media automation", "business automation",
    "content automation", "AI marketing", "no-code automation",
  ],
  authors: [{ name: "NexAgent" }],
  creator: "NexAgent",
  metadataBase: new URL("https://nexagent.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nexagent.ai",
    title: "NexAgent — AI Automation Platform",
    description: "Deploy AI agents that automate your entire business. YouTube, social media, email and more.",
    siteName: "NexAgent",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexAgent — AI Automation Platform",
    description: "Deploy AI agents that automate your entire business.",
    creator: "@nexagent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}