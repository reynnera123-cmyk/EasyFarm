"use client";

import { useThemeEasyFarm } from "@/lib/theme";

export function ThemeModeToggle() {
  const { mode, toggleMode } = useThemeEasyFarm();

  return (
    <button
      type="button"
      onClick={toggleMode}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-(--color-border) bg-(--color-surface) shadow-sm text-sm"
      title={mode === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
    >
      {mode === "light" ? "🌙" : "☀️"}
    </button>
  );
}
