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
