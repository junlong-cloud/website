"use client";

import { Store, BarChart3, LayoutDashboard, Settings, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TabKey = "pos" | "history" | "dashboard" | "settings";

const TABS: {
  key: TabKey;
  icon: typeof Store;
  deskLabel: string;
  mobileLabel: string;
}[] = [
  { key: "pos", icon: Store, deskLabel: "收银台", mobileLabel: "收银" },
  { key: "history", icon: BarChart3, deskLabel: "报表与历史", mobileLabel: "报表" },
  { key: "dashboard", icon: LayoutDashboard, deskLabel: "数据看板", mobileLabel: "看板" },
  { key: "settings", icon: Settings, deskLabel: "系统设置", mobileLabel: "设置" },
];

export function TimerProHeader({
  currentTab,
  onTabChange,
  shopName,
}: {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  shopName: string;
}) {
  return (
    <header className="bg-gradient-to-r from-primary to-brand-turquoise text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-14">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold whitespace-nowrap tracking-tight">
            PixTime <span className="font-normal opacity-90">像素时光</span>
          </h1>
          <nav className="hidden md:flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition text-sm ${
                  currentTab === tab.key ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                <tab.icon className="size-4" />
                {tab.deskLabel}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end border-r border-white/20 pr-4 mr-2">
            <span className="text-[10px] text-white/70 tracking-wider uppercase font-medium">
              SaaS | 体验版
            </span>
            <span className="text-sm font-bold tracking-tight">{shopName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/15 hover:text-white rounded-full"
              title="手动刷新"
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/15 hover:text-white rounded-full"
              title="退出系统"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="md:hidden flex bg-black/10 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-medium ${
              currentTab === tab.key ? "border-b-2 border-white" : "opacity-80"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.mobileLabel}
          </button>
        ))}
      </div>
    </header>
  );
}
