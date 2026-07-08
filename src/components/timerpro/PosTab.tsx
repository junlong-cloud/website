"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SeatMapPanel } from "@/components/timerpro/SeatMapPanel";
import { SeatStatusFilterBar } from "@/components/timerpro/SeatStatusFilterBar";
import { getSeatStatus, getSeatStatusBucket, type SeatStatusBucket } from "@/lib/seat-status";
import { RemarkModal } from "@/components/timerpro/modals/RemarkModal";
import { CheckoutModal } from "@/components/timerpro/modals/CheckoutModal";
import { AddTimeModal } from "@/components/timerpro/modals/AddTimeModal";
import {
  OpenTableModal,
  type OpenTablePayload,
} from "@/components/timerpro/modals/OpenTableModal";
import {
  OvertimeAlertModal,
  type OvertimeAlertItem,
} from "@/components/timerpro/modals/OvertimeAlertModal";
import type { CompletedOrderPayload } from "@/lib/timerpro-history-convert";
import type { ActiveOrder, OrderMode, ShopConfig } from "@/types/timerpro-pos";
import type { PunchCardMembership, PunchCardProduct, Seat, Zone } from "@/types/timerpro-seats";
import { formatDuration } from "@/lib/order-tick";

const MODE_TEXT: Record<OrderMode, string> = {
  pay_later: "先玩后付",
  fixed: "固定时长",
  group_buy: "团购套餐",
  time_slot: "时段优惠",
  unlimited: "全天畅玩",
  single_board: "单板不限时",
  punch_card: "次卡",
};

type ModalState =
  | { type: "none" }
  | { type: "open_table"; seat: Seat }
  | { type: "remark"; orderId: number }
  | { type: "checkout"; orderId: number }
  | { type: "add_time"; orderId: number }
  | { type: "overtime_alert"; items: OvertimeAlertItem[] };

function baseOrderFields(id: number, seat: Seat): ActiveOrder {
  const now = new Date();
  const startTime = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  return {
    id,
    seatId: seat.id,
    seatLabel: seat.label,
    mode: "pay_later",
    modeText: MODE_TEXT.pay_later,
    startTime,
    startTimestamp: Date.now(),
    elapsedTime: "0秒",
    estimatedCost: 0,
    statusClass: "bg-brand-turquoise/10 text-brand-turquoise",
    statusText: "进行中",
    isPaused: false,
    isSuspended: false,
    countdown: null,
    gbConfig: null,
    added_gb: [],
    rawRemark: "",
    pausedAccumMs: 0,
    pauseStartedAt: null,
  };
}

export interface PosTabProps {
  shopConfig: ShopConfig;
  /** Cloud-persisted source state — only mutated by explicit user actions (open/pause/checkout/...), never by the per-second clock. */
  activeOrders: ActiveOrder[];
  /** Same orders with live elapsed time/cost/countdown recomputed client-side every second; use this for anything rendered. */
  displayOrders: ActiveOrder[];
  onActiveOrdersChange: (updater: (prev: ActiveOrder[]) => ActiveOrder[]) => void;
  ordersHydrated: boolean;
  zones: Zone[];
  seats: Seat[];
  punchCardProducts: PunchCardProduct[];
  punchCardMemberships: PunchCardMembership[];
  onPunchCardMembershipsChange: (
    updater: (prev: PunchCardMembership[]) => PunchCardMembership[]
  ) => void;
  onCheckoutComplete?: (payload: CompletedOrderPayload) => void;
}

export function PosTab({
  shopConfig,
  activeOrders,
  displayOrders,
  onActiveOrdersChange: setActiveOrders,
  ordersHydrated,
  zones,
  seats,
  punchCardProducts,
  punchCardMemberships,
  onPunchCardMembershipsChange,
  onCheckoutComplete,
}: PosTabProps) {
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [seatFilter, setSeatFilter] = useState<SeatStatusBucket | "all">("all");
  const overtimeCheckedRef = useRef(false);

  const seatStatusCounts = useMemo(() => {
    const ordersBySeatId = new Map(displayOrders.map((o) => [o.seatId, o]));
    const counts = { all: seats.length, active: 0, free: 0, overtime: 0 };
    for (const seat of seats) {
      const bucket = getSeatStatusBucket(getSeatStatus(ordersBySeatId.get(seat.id)));
      counts[bucket] += 1;
    }
    return counts;
  }, [seats, displayOrders]);

  // Show the overtime alert once, after real (possibly persisted) data has loaded.
  useEffect(() => {
    if (!ordersHydrated || overtimeCheckedRef.current) return;
    overtimeCheckedRef.current = true;
    const overtimeOrders = displayOrders.filter(
      (o) => o.countdown && o.countdown.percent >= 100
    );
    if (overtimeOrders.length > 0) {
      setModal({
        type: "overtime_alert",
        items: overtimeOrders.map((o) => ({
          phone: o.seatLabel,
          modeText: o.modeText,
          overMinutes: Math.max(0, -(o.countdown?.remainingMinutes ?? 0)),
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersHydrated]);

  const closeModal = () => setModal({ type: "none" });

  const handleOpenTable = (seat: Seat, payload: OpenTablePayload) => {
    const id = Math.max(0, ...activeOrders.map((o) => o.id)) + 1;
    const order = baseOrderFields(id, seat);

    if (payload.kind === "builtin") {
      order.mode = payload.mode;
      order.modeText = MODE_TEXT[payload.mode];
      if (payload.mode === "fixed") {
        const minutes = payload.fixedDurationMinutes ?? 60;
        order.fixedDurationMinutes = minutes;
        order.countdown = {
          percent: 0,
          remainText: `${minutes}分钟`,
          totalMinutes: minutes,
          remainingMinutes: minutes,
        };
      } else if (payload.mode === "unlimited") {
        order.estimatedCost = shopConfig.price_unlimited;
      } else if (payload.mode === "single_board") {
        order.estimatedCost = shopConfig.price_single_board;
      }
    } else if (payload.kind === "group_buy") {
      const gb = shopConfig.group_buys.find((g) => g.id === payload.groupBuyId);
      if (gb) {
        order.gbConfig = gb;
        order.mode = "group_buy";
        order.modeText = gb.name;
        order.estimatedCost = gb.price;
        order.added_gb = [{ id: gb.id, name: gb.name, verified: payload.gbVerified }];
        if (gb.type === "fixed" && gb.duration_minutes) {
          order.countdown = {
            percent: 0,
            remainText: `${gb.duration_minutes}分钟`,
            totalMinutes: gb.duration_minutes,
            remainingMinutes: gb.duration_minutes,
          };
        }
      }
    } else if (payload.kind === "punch_card_existing") {
      const membership = punchCardMemberships.find((m) => m.id === payload.membershipId);
      if (membership) {
        order.mode = "punch_card";
        order.modeText = membership.productNameSnapshot;
        order.estimatedCost = 0;
        order.punchCardMembershipId = membership.id;
        order.punchCardProductNameSnapshot = membership.productNameSnapshot;
        onPunchCardMembershipsChange((prevM) =>
          prevM.map((m) =>
            m.id === membership.id ? { ...m, remainingUses: Math.max(0, m.remainingUses - 1) } : m
          )
        );
      }
    } else if (payload.kind === "punch_card_new") {
      const product = punchCardProducts.find((p) => p.id === payload.productId);
      if (product) {
        const membershipId = crypto.randomUUID();
        order.mode = "punch_card";
        order.modeText = product.name;
        order.estimatedCost = 0;
        order.punchCardMembershipId = membershipId;
        order.punchCardProductNameSnapshot = product.name;
        onPunchCardMembershipsChange((prevM) => [
          {
            id: membershipId,
            customerName: payload.customerName,
            phone: payload.phone,
            productId: product.id,
            productNameSnapshot: product.name,
            totalUsesSnapshot: product.total_uses,
            remainingUses: Math.max(0, product.total_uses - 1),
            purchasedAt: Date.now(),
          },
          ...prevM,
        ]);
      }
    }

    setActiveOrders((prev) => [order, ...prev]);
    closeModal();
  };

  const handleRemove = (id: number) => {
    setActiveOrders((prev) => prev.filter((o) => o.id !== id));
    closeModal();
  };

  const handleTogglePause = (id: number) => {
    const now = Date.now();
    setActiveOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const pausing = !o.isPaused;
        return {
          ...o,
          isPaused: pausing,
          pauseStartedAt: pausing ? now : null,
          pausedAccumMs: pausing
            ? o.pausedAccumMs ?? 0
            : (o.pausedAccumMs ?? 0) + (o.pauseStartedAt ? now - o.pauseStartedAt : 0),
          statusText: pausing ? "已暂停" : "进行中",
          statusClass: pausing
            ? "bg-warning/15 text-amber-800"
            : "bg-brand-turquoise/10 text-brand-turquoise",
        };
      })
    );
  };

  const handleCancelSuspend = (id: number) => {
    setActiveOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              isSuspended: false,
              lockedCost: undefined,
              statusText: "进行中",
              statusClass: "bg-brand-turquoise/10 text-brand-turquoise",
            }
          : o
      )
    );
  };

  const handleAddTimeDirect = (id: number, minutes: number) => {
    setActiveOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (!o.countdown) return o;
        const totalMinutes = o.countdown.totalMinutes + minutes;
        return {
          ...o,
          countdown: {
            ...o.countdown,
            totalMinutes,
          },
        };
      })
    );
    closeModal();
  };

  const handleAddTimeGroupBuy = (id: number) => {
    setActiveOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              added_gb: [
                ...o.added_gb,
                { id: `agb-${Date.now()}`, name: "加时团购券", verified: false },
              ],
            }
          : o
      )
    );
    closeModal();
  };

  const handleToggleGroupBuyVerify = (orderId: number, groupBuyId: string) => {
    setActiveOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          added_gb: o.added_gb.map((gb) =>
            gb.id === groupBuyId ? { ...gb, verified: !gb.verified } : gb
          ),
        };
      })
    );
  };

  const handleSaveRemark = (id: number, remark: string) => {
    setActiveOrders((prev) => prev.map((o) => (o.id === id ? { ...o, rawRemark: remark } : o)));
    closeModal();
  };

  const handleSuspendCheckout = (id: number, amount: number, remark: string) => {
    setActiveOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              isSuspended: true,
              lockedCost: amount,
              estimatedCost: amount,
              rawRemark: remark,
              statusText: "挂账中",
              statusClass: "bg-primary/10 text-primary",
            }
          : o
      )
    );
    closeModal();
  };

  const handleConfirmCheckout = (id: number, amount: number, remark: string) => {
    // displayOrders (not activeOrders) so `estimatedCost` reflects the live-ticked amount, not the last-persisted one.
    const order = displayOrders.find((o) => o.id === id);
    if (order && onCheckoutComplete) {
      const now = Date.now();
      const pausedMs =
        (order.pausedAccumMs ?? 0) +
        (order.isPaused && order.pauseStartedAt ? now - order.pauseStartedAt : 0);
      const totalMs = Math.max(0, now - order.startTimestamp);
      const playMs = Math.max(0, totalMs - pausedMs);
      const mainGbVerified =
        order.gbConfig != null &&
        order.added_gb.find((g) => g.id === order.gbConfig!.id)?.verified === true;

      onCheckoutComplete({
        seatLabel: order.seatLabel,
        modeText: order.modeText,
        startTime: order.startTime,
        startTimestamp: order.startTimestamp,
        endTimestamp: now,
        totalDurationText: formatDuration(totalMs),
        playDurationText: formatDuration(playMs),
        pauseDurationText: pausedMs > 0 ? formatDuration(pausedMs) : "无",
        fixedPackageText: order.fixedDurationMinutes
          ? `定额${order.fixedDurationMinutes}分钟套餐`
          : order.gbConfig?.duration_minutes
            ? `${order.gbConfig.name} ${order.gbConfig.duration_minutes}分钟`
            : "",
        gbType: order.gbConfig?.name ?? "",
        gbVoucherValue: mainGbVerified ? order.gbConfig!.price : 0,
        totalPrice: order.estimatedCost,
        actualTotal: amount,
        remark,
        guestCount: 1,
      });
    }
    setActiveOrders((prev) => prev.filter((o) => o.id !== id));
    closeModal();
  };

  const remarkOrder =
    modal.type === "remark" ? displayOrders.find((o) => o.id === modal.orderId) : undefined;
  const checkoutOrder =
    modal.type === "checkout" ? displayOrders.find((o) => o.id === modal.orderId) : undefined;
  const addTimeOrder =
    modal.type === "add_time" ? displayOrders.find((o) => o.id === modal.orderId) : undefined;

  return (
    <div>
      <SeatStatusFilterBar
        counts={seatStatusCounts}
        filter={seatFilter}
        onFilterChange={setSeatFilter}
      />
      <SeatMapPanel
        zones={zones}
        seats={seats}
        activeOrders={displayOrders}
        punchCardMemberships={punchCardMemberships}
        filter={seatFilter}
        onSeatClick={(seat) => {
          const order = activeOrders.find((o) => o.seatId === seat.id);
          if (order) {
            setModal({ type: "checkout", orderId: order.id });
          } else {
            setModal({ type: "open_table", seat });
          }
        }}
      />

      {modal.type === "open_table" && (
        <OpenTableModal
          seat={modal.seat}
          shopConfig={shopConfig}
          punchCardProducts={punchCardProducts}
          punchCardMemberships={punchCardMemberships}
          onCancel={closeModal}
          onConfirm={(payload) => handleOpenTable(modal.seat, payload)}
        />
      )}

      {modal.type === "remark" && remarkOrder && (
        <RemarkModal
          initialRemark={remarkOrder.rawRemark}
          onCancel={closeModal}
          onSave={(remark) => handleSaveRemark(remarkOrder.id, remark)}
        />
      )}

      {modal.type === "checkout" && checkoutOrder && (
        <CheckoutModal
          order={checkoutOrder}
          onCancel={closeModal}
          onSuspend={(amount, remark) => handleSuspendCheckout(checkoutOrder.id, amount, remark)}
          onConfirm={(amount, remark) => handleConfirmCheckout(checkoutOrder.id, amount, remark)}
          onTogglePause={handleTogglePause}
          onCancelSuspend={handleCancelSuspend}
          onAddTime={(id) => setModal({ type: "add_time", orderId: id })}
          onOpenRemark={(id) => setModal({ type: "remark", orderId: id })}
          onToggleGroupBuyVerify={handleToggleGroupBuyVerify}
          onRemove={handleRemove}
        />
      )}

      {modal.type === "add_time" && addTimeOrder && (
        <AddTimeModal
          onCancel={closeModal}
          onConfirmDirect={(minutes) => handleAddTimeDirect(addTimeOrder.id, minutes)}
          onConfirmGroupBuy={() => handleAddTimeGroupBuy(addTimeOrder.id)}
        />
      )}

      {modal.type === "overtime_alert" && (
        <OvertimeAlertModal items={modal.items} onClose={closeModal} />
      )}
    </div>
  );
}
