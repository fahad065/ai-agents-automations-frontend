import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/layout/providers";
import { Toaster } from "sonner";
import { KeepAlive } from "@/components/keep-alive";

// Replace your src/app/layout.tsx metadata export with this:

export const metadata: Metadata = {
  title: {
    default: "LogicMate — AI Automation Platform",
    template: "%s — LogicMate",
  },
  description:
    "Deploy AI agents that automate your content, leads, and operations. YouTube automation, Instagram Reels, WhatsApp lead generation and more.",
  keywords: [
    "AI automation", "AI agents", "YouTube automation",
    "Instagram Reels AI", "content automation", "GCC automation",
    "UAE AI platform", "LogicMate",
  ],
  authors: [{ name: "LogicMate" }],
  creator: "LogicMate",
  metadataBase: new URL("https://www.logicmate.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.logicmate.io",
    siteName: "LogicMate",
    title: "LogicMate — AI Automation Platform",
    description:
      "Deploy AI agents that automate your content, leads, and operations. 30-day free trial.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LogicMate — AI Automation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LogicMate — AI Automation Platform",
    description: "Deploy AI agents that automate your content, leads, and operations.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    shortcut: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster position="bottom-right" theme="dark" richColors closeButton />
        </Providers>
        <KeepAlive />
      </body>
    </html>
  );
}