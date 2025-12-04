"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type ThemeName = "easyfarm" | "corporate" | "agro" | "premium";
type Mode = "light" | "dark";

type ThemeContextType = {
  theme: ThemeName;
  mode: Mode;
  setTheme: (theme: ThemeName) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = "easyfarm_theme";
const MODE_KEY = "easyfarm_mode";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("easyfarm");
  const [mode, setModeState] = useState<Mode>("light");

  // carregar preferências salvas / sistema
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTheme = localStorage.getItem(THEME_KEY) as ThemeName | null;
    const storedMode = localStorage.getItem(MODE_KEY) as Mode | null;

    let initialTheme: ThemeName = storedTheme || "easyfarm";
    let initialMode: Mode = storedMode || "light";

    // se não tiver nada salvo, usa preferência do sistema p/ modo
    if (!storedMode) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      initialMode = prefersDark ? "dark" : "light";
    }

    applyTheme(initialTheme, initialMode);
    setThemeState(initialTheme);
    setModeState(initialMode);
  }, []);

  function applyTheme(nextTheme: ThemeName, nextMode: Mode) {
    if (typeof document === "undefined") return;

    const root = document.documentElement; // <html>

    // classe dark / light
    if (nextMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // data-theme para os 4 temas
    root.setAttribute("data-theme", nextTheme);
  }

  function setTheme(next: ThemeName) {
    setThemeState(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next, mode);
  }

  function toggleMode() {
    const nextMode: Mode = mode === "light" ? "dark" : "light";
    setModeState(nextMode);
    localStorage.setItem(MODE_KEY, nextMode);
    applyTheme(theme, nextMode);
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeEasyFarm() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeEasyFarm deve ser usado dentro de ThemeProvider");
  return ctx;
}
