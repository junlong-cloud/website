"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { SeatMapPanel } from "@/components/timerpro/SeatMapPanel";
import { SeatStatusFilterBar } from "@/components/timerpro/SeatStatusFilterBar";
import { Button } from "@/components/ui/button";
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
import type {
  ActiveOrder,
  ActiveOrderDraft,
  ActiveOrderMutation,
  ActiveOrderMutationResult,
  OrderMode,
  ShopConfig,
} from "@/types/timerpro-pos";
import type {
  PunchCardMembership,
  PunchCardProduct,
  Seat,
  SeatLayoutBackup,
  Zone,
} from "@/types/timerpro-seats";
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

function baseOrderFields(seat: Seat): ActiveOrderDraft {
  const now = new Date();
  const startTime = now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  return {
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

function toMutation(previous: ActiveOrder[], next: ActiveOrder[]): ActiveOrderMutation | null {
  const previousIds = new Set(previous.map((order) => order.id));
  const nextIds = new Set(next.map((order) => order.id));
  const added = next.filter((order) => !previousIds.has(order.id));
  const removed = previous.filter((order) => !nextIds.has(order.id));

  if (added.length === 1 && removed.length === 0) {
    const order = Object.fromEntries(
      Object.entries(added[0]).filter(([key]) => key !== "id")
    ) as ActiveOrderDraft;
    return { type: "open", order };
  }
  if (removed.length === 1 && added.length === 0) return { type: "remove", id: removed[0].id };
  if (added.length > 0 || removed.length > 0) return null;

  const changed = next.find((order) => {
    const previousOrder = previous.find((candidate) => candidate.id === order.id);
    return previousOrder && JSON.stringify(previousOrder) !== JSON.stringify(order);
  });
  if (!changed) return null;

  const previousOrder = previous.find((order) => order.id === changed.id);
  if (!previousOrder) return null;
  const patch = Object.fromEntries(
    Object.entries(changed).filter(
      ([key, value]) =>
        !["id", "seatId", "seatLabel", "startTime", "startTimestamp"].includes(key) &&
        JSON.stringify(previousOrder[key as keyof ActiveOrder]) !== JSON.stringify(value)
    )
  );
  return { type: "patch", id: changed.id, patch };
}

export interface PosTabProps {
  shopConfig: ShopConfig;
  /** Cloud-persisted source state — only mutated by explicit user actions (open/pause/checkout/...), never by the per-second clock. */
  activeOrders: ActiveOrder[];
  /** Same orders with live elapsed time/cost/countdown recomputed client-side every second; use this for anything rendered. */
  displayOrders: ActiveOrder[];
  onActiveOrdersMutate: (mutation: ActiveOrderMutation) => Promise<ActiveOrderMutationResult>;
  ordersHydrated: boolean;
  zones: Zone[];
  seats: Seat[];
  punchCardProducts: PunchCardProduct[];
  punchCardMemberships: PunchCardMembership[];
  onPunchCardMembershipsChange: (
    updater: (prev: PunchCardMembership[]) => PunchCardMembership[]
  ) => void;
  onCheckoutComplete?: (payload: CompletedOrderPayload) => void;
  seatLayoutBackup: SeatLayoutBackup | null;
  onRestoreSeatLayout: () => void;
}

export function PosTab({
  shopConfig,
  activeOrders,
  displayOrders,
  onActiveOrdersMutate,
  ordersHydrated,
  zones,
  seats,
  punchCardProducts,
  punchCardMemberships,
  onPunchCardMembershipsChange,
  onCheckoutComplete,
  seatLayoutBackup,
  onRestoreSeatLayout,
}: PosTabProps) {
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [seatFilter, setSeatFilter] = useState<SeatStatusBucket | "all">("all");
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState("");
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

  const mutateOrders = async (mutation: ActiveOrderMutation) => {
    setIsMutating(true);
    setMutationError("");
    try {
      const result = await onActiveOrdersMutate(mutation);
      if (result.conflict) {
        setMutationError(result.message ?? "该座位已在另一台设备开台");
        return false;
      }
      return true;
    } catch (error) {
      setMutationError(error instanceof Error ? error.message : "订单同步失败，请重试");
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const setActiveOrders = (updater: (previous: ActiveOrder[]) => ActiveOrder[]) => {
    const mutation = toMutation(activeOrders, updater(activeOrders));
    if (mutation) void mutateOrders(mutation);
  };

  const handleRestoreSeatLayout = () => {
    if (!seatLayoutBackup) return;
    const backedUpSeatIds = new Set(seatLayoutBackup.seats.map((seat) => seat.id));
    const missingActiveOrder = activeOrders.find((order) => !backedUpSeatIds.has(order.seatId));
    if (missingActiveOrder) {
      setMutationError(`无法恢复：${missingActiveOrder.seatLabel} 正在使用，且不在备份布局中`);
      return;
    }
    if (window.confirm("恢复会覆盖当前区域和座位布局，确定继续吗？")) {
      setMutationError("");
      onRestoreSeatLayout();
    }
  };

  const handleOpenTable = (seat: Seat, payload: OpenTablePayload) => {
    if (isMutating) return;
    const order = baseOrderFields(seat);
    let updatePunchCardMemberships: (() => void) | undefined;

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
        updatePunchCardMemberships = () =>
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
        updatePunchCardMemberships = () =>
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

    void mutateOrders({ type: "open", order }).then((opened) => {
      if (!opened) return;
      updatePunchCardMemberships?.();
      closeModal();
    });
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
    if (isMutating) return;
    // displayOrders (not activeOrders) so `estimatedCost` reflects the live-ticked amount, not the last-persisted one.
    const order = displayOrders.find((o) => o.id === id);
    if (!order) return;

    void mutateOrders({ type: "remove", id }).then((removed) => {
      if (!removed) return;
      if (onCheckoutComplete) {
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
      closeModal();
    });
  };

  const remarkOrder =
    modal.type === "remark" ? displayOrders.find((o) => o.id === modal.orderId) : undefined;
  const checkoutOrder =
    modal.type === "checkout" ? displayOrders.find((o) => o.id === modal.orderId) : undefined;
  const addTimeOrder =
    modal.type === "add_time" ? displayOrders.find((o) => o.id === modal.orderId) : undefined;

  return (
    <div>
      {(!ordersHydrated || isMutating || mutationError) && (
        <p className={`mb-3 text-sm ${mutationError ? "text-destructive" : "text-muted-foreground"}`} role="status">
          {mutationError || (isMutating ? "正在同步订单…" : "正在加载订单…")}
        </p>
      )}
      {seatLayoutBackup && (
        <div className="mb-3 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRestoreSeatLayout}
            disabled={!ordersHydrated || isMutating}
          >
            <RotateCcw className="size-3.5" />
            恢复布局备份（{new Date(seatLayoutBackup.savedAt).toLocaleString("zh-CN")}）
          </Button>
        </div>
      )}
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
        disabled={!ordersHydrated || isMutating}
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
          isSubmitting={isMutating}
          errorMessage={mutationError}
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
