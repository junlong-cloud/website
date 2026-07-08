"use client";

import { useState } from "react";
import { Hourglass, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface AddTimeModalProps {
  onCancel: () => void;
  onConfirmDirect: (minutes: number) => void;
  onConfirmGroupBuy: () => void;
}

type AddTimeMode = "direct" | "group_buy";

const QUICK_MINUTES = [30, 60, 90, 120];

export function AddTimeModal({ onCancel, onConfirmDirect, onConfirmGroupBuy }: AddTimeModalProps) {
  const [mode, setMode] = useState<AddTimeMode>("direct");
  const [minutes, setMinutes] = useState(60);

  const handleConfirm = () => {
    if (mode === "direct") {
      onConfirmDirect(minutes);
    } else {
      onConfirmGroupBuy();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hourglass className="size-4 text-primary" />
            加时间 / 加团购券
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => setMode("direct")}
            variant={mode === "direct" ? "turquoise" : "secondary"}
            className="flex-1"
          >
            <Hourglass className="size-3.5" />
            直接加时间
          </Button>
          <Button
            type="button"
            onClick={() => setMode("group_buy")}
            variant={mode === "group_buy" ? "default" : "secondary"}
            className="flex-1"
          >
            <Ticket className="size-3.5" />
            加团购券
          </Button>
        </div>

        {mode === "direct" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">添加分钟数</label>
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value, 10) || 1)}
              className="w-full border border-input rounded-lg px-3 py-2 text-lg font-bold tabular-nums text-center focus:ring-2 focus:ring-brand-turquoise"
              placeholder="60"
            />
            <div className="flex gap-2 mt-2">
              {QUICK_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutes(m)}
                  className="flex-1 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/70 transition"
                >
                  {m}分
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === "group_buy" && (
          <p className="text-sm text-muted-foreground">将为该订单追加一张团购加时券。</p>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button type="button" variant="turquoise" onClick={handleConfirm}>
            确认添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
