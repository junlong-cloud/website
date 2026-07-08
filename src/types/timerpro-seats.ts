// Zone/seat spatial config + punch-card (次卡) membership types.

export interface Zone {
  id: string;
  name: string;
}

export interface Seat {
  id: string;
  zoneId: string;
  label: string;
}

export interface PunchCardProduct {
  id: string;
  name: string;
  total_price: number;
  total_uses: number;
}

export interface PunchCardMembership {
  id: string;
  customerName: string;
  phone: string;
  productId: string;
  /** Snapshots so editing/deleting the product template later doesn't corrupt existing memberships. */
  productNameSnapshot: string;
  totalUsesSnapshot: number;
  remainingUses: number;
  purchasedAt: number;
}

/**
 * Sanitized, customer-safe mirror of an occupied seat's ActiveOrder — published
 * to a separately-permissioned cloud collection so the public /c/[uid]/[seatId]
 * page can read it via an anonymous session. Deliberately excludes cost/pricing
 * fields (estimatedCost, lockedCost, gbConfig, rawRemark) and anything else that
 * shouldn't be visible to a customer scanning a QR code.
 */
export interface PublicSeatStatus {
  seatId: string;
  seatLabel: string;
  modeText: string;
  startTimestamp: number;
  isPaused: boolean;
  pauseStartedAt: number | null;
  pausedAccumMs: number;
  isSuspended: boolean;
  /** Present only for modes with a fixed duration (fixed/group_buy time-limited/etc). */
  countdownTotalMinutes: number | null;
}
