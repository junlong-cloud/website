"use client";

import { useEffect, useState } from "react";
import { Clock, Loader2, Tag } from "lucide-react";
import { auth, db } from "@/lib/cloudbase";
import { tickPublicSeatStatus } from "@/lib/order-tick";
import type { PublicSeatStatus } from "@/types/timerpro-seats";

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "free"; seatId: string }
  | { phase: "occupied"; status: PublicSeatStatus };

/**
 * Public, read-only "how long has my seat been running" view — no login, no
 * cost shown. Reads shopUid/seatId from the URL's query string (?u=&s=) rather
 * than a Next.js dynamic route segment, so this page is a single static file
 * (works under `output: "export"` static hosting) that serves any seat.
 */
export function CustomerSeatView() {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const query = new URLSearchParams(window.location.search);
      const shopUid = query.get("u");
      const seatId = query.get("s");
      if (!shopUid || !seatId) {
        setState({ phase: "error", message: "链接无效，请重新扫码" });
        return;
      }
      try {
        if (!auth.currentUser) {
          const { error } = await auth.signInAnonymously();
          if (error) throw new Error(error.message);
        }
        const res = await db.collection("public_seat_status").where({ uid: shopUid }).get();
        if (cancelled) return;
        const doc = res.data?.[0] as { value?: PublicSeatStatus[] } | undefined;
        const found = doc?.value?.find((s) => s.seatId === seatId);
        setState(found ? { phase: "occupied", status: found } : { phase: "free", seatId });
      } catch (err) {
        if (cancelled) return;
        setState({ phase: "error", message: err instanceof Error ? err.message : "加载失败" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.phase !== "occupied") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [state.phase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-card rounded-xl shadow-sm p-6 text-center">
        {state.phase === "loading" && (
          <Loader2 className="size-6 animate-spin text-muted-foreground mx-auto" />
        )}

        {state.phase === "error" && (
          <p className="text-sm text-destructive">{state.message}</p>
        )}

        {state.phase === "free" && (
          <>
            <h1 className="text-lg font-semibold text-foreground mb-1">座位 {state.seatId}</h1>
            <p className="text-sm text-muted-foreground">当前空闲，暂无进行中的计时</p>
          </>
        )}

        {state.phase === "occupied" &&
          (() => {
            const { elapsedTime } = tickPublicSeatStatus(state.status, now);
            return (
              <>
                <h1 className="text-lg font-semibold text-foreground mb-4">
                  座位 {state.status.seatLabel}
                </h1>
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-2">
                  <Tag className="size-3.5" />
                  {state.status.modeText}
                </div>
                <div className="flex items-center justify-center gap-2 text-3xl font-bold tabular-nums text-primary">
                  <Clock className="size-6" />
                  {elapsedTime}
                </div>
                {state.status.isPaused && (
                  <p className="mt-2 text-xs font-medium text-amber-800">计时已暂停</p>
                )}
              </>
            );
          })()}
      </div>
    </div>
  );
}
