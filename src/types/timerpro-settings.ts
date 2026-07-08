export interface GroupBuyConfig {
  id: string;
  name: string;
  type: "fixed" | "time_slot" | "unlimited";
  price: number;
  people: number;
  duration_min: number;
  slot_start: string;
  slot_end: string;
}

export interface ShopConfig {
  price_base: number;
  time_base: number;
  price_overtime: number;
  price_unlimited: number;
  price_single_board: number;
  buffer_min: number;
  calc_mode: "exact" | "step";
  step_n: number;
  step_y: number;
  step_k: number;
  ceil_x: number;
  overtime_alert_enabled: boolean;
  group_buys: GroupBuyConfig[];
}

export interface CustomerCode {
  code_id: string;
  label: string;
  url: string;
}
