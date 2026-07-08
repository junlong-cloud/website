"use client";

import { useMemo } from "react";
import {
  BarChart3,
  Coins,
  LayoutGrid,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { getLocalDateString } from "@/lib/timerpro-history-convert";
import { getSeatStatus, getSeatStatusBucket } from "@/lib/seat-status";
import type { ActiveOrder } from "@/types/timerpro-pos";
import type { HistoryRecord } from "@/types/timerpro-history";
import type { PunchCardMembership, Seat } from "@/types/timerpro-seats";

export interface DashboardTabProps {
  historyRecords: HistoryRecord[];
  activeOrders: ActiveOrder[];
  seats: Seat[];
  punchCardMemberships: PunchCardMembership[];
}

const HOUR_RANGE = { start: 9, end: 21 }; // 09:00–21:59 business hours

function StatTile({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`bg-muted/50 rounded-lg p-3 ${className}`}>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-xl font-bold tabular-nums mt-1">{value}</div>
    </div>
  );
}

export function DashboardTab({
  historyRecords,
  activeOrders,
  seats,
  punchCardMemberships,
}: DashboardTabProps) {
  const seatOverview = useMemo(() => {
    const ordersBySeatId = new Map(activeOrders.map((o) => [o.seatId, o]));
    const counts = { all: seats.length, active: 0, free: 0, overtime: 0 };
    for (const seat of seats) {
      const bucket = getSeatStatusBucket(getSeatStatus(ordersBySeatId.get(seat.id)));
      counts[bucket] += 1;
    }
    return counts;
  }, [seats, activeOrders]);

  const todayStr = getLocalDateString();
  const todayRecords = useMemo(
    () => historyRecords.filter((r) => r.start_time.slice(0, 10) === todayStr),
    [historyRecords, todayStr]
  );

  const todayStats = useMemo(() => {
    const count = todayRecords.length;
    const guests = todayRecords.reduce((sum, r) => sum + (r.guestCount ?? 1), 0);
    const revenue = todayRecords.reduce((sum, r) => sum + parseFloat(r.actual_total || "0"), 0);
    const gbVoucher = todayRecords.reduce((sum, r) => sum + parseFloat(r.gb_voucher || "0"), 0);
    return { count, guests, revenue, gbVoucher };
  }, [todayRecords]);

  const inProgressEstimate = useMemo(
    () => activeOrders.filter((o) => !o.isSuspended).reduce((sum, o) => sum + o.estimatedCost, 0),
    [activeOrders]
  );

  const modeRanking = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    for (const r of todayRecords) {
      const key = r.mode_text || "其他";
      const entry = map.get(key) ?? { count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += parseFloat(r.actual_total || "0");
      map.set(key, entry);
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [todayRecords]);
  const maxModeCount = Math.max(1, ...modeRanking.map((m) => m.count));

  const hourlyDistribution = useMemo(() => {
    const buckets = new Map<number, number>();
    for (let h = HOUR_RANGE.start; h <= HOUR_RANGE.end; h++) buckets.set(h, 0);
    for (const r of todayRecords) {
      const hour = parseInt(r.start_time.slice(11, 13), 10);
      if (!Number.isNaN(hour) && buckets.has(hour)) {
        buckets.set(hour, (buckets.get(hour) ?? 0) + 1);
      }
    }
    return [...buckets.entries()].map(([hour, count]) => ({ hour, count }));
  }, [todayRecords]);
  const maxHourlyCount = Math.max(1, ...hourlyDistribution.map((h) => h.count));

  const punchCardOverview = useMemo(() => {
    const activeMembers = punchCardMemberships.filter((m) => m.remainingUses > 0).length;
    const outstandingUses = punchCardMemberships.reduce((sum, m) => sum + m.remainingUses, 0);
    return { activeMembers, outstandingUses };
  }, [punchCardMemberships]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <LayoutGrid className="size-5 text-primary" />
          实时座位概览
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="座位总数" value={String(seatOverview.all)} />
          <StatTile
            label="使用中"
            value={String(seatOverview.active)}
            className="bg-brand-turquoise/10"
          />
          <StatTile label="空闲" value={String(seatOverview.free)} />
          <StatTile
            label="超时"
            value={String(seatOverview.overtime)}
            className="bg-destructive/10"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Coins className="size-5 text-primary" />
          今日经营数据
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatTile label="今日订单数" value={String(todayStats.count)} />
          <StatTile label="今日客流" value={String(todayStats.guests)} />
          <StatTile
            label="今日实收"
            value={`¥${todayStats.revenue.toFixed(2)}`}
            className="bg-brand-turquoise/10"
          />
          <StatTile
            label="团购核销抵扣值"
            value={`¥${todayStats.gbVoucher.toFixed(2)}`}
            className="bg-primary/10"
          />
        </div>
        <div className="mt-3 text-sm text-muted-foreground flex items-center gap-1.5">
          <TrendingUp className="size-3.5" />
          进行中订单预估金额（未结算，仅供参考）：
          <span className="font-bold tabular-nums text-foreground">
            ¥{inProgressEstimate.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          计费模式销量榜（今日）
        </h2>
        {modeRanking.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">今日暂无成交记录</p>
        ) : (
          <div className="space-y-2">
            {modeRanking.map((m) => (
              <div key={m.name} className="flex items-center gap-3 text-sm">
                <span className="w-28 shrink-0 truncate text-foreground">{m.name}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-brand-turquoise rounded-full"
                    style={{ width: `${(m.count / maxModeCount) * 100}%` }}
                  />
                </div>
                <span className="w-10 text-right tabular-nums font-medium">{m.count}单</span>
                <span className="w-20 text-right tabular-nums text-muted-foreground">
                  ¥{m.revenue.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          营业时段分布（今日）
        </h2>
        <div className="flex items-end gap-1.5 h-32">
          {hourlyDistribution.map(({ hour, count }) => (
            <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <div
                className="w-full bg-primary/70 rounded-t"
                style={{ height: `${(count / maxHourlyCount) * 100}%`, minHeight: count > 0 ? 4 : 0 }}
                title={`${hour}:00 — ${count} 单`}
              />
              <span className="text-[10px] text-muted-foreground tabular-nums">{hour}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Ticket className="size-5 text-primary" />
          次卡概况
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <StatTile
            label="有效会员次卡数"
            value={String(punchCardOverview.activeMembers)}
            className="bg-brand-turquoise/10"
          />
          <StatTile
            label="剩余可核销次数总计"
            value={String(punchCardOverview.outstandingUses)}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <Users className="size-3 shrink-0" />
          即已售出但顾客尚未消费的次数，可理解为待兑付的&quot;次数负债&quot;。
        </p>
      </div>
    </div>
  );
}
