import type { ShopConfig as PosShopConfig, GroupBuyConfig as PosGroupBuyConfig } from "@/types/timerpro-pos";
import type { ShopConfig as SettingsShopConfig } from "@/types/timerpro-settings";

/**
 * SettingsTab persists pricing/group-buy config using the richer `timerpro-settings`
 * ShopConfig shape (different field names: people/duration_min/slot_start/slot_end).
 * PosTab/OpenTableModal read the simpler `timerpro-pos` ShopConfig shape. This adapter
 * keeps the two in sync so group-buy products edited in Settings actually show up when
 * opening a table, instead of PosTab silently using its own static mock data.
 */
export function toPosShopConfig(settings: SettingsShopConfig): PosShopConfig {
  const group_buys: PosGroupBuyConfig[] = settings.group_buys.map((gb) => ({
    id: gb.id,
    name: gb.name,
    price: gb.price,
    persons: gb.people,
    type: gb.type,
    duration_minutes: gb.type === "fixed" ? gb.duration_min : undefined,
    start_time: gb.type === "time_slot" ? gb.slot_start : undefined,
    end_time: gb.type === "time_slot" ? gb.slot_end : undefined,
  }));

  return {
    price_unlimited: settings.price_unlimited,
    price_single_board: settings.price_single_board,
    price_per_hour: settings.price_base,
    group_buys,
  };
}
