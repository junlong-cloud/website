export interface HistoryRecord {
  id: string;
  seatLabel: string;
  start_time: string;
  end_time: string;
  mode_text: string;
  total_dur_str: string;
  play_dur_str: string;
  fixed_str: string;
  pause_dur_str: string;
  gb_type: string;
  gb_voucher: string;
  total_price: string;
  actual_total: string;
  remark: string;
  /** Number of guests on this order; defaults to 1 when absent. */
  guestCount?: number;
}

export interface HistoryStats {
  count: number;
  guests: number;
  total: number;
  gbTotal: number;
}
