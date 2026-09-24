"use client";
import { useEffect, useState } from "react";
import { THEME_KEY } from "@/lib/theme";

// Light, dark, or whatever the device is set to. The choice is kept on this
// device and applied as <html data-theme>, which app/globals.css reads; with no
// choice the stylesheet follows the device, as it did before this existed.

type Theme = "system" | "light" | "dark";

const OPTIONS: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  { value: "light", label: "Light", icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> },
  { value: "system", label: "Same as this device", icon: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></> },
  { value: "dark", label: "Dark", icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /> },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const saved = document.documentElement.dataset.theme;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    const apply = () => {
      if (next === "system") delete document.documentElement.dataset.theme;
      else document.documentElement.dataset.theme = next;
    };
    // Cross-fade rather than cut: a whole screen jumping from white to near
    // black in one frame is a flash, and a sensitivity for some readers.
    // A fade is the gentle form, so it stays under reduced motion too.
    if (document.startViewTransition) document.startViewTransition(apply);
    else apply();
    try {
      if (next === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {
      // Not saved; it still applies until the page is closed.
    }
  }

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Colour theme">
      {OPTIONS.map((option) => (
        <button key={option.value} type="button" role="radio" aria-checked={theme === option.value}
          aria-label={option.label} title={option.label} onClick={() => choose(option.value)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {option.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
