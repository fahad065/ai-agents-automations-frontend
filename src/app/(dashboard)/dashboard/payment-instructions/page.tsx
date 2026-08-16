import type { Metadata } from "next";
import { PaymentInstructionsPage } from "@/components/dashboard/payment-instructions-page";

export const metadata: Metadata = {
  title: "Payment Instructions",
  description: "Subscribe to LogicMate AI agents via bank transfer. View payment instructions and activate your account.",
};

export default function PaymentInstructionsRoute() {
  return <PaymentInstructionsPage />;
}