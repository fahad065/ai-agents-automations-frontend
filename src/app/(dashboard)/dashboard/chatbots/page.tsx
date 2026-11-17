"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

// Old list URL. Customers manage chatbots on My Services; admins see every
// client's chatbot on Customer Services. Each bot's settings page is still
// /dashboard/chatbots/[id].
export default function Page() {
  const router = useRouter();
  const { user } = useAuthStore();
  useEffect(() => {
    if (user) router.replace(user.role === "admin" ? "/dashboard/customer-services" : "/dashboard/modules");
  }, [user, router]);
  return null;
}
