"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { getNavSections } from "@/config/nav";
import { useAuthStore } from "@/store/auth.store";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandPalette } from "./command-palette-provider";

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const router = useRouter();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const sections = getNavSections(isAdmin);

  function go(url: string) {
    setOpen(false);
    router.push(url);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Search for a page..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {sections.map((section, index) => (
            <React.Fragment key={section.label}>
              <CommandGroup heading={section.label}>
                {section.items.map((item) =>
                  item.items ? (
                    item.items.map((sub) => (
                      <CommandItem key={sub.url} value={`${item.title} ${sub.title}`} onSelect={() => go(sub.url)}>
                        <sub.icon />
                        <span>{item.title} — {sub.title}</span>
                      </CommandItem>
                    ))
                  ) : (
                    <CommandItem key={item.url} value={item.title} onSelect={() => go(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </CommandItem>
                  )
                )}
              </CommandGroup>
              {index < sections.length - 1 ? <CommandSeparator /> : null}
            </React.Fragment>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
