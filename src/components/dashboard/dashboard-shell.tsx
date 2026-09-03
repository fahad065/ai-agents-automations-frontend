"use client";

import { Suspense } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { CommandPaletteProvider } from "./command-palette-provider";
import { CommandPalette } from "./command-palette";
import { VerifyEmailBanner } from "./verify-email-banner";
import { ProfileCompletionBanner } from "./profile-completion-banner";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <SidebarProvider>
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>
        <SidebarInset>
          <SiteHeader />
          <VerifyEmailBanner />
          <ProfileCompletionBanner />
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
      <CommandPalette />
    </CommandPaletteProvider>
  );
}
