import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, FileText, Key, CreditCard, Bell, Settings,
  Package, Users, BookOpen, Shield, Mail, Activity, History, Store, LayoutGrid, Wallet,
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
// ones without adminOnly. Customers see Overview / Services / Account /
// Settings; admins also get Administration (everything about other
// customers and the catalog). Each page's <h1> matches its label here.
// Settings is itself a NavGroup (item.items) so it renders as a
// collapsible sub-nav.
export const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Services",
    items: [
      { title: "My Services", url: "/dashboard/modules", icon: Package },
      { title: "Browse Services", url: "/dashboard/services", icon: Store },
      { title: "Run History", url: "/dashboard/pipeline-logs", icon: FileText },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
      { title: "API Keys", url: "/dashboard/api-keys", icon: Key },
      { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
      { title: "Activity Logs", url: "/dashboard/activity-logs", icon: History },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Users", url: "/dashboard/users", icon: Users, adminOnly: true },
      { title: "Customer Services", url: "/dashboard/customer-services", icon: Package, adminOnly: true },
      { title: "Service Catalog", url: "/dashboard/cms-modules", icon: LayoutGrid, adminOnly: true },
      { title: "Payments", url: "/dashboard/payments", icon: Wallet, adminOnly: true },
      { title: "Usage", url: "/dashboard/usage", icon: Activity, adminOnly: true },
      { title: "Website Content", url: "/dashboard/cms", icon: BookOpen, adminOnly: true },
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
          { title: "Notification Preferences", url: "/dashboard/settings?tab=notifications", icon: Bell },
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
