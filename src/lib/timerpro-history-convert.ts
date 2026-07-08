import type { HistoryRecord } from "@/types/timerpro-history";

/**
 * Plain-field payload emitted by PosTab when an order is checked out, so PosTab
 * doesn't need to depend on HistoryTab's types. page.tsx converts this into a
 * HistoryRecord and appends it to the persisted history list.
 */
export interface CompletedOrderPayload {
  seatLabel: string;
  modeText: string;
  startTime: string;
  startTimestamp: number;
  endTimestamp: number;
  totalDurationText: string;
  playDurationText: string;
  pauseDurationText: string;
  fixedPackageText: string;
  gbType: string;
  gbVoucherValue: number;
  totalPrice: number;
  actualTotal: number;
  remark: string;
  guestCount: number;
}

/** Local "YYYY-MM-DD" (not UTC, unlike Date#toISOString) so day-boundary comparisons match the user's clock. */
export function getLocalDateString(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${getLocalDateString(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildHistoryRecordFromCompletedOrder(
  payload: CompletedOrderPayload,
  id: string
): HistoryRecord {
  return {
    id,
    seatLabel: payload.seatLabel,
    start_time: formatDateTime(payload.startTimestamp),
    end_time: formatDateTime(payload.endTimestamp),
    mode_text: payload.modeText,
    total_dur_str: payload.totalDurationText,
    play_dur_str: payload.playDurationText,
    fixed_str: payload.fixedPackageText,
    pause_dur_str: payload.pauseDurationText,
    gb_type: payload.gbType,
    gb_voucher: payload.gbVoucherValue > 0 ? payload.gbVoucherValue.toFixed(2) : "",
    total_price: payload.totalPrice.toFixed(2),
    actual_total: payload.actualTotal.toFixed(2),
    remark: payload.remark,
    guestCount: payload.guestCount,
  };
}
