import type { Metadata } from "next";
import { ContactPage } from "@/components/marketing/contact-page";

export const metadata: Metadata = { 
    title: "Contact",
    description: "Get in touch with the LogicMate team. We're here to help with your AI automation needs.",
    openGraph: {
        title: "Contact — LogicMate",
        description: "Get in touch with the LogicMate team.",
        url: "https://www.logicmate.io/contact",
    },
};
export default function Contact() { 
    return <ContactPage />; 
}