import { useState, useCallback, useEffect } from "react";
import { flushSync } from "react-dom";
import { STORAGE_KEYS } from "../constants";

// ─────────────────────────────────────────────────────────────────────────────
// useDarkMode — Telegram-style circular theme transition
//
// HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────
// 1. User clicks the sun/moon pill toggle → toggleDarkMode(x, y) is called
//    with the exact pixel coordinates of the click.
//
// 2. We set two CSS custom properties on <html>:
//      --vt-x, --vt-y   → the click origin for the circle animation
//
// 3. We set data-theme-dir="to-dark" or "to-light" on <html> so CSS knows
//    which direction the transition is going:
//      to-dark  → small circle EXPANDS  from click point (covering screen)
//      to-light → large circle SHRINKS  to click point   (retreating)
//
// 4. document.startViewTransition(callback):
//      - Browser takes a BEFORE screenshot (old theme)
//      - We call flushSync(() => setIsDarkMode(next)) → React renders the new
//        theme synchronously inside the callback
//      - Browser takes an AFTER screenshot (new theme)
//      - CSS ::view-transition-new / ::view-transition-old animations play
//
// 5. flushSync is CRITICAL — without it React batches the state update and the
//    browser captures identical before/after snapshots → no animation visible.
//
// WHERE THE CSS LIVES
//   src/index.css  — search for "Telegram-style circular theme reveal"
//   The keyframes @theme-circle-expand and @theme-circle-shrink are defined there.
//
// TO CHANGE ANIMATION SPEED
//   In src/index.css, change the duration in these two rules:
//     html[data-theme-dir="to-dark"]::view-transition-new(root)  { animation-duration: 750ms }
//     html[data-theme-dir="to-light"]::view-transition-old(root) { animation-duration: 750ms }
//   Common values: 500ms (fast) | 750ms (default) | 1000ms (slow) | 1500ms (very slow)
// ─────────────────────────────────────────────────────────────────────────────

interface UseDarkModeReturn {
  isDarkMode: boolean;
  toggleDarkMode: (x: number, y: number) => void;
}

export const useDarkMode = (): UseDarkModeReturn => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (stored !== null) return stored === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });

  // Keep <html class="dark"> in sync with state on first mount
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = useCallback((x: number, y: number) => {

    // flushSync forces React to render the new theme synchronously so the
    // browser View Transitions API captures a real before/after diff.
    const applyToggle = () => {
      flushSync(() => {
        setIsDarkMode(prev => {
          const next = !prev;
          document.documentElement.classList.toggle("dark", next);
          try { localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(next)); } catch {}
          return next;
        });
      });
    };

    // ── View Transitions API (Chrome / Edge 111+) ─────────────────────────
    if ("startViewTransition" in document) {
      // Store click origin — used by the CSS circle animation
      document.documentElement.style.setProperty("--vt-x", `${x}px`);
      document.documentElement.style.setProperty("--vt-y", `${y}px`);

      // Direction flag: CSS reads this to choose expand vs shrink animation
      const nextIsDark = !isDarkMode;
      document.documentElement.setAttribute(
        "data-theme-dir",
        nextIsDark ? "to-dark" : "to-light"
      );

      (document as any).startViewTransition(applyToggle);
      return;
    }

    // ── Fallback: smooth CSS crossfade (Firefox / older browsers) ─────────
    document.documentElement.classList.add("theme-switching");
    applyToggle();
    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-switching");
    }, 420);

  }, [isDarkMode]);

  return { isDarkMode, toggleDarkMode };
};
