"use client";

import { useEffect, useMemo, useState } from "react";
import { TimerProHeader, type TabKey } from "@/components/timerpro/TimerProHeader";
import { PosTab } from "@/components/timerpro/PosTab";
import { HistoryTab } from "@/components/timerpro/HistoryTab";
import { DashboardTab } from "@/components/timerpro/DashboardTab";
import { SettingsTab } from "@/components/timerpro/SettingsTab";
import { LoginGate } from "@/components/auth/LoginGate";
import { useAuth } from "@/hooks/useAuth";
import { useCloudDocState } from "@/hooks/useCloudDocState";
import { mockHistoryRecords } from "@/lib/mock-timerpro-history-data";
import {
  mockActiveOrders,
  mockPunchCardMemberships,
  mockPunchCardProducts,
  mockSeats,
  mockZones,
} from "@/lib/mock-timerpro-pos-data";
import { buildHistoryRecordFromCompletedOrder } from "@/lib/timerpro-history-convert";
import { toPosShopConfig } from "@/lib/timerpro-shop-config-adapter";
import { tickOrder, toPublicSeatStatus } from "@/lib/order-tick";
import { mockShopConfig as mockSettingsShopConfig } from "@/lib/mock-timerpro-settings-data";
import type { HistoryRecord } from "@/types/timerpro-history";
import type { ActiveOrder } from "@/types/timerpro-pos";
import type { ShopConfig as SettingsShopConfig } from "@/types/timerpro-settings";
import type {
  PublicSeatStatus,
  PunchCardMembership,
  PunchCardProduct,
  Seat,
  Zone,
} from "@/types/timerpro-seats";

function HomeContent() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabKey>("pos");
  const [historyRecords, setHistoryRecords] = useCloudDocState<HistoryRecord[]>(
    "history_records",
    mockHistoryRecords
  );
  const [shopName, setShopName] = useCloudDocState("shop_meta", "TimerPro 演示店铺");
  const [zones, setZones] = useCloudDocState<Zone[]>("zones", mockZones);
  const [seats, setSeats] = useCloudDocState<Seat[]>("seats", mockSeats);
  const [punchCardProducts, setPunchCardProducts] = useCloudDocState<PunchCardProduct[]>(
    "punch_card_products",
    mockPunchCardProducts
  );
  const [punchCardMemberships, setPunchCardMemberships] = useCloudDocState<
    PunchCardMembership[]
  >("punch_card_memberships", mockPunchCardMemberships);
  // Only ever written by explicit user actions (open/pause/checkout/...) — never by the
  // per-second clock, so this doesn't turn into a per-second write to the database.
  const [activeOrders, setActiveOrders, activeOrdersHydrated] = useCloudDocState<ActiveOrder[]>(
    "active_orders",
    mockActiveOrders
  );
  const [settingsShopConfig, setSettingsShopConfig] = useCloudDocState<SettingsShopConfig>(
    "shop_config",
    mockSettingsShopConfig
  );
  const posShopConfig = toPosShopConfig(settingsShopConfig);

  // Sanitized (no cost/pricing) mirror of activeOrders, published under READONLY
  // permissions so the public /c/[uid]/[seatId] customer page can read it via an
  // anonymous session. Only re-published when activeOrders itself changes (real
  // actions), not on the per-second tick.
  const [, setPublicSeatStatus] = useCloudDocState<PublicSeatStatus[]>("public_seat_status", []);
  useEffect(() => {
    setPublicSeatStatus(
      activeOrders.filter((o) => !o.isSuspended).map((o) => toPublicSeatStatus(o))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrders]);

  // Client-side-only render snapshot: recomputes elapsed time/cost/countdown every
  // second without touching `activeOrders` (and therefore without writing to the
  // cloud every second). Shared here so both PosTab and DashboardTab see the same
  // live numbers.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const displayOrders = useMemo(
    () => activeOrders.map((o) => tickOrder(o, now, posShopConfig)),
    [activeOrders, now, posShopConfig]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <TimerProHeader currentTab={currentTab} onTabChange={setCurrentTab} shopName={shopName} />
      <main className="container mx-auto p-4">
        <div style={{ display: currentTab === "pos" ? "block" : "none" }}>
          <PosTab
            shopConfig={posShopConfig}
            activeOrders={activeOrders}
            displayOrders={displayOrders}
            onActiveOrdersChange={setActiveOrders}
            ordersHydrated={activeOrdersHydrated}
            zones={zones}
            seats={seats}
            punchCardProducts={punchCardProducts}
            punchCardMemberships={punchCardMemberships}
            onPunchCardMembershipsChange={setPunchCardMemberships}
            onCheckoutComplete={(payload) => {
              const record = buildHistoryRecordFromCompletedOrder(
                payload,
                `chk-${payload.endTimestamp}`
              );
              setHistoryRecords((prev) => [record, ...prev]);
            }}
          />
        </div>
        <div style={{ display: currentTab === "history" ? "block" : "none" }}>
          <HistoryTab records={historyRecords} onRecordsChange={setHistoryRecords} />
        </div>
        <div style={{ display: currentTab === "dashboard" ? "block" : "none" }}>
          <DashboardTab
            historyRecords={historyRecords}
            activeOrders={displayOrders}
            seats={seats}
            punchCardMemberships={punchCardMemberships}
          />
        </div>
        <div style={{ display: currentTab === "settings" ? "block" : "none" }}>
          <SettingsTab
            shopName={shopName}
            onShopNameChange={setShopName}
            config={settingsShopConfig}
            onConfigChange={setSettingsShopConfig}
            zones={zones}
            onZonesChange={setZones}
            seats={seats}
            onSeatsChange={setSeats}
            punchCardProducts={punchCardProducts}
            onPunchCardProductsChange={setPunchCardProducts}
            punchCardMemberships={punchCardMemberships}
            onPunchCardMembershipsChange={setPunchCardMemberships}
            activeOrders={activeOrders}
            shopUid={user?.uid}
          />
        </div>
      </main>
    </div>
  );
}

export default function ClientApp() {
  return (
    <LoginGate>
      <HomeContent />
    </LoginGate>
  );
}
