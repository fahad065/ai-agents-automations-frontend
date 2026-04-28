import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing — NexAgent",
  description: "Simple, transparent pricing. Start with a 30-day free trial on any module.",
};

export default function Pricing() {
  return <PricingPage />;
}