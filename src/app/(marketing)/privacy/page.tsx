import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
export const metadata: Metadata = { title: "Privacy Policy — LogicMate" };
export default function Privacy() { return <LegalPage slug="privacy" />; }