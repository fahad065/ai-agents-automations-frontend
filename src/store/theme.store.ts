import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

// Light is the default while dark mode is toggle-less (navbar.tsx dropped
// the switch — see CLAUDE.md). toggleTheme() and the store itself are left
// fully intact so re-adding a switch later is a one-component change, not a
// rewire. Storage key bumped so anyone who'd previously toggled to dark
// doesn't get stuck there forever with no way back — everyone starts fresh
// at the new default.
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
        document.body.className = next;
      },
    }),
    { name: "kt-theme-v2" }
  )
);