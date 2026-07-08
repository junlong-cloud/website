"use client";

import { AlertTriangle, Armchair, LayoutGrid, Users } from "lucide-react";
import type { SeatStatusBucket } from "@/lib/seat-status";

export interface SeatStatusCounts {
  all: number;
  active: number;
  free: number;
  overtime: number;
}

export interface SeatStatusFilterBarProps {
  counts: SeatStatusCounts;
  filter: SeatStatusBucket | "all";
  onFilterChange: (filter: SeatStatusBucket | "all") => void;
}

export function SeatStatusFilterBar({ counts, filter, onFilterChange }: SeatStatusFilterBarProps) {
  const items: {
    key: SeatStatusBucket | "all";
    label: string;
    count: number;
    icon: typeof LayoutGrid;
    activeClasses: string;
  }[] = [
    { key: "all", label: "全部", count: counts.all, icon: LayoutGrid, activeClasses: "bg-primary text-primary-foreground" },
    {
      key: "active",
      label: "使用中",
      count: counts.active,
      icon: Users,
      activeClasses: "bg-brand-turquoise text-white",
    },
    {
      key: "free",
      label: "空闲",
      count: counts.free,
      icon: Armchair,
      activeClasses: "bg-foreground text-background",
    },
    {
      key: "overtime",
      label: "超时",
      count: counts.overtime,
      icon: AlertTriangle,
      activeClasses: "bg-destructive text-destructive-foreground",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {items.map((item) => {
        const active = filter === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterChange(item.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
              active ? item.activeClasses + " shadow-sm" : "bg-card text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
            <span className="tabular-nums font-bold">{item.count}</span>
          </button>
        );
      })}
    </div>
  );
}
