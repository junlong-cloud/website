"use client";

import { AlarmClock } from "lucide-react";

export interface OvertimeAlertItem {
  phone: string;
  modeText: string;
  overMinutes: number;
}

export interface OvertimeAlertModalProps {
  items: OvertimeAlertItem[];
  onClose: () => void;
}

export function OvertimeAlertModal({ items, onClose }: OvertimeAlertModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: "pulse-alert 1s ease-in-out infinite" }}
      >
        <div className="bg-gradient-to-r from-destructive to-amber-500 px-6 py-4 text-white text-center">
          <AlarmClock className="size-9 mx-auto mb-1" />
          <h3 className="text-xl font-bold">超时预警提醒</h3>
          <p className="text-white/85 text-sm mt-1">以下订单已超时</p>
        </div>
        <div className="px-6 py-4 max-h-60 overflow-y-auto">
          {items.map((item, index) => (
            <div
              key={`${item.phone}-${index}`}
              className="flex justify-between items-center py-3 border-b last:border-0 border-border"
            >
              <div>
                <span className="font-bold text-foreground text-lg">{item.phone}</span>
                <span className="ml-2 text-sm text-muted-foreground">{item.modeText}</span>
              </div>
              <span className="text-destructive font-bold text-sm bg-destructive/10 px-2 py-1 rounded-lg tabular-nums">
                超时 {item.overMinutes} 分钟
              </span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-bold text-lg hover:bg-destructive/90 transition"
          >
            我已知晓，关闭提醒
          </button>
        </div>
      </div>
    </div>
  );
}
