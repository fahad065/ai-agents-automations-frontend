import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in to LogicMate",
  description: "Sign in to your LogicMate account to manage your AI automation agents.",
};

export default function LoginPage() {
  return <LoginForm />;
}