import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'darkMode';

const getInitialDark = (): boolean => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'true' || stored === 'false') return stored === 'true';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
};

const applyToDocument = (dark: boolean) => {
  document.documentElement.classList.toggle('dark', dark);
  // Sync Safari / PWA browser chrome color with the app theme
  updateThemeColorMeta(dark);
};

const updateThemeColorMeta = (dark: boolean) => {
  // Update all theme-color meta tags (we have two: one per color scheme)
  // The "no media" or "light" one is the active programmatic one for PWA chrome
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  metas.forEach((meta) => {
    const media = meta.getAttribute("media") || "";
    if (media.includes("dark")) {
      meta.setAttribute("content", "#0d0d0d");
    } else {
      // light / no media — update to match current mode
      meta.setAttribute("content", dark ? "#0d0d0d" : "#ffffff");
    }
  });
};

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDark);

  // Apply on mount
  useEffect(() => {
    applyToDocument(isDarkMode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist + apply whenever local state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isDarkMode ? 'true' : 'false');
    applyToDocument(isDarkMode);
  }, [isDarkMode]);

  // ── MutationObserver: re-sync when ANY code changes html.dark ──────────────
  // This keeps all useDarkMode() instances in the same tab in sync regardless
  // of which component triggered the change.
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const domDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(prev => (prev === domDark ? prev : domDark));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // ── Cross-tab sync via storage events ─────────────────────────────────────
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue === null) return;
      const next = e.newValue === 'true';
      setIsDarkMode(next);
      applyToDocument(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
      applyToDocument(next);
      return next;
    });
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value);
    localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
    applyToDocument(value);
  }, []);

  return { isDarkMode, toggleDarkMode, setDarkMode };
};
