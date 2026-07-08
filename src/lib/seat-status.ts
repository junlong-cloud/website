import type { ActiveOrder } from "@/types/timerpro-pos";

export type SeatStatus = "free" | "active" | "paused" | "overtime" | "suspended";

/** Detailed per-seat status, matching the exact priority SeatCard uses for styling. */
export function getSeatStatus(order?: ActiveOrder): SeatStatus {
  if (!order) return "free";
  const overtime = order.countdown ? order.countdown.percent >= 100 : false;
  if (order.isSuspended) return "suspended";
  if (overtime) return "overtime";
  if (order.isPaused) return "paused";
  return "active";
}

export type SeatStatusBucket = "free" | "active" | "overtime";

/** Coarser 3-bucket grouping used by the status filter bar / dashboard: paused and suspended both count as "occupied". */
export function getSeatStatusBucket(status: SeatStatus): SeatStatusBucket {
  if (status === "free") return "free";
  if (status === "overtime") return "overtime";
  return "active";
}
