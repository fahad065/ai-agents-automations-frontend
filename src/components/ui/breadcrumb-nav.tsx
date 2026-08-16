"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function BreadcrumbNav({ items }: { items: BreadcrumbItem[] }) {
  const { colors, isDark } = useTheme();

  return (
    <nav style={{
      display: "flex", alignItems: "center", gap: "4px",
      fontSize: "13px", color: colors.textMuted,
    }}>
      <Link href="/" style={{
        display: "flex", alignItems: "center",
        color: colors.textMuted, textDecoration: "none",
        padding: "2px 4px", borderRadius: "5px",
        transition: "color 0.15s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
        onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
      >
        <Home size={13} />
      </Link>

      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <ChevronRight size={12} style={{ opacity: 0.4, flexShrink: 0 }} />
          {item.href ? (
            <Link href={item.href} style={{
              color: colors.textMuted, textDecoration: "none",
              transition: "color 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.textMuted)}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ color: colors.text, fontWeight: 500 }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
