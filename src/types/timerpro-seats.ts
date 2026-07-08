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
