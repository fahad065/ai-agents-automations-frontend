"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  useSidebar,
} from "@/components/ui/sidebar";

// Matches on pathname only — deliberately ignores each item's own ?tab=
// query string. Reading the live query string here would need
// useSearchParams(), which forces a Suspense boundary around the sidebar;
// since the sidebar is part of the persistent dashboard layout (not a
// single page), that boundary's fallback (rendered into the statically
// prerendered HTML) never matches what the client immediately renders once
// real search params are available — a real hydration mismatch that was
// severe enough to swallow sidebar link clicks entirely. Losing exact
// per-tab sub-item highlighting is a fair trade for that.
function urlMatches(url: string, pathname: string) {
  const [path] = url.split("?");
  return path === pathname;
}

function NavLeaf({ item, isActive, onNavigate }: { item: NavItem; isActive: boolean; onNavigate: () => void }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.title} isActive={isActive} render={<Link href={item.url} onClick={onNavigate} />}>
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
      {item.badge ? <SidebarMenuBadge>{item.badge}</SidebarMenuBadge> : null}
    </SidebarMenuItem>
  );
}

function NavGroup({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate: () => void }) {
  const isChildActive = urlMatches(item.url, pathname);
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
                {/* Sub-items share one pathname (e.g. every Settings tab is
                    /dashboard/settings?tab=...) — no per-tab active state
                    without reading the live query string, which needs
                    useSearchParams() and the hydration issues that comes
                    with in this persistent-layout sidebar (see urlMatches). */}
                <SidebarMenuSubButton render={<Link href={sub.url} onClick={onNavigate} />}>
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
  const { setOpen } = useCommandPalette();
  const { setOpenMobile } = useSidebar();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const sections = getNavSections(isAdmin);
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" onClick={closeMobile} />}>
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
                    <NavGroup key={item.url} item={item} pathname={pathname} onNavigate={closeMobile} />
                  ) : (
                    <NavLeaf
                      key={item.url}
                      item={item}
                      isActive={urlMatches(item.url, pathname)}
                      onNavigate={closeMobile}
                    />
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
