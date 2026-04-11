"use client";

import { useTheme } from "@/hooks/use-theme";

export function AuthDivider({ label = "or" }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <div style={{
      display: "flex", alignItems: "center",
      gap: "12px", margin: "20px 0",
    }}>
      <div style={{ flex: 1, height: "1px", background: colors.border }} />
      <span style={{ fontSize: "12px", color: colors.textMuted }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: colors.border }} />
    </div>
  );
}