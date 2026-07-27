const PATCHABLE_FIELDS = new Set([
  "mode",
  "modeText",
  "elapsedTime",
  "estimatedCost",
  "statusClass",
  "statusText",
  "isPaused",
  "isSuspended",
  "lockedCost",
  "countdown",
  "gbConfig",
  "added_gb",
  "rawRemark",
  "fixedDurationMinutes",
  "pausedAccumMs",
  "pauseStartedAt",
  "punchCardMembershipId",
  "punchCardProductNameSnapshot",
]);

function assertOrderDraft(order) {
  if (
    !order ||
    typeof order !== "object" ||
    typeof order.seatId !== "string" ||
    typeof order.seatLabel !== "string" ||
    typeof order.mode !== "string" ||
    !Number.isFinite(order.startTimestamp)
  ) {
    throw new Error("Invalid order");
  }
}

function applyMutation(orders, event) {
  if (!event || typeof event !== "object") throw new Error("Invalid mutation");
  if (!Array.isArray(orders)) throw new Error("Invalid active orders");

  if (event.type === "bootstrap") {
    if (!Array.isArray(event.orders)) throw new Error("Invalid active orders");
    return { orders };
  }

  if (event.type === "open") {
    assertOrderDraft(event.order);
    if (orders.some((order) => order.seatId === event.order.seatId)) {
      return { orders, conflict: true, message: "该座位已在另一台设备开台" };
    }
    const id = Math.max(0, ...orders.map((order) => order.id)) + 1;
    return { orders: [{ ...event.order, id }, ...orders] };
  }

  if (!Number.isFinite(event.id)) throw new Error("Invalid order id");
  const index = orders.findIndex((order) => order.id === event.id);
  if (index === -1) throw new Error("订单已在另一台设备被处理");

  if (event.type === "remove") {
    return { orders: orders.filter((order) => order.id !== event.id) };
  }

  if (event.type === "patch" && event.patch && typeof event.patch === "object") {
    const patch = Object.fromEntries(
      Object.entries(event.patch).filter(([key]) => PATCHABLE_FIELDS.has(key))
    );
    const next = [...orders];
    next[index] = { ...next[index], ...patch };
    return { orders: next };
  }

  throw new Error("Invalid mutation");
}

module.exports = { applyMutation };
