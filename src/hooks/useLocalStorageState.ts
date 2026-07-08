"use client";

import { useEffect, useState } from "react";

/**
 * Like useState, but persists to localStorage under `key` and rehydrates on mount.
 * Safe for Next.js SSR: localStorage is only touched inside effects (client-only).
 * Returns a `hydrated` flag so callers can defer logic that depends on the
 * real persisted value (e.g. one-time checks on mount) until after rehydration.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from the external localStorage API on mount; must run in an
    // effect since it's unavailable during SSR/first render.
    try {
      const raw = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState(JSON.parse(raw) as T);
    } catch {
      // ignore malformed/unavailable storage, keep initialValue
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage full/unavailable — fail silently, in-memory state still works
    }
  }, [key, state, hydrated]);

  return [state, setState, hydrated] as const;
}
