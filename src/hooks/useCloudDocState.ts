"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/cloudbase";
import { useAuth } from "@/hooks/useAuth";

interface LegacyDoc<T> {
  _id: string;
  value?: T;
}

/**
 * Like useLocalStorageState, but persists the whole value as a single CloudBase
 * document whose id IS the signed-in user's uid — so a given account+collection
 * maps to exactly one document, and every device reading/writing it necessarily
 * hits the same doc. Same [state, setState, hydrated] shape so callers can swap
 * useLocalStorageState -> useCloudDocState with no other changes.
 *
 * On first load after this change, it migrates any legacy random-_id docs (from
 * the old where()+add() implementation, which could create duplicates when the
 * same new account first logged in on two devices at once): it picks the
 * richest legacy doc, writes it to the deterministic doc(uid), and deletes the
 * old duplicates so they can never be read again.
 */
export function useCloudDocState<T>(collection: string, initialValue: T) {
  const { user } = useAuth();
  const [state, setStateRaw] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const ready = useRef(false);
  const initialValueRef = useRef(initialValue);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    ready.current = false;
    if (!user) return;

    const docRef = db.collection(collection).doc(user.uid);

    (async () => {
      try {
        const res = await docRef.get();
        const own = res.data?.[0] as { value?: T } | undefined;
        if (cancelled) return;

        if (own) {
          setStateRaw(own.value as T);
        } else {
          // No deterministic doc yet — migrate from legacy random-_id docs if any.
          const legacy = ((await db.collection(collection).where({ uid: user.uid }).get())
            .data ?? []) as LegacyDoc<T>[];
          if (cancelled) return;

          if (legacy.length > 0) {
            // Pick the "fullest" doc: longest serialized value (a user's real
            // config is generally longer than the default seed); ties -> later _id.
            const best = legacy.reduce((a, b) =>
              JSON.stringify(b.value ?? "").length >= JSON.stringify(a.value ?? "").length ? b : a
            );
            await docRef.set({ uid: user.uid, value: best.value });
            if (cancelled) return;
            setStateRaw(best.value as T);
            // Delete every legacy random-_id doc so it's never read again.
            for (const d of legacy) {
              db.collection(collection).doc(d._id).remove().catch(() => {});
            }
          } else {
            const seed = initialValueRef.current;
            await docRef.set({ uid: user.uid, value: seed });
            if (cancelled) return;
            setStateRaw(seed);
          }
        }
        ready.current = true;
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
        // Only persist once the deterministic doc is established, so a write can't
        // race ahead of the migration/seed step and create a stray record.
        if (ready.current && user) {
          db.collection(collection)
            .doc(user.uid)
            .set({ uid: user.uid, value: next })
            .catch(() => {
              // best-effort; next successful write reconciles
            });
        }
        return next;
      });
    },
    [collection, user]
  );

  return [state, setState, hydrated] as const;
}
