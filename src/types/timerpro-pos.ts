// Type definitions for the TimerPro cloud POS / timed-billing dashboard clone.

export type OrderMode =
  | "pay_later"
  | "fixed"
  | "group_buy"
  | "time_slot"
  | "unlimited"
  | "single_board"
  | "punch_card";

export interface GroupBuyConfig {
  id: string;
  name: string;
  price: number;
  persons: number;
  type: "fixed" | "time_slot" | "unlimited";
  /** Duration in minutes, used when type is "fixed" */
  duration_minutes?: number;
  start_time?: string;
  end_time?: string;
}

export interface AddedGroupBuy {
  id: string;
  name: string;
  verified: boolean;
}

export interface ShopConfig {
  price_unlimited: number;
  price_single_board: number;
  /** Hourly rate used to compute the live-ticking cost of "先玩后付" (pay_later) orders. */
  price_per_hour: number;
  group_buys: GroupBuyConfig[];
}

export interface CountdownInfo {
  /** 0-100+, >=100 means overtime */
  percent: number;
  /** Human readable remaining/overtime text, e.g. "剩余 12 分钟" or "超时 5 分钟" */
  remainText: string;
  totalMinutes: number;
  remainingMinutes: number;
}

export interface ActiveOrder {
  id: number;
  /** The Seat this order is bound to. */
  seatId: string;
  /** Snapshot of the seat's label at open-time, so later renames/deletes of the seat config don't affect live/history display. */
  seatLabel: string;
  mode: OrderMode;
  modeText: string;
  startTime: string;
  startTimestamp: number;
  elapsedTime: string;
  estimatedCost: number;
  statusClass: string;
  statusText: string;
  isPaused: boolean;
  isSuspended: boolean;
  lockedCost?: number;
  countdown: CountdownInfo | null;
  gbConfig?: GroupBuyConfig | null;
  added_gb: AddedGroupBuy[];
  rawRemark: string;
  fixedDurationMinutes?: number;
  /** Total milliseconds spent paused so far (excludes the current in-progress pause, if any). */
  pausedAccumMs?: number;
  /** Timestamp when the current pause began, or null/undefined if not currently paused. */
  pauseStartedAt?: number | null;
  /** Set when mode is "punch_card" — links to the PunchCardMembership this visit consumed. */
  punchCardMembershipId?: string;
  /** Snapshot of the punch-card product name, used as modeText/history display. */
  punchCardProductNameSnapshot?: string;
}
