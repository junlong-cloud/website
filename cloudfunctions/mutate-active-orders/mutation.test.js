/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const test = require("node:test");
const { applyMutation } = require("./mutation");

const draft = (seatId) => ({
  seatId,
  seatLabel: seatId,
  mode: "pay_later",
  modeText: "先玩后付",
  startTime: "10:00",
  startTimestamp: 1,
  elapsedTime: "0秒",
  estimatedCost: 0,
  statusClass: "",
  statusText: "进行中",
  isPaused: false,
  isSuspended: false,
  countdown: null,
  added_gb: [],
  rawRemark: "",
});

test("concurrent commits keep orders opened on different seats", () => {
  const first = applyMutation([], { type: "open", order: draft("A1") });
  const second = applyMutation(first.orders, { type: "open", order: draft("A2") });

  assert.deepEqual(second.orders.map((order) => order.seatId).sort(), ["A1", "A2"]);
  assert.equal(applyMutation(second.orders, { type: "open", order: draft("A1") }).conflict, true);
});
