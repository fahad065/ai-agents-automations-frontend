"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";

import { useCommandPalette } from "./command-palette-provider";
import { getNavSections, type NavItem } from "@/config/nav";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

function urlMatches(url: string, pathname: string, tab: string | null) {
  const [path, query] = url.split("?");
  if (path !== pathname) return false;
  if (!query) return !tab; // plain /dashboard/settings only "active" with no ?tab
  const urlTab = new URLSearchParams(query).get("tab");
  return urlTab === tab;
}

function NavLeaf({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.title} isActive={isActive} render={<Link href={item.url} />}>
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
      {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  );
}

function NavGroup({ item, pathname, tab }: { item: NavItem; pathname: string; tab: string | null }) {
  const isChildActive = item.items!.some((sub) => urlMatches(sub.url, pathname, tab));
  const [open, setOpen] = React.useState(isChildActive);

  React.useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton tooltip={item.title} isActive={isChildActive} className="group/collapsible">
              <item.icon />
              <span>{item.title}</span>
              <ChevronRight className="ml-auto transition-transform group-data-[panel-open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items!.map((sub) => (
              <SidebarMenuSubItem key={sub.url}>
                <SidebarMenuSubButton isActive={urlMatches(sub.url, pathname, tab)} render={<Link href={sub.url} />}>
                  <span>{sub.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { setOpen } = useCommandPalette();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const sections = getNavSections(isAdmin);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-violet-800 text-white">
                <img src="/icon.svg" width={20} height={20} className="rounded" alt="" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">LogicMate</span>
                {isAdmin && (
                  <span className="truncate text-[10px] font-semibold tracking-wide text-sidebar-foreground/60">
                    ADMIN
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="group-data-[collapsible=icon]:hidden mt-1 w-full justify-start gap-2 bg-sidebar text-sidebar-foreground/70 hover:text-sidebar-foreground"
        >
          <Search className="size-4" />
          Search...
          <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Search"
          className="hidden group-data-[collapsible=icon]:flex"
        >
          <Search className="size-4" />
        </Button>
      </SidebarHeader>

      <SidebarContent>
        {sections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) =>
                  item.items ? (
                    <NavGroup key={item.url} item={item} pathname={pathname} tab={tab} />
                  ) : (
                    <NavLeaf key={item.url} item={item} isActive={urlMatches(item.url, pathname, tab)} />
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
