import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign in to NexAgent",
    template: "%s | NexAgent",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}