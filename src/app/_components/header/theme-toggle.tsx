"use client";

import { useEffect, useState } from "react";

interface ThemeToggleProps {
  /** Extra classes for the button (size/spacing tweaks per placement). */
  className?: string;
}

const STORAGE_KEY = "theme";

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  // Default is light; the inline script in the root layout adds `.dark` early
  // when the user previously chose dark, so we read the live class on mount.
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Ignore — private mode / blocked storage just means no persistence.
    }
  };

  // Until mounted we render the light (sun) glyph to match the server output
  // and avoid a hydration mismatch; it swaps instantly on mount if needed.
  const showMoon = mounted && isDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={showMoon ? "Включить светлую тему" : "Включить тёмную тему"}
      aria-pressed={showMoon}
      title={showMoon ? "Светлая тема" : "Тёмная тема"}
      className={`border-line-2 bg-surface text-ink-2 hover:bg-surface-2 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors ${className}`}
    >
      {showMoon ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
