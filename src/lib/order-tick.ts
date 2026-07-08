import type { ActiveOrder, ShopConfig } from "@/types/timerpro-pos";
import type { PublicSeatStatus } from "@/types/timerpro-seats";

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}小时${minutes}分${seconds}秒`;
  if (minutes > 0) return `${minutes}分${seconds}秒`;
  return `${seconds}秒`;
}

/**
 * Recomputes live-ticking display fields (elapsed time, countdown, pay_later cost)
 * for one order without persisting anything. Callers keep the result in a local
 * (non-cloud-backed) render snapshot, ticked every second client-side — the
 * cloud-persisted ActiveOrder only stores the source fields (startTimestamp,
 * isPaused, pausedAccumMs, etc.), never these derived values, so a per-second
 * timer never triggers a per-second write to the database.
 */
export function tickOrder(order: ActiveOrder, now: number, shopConfig: ShopConfig): ActiveOrder {
  if (order.isSuspended) return order; // frozen once put on tab

  const pausedMs =
    (order.pausedAccumMs ?? 0) +
    (order.isPaused && order.pauseStartedAt ? now - order.pauseStartedAt : 0);
  const elapsedMs = Math.max(0, now - order.startTimestamp - pausedMs);
  const elapsedMinutes = elapsedMs / 60000;

  const next: ActiveOrder = { ...order, elapsedTime: formatDuration(elapsedMs) };

  if (order.mode === "pay_later") {
    next.estimatedCost = Math.round(elapsedMinutes * (shopConfig.price_per_hour / 60) * 10) / 10;
  }

  if (order.countdown) {
    const remainingMinutes = Math.round(order.countdown.totalMinutes - elapsedMinutes);
    const percent = Math.round((elapsedMinutes / order.countdown.totalMinutes) * 100);
    next.countdown = {
      ...order.countdown,
      remainingMinutes,
      percent,
      remainText: `${Math.abs(remainingMinutes)}分钟`,
    };
  }

  return next;
}

export function toPublicSeatStatus(order: ActiveOrder): PublicSeatStatus {
  return {
    seatId: order.seatId,
    seatLabel: order.seatLabel,
    modeText: order.modeText,
    startTimestamp: order.startTimestamp,
    isPaused: order.isPaused,
    pauseStartedAt: order.pauseStartedAt ?? null,
    pausedAccumMs: order.pausedAccumMs ?? 0,
    isSuspended: order.isSuspended,
    countdownTotalMinutes: order.countdown?.totalMinutes ?? null,
  };
}

/** Elapsed time + countdown percent for the customer-facing seat view — no cost involved, so unlike tickOrder this needs no ShopConfig. */
export function tickPublicSeatStatus(
  status: PublicSeatStatus,
  now: number
): { elapsedTime: string; countdownPercent: number | null } {
  if (status.isSuspended) return { elapsedTime: formatDuration(0), countdownPercent: null };

  const pausedMs =
    status.pausedAccumMs + (status.isPaused && status.pauseStartedAt ? now - status.pauseStartedAt : 0);
  const elapsedMs = Math.max(0, now - status.startTimestamp - pausedMs);
  const elapsedMinutes = elapsedMs / 60000;

  const countdownPercent =
    status.countdownTotalMinutes != null
      ? Math.round((elapsedMinutes / status.countdownTotalMinutes) * 100)
      : null;

  return { elapsedTime: formatDuration(elapsedMs), countdownPercent };
}
