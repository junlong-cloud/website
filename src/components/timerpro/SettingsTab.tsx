"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  HelpCircle,
  Info,
  MapPin,
  Plus,
  QrCode,
  Settings as SettingsIcon,
  Store,
  Ticket,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCloudDocState } from "@/hooks/useCloudDocState";
import { mockShopConfig } from "@/lib/mock-timerpro-settings-data";
import type { CustomerCode, GroupBuyConfig, ShopConfig } from "@/types/timerpro-settings";
import type { ActiveOrder } from "@/types/timerpro-pos";
import type { PunchCardMembership, PunchCardProduct, Seat, Zone } from "@/types/timerpro-seats";
import { CustomerCodeModal } from "@/components/timerpro/modals/CustomerCodeModal";
import { PunchCardModal } from "@/components/timerpro/modals/PunchCardModal";
import {
  downloadDataUrl,
  downloadTextFile,
  generateQrDataUrl,
  generateQrSheetDataUrl,
} from "@/lib/qr-export";

function createBlankGroupBuy(): GroupBuyConfig {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "fixed",
    price: 0,
    people: 1,
    duration_min: 60,
    slot_start: "",
    slot_end: "",
  };
}

function Hint({
  icon: Icon = HelpCircle,
  children,
}: {
  icon?: typeof HelpCircle;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="text-muted-foreground hover:text-primary transition">
        <Icon className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-left whitespace-normal">{children}</TooltipContent>
    </Tooltip>
  );
}

export interface SettingsTabProps {
  shopName: string;
  onShopNameChange: (name: string) => void;
  config: ShopConfig;
  onConfigChange: (updater: (prev: ShopConfig) => ShopConfig) => void;
  zones: Zone[];
  onZonesChange: (updater: (prev: Zone[]) => Zone[]) => void;
  seats: Seat[];
  onSeatsChange: (updater: (prev: Seat[]) => Seat[]) => void;
  punchCardProducts: PunchCardProduct[];
  onPunchCardProductsChange: (updater: (prev: PunchCardProduct[]) => PunchCardProduct[]) => void;
  punchCardMemberships: PunchCardMembership[];
  onPunchCardMembershipsChange: (
    updater: (prev: PunchCardMembership[]) => PunchCardMembership[]
  ) => void;
  activeOrders: ActiveOrder[];
  /** Signed-in shop owner's uid, used to build each seat's customer-facing QR URL (/c/[shopUid]/[seatId]). */
  shopUid: string | undefined;
}

function createBlankPunchCardProduct(): PunchCardProduct {
  return { id: crypto.randomUUID(), name: "", total_price: 0, total_uses: 1 };
}

export function SettingsTab({
  shopName,
  onShopNameChange,
  config,
  onConfigChange: setConfig,
  zones,
  onZonesChange,
  seats,
  onSeatsChange,
  punchCardProducts,
  onPunchCardProductsChange,
  punchCardMemberships,
  onPunchCardMembershipsChange,
  activeOrders,
  shopUid,
}: SettingsTabProps) {
  const [customerUniversalUrl, setCustomerUniversalUrl] = useCloudDocState(
    "customer_universal_url",
    ""
  );
  const [customerCodes, setCustomerCodes] = useCloudDocState<CustomerCode[]>(
    "customer_codes",
    []
  );
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPunchCardModalOpen, setIsPunchCardModalOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const occupiedSeatIds = new Set(activeOrders.map((o) => o.seatId));

  const handleAddZone = () => {
    onZonesChange((prev) => [...prev, { id: crypto.randomUUID(), name: "" }]);
  };

  const handleRenameZone = (id: string, name: string) => {
    onZonesChange((prev) => prev.map((z) => (z.id === id ? { ...z, name } : z)));
  };

  const handleRemoveZone = (id: string) => {
    onZonesChange((prev) => prev.filter((z) => z.id !== id));
  };

  const handleAddSeat = (zoneId: string) => {
    onSeatsChange((prev) => [...prev, { id: crypto.randomUUID(), zoneId, label: "" }]);
  };

  const handleRenameSeat = (id: string, label: string) => {
    onSeatsChange((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));
  };

  const handleRemoveSeat = (id: string) => {
    onSeatsChange((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDownloadSeatQr = async (seat: Seat) => {
    if (!shopUid) return;
    const url = `${window.location.origin}/c/?u=${encodeURIComponent(shopUid)}&s=${encodeURIComponent(seat.id)}`;
    const dataUrl = await generateQrDataUrl(url);
    downloadDataUrl(dataUrl, `座位二维码_${seat.label || seat.id}.png`);
  };

  const handleAddPunchCardProduct = () => {
    onPunchCardProductsChange((prev) => [...prev, createBlankPunchCardProduct()]);
  };

  const updatePunchCardProduct = <K extends keyof PunchCardProduct>(
    id: string,
    field: K,
    value: PunchCardProduct[K]
  ) => {
    onPunchCardProductsChange((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleRemovePunchCardProduct = (id: string) => {
    onPunchCardProductsChange((prev) => prev.filter((p) => p.id !== id));
  };

  const updateField = <K extends keyof ShopConfig>(field: K, value: ShopConfig[K]) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const updateGroupBuy = <K extends keyof GroupBuyConfig>(
    id: string,
    field: K,
    value: GroupBuyConfig[K]
  ) => {
    setConfig((prev) => ({
      ...prev,
      group_buys: prev.group_buys.map((gb) =>
        gb.id === id ? { ...gb, [field]: value } : gb
      ),
    }));
  };

  const handleAddGroupBuy = () => {
    setConfig((prev) => ({
      ...prev,
      group_buys: [...prev.group_buys, createBlankGroupBuy()],
    }));
  };

  const handleRemoveGroupBuy = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      group_buys: prev.group_buys.filter((gb) => gb.id !== id),
    }));
  };

  const handleMoveGroupBuy = (id: string, direction: -1 | 1) => {
    setConfig((prev) => {
      const list = [...prev.group_buys];
      const index = list.findIndex((gb) => gb.id === id);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= list.length) return prev;
      [list[index], list[targetIndex]] = [list[targetIndex], list[index]];
      return { ...prev, group_buys: list };
    });
  };

  const handleRefreshUniversalUrl = () => {
    setCustomerUniversalUrl("https://timerpro.top/c/universal/SHOP123");
  };

  const resolvedUniversalUrl = () =>
    customerUniversalUrl || "https://timerpro.top/c/universal/SHOP123";

  const handleExportUniversalQr = async () => {
    const dataUrl = await generateQrDataUrl(resolvedUniversalUrl());
    downloadDataUrl(dataUrl, "通用入口二维码.png");
  };

  const handleExportUniversalNfc = () => {
    downloadTextFile(
      `# 通用入口\n${resolvedUniversalUrl()}`,
      "通用入口NFC写入清单.txt"
    );
  };

  const handleDownloadAllMaterials = async () => {
    const dataUrl = await generateQrSheetDataUrl([
      { label: "通用入口", url: resolvedUniversalUrl() },
      ...customerCodes.map((c) => ({ label: c.label, url: c.url })),
    ]);
    downloadDataUrl(dataUrl, "全部物料包_二维码.png");
    const lines = [
      "# 通用入口",
      resolvedUniversalUrl(),
      "",
      "# 号牌",
      ...customerCodes.map((c) => `${c.label}: ${c.url}`),
    ];
    downloadTextFile(lines.join("\n"), "全部物料包_NFC清单.txt");
  };

  const handleReset = () => {
    setConfig(() => mockShopConfig);
    setSavedMessage("");
  };

  const handleSave = () => {
    console.log("保存设置", config);
    setSavedMessage("设置已保存");
    setTimeout(() => setSavedMessage(""), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Store className="size-5 text-primary" />
          店铺信息
        </h2>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">店铺名称</label>
          <input
            type="text"
            className="w-full border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-turquoise"
            value={shopName}
            onChange={(e) => onShopNameChange(e.target.value)}
            placeholder="显示在顶部导航栏的店铺名称"
          />
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <SettingsIcon className="size-5 text-primary" />
          计费核心设置
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                通用基准价 (元/小时)
                <Hint>
                  默认模式下，计算费用的基础标准价格。如果不使用进阶阶梯算法，系统会按此价格和在场时长进行折合计算。
                </Hint>
              </label>
              <input
                type="number"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.price_base}
                onChange={(e) => updateField("price_base", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                基准时长 (分钟)
                <Hint>一小时=60分。配合基准价使用，通常保持60即可。系统内部计算单价率的基础。</Hint>
              </label>
              <input
                type="number"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.time_base}
                onChange={(e) => updateField("time_base", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                加时单价 (元/小时)
                <Hint>定额/时段等包含固定时长的套餐，超出固定时长后的加收标准（即超时计费汇率）。</Hint>
              </label>
              <input
                type="number"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.price_overtime}
                onChange={(e) => updateField("price_overtime", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                全天畅玩价 (元)
              </label>
              <input
                type="number"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.price_unlimited}
                onChange={(e) => updateField("price_unlimited", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                单板不限时 (元)
              </label>
              <input
                type="number"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.price_single_board}
                onChange={(e) => updateField("price_single_board", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                计费缓冲缓冲 (分钟)
                <Hint icon={AlertTriangle}>
                  重要参数：顾客超时多少分钟内不额外扣费。例如设置为10，玩了1小时9分钟只收1小时的钱。这是提供人情味的容错机制。
                </Hint>
              </label>
              <input
                type="number"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.buffer_min}
                onChange={(e) => updateField("buffer_min", Number(e.target.value))}
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mt-8 mb-3 border-b border-border pb-2 flex items-center gap-2">
            进阶阶梯计速参数 (仅选择阶梯算法时生效)
            <Hint icon={Info}>
              阶梯算法适用于将计算切割为多个&quot;块(计费周期)&quot;的场景。例如：每10分钟收费5元，不满规定时间也可按逻辑进行舍去。这是一种更贴近实体的分段计费模型。
            </Hint>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">算法模式</label>
              <select
                className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-turquoise"
                value={config.calc_mode}
                onChange={(e) =>
                  updateField("calc_mode", e.target.value as ShopConfig["calc_mode"])
                }
              >
                <option value="exact">精确计价(按比例)</option>
                <option value="step">阶梯计价(按块)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                计费块大小 N(分)
                <Hint>每一个收费周期的时长。如设为&quot;30&quot;，代表每30分钟为一个计算切片。</Hint>
              </label>
              <input
                type="number"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.step_n}
                onChange={(e) => updateField("step_n", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                每块收费 Y(元)
                <Hint>对应上方 N(分) 产生的基础金额。例如 N=30，Y=15，代表每经过30分钟，产生 15 元。</Hint>
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.step_y}
                onChange={(e) => updateField("step_y", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                进位分割系数 K
                <Hint>内部进位算法系数。通常填1。若要实现特殊的四舍五入或向上取整逻辑可调整。默认情况下无需更改。</Hint>
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.step_k}
                onChange={(e) => updateField("step_k", Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                抹零免单界限 X(分)
                <Hint>
                  阶梯算法下的独立缓冲时间。每一个新的计费块开始时，前 X 分钟内结出不会被视作进入了这一个收费块（等于该计费块免单）。
                </Hint>
              </label>
              <input
                type="number"
                className="w-full border border-input rounded-lg px-3 py-2 tabular-nums focus:ring-2 focus:ring-brand-turquoise"
                value={config.ceil_x}
                onChange={(e) => updateField("ceil_x", Number(e.target.value))}
              />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mt-8 mb-3 border-b border-border pb-2 flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            超时提醒设置
          </h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded"
                checked={config.overtime_alert_enabled}
                onChange={(e) => updateField("overtime_alert_enabled", e.target.checked)}
              />
              <span className="text-sm text-foreground">启用超时铃声提醒</span>
            </label>
            <span className="text-xs text-muted-foreground">
              开启后，当定额/团购卡片超时超过缓冲期时会自动弹窗并发出铃声
            </span>
          </div>

          <div className="mt-8 mb-3 flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <Ticket className="size-4 text-primary" />
              团购产品管理
            </h3>
            <Button variant="outline" size="xs" onClick={handleAddGroupBuy}>
              <Plus className="size-3" />
              添加团购方案
            </Button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {config.group_buys.map((gb, index) => (
              <div
                key={gb.id}
                className="border border-border rounded-lg bg-muted/30 p-3 pt-6 relative text-sm"
              >
                <div className="absolute top-1 right-2 flex items-center gap-0.5">
                  <button
                    className="text-muted-foreground hover:text-primary p-1 disabled:opacity-30 disabled:pointer-events-none"
                    onClick={() => handleMoveGroupBuy(gb.id, -1)}
                    disabled={index === 0}
                    title="上移"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    className="text-muted-foreground hover:text-primary p-1 disabled:opacity-30 disabled:pointer-events-none"
                    onClick={() => handleMoveGroupBuy(gb.id, 1)}
                    disabled={index === config.group_buys.length - 1}
                    title="下移"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    className="text-muted-foreground hover:text-destructive p-1"
                    onClick={() => handleRemoveGroupBuy(gb.id)}
                    title="移除"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="col-span-2 md:col-span-3">
                    <label className="block text-xs text-muted-foreground mb-1">展示名称</label>
                    <input
                      className="w-full border border-input rounded-lg px-2 py-1"
                      value={gb.name}
                      onChange={(e) => updateGroupBuy(gb.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">团购类型</label>
                    <select
                      className="w-full border border-input rounded-lg px-2 py-1"
                      value={gb.type}
                      onChange={(e) =>
                        updateGroupBuy(
                          gb.id,
                          "type",
                          e.target.value as GroupBuyConfig["type"]
                        )
                      }
                    >
                      <option value="fixed">计时长(如定额限时)</option>
                      <option value="time_slot">包时间段(如10-18点)</option>
                      <option value="unlimited">全天畅玩</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">售价(元)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full border border-input rounded-lg px-2 py-1 tabular-nums"
                      value={gb.price}
                      onChange={(e) =>
                        updateGroupBuy(gb.id, "price", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">包含人数</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      className="w-full border border-input rounded-lg px-2 py-1 tabular-nums"
                      value={gb.people}
                      onChange={(e) =>
                        updateGroupBuy(gb.id, "people", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">内含时长(分)</label>
                    <input
                      type="number"
                      className="w-full border border-input rounded-lg px-2 py-1 tabular-nums disabled:bg-muted disabled:text-muted-foreground"
                      disabled={gb.type === "unlimited"}
                      value={gb.duration_min}
                      onChange={(e) =>
                        updateGroupBuy(gb.id, "duration_min", Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">时段起</label>
                    <input
                      type="time"
                      className="w-full border border-input rounded-lg px-2 py-1 disabled:bg-muted disabled:text-muted-foreground"
                      disabled={gb.type !== "time_slot"}
                      value={gb.slot_start}
                      onChange={(e) =>
                        updateGroupBuy(gb.id, "slot_start", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">时段止</label>
                    <input
                      type="time"
                      className="w-full border border-input rounded-lg px-2 py-1 disabled:bg-muted disabled:text-muted-foreground"
                      disabled={gb.type !== "time_slot"}
                      value={gb.slot_end}
                      onChange={(e) =>
                        updateGroupBuy(gb.id, "slot_end", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 mb-3 flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              区域座位管理
            </h3>
            <Button variant="outline" size="xs" onClick={handleAddZone}>
              <Plus className="size-3" />
              添加区域
            </Button>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-primary/80 space-y-1">
            <p>仅空闲座位可删除：占用中请先在座位图结单。</p>
            <p>删除区域前请清空或移走该区域内座位。</p>
          </div>
          <div className="space-y-4">
            {zones.map((zone) => {
              const zoneSeats = seats.filter((s) => s.zoneId === zone.id);
              const zoneHasSeats = zoneSeats.length > 0;
              return (
                <div key={zone.id} className="border border-border rounded-lg bg-muted/30 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      value={zone.name}
                      onChange={(e) => handleRenameZone(zone.id, e.target.value)}
                      placeholder="区域名称"
                      className="flex-1 border border-input rounded-lg px-2 py-1 text-sm font-medium"
                    />
                    <Button type="button" size="xs" variant="outline" onClick={() => handleAddSeat(zone.id)}>
                      <Plus className="size-3" />
                      添加座位
                    </Button>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      disabled={zoneHasSeats}
                      title={zoneHasSeats ? "请先清空该区域内座位" : "删除区域"}
                      onClick={() => handleRemoveZone(zone.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                  {zoneSeats.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {zoneSeats.map((seat) => {
                        const occupied = occupiedSeatIds.has(seat.id);
                        return (
                          <div key={seat.id} className="flex items-center gap-1">
                            <input
                              value={seat.label}
                              onChange={(e) => handleRenameSeat(seat.id, e.target.value)}
                              placeholder="座位号"
                              className="flex-1 min-w-0 border border-input rounded-lg px-2 py-1 text-sm"
                            />
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              disabled={!shopUid}
                              title="下载本座位专属二维码"
                              onClick={() => handleDownloadSeatQr(seat)}
                              className="text-muted-foreground hover:text-primary shrink-0"
                            >
                              <QrCode className="size-3" />
                            </Button>
                            <Button
                              type="button"
                              size="icon-xs"
                              variant="ghost"
                              disabled={occupied}
                              title={occupied ? "占用中，请先结账" : "删除座位"}
                              onClick={() => handleRemoveSeat(seat.id)}
                              className="text-muted-foreground hover:text-destructive shrink-0"
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {zones.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                还没有区域，点击右上角&quot;添加区域&quot;开始配置。
              </p>
            )}
          </div>

          <div className="mt-8 mb-3 flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <Ticket className="size-4 text-primary" />
              次卡产品管理
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="xs" onClick={() => setIsPunchCardModalOpen(true)}>
                管理会员次卡
              </Button>
              <Button variant="outline" size="xs" onClick={handleAddPunchCardProduct}>
                <Plus className="size-3" />
                添加次卡方案
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {punchCardProducts.map((p) => (
              <div key={p.id} className="border border-border rounded-lg bg-muted/30 p-3 pt-6 relative text-sm">
                <button
                  className="absolute top-1 right-2 text-muted-foreground hover:text-destructive p-1"
                  onClick={() => handleRemovePunchCardProduct(p.id)}
                >
                  <X className="size-3.5" />
                </button>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">名称</label>
                    <input
                      className="w-full border border-input rounded-lg px-2 py-1"
                      value={p.name}
                      onChange={(e) => updatePunchCardProduct(p.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">总价(元)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full border border-input rounded-lg px-2 py-1 tabular-nums"
                      value={p.total_price}
                      onChange={(e) => updatePunchCardProduct(p.id, "total_price", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">总次数</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full border border-input rounded-lg px-2 py-1 tabular-nums"
                      value={p.total_uses}
                      onChange={(e) => updatePunchCardProduct(p.id, "total_uses", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
            {punchCardProducts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                还没有次卡方案，点击右上角&quot;添加次卡方案&quot;开始配置。
              </p>
            )}
          </div>

          <div className="mt-8 mb-3 flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
              <QrCode className="size-4 text-primary" />
              顾客号牌码
            </h3>
            <Button variant="outline" size="xs" onClick={handleRefreshUniversalUrl}>
              刷新
            </Button>
          </div>
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
              <div className="font-bold text-primary mb-1">本店通用顾客入口</div>
              <div className="text-primary/90 break-all">
                {customerUniversalUrl || "点击刷新后生成本店入口链接"}
              </div>
              <p className="mt-1 text-primary/70">
                这个链接做成店内通用二维码，顾客扫码后只需要输入自己的号牌/标识。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="default" size="sm" onClick={() => setIsCodeModalOpen(true)}>
                管理号牌码
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportUniversalQr}>
                导出通用入口二维码
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportUniversalNfc}>
                导出通用入口NFC
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadAllMaterials}>
                下载全部物料包
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              号牌生成、二维码导出和 NFC 写入清单在弹窗内统一处理，避免设置页过长。
            </p>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-border">
            {savedMessage && (
              <span className="self-center text-sm text-brand-turquoise">{savedMessage}</span>
            )}
            <Button variant="outline" onClick={handleReset}>
              取消重置
            </Button>
            <Button onClick={handleSave}>保存设置</Button>
          </div>
        </div>
      </div>

      {isCodeModalOpen && (
        <CustomerCodeModal
          customerUniversalUrl={customerUniversalUrl}
          customerCodes={customerCodes}
          onCustomerCodesChange={setCustomerCodes}
          onClose={() => setIsCodeModalOpen(false)}
        />
      )}

      {isPunchCardModalOpen && (
        <PunchCardModal
          punchCardProducts={punchCardProducts}
          memberships={punchCardMemberships}
          onMembershipsChange={onPunchCardMembershipsChange}
          onClose={() => setIsPunchCardModalOpen(false)}
        />
      )}
    </div>
  );
}
