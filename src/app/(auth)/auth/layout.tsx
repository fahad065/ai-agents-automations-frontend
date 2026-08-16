import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign in to LogicMate",
    template: "%s | LogicMate",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}