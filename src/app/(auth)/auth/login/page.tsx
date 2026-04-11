import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in to NexAgent",
  description: "Sign in to your NexAgent account to manage your AI automation agents.",
};

export default function LoginPage() {
  return <LoginForm />;
}