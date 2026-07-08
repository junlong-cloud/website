"use client";

import { useState } from "react";
import { Plus, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PunchCardMembership, PunchCardProduct } from "@/types/timerpro-seats";

export interface PunchCardModalProps {
  punchCardProducts: PunchCardProduct[];
  memberships: PunchCardMembership[];
  onMembershipsChange: (updater: (prev: PunchCardMembership[]) => PunchCardMembership[]) => void;
  onClose: () => void;
}

export function PunchCardModal({
  punchCardProducts,
  memberships,
  onMembershipsChange,
  onClose,
}: PunchCardModalProps) {
  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState(punchCardProducts[0]?.id ?? "");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const filtered = memberships.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return m.customerName.toLowerCase().includes(q) || m.phone.toLowerCase().includes(q);
  });

  const handleCreate = () => {
    const product = punchCardProducts.find((p) => p.id === productId);
    if (!product || (!customerName.trim() && !phone.trim())) return;
    onMembershipsChange((prev) => [
      {
        id: crypto.randomUUID(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        productId: product.id,
        productNameSnapshot: product.name,
        totalUsesSnapshot: product.total_uses,
        remainingUses: product.total_uses,
        purchasedAt: Date.now(),
      },
      ...prev,
    ]);
    setCustomerName("");
    setPhone("");
  };

  const handleTopUp = (id: string, delta: number) => {
    onMembershipsChange((prev) =>
      prev.map((m) => (m.id === id ? { ...m, remainingUses: Math.max(0, m.remainingUses + delta) } : m))
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="size-4 text-primary" />
            会员次卡管理
          </DialogTitle>
          <DialogDescription>查看剩余次数，手动新增或补充会员次卡。</DialogDescription>
        </DialogHeader>

        <div className="border border-border rounded-lg p-3 space-y-2">
          <div className="text-sm font-semibold text-foreground">新增会员次卡</div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="col-span-2 border border-input rounded-lg px-2 py-1.5 text-sm"
            >
              {punchCardProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ¥{p.total_price} ({p.total_uses}次)
                </option>
              ))}
            </select>
            <input
              placeholder="顾客姓名"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border border-input rounded-lg px-2 py-1.5 text-sm"
            />
            <input
              placeholder="电话"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-input rounded-lg px-2 py-1.5 text-sm"
            />
          </div>
          <Button type="button" size="sm" onClick={handleCreate}>
            <Plus className="size-3.5" />
            新增
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索姓名/电话..."
            className="w-full border border-input rounded-lg pl-9 pr-3 py-2 text-sm"
          />
        </div>

        {filtered.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            {filtered.map((m) => (
              <div key={m.id} className="px-3 py-2 border-b border-border last:border-b-0 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    {m.customerName} {m.phone}
                  </span>
                  <span className="text-brand-turquoise font-bold tabular-nums text-xs">
                    剩余 {m.remainingUses}/{m.totalUsesSnapshot}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{m.productNameSnapshot}</span>
                  <div className="flex gap-1">
                    <Button type="button" size="xs" variant="outline" onClick={() => handleTopUp(m.id, 1)}>
                      +1次
                    </Button>
                    <Button type="button" size="xs" variant="outline" onClick={() => handleTopUp(m.id, 5)}>
                      +5次
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground border border-border rounded-lg">
            暂无会员次卡
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
