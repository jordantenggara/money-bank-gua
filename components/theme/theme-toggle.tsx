"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <>
          <span>🌙</span>
          <span>Dark Mode</span>
        </>
      ) : (
        <>
          <span>☀️</span>
          <span>Light Mode</span>
        </>
      )}
    </button>
  );
}
