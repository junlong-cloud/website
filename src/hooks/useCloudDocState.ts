"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/cloudbase";
import { useAuth } from "@/hooks/useAuth";

/**
 * Like useLocalStorageState, but persists the whole value as a single CloudBase
 * document scoped to the signed-in user (`where({ uid })`). Same [state, setState,
 * hydrated] shape so callers can swap useLocalStorageState -> useCloudDocState
 * with no other changes. One document per collection per user — setState always
 * overwrites the full document, there's no per-item CRUD.
 */
export function useCloudDocState<T>(collection: string, initialValue: T) {
  const { user } = useAuth();
  const [state, setStateRaw] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const docIdRef = useRef<string | null>(null);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    docIdRef.current = null;
    if (!user) return;

    (async () => {
      try {
        const res = await db.collection(collection).where({ uid: user.uid }).get();
        const existing = res.data?.[0] as { _id: string; value: T } | undefined;
        if (cancelled) return;
        if (existing) {
          docIdRef.current = existing._id;
          setStateRaw(existing.value);
        } else {
          const seed = initialValueRef.current;
          const addRes = await db.collection(collection).add({ uid: user.uid, value: seed });
          if (cancelled) return;
          docIdRef.current = addRes.id as string;
          setStateRaw(seed);
        }
      } catch {
        // network/permission error — keep the in-memory seed, UI still works locally
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [collection, user]);

  const setState = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setStateRaw((prev) => {
        const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater;
        if (docIdRef.current) {
          db.collection(collection)
            .doc(docIdRef.current)
            .update({ value: next })
            .catch(() => {
              // best-effort; next successful write will reconcile
            });
        }
        return next;
      });
    },
    [collection]
  );

  return [state, setState, hydrated] as const;
}
