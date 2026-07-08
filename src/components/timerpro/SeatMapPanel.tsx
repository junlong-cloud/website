"use client";

import { SeatCard } from "@/components/timerpro/SeatCard";
import { getSeatStatus, getSeatStatusBucket, type SeatStatusBucket } from "@/lib/seat-status";
import type { ActiveOrder } from "@/types/timerpro-pos";
import type { PunchCardMembership, Seat, Zone } from "@/types/timerpro-seats";

export interface SeatMapPanelProps {
  zones: Zone[];
  seats: Seat[];
  activeOrders: ActiveOrder[];
  punchCardMemberships: PunchCardMembership[];
  onSeatClick: (seat: Seat) => void;
  filter?: SeatStatusBucket | "all";
}

export function SeatMapPanel({
  zones,
  seats,
  activeOrders,
  punchCardMemberships,
  onSeatClick,
  filter = "all",
}: SeatMapPanelProps) {
  const ordersBySeatId = new Map(activeOrders.map((o) => [o.seatId, o]));
  const membershipsById = new Map(punchCardMemberships.map((m) => [m.id, m]));

  if (zones.length === 0) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-6 text-center text-muted-foreground">
        还没有配置任何区域/座位，请先到「系统设置 → 区域座位管理」新建。
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {zones.map((zone) => {
        const zoneSeats = seats.filter((s) => s.zoneId === zone.id);
        const occupied = zoneSeats.filter((s) => ordersBySeatId.has(s.id)).length;
        const visibleSeats =
          filter === "all"
            ? zoneSeats
            : zoneSeats.filter(
                (s) => getSeatStatusBucket(getSeatStatus(ordersBySeatId.get(s.id))) === filter
              );
        if (zoneSeats.length > 0 && visibleSeats.length === 0) return null;
        return (
          <div key={zone.id} className="bg-card rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              {zone.name}{" "}
              <span className="text-muted-foreground normal-case tracking-normal font-normal">
                ({occupied}/{zoneSeats.length})
              </span>
            </h3>
            {zoneSeats.length === 0 ? (
              <p className="text-sm text-muted-foreground">该区域暂无座位</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleSeats.map((seat) => {
                  const order = ordersBySeatId.get(seat.id);
                  const membership = order?.punchCardMembershipId
                    ? membershipsById.get(order.punchCardMembershipId)
                    : undefined;
                  return (
                    <SeatCard
                      key={seat.id}
                      seat={seat}
                      order={order}
                      membership={membership}
                      onClick={() => onSeatClick(seat)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
