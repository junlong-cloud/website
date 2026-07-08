# History Tab (报表与历史) Specification

## Overview
- **Target file:** `src/components/timerpro/HistoryTab.tsx`
- **Screenshot:** `docs/design-references/history-tab.jpg`
- **Interaction model:** click-driven (checkbox selection reveals batch-delete button; date filters trigger re-query against mock data)
- **Data:** `mockHistoryRecords`, `mockHistoryStats` from `src/lib/mock-timerpro-data.ts`, types from `src/types/timerpro.ts`

## DOM structure (Tailwind classes verbatim from original — no translation needed)
- Header row (`flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4`):
  - Left: title "📊 历史账单明细流水库" (`text-xl font-bold text-gray-800`), "批量删除 (N)" button (`bg-red-100 border-red-300 text-red-600`, only visible when `selectedHistory.length > 0`), "📥 导出CSV" button (`bg-green-100 border-green-300 text-green-700`)
  - Right: date range `<input type="date">` x2 + "至" separator, "显示全部" button (white/gray), "检索查询" button (`bg-indigo-600 text-white`) — wrapped in `bg-gray-50 p-2 rounded-lg border`
- Search input full width: "🔍 搜索标识/团购类型/备注..."
- Stats grid `grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6`, 5 cards:
  1. indigo bg-indigo-50: 订单总数 (单) → `historyStats.count`
  2. blue bg-blue-50: 累计客数 → `historyStats.guests`
  3. green bg-green-50: 营业实收 (单据结算额) → `¥{total.toFixed(2)}`
  4. purple bg-purple-50: 已核销团购 (抵扣价值) → `¥{gbTotal.toFixed(2)}`
  5. orange bg-orange-50 border-orange-200: 订单总价值 (实收+核销) → `¥{(total+gbTotal).toFixed(2)}`
- Table (`overflow-x-auto rounded-lg border`, `min-w-full divide-y text-sm whitespace-nowrap`), 12 columns:
  checkbox (select-all in `<thead>`, per-row in `<tbody>`) | 起止时段 (start/end substr(5,16) each on own line) | 标识/单号 (phone) | 模式与时长 (mode_text, 在场:total_dur_str, 游玩:play_dur_str in 3 stacked lines) | 定额与暂离明细 (fixed_str in yellow box, pause_dur_str in purple box, both optional) | 团购类型 (gb_type or "-") | 团购核销值 (gb_voucher green or "-") | 账面总金额 (total_price, `line-through text-gray-500`) | 订单总价值 (`text-indigo-600 font-medium`, = actual_total + gb_voucher) | 结算实收额 (`text-orange-600 font-bold text-[15px]`) | 备注 (remark, wraps) | 操作 (删除 link button, red text hover underline)
- Empty state row: "未查询到相关记录" centered, colspan 12, `text-gray-400`

## Behaviors
- Row checkbox toggles membership in a local `selectedHistory` array (React state) — batch-delete button appears once non-empty
- Select-all checkbox toggles all filtered rows
- Search input filters the mock list client-side by phone/mode_text/remark substring match (case-insensitive) — this is a real, working filter over the mock array, not a stub
- Date filters can just filter the mock array by date range on `start_time` prefix, or be non-functional decorative controls if the mock dataset is tiny — implement basic filtering if simple, otherwise document as a static control
- "导出CSV" and 删除 buttons can be no-ops (log to console) since there's no real backend — this is expected per project scope (mock data only)

## Text content
Use exact Chinese strings listed above verbatim.

## Responsive
- Stats grid: `grid-cols-2` on mobile → `lg:grid-cols-5` at 1024px
- Header: `flex-col` stacked on mobile → `md:flex-row` at 768px
- Table always horizontally scrollable (`overflow-x-auto`), never reflows to cards

## Verification
`"use client"` component, self-contained local state. Run `npx tsc --noEmit` before finishing.
