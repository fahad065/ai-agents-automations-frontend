import { useThemeStore } from "@/store/theme.store";

export function useTheme() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "#080808" : "#fafafa",
    bgSecondary: isDark ? "#111" : "#f0f0f0",
    bgCard: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
    bgCardHover: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    border: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    borderStrong: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
    text: isDark ? "#ffffff" : "#111111",
    textMuted: isDark ? "#666" : "#888",
    textSubtle: isDark ? "#333" : "#ccc",
    brand: "#7c3aed",
    brandLight: "#a78bfa",
    navBg: isDark ? "rgba(8,8,8,0.85)" : "rgba(250,250,250,0.85)",
  };

  return { theme, isDark, toggleTheme, colors };
}