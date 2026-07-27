"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { app, db } from "@/lib/cloudbase";
import { useAuth } from "@/hooks/useAuth";
import type {
  ActiveOrder,
  ActiveOrderMutation,
  ActiveOrderMutationResult,
} from "@/types/timerpro-pos";

interface ActiveOrdersDocument {
  value?: ActiveOrder[];
}

function readOrders(data: unknown): ActiveOrder[] | null {
  const records = Array.isArray(data) ? data : [];
  const value = (records[0] as ActiveOrdersDocument | undefined)?.value;
  return Array.isArray(value) ? value : null;
}

function readResult(result: unknown): ActiveOrderMutationResult {
  if (!result || typeof result !== "object") throw new Error("订单同步失败");
  const response = result as ActiveOrderMutationResult;
  if (!Array.isArray(response.orders)) throw new Error(response.message ?? "订单同步失败");
  return response;
}

/**
 * Active orders are the only frequently-mutated shared state. Every mutation is
 * serialized by the CloudBase function; this hook only reads and subscribes.
 */
export function useActiveOrders(initialValue: ActiveOrder[]) {
  const { user } = useAuth();
  const [orders, setOrders] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const initialValueRef = useRef(initialValue);

  const refresh = useCallback(async () => {
    if (!user) return;
    const docRef = db.collection("active_orders").doc(user.uid);
    const stored = readOrders((await docRef.get()).data);
    if (stored) {
      setOrders(stored);
      return;
    }

    const response = await app.callFunction({
      name: "mutate-active-orders",
      data: { type: "bootstrap", orders: initialValueRef.current } satisfies ActiveOrderMutation,
      parse: true,
    });
    setOrders(readResult(response.result).orders);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    if (!user) return;

    const sync = async () => {
      try {
        await refresh();
      } catch {
        // Keep the last known snapshot. A later real-time event will retry it.
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };
    void sync();

    const listener = db.collection("active_orders").where({ uid: user.uid }).watch({
      onChange: () => void sync(),
      onError: () => {},
    });

    return () => {
      cancelled = true;
      listener.close();
    };
  }, [refresh, user]);

  const mutate = useCallback(
    async (mutation: ActiveOrderMutation) => {
      if (!hydrated || !user) throw new Error("订单仍在同步，请稍候");
      const response = await app.callFunction({
        name: "mutate-active-orders",
        data: mutation,
        parse: true,
      });
      const result = readResult(response.result);
      setOrders(result.orders);
      return result;
    },
    [hydrated, user]
  );

  return [orders, mutate, hydrated] as const;
}
