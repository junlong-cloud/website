/* eslint-disable @typescript-eslint/no-require-imports */
const cloudbase = require("@cloudbase/node-sdk");
const { applyMutation } = require("./mutation");

const app = cloudbase.init();
const db = app.database();

function toPublicSeatStatus(order) {
  return {
    seatId: order.seatId,
    seatLabel: order.seatLabel,
    modeText: order.modeText,
    startTimestamp: order.startTimestamp,
    isPaused: order.isPaused,
    pauseStartedAt: order.pauseStartedAt ?? null,
    pausedAccumMs: order.pausedAccumMs ?? 0,
    isSuspended: order.isSuspended,
    countdownTotalMinutes: order.countdown?.totalMinutes ?? null,
  };
}

function documentValue(result) {
  const record = Array.isArray(result.data) ? result.data[0] : result.data;
  return Array.isArray(record?.value) ? record.value : [];
}

exports.main = async (event) => {
  const { uid } = app.auth().getUserInfo();
  if (!uid) throw new Error("请先登录");

  const transactionResult = await db.runTransaction(async (transaction) => {
    const orderDoc = transaction.collection("active_orders").doc(uid);
    const existing = await orderDoc.get();
    const orders = documentValue(existing);
    const result = applyMutation(orders, event);
    const nextOrders =
      event.type === "bootstrap" && orders.length === 0 ? event.orders : result.orders;

    await orderDoc.set({ uid, value: nextOrders });
    await transaction
      .collection("public_seat_status")
      .doc(uid)
      .set({ uid, value: nextOrders.filter((order) => !order.isSuspended).map(toPublicSeatStatus) });

    return { ...result, orders: nextOrders };
  });
  return transactionResult;
};
