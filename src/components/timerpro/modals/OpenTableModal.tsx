"use client";

import { useState } from "react";
import { Check, DoorOpen, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GroupBuyConfig, OrderMode, ShopConfig } from "@/types/timerpro-pos";
import type { PunchCardMembership, PunchCardProduct, Seat } from "@/types/timerpro-seats";

export type OpenTablePayload =
  | { kind: "builtin"; mode: OrderMode; fixedDurationMinutes?: number }
  | { kind: "group_buy"; groupBuyId: string; gbVerified: boolean }
  | { kind: "punch_card_existing"; membershipId: string }
  | { kind: "punch_card_new"; productId: string; customerName: string; phone: string };

export interface OpenTableModalProps {
  seat: Seat;
  shopConfig: ShopConfig;
  punchCardProducts: PunchCardProduct[];
  punchCardMemberships: PunchCardMembership[];
  onCancel: () => void;
  onConfirm: (payload: OpenTablePayload) => void;
}

type TabKey = "group_buy" | "builtin" | "punch_card";

const BUILTIN_MODES: { mode: OrderMode; label: string }[] = [
  { mode: "pay_later", label: "先玩后付" },
  { mode: "fixed", label: "固定时长" },
  { mode: "unlimited", label: "全天畅玩" },
  { mode: "single_board", label: "单板不限时" },
];

function GroupBuyCard({
  gb,
  selected,
  onSelect,
}: {
  gb: GroupBuyConfig;
  selected: boolean;
  onSelect: () => void;
}) {
  const detail =
    gb.type === "time_slot"
      ? `${gb.start_time}-${gb.end_time}`
      : gb.type === "unlimited"
        ? "包天"
        : `固定 ${gb.duration_minutes} 分钟`;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left border rounded-lg p-3 transition ${
        selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border hover:bg-muted/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm text-foreground">{gb.name}</span>
        {selected && <Check className="size-4 text-primary" />}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{detail}</div>
      <div className="text-sm font-bold tabular-nums text-primary mt-1">¥{gb.price}</div>
    </button>
  );
}

export function OpenTableModal({
  seat,
  shopConfig,
  punchCardProducts,
  punchCardMemberships,
  onCancel,
  onConfirm,
}: OpenTableModalProps) {
  const [tab, setTab] = useState<TabKey>("builtin");

  const [selectedGbId, setSelectedGbId] = useState<string>("");
  const [gbVerified, setGbVerified] = useState(false);

  const [selectedBuiltin, setSelectedBuiltin] = useState<OrderMode>("pay_later");
  const [fixedMinutes, setFixedMinutes] = useState(60);

  const [pcSearch, setPcSearch] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState("");
  const [showNewMembershipForm, setShowNewMembershipForm] = useState(false);
  const [newProductId, setNewProductId] = useState(punchCardProducts[0]?.id ?? "");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const matchingMemberships = punchCardMemberships.filter((m) => {
    if (m.remainingUses <= 0) return false;
    const q = pcSearch.trim().toLowerCase();
    if (!q) return true;
    return m.customerName.toLowerCase().includes(q) || m.phone.toLowerCase().includes(q);
  });

  const canConfirm =
    (tab === "group_buy" && selectedGbId !== "") ||
    (tab === "builtin" && (selectedBuiltin !== "fixed" || fixedMinutes > 0)) ||
    (tab === "punch_card" &&
      (selectedMembershipId !== "" ||
        (showNewMembershipForm && newProductId !== "" && (newCustomerName.trim() !== "" || newPhone.trim() !== ""))));

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (tab === "group_buy") {
      onConfirm({ kind: "group_buy", groupBuyId: selectedGbId, gbVerified });
    } else if (tab === "builtin") {
      onConfirm({
        kind: "builtin",
        mode: selectedBuiltin,
        fixedDurationMinutes: selectedBuiltin === "fixed" ? fixedMinutes : undefined,
      });
    } else if (selectedMembershipId) {
      onConfirm({ kind: "punch_card_existing", membershipId: selectedMembershipId });
    } else {
      onConfirm({
        kind: "punch_card_new",
        productId: newProductId,
        customerName: newCustomerName.trim(),
        phone: newPhone.trim(),
      });
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="size-4 text-primary" />
            开台办理 · {seat.label}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={tab === "group_buy" ? "default" : "secondary"}
            onClick={() => setTab("group_buy")}
            className="flex-1"
          >
            团购核销
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "builtin" ? "default" : "secondary"}
            onClick={() => setTab("builtin")}
            className="flex-1"
          >
            店内套餐
          </Button>
          <Button
            type="button"
            size="sm"
            variant={tab === "punch_card" ? "default" : "secondary"}
            onClick={() => setTab("punch_card")}
            className="flex-1"
          >
            <Ticket className="size-3.5" />
            次卡
          </Button>
        </div>

        {tab === "group_buy" && (
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {shopConfig.group_buys.map((gb) => (
              <GroupBuyCard
                key={gb.id}
                gb={gb}
                selected={selectedGbId === gb.id}
                onSelect={() => setSelectedGbId(gb.id)}
              />
            ))}
            {selectedGbId && (
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">核销状态:</span>
                <button
                  type="button"
                  onClick={() => setGbVerified(true)}
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${
                    gbVerified ? "bg-brand-turquoise/10 text-brand-turquoise" : "bg-muted text-muted-foreground"
                  }`}
                >
                  已核销
                </button>
                <button
                  type="button"
                  onClick={() => setGbVerified(false)}
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${
                    !gbVerified ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                  }`}
                >
                  未核销
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "builtin" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {BUILTIN_MODES.map(({ mode, label }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSelectedBuiltin(mode)}
                  className={`text-left border rounded-lg p-3 text-sm font-medium transition ${
                    selectedBuiltin === mode
                      ? "border-primary ring-2 ring-primary/30 bg-primary/5 text-primary"
                      : "border-border hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {label}
                  {mode === "unlimited" && (
                    <div className="text-xs font-normal text-muted-foreground mt-1">
                      ¥{shopConfig.price_unlimited}
                    </div>
                  )}
                  {mode === "single_board" && (
                    <div className="text-xs font-normal text-muted-foreground mt-1">
                      ¥{shopConfig.price_single_board}
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedBuiltin === "fixed" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">定额时长(分钟)</label>
                <input
                  type="number"
                  min={1}
                  value={fixedMinutes}
                  onChange={(e) => setFixedMinutes(parseInt(e.target.value, 10) || 1)}
                  className="w-full border border-input rounded-lg px-3 py-2 tabular-nums"
                />
              </div>
            )}
          </div>
        )}

        {tab === "punch_card" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={pcSearch}
                onChange={(e) => setPcSearch(e.target.value)}
                placeholder="按姓名/电话搜索会员次卡..."
                className="w-full border border-input rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {matchingMemberships.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMembershipId(m.id);
                    setShowNewMembershipForm(false);
                  }}
                  className={`w-full text-left border rounded-lg p-3 transition ${
                    selectedMembershipId === m.id
                      ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {m.customerName} {m.phone}
                    </span>
                    <span className="text-brand-turquoise font-bold tabular-nums">
                      剩余 {m.remainingUses}/{m.totalUsesSnapshot}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{m.productNameSnapshot}</div>
                </button>
              ))}
              {matchingMemberships.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">未找到匹配的会员次卡</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowNewMembershipForm((v) => !v);
                setSelectedMembershipId("");
              }}
              className="text-sm text-primary hover:underline"
            >
              + 新建会员次卡
            </button>

            {showNewMembershipForm && (
              <div className="border border-border rounded-lg p-3 space-y-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">次卡方案</label>
                  <select
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    className="w-full border border-input rounded-lg px-2 py-1.5 text-sm"
                  >
                    {punchCardProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ¥{p.total_price} ({p.total_uses}次)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">顾客姓名</label>
                    <input
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full border border-input rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">电话</label>
                    <input
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full border border-input rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="button" disabled={!canConfirm} onClick={handleConfirm}>
            确认开台
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
