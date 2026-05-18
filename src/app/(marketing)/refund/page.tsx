import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = { 
    title: "Refund Policy — LogicMate" 
};

export default function Refund() { 
    return <LegalPage slug="refund" />; 
}