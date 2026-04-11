import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Sign up for NexAgent and start automating your business with AI agents.",
};

export default function SignupPage() {
  return <SignupForm />;
}