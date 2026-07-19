import { useState, useEffect, useRef } from "react";

/**
 * Like useState, but persists the value to localStorage under `key` and
 * rehydrates from it on mount — so page refreshes don't lose it.
 * Falls back to `defaultValue` when nothing is stored or JSON.parse fails.
 */
export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored != null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(value));
    } catch {
      /* storage unavailable/full — silently skip persistence */
    }
  }, [value]);

  return [value, setValue] as const;
}

export default useLocalStorageState;
