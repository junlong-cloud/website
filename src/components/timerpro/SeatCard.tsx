"use client";

import { Clock } from "lucide-react";
import { getSeatStatus } from "@/lib/seat-status";
import type { ActiveOrder } from "@/types/timerpro-pos";
import type { PunchCardMembership, Seat } from "@/types/timerpro-seats";

export interface SeatCardProps {
  seat: Seat;
  order?: ActiveOrder;
  membership?: PunchCardMembership;
  onClick: () => void;
}

export function SeatCard({ seat, order, membership, onClick }: SeatCardProps) {
  if (!order) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left border border-dashed border-border rounded-xl p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors"
      >
        <div className="font-bold text-foreground">{seat.label}</div>
        <div className="mt-3 inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
          可开台
        </div>
        <div className="mt-2 text-xs text-muted-foreground">点击开台</div>
      </button>
    );
  }

  const status = getSeatStatus(order);

  let cardClasses = "border-border";
  let badgeClasses = "bg-brand-turquoise/10 text-brand-turquoise";
  let badgeText = "使用中";

  if (status === "suspended") {
    cardClasses = "bg-primary/5 border-primary/30 border-l-4 border-l-primary";
    badgeClasses = "bg-primary/10 text-primary";
    badgeText = "已到期";
  } else if (status === "overtime") {
    cardClasses = "overtime-card";
    badgeClasses = "bg-destructive/10 text-destructive";
    badgeText = "超时";
  } else if (status === "paused") {
    cardClasses = "bg-warning/10 border-warning/40";
    badgeClasses = "bg-warning/15 text-amber-800";
    badgeText = "已暂停";
  }

  let infoLine: string;
  if (order.mode === "punch_card" && membership) {
    infoLine = `已用 ${membership.totalUsesSnapshot - membership.remainingUses}/${membership.totalUsesSnapshot}`;
  } else if (
    order.mode === "unlimited" ||
    order.mode === "single_board" ||
    order.gbConfig?.type === "unlimited"
  ) {
    infoLine = "包天";
  } else if (status === "overtime" && order.countdown) {
    infoLine = `超时 ${order.countdown.remainText}`;
  } else {
    infoLine = order.elapsedTime;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border rounded-xl p-4 hover:shadow-md transition-all duration-200 ${cardClasses}`}
    >
      <div className="font-bold text-foreground">{seat.label}</div>
      <div className={`mt-3 inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClasses}`}>
        {badgeText}
      </div>
      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 tabular-nums">
        <Clock className="size-3" />
        {infoLine}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">点击查看详情</div>
    </button>
  );
}
