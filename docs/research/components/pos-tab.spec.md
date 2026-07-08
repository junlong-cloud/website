# POS Tab (收银台) Specification

## Overview
- **Target files:** `src/components/timerpro/OpenOrderPanel.tsx`, `src/components/timerpro/ActiveOrdersPanel.tsx`, `src/components/timerpro/OrderCard.tsx`, `src/components/timerpro/modals/RemarkModal.tsx`, `src/components/timerpro/modals/CheckoutModal.tsx`, `src/components/timerpro/modals/AddTimeModal.tsx`, `src/components/timerpro/modals/OvertimeAlertModal.tsx`, `src/components/timerpro/PosTab.tsx` (wrapper importing all of the above)
- **Screenshot:** `docs/design-references/pos-tab.jpg`
- **Interaction model:** click-driven (no scroll-driven behavior anywhere on this page)
- **Data source:** `src/lib/mock-timerpro-data.ts` (already created), types in `src/types/timerpro.ts` (already created)

## Source of truth
The ENTIRE original markup uses Tailwind CSS utility classes verbatim (Tailwind CDN JIT — same classes work in our Tailwind v4 setup, no translation needed). Vue directives map to React as: `v-if`→`{cond && (...)}`, `v-show`→ same as v-if is fine here (no animation depends on it), `v-for`→`.map()`, `v-model`→ controlled `value`+`onChange` local `useState`, `@click`→`onClick`.

Full original template (React-ize this directly, keep every Tailwind class exactly as written):
- Left column "开台操作" form: lines with 数量 input, 顾客号牌/标识 dynamic list (array of inputs sized to `count`), 计费模式 select with 6 options, conditional sub-forms per mode (固定时长 shows minutes input; 团购套餐 shows a select populated from `shopConfig.group_buys` filtered to non time_slot; 时段优惠 shows select of time_slot group buys; 不限时/单板不限时 show a big price display), and a disabled-until-valid "🚀 开台" submit button.
- Right column "正在制作" panel: header with count + spinning refresh button; filter bar = 6 pill buttons (`orderFilterTabs`) + sort `<select>` (最新开台↓/最早开台↑/按台号A-Z/进度超时↓) + search `<input>`; order grid `grid md:grid-cols-2 gap-4` of `OrderCard`.
- `OrderCard`: border card with conditional classes — paused: `bg-yellow-50 border-yellow-300`; suspended: `suspended-card border-purple-300` (defined in globals.css, purple left border); overtime: `overtime-card` (blink-red animation, defined in globals.css); default: `border-gray-200`. Shows phone/table number + optional "👥 连坐" badge, status pill, ✖ force-remove button, info rows (模式/开始/已用/应付), countdown progress bar (only for fixed/group_buy modes with a limit) with color threshold (indigo <80%, orange ≥80%, red ≥100%), group-buy verify badges (main + `added_gb` list, each togglable 已核销/未核销), clickable remark row (opens RemarkModal), suspended lock-price banner, and action button row: "💰 结账/挂账" (always, opens CheckoutModal), "⏸ 暂停"/"▶ 继续" (toggle, hidden when suspended), "🔙 取消挂账" (only when suspended), "➕ 加时" (only for fixed/group_buy-with-limit modes, opens AddTimeModal).
- `RemarkModal`: `.modal-overlay`/`.modal-box` (global CSS classes already added), textarea + 取消/保存 buttons.
- `CheckoutModal`: shows bill breakdown (mode, limit min, added time, total duration, pause duration, play duration, over-time status, itemized `detail_items` list, final total), group-buy verify radio toggles (main + each added_gb), editable final amount input, remark textarea, team/连坐 batch-checkout panel (only if `groupId` shared with other active orders), and footer buttons 取消/📌挂账等候(hidden if already suspended)/💰确认结账.
- `AddTimeModal`: mode toggle pill (⏱直接加时间 / 🎫加团购券), direct mode = minutes input + 4 quick-set buttons (30/60/90/120), group-buy mode = select of `countdownGroupBuys` (type fixed, persons 1) + 核销状态 radio, footer 取消/确认添加.
- `OvertimeAlertModal`: red/orange gradient header with ⏰ icon, list of overtime items (phone + mode + "超时 N 分钟" badge), footer 我已知晓关闭 button. Uses `pulse-alert` keyframe animation on the modal box (already in globals.css). This can be built but not necessarily auto-triggered — a manual trigger button/state is fine for the demo since there's no real timer backend.

## States & Behaviors (see docs/research/BEHAVIORS.md for full detail)
- Filter tab active state: `bg-indigo-600 text-white shadow` vs `bg-gray-100 text-gray-600 hover:bg-gray-200`
- Card hover: `hover:shadow-md transition-all duration-200`
- Progress bar: `transition-all duration-1000`, width = `min(percent,100)%`
- `.btn-action:active { transform: scale(0.95) }` — apply `btn-action` class to all action buttons
- All modals close on backdrop click and on their own 取消 button

## Text content
Use literal Chinese text exactly as in mock data / labels above (顾客号牌/标识, 计费模式, 🚀 开台, 📋 正在制作, 💰 结账 / 挂账, ⏸ 暂停, ▶ 继续, 🔙 取消挂账, ➕ 加时, etc.) — do not translate or paraphrase.

## Responsive
- Desktop (1440px): `grid lg:grid-cols-3` — left col 1/3, right col 2/3 (`lg:col-span-2`); order grid `md:grid-cols-2`
- Mobile (390px): everything stacks to 1 column (`grid-cols-1`, no `md:`/`lg:` prefix applies)
- Breakpoints: `md` = 768px, `lg` = 1024px (Tailwind defaults)

## Verification
Run `npx tsc --noEmit` before finishing. `PosTab.tsx` should be a self-contained client component (`"use client"`) managing all local state (currentTab is NOT its concern — it's rendered by the parent page when `pos` tab is active).
