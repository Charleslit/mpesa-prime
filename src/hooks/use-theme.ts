import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const THEME_KEY = "mpesa_theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        setThemeState(stored);
      }
    } catch {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const body = document.body;

    const applyDark = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark");
        body.classList.add("dark");
      } else {
        root.classList.remove("dark");
        body.classList.remove("dark");
      }
    };

    if (theme === "dark") {
      applyDark(true);
    } else if (theme === "light") {
      applyDark(false);
    } else {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyDark(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => applyDark(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [theme, mounted]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {}
  };

  return { theme, setTheme, isDark: theme === "dark" };
}
