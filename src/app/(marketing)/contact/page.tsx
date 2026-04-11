import type { Metadata } from "next";
import { ContactPage } from "@/components/marketing/contact-page";
export const metadata: Metadata = { title: "Contact — NexAgent" };
export default function Contact() { return <ContactPage />; }