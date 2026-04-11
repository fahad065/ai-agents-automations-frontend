import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
export const metadata: Metadata = { title: "Terms of Service — NexAgent" };
export default function Terms() { return <LegalPage slug="terms" />; }