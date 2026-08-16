import type { Metadata } from "next";
import { PricingPage } from "@/components/marketing/pricing-page";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for LogicMate AI agents and automations. Start with a 30-day free trial. No credit card required.",
  openGraph: {
    title: "Pricing — LogicMate",
    description: "30-day free trial on every module. Pay only for what you use. No credit card required.",
    url: "https://www.logicmate.io/pricing",
  },
};

export default function PricingRoute() {
  return <PricingPage />;
}