import { Bot, MessageCircle, Zap, type LucideIcon } from "lucide-react";

// Single source for how the three service types are named, described and
// linked across the marketing site (navbar menu, footer, /services page,
// breadcrumbs). URL scheme:
//   /services                      — every service, filterable by type
//   /agents | /automations | /chatbots — one landing page per type
//   /agents/<slug> (etc.)          — the canonical detail page
// /services/<slug> permanently redirects to the canonical detail URL.

export type ServiceTypeKey = "agent" | "automation" | "chatbot";

export interface ServiceTypeMeta {
  key: ServiceTypeKey;
  label: string;
  label_ar: string;
  description: string;
  description_ar: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export const SERVICE_TYPES: ServiceTypeMeta[] = [
  {
    key: "agent",
    label: "AI Agents",
    label_ar: "الوكلاء الذكيون",
    description: "Create content and work for you on autopilot",
    description_ar: "يصنعون المحتوى ويشتغلون عنك تلقائياً",
    href: "/agents",
    icon: Bot,
    color: "#7c3aed",
  },
  {
    key: "automation",
    label: "Automations",
    label_ar: "الأتمتة",
    description: "Connect your tools and remove repetitive tasks",
    description_ar: "اربط أدواتك وتخلّص من المهام المتكررة",
    href: "/automations",
    icon: Zap,
    color: "#f59e0b",
  },
  {
    key: "chatbot",
    label: "Chatbots",
    label_ar: "الشات بوت",
    description: "Answer customers 24/7 on web, WhatsApp and Instagram",
    description_ar: "رد على عملائك 24/7 على الموقع وواتساب وإنستغرام",
    href: "/chatbots",
    icon: MessageCircle,
    color: "#06b6d4",
  },
];

export const SERVICE_TYPE_BY_KEY = Object.fromEntries(
  SERVICE_TYPES.map((t) => [t.key, t]),
) as Record<ServiceTypeKey, ServiceTypeMeta>;

export const ALL_SERVICES_HREF = "/services";

export function serviceDetailHref(type: string, slug: string): string {
  const meta = SERVICE_TYPE_BY_KEY[type as ServiceTypeKey];
  return meta ? `${meta.href}/${slug}` : `${ALL_SERVICES_HREF}/${slug}`;
}

// Paths that belong to the "Services" section, for the navbar active state.
export function isServicesPath(pathname: string): boolean {
  return [ALL_SERVICES_HREF, ...SERVICE_TYPES.map((t) => t.href)].some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}
