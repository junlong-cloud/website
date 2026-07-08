"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Hourglass,
  Lock,
  NotebookPen,
  Pause,
  Pin,
  Play,
  Undo2,
  Wallet,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActiveOrder } from "@/types/timerpro-pos";

export interface CheckoutModalProps {
  order: ActiveOrder;
  onCancel: () => void;
  onSuspend: (amount: number, remark: string) => void;
  onConfirm: (amount: number, remark: string) => void;
  onTogglePause: (id: number) => void;
  onCancelSuspend: (id: number) => void;
  onAddTime: (id: number) => void;
  onOpenRemark: (id: number) => void;
  onToggleGroupBuyVerify: (orderId: number, groupBuyId: string) => void;
  onRemove: (id: number) => void;
}

function canAddTime(order: ActiveOrder): boolean {
  if (order.mode === "fixed") return true;
  if (order.mode === "group_buy" && order.gbConfig) {
    return order.gbConfig.type === "fixed" || order.gbConfig.type === "time_slot";
  }
  return false;
}

export function CheckoutModal({
  order,
  onCancel,
  onSuspend,
  onConfirm,
  onTogglePause,
  onCancelSuspend,
  onAddTime,
  onOpenRemark,
  onToggleGroupBuyVerify,
  onRemove,
}: CheckoutModalProps) {
  const isPunchCard = order.mode === "punch_card";
  const [amount, setAmount] = useState(isPunchCard ? 0 : order.estimatedCost);
  const [remark, setRemark] = useState(order.rawRemark ?? "");
  const remarkDisplay = order.rawRemark?.trim();

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-2">
            <span>{isPunchCard ? "结束使用" : "结账 / 挂账详情"}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${order.statusClass}`}>
              {order.statusText}
            </span>
          </DialogTitle>
          <DialogDescription>
            座位: <span className="font-bold text-foreground">{order.seatLabel}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-sm text-foreground bg-muted/50 p-3 rounded-lg border border-border">
          <div className="flex justify-between">
            <span className="font-medium">计费模式:</span>
            <span>{order.modeText}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">总时长:</span>
            <span className="tabular-nums">{order.elapsedTime}</span>
          </div>
          {!isPunchCard && (
            <div className="flex justify-between">
              <span className="font-medium">计费时长:</span>
              <span className="text-brand-turquoise font-bold tabular-nums">{order.elapsedTime}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 mt-1 border-t border-border">
            <span className="font-bold text-foreground">合计</span>
            <span className="font-bold text-lg text-primary tabular-nums">
              {isPunchCard ? "¥0.00（次卡已预付）" : `¥${order.estimatedCost.toFixed(2)}`}
            </span>
          </div>
        </div>

        {order.countdown && (
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span
                className={`font-medium flex items-center gap-1 ${
                  order.countdown.percent >= 100 ? "text-destructive" : "text-brand-turquoise"
                }`}
              >
                {order.countdown.percent >= 100 ? (
                  <>
                    <AlertTriangle className="size-3" />
                    已超时
                  </>
                ) : (
                  <>
                    <Hourglass className="size-3" />
                    剩余
                  </>
                )}
              </span>
              <span
                className={`font-bold tabular-nums ${
                  order.countdown.percent >= 100
                    ? "text-destructive"
                    : order.countdown.percent >= 80
                      ? "text-amber-600"
                      : "text-brand-turquoise"
                }`}
              >
                {order.countdown.remainText}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  order.countdown.percent >= 100
                    ? "bg-destructive"
                    : order.countdown.percent >= 80
                      ? "bg-amber-500"
                      : "bg-brand-turquoise"
                }`}
                style={{ width: `${Math.min(order.countdown.percent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {(order.gbConfig || order.added_gb.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {order.gbConfig && (
              <button type="button" onClick={() => onToggleGroupBuyVerify(order.id, order.gbConfig!.id)}>
                <Badge
                  variant={
                    order.added_gb.find((g) => g.id === order.gbConfig!.id)?.verified
                      ? "turquoise"
                      : "destructive"
                  }
                >
                  {order.gbConfig.name}{" "}
                  {order.added_gb.find((g) => g.id === order.gbConfig!.id)?.verified ? "已核销" : "未核销"}
                </Badge>
              </button>
            )}
            {order.added_gb
              .filter((g) => g.id !== order.gbConfig?.id)
              .map((gb) => (
                <button key={gb.id} type="button" onClick={() => onToggleGroupBuyVerify(order.id, gb.id)}>
                  <Badge variant={gb.verified ? "turquoise" : "destructive"}>
                    {gb.name} {gb.verified ? "已核销" : "未核销"}
                  </Badge>
                </button>
              ))}
          </div>
        )}

        <div
          onClick={() => onOpenRemark(order.id)}
          className="text-sm text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg cursor-pointer hover:bg-muted transition truncate flex items-center gap-1.5"
          title="点击编辑备注"
        >
          <NotebookPen className="size-3.5 shrink-0" />
          {remarkDisplay || "(点击添加备注)"}
        </div>

        {order.isSuspended && (
          <div className="text-sm font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg flex items-center gap-1.5 tabular-nums">
            <Lock className="size-3.5" />
            挂账冻结: ¥{order.lockedCost}
          </div>
        )}

        {!isPunchCard && (
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <label className="block text-sm font-medium text-primary mb-1">应付/实收金额 (元)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full border-0 shadow-inner rounded-lg px-3 py-2 text-2xl font-bold tabular-nums text-center text-primary focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">订单备注</label>
          <textarea
            rows={2}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-turquoise resize-none"
            placeholder="如需备注，请在此输入..."
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {!order.isSuspended && !order.isPaused && (
            <Button type="button" onClick={() => onTogglePause(order.id)} variant="warning" size="sm" className="flex-1">
              <Pause className="size-3.5" />
              暂停
            </Button>
          )}
          {!order.isSuspended && order.isPaused && (
            <Button type="button" onClick={() => onTogglePause(order.id)} variant="turquoise" size="sm" className="flex-1">
              <Play className="size-3.5" />
              继续
            </Button>
          )}
          {order.isSuspended && (
            <Button type="button" onClick={() => onCancelSuspend(order.id)} variant="outline" size="sm" className="flex-1">
              <Undo2 className="size-3.5" />
              取消挂账
            </Button>
          )}
          {canAddTime(order) && (
            <Button type="button" onClick={() => onAddTime(order.id)} variant="turquoise" size="sm" className="flex-1">
              <Hourglass className="size-3.5" />
              加时
            </Button>
          )}
          <Button
            type="button"
            onClick={() => onRemove(order.id)}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="size-3.5" />
            强制移除
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          {!isPunchCard && !order.isSuspended && (
            <Button
              type="button"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => onSuspend(amount, remark)}
            >
              <Pin className="size-3.5" />
              挂账等候
            </Button>
          )}
          <Button type="button" onClick={() => onConfirm(amount, remark)}>
            <Wallet className="size-3.5" />
            {isPunchCard ? "确认结束" : "确认结账"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
