import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Bot, FileText, Key, CreditCard, Bell, Settings,
  Package, Users, BarChart3, BookOpen, Shield, Mail, User,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  adminOnly?: boolean;
  items?: NavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

// Full nav map — admin sees every section/item, a regular user only the
// ones without adminOnly. Settings is itself a NavGroup (item.items) so it
// renders as a collapsible sub-nav in the sidebar, matching the rest of the
// group styling instead of being a flat page link.
export const navSections: NavSection[] = [
  {
    label: "Dashboard",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "My Modules", url: "/dashboard/modules", icon: Package },
      { title: "Chatbots", url: "/dashboard/chatbots", icon: Bot },
      { title: "Pipeline Logs", url: "/dashboard/pipeline-logs", icon: FileText },
      { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
    ],
  },
  {
    label: "Apps",
    items: [
      { title: "API Keys", url: "/dashboard/api-keys", icon: Key },
    ],
  },
  {
    label: "Billing",
    items: [
      { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
      { title: "Payments", url: "/dashboard/payments", icon: CreditCard, adminOnly: true },
      { title: "Subscriptions", url: "/dashboard/subscriptions", icon: BarChart3, adminOnly: true },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Industries", url: "/dashboard/industries", icon: Package, adminOnly: true },
      { title: "Modules", url: "/dashboard/cms-modules", icon: Bot, adminOnly: true },
      { title: "Users", url: "/dashboard/users", icon: Users, adminOnly: true },
      { title: "Content (CMS)", url: "/dashboard/cms", icon: BookOpen, adminOnly: true },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings,
        items: [
          { title: "Notifications", url: "/dashboard/settings?tab=notifications", icon: Bell },
          { title: "Security", url: "/dashboard/settings?tab=security", icon: Shield },
          { title: "Email Sender", url: "/dashboard/settings?tab=email", icon: Mail, adminOnly: true },
        ],
      },
    ],
  },
];

export function getNavSections(isAdmin: boolean): NavSection[] {
  return navSections
    .map((section) => ({
      label: section.label,
      items: section.items
        .filter((item) => !item.adminOnly || isAdmin)
        .map((item) =>
          item.items ? { ...item, items: item.items.filter((sub) => !sub.adminOnly || isAdmin) } : item
        ),
    }))
    .filter((section) => section.items.length > 0);
}
