import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
export const metadata: Metadata = { title: "Cookie Policy — NexAgent" };
export default function Cookies() { return <LegalPage slug="cookies" />; }