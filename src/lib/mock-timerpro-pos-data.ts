import type { ActiveOrder, GroupBuyConfig, ShopConfig } from "@/types/timerpro-pos";
import type { PunchCardMembership, PunchCardProduct, Seat, Zone } from "@/types/timerpro-seats";

export const shopInfo = {
  name: "星际电玩城",
  address: "示例市示例区示例路 88 号",
};

const groupBuys: GroupBuyConfig[] = [
  {
    id: "gb1",
    name: "双人畅玩套餐",
    price: 88,
    persons: 2,
    type: "fixed",
    duration_minutes: 120,
  },
  {
    id: "gb2",
    name: "单人体验套餐",
    price: 39,
    persons: 1,
    type: "fixed",
    duration_minutes: 60,
  },
  {
    id: "gb3",
    name: "全天不限时套餐",
    price: 128,
    persons: 1,
    type: "unlimited",
  },
  {
    id: "ts1",
    name: "工作日午间时段",
    price: 29,
    persons: 1,
    type: "time_slot",
    start_time: "13:00",
    end_time: "17:00",
  },
];

export const mockShopConfig: ShopConfig = {
  price_unlimited: 98,
  price_single_board: 68,
  price_per_hour: 20,
  group_buys: groupBuys,
};

export const mockZones: Zone[] = [
  { id: "zone-vip", name: "VIP区" },
  { id: "zone-a", name: "大桌区A" },
];

export const mockSeats: Seat[] = [
  { id: "seat-vip1", zoneId: "zone-vip", label: "VIP1" },
  { id: "seat-vip2", zoneId: "zone-vip", label: "VIP2" },
  { id: "seat-vip3", zoneId: "zone-vip", label: "VIP3" },
  { id: "seat-a1", zoneId: "zone-a", label: "A1" },
  { id: "seat-a2", zoneId: "zone-a", label: "A2" },
  { id: "seat-a3", zoneId: "zone-a", label: "A3" },
  { id: "seat-a4", zoneId: "zone-a", label: "A4" },
];

export const mockPunchCardProducts: PunchCardProduct[] = [
  { id: "pc1", name: "5次卡", total_price: 120, total_uses: 5 },
  { id: "pc2", name: "10次卡", total_price: 220, total_uses: 10 },
];

export const mockPunchCardMemberships: PunchCardMembership[] = [
  {
    id: "mem1",
    customerName: "王女士",
    phone: "138****8888",
    productId: "pc1",
    productNameSnapshot: "5次卡",
    totalUsesSnapshot: 5,
    remainingUses: 3,
    purchasedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
];

export const mockActiveOrders: ActiveOrder[] = [
  {
    id: 1004,
    seatId: "seat-vip1",
    seatLabel: "VIP1",
    mode: "pay_later",
    modeText: "先玩后付",
    startTime: "14:02",
    startTimestamp: Date.now() - 1000 * 60 * 42,
    elapsedTime: "42分0秒",
    estimatedCost: 42,
    statusClass: "bg-brand-turquoise/10 text-brand-turquoise",
    statusText: "进行中",
    isPaused: false,
    isSuspended: false,
    countdown: null,
    gbConfig: null,
    added_gb: [],
    rawRemark: "靠窗位置",
  },
  {
    id: 1005,
    seatId: "seat-a1",
    seatLabel: "A1",
    mode: "fixed",
    modeText: "固定时长",
    startTime: "13:40",
    startTimestamp: Date.now() - 1000 * 60 * 58,
    elapsedTime: "58分0秒",
    estimatedCost: 60,
    statusClass: "bg-warning/15 text-amber-800",
    statusText: "即将超时",
    isPaused: false,
    isSuspended: false,
    countdown: {
      percent: 96,
      remainText: "2分钟",
      totalMinutes: 60,
      remainingMinutes: 2,
    },
    gbConfig: null,
    added_gb: [],
    rawRemark: "",
    fixedDurationMinutes: 60,
  },
  {
    id: 1006,
    seatId: "seat-a2",
    seatLabel: "A2",
    mode: "group_buy",
    modeText: "团购套餐",
    startTime: "12:30",
    startTimestamp: Date.now() - 1000 * 60 * 130,
    elapsedTime: "2小时10分0秒",
    estimatedCost: 88,
    statusClass: "bg-destructive/10 text-destructive",
    statusText: "已超时",
    isPaused: false,
    isSuspended: false,
    countdown: {
      percent: 108,
      remainText: "10分钟",
      totalMinutes: 120,
      remainingMinutes: -10,
    },
    gbConfig: groupBuys[0],
    added_gb: [{ id: "agb1", name: "加时券 30 分钟", verified: false }],
    rawRemark: "",
  },
  {
    id: 1007,
    seatId: "seat-vip2",
    seatLabel: "VIP2",
    mode: "unlimited",
    modeText: "全天畅玩",
    startTime: "10:15",
    startTimestamp: Date.now() - 1000 * 60 * 260,
    elapsedTime: "4小时20分0秒",
    estimatedCost: 98,
    statusClass: "bg-primary/10 text-primary",
    statusText: "挂账中",
    isPaused: false,
    isSuspended: true,
    lockedCost: 98,
    countdown: null,
    gbConfig: null,
    added_gb: [],
    rawRemark: "已挂账，等待顾客回来结算",
  },
];
