// src/hooks/use-theme.ts
import { useThemeStore } from "@/store/theme.store";

export function useTheme() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "#080808" : "#ffffff",
    bgSecondary: isDark ? "#111" : "#f5f5f7",
    bgCard: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
    bgCardHover: isDark ? "rgba(255,255,255,0.06)" : "#f9f9fb",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)",
    borderStrong: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.18)",
    text: isDark ? "#ffffff" : "#0a0a0a",
    textMuted: isDark ? "#666" : "#6b7280",
    textSubtle: isDark ? "#333" : "#9ca3af",
    brand: "#7c3aed",
    brandLight: "#a78bfa",
    navBg: isDark ? "rgba(8,8,8,0.85)" : "rgba(255,255,255,0.85)",
    shadow: isDark
      ? "0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)"
      : "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
    shadowCard: isDark
      ? "0 4px 24px rgba(0,0,0,0.4)"
      : "0 4px 24px rgba(0,0,0,0.06)",
  };

  return { theme, isDark, toggleTheme, colors };
}