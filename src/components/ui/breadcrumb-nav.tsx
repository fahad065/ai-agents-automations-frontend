"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-[13px] text-muted-foreground">
      <Link href="/" className="flex items-center rounded-[5px] px-1 py-0.5 text-muted-foreground transition-colors hover:text-foreground">
        <Home size={13} />
      </Link>

      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight size={12} className="shrink-0 opacity-40" />
          {item.href ? (
            <Link href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
