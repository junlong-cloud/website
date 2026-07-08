# Settings Tab (系统设置) Specification

## Overview
- **Target files:** `src/components/timerpro/SettingsTab.tsx`, `src/components/timerpro/modals/CustomerCodeModal.tsx`
- **Screenshot:** `docs/design-references/settings-tab.jpg`
- **Interaction model:** click-driven; tooltips are hover-driven (CSS-only, no JS)
- **Data:** `mockShopConfig` from `src/lib/mock-timerpro-data.ts` (values: price_base=19.9, time_base=60, price_overtime=20, price_unlimited=59.9, price_single_board=60, buffer_min=10, calc_mode='exact', step_n=30, step_y=15, step_k=1, ceil_x=5, group_buys=[...])

## DOM structure
Single column `max-w-2xl mx-auto space-y-6`, one white card `bg-white rounded-xl shadow-md p-6`:

1. **⚙️ 计费核心设置** heading, then `grid grid-cols-2 gap-4` of number inputs, each with a `<label>` and some with a hover tooltip icon (`<i class="ri-question-line">` or `ri-alert-line` wrapped in `.tooltip` span with `.tooltip-text` — these classes are already defined in globals.css, use them verbatim, do NOT rebuild with a JS tooltip library):
   - 通用基准价 (元/小时) — tooltip: "默认模式下，计算费用的基础标准价格。如果不使用进阶阶梯算法，系统会按此价格和在场时长进行折合计算。"
   - 基准时长 (分钟) — tooltip: "一小时=60分。配合基准价使用，通常保持60即可。系统内部计算单价率的基础。"
   - 加时单价 (元/小时) — tooltip: "定额/时段等包含固定时长的套餐，超出固定时长后的加收标准（即超时计费汇率）。"
   - 全天畅玩价 (元) — no tooltip
   - 单板不限时 (元) — no tooltip
   - 计费缓冲缓冲 (分钟) — RED alert-style tooltip (`ri-alert-line`, text-red-400, tooltip border-red-500): "重要参数：顾客超时多少分钟内不额外扣费。例如设置为10，玩了1小时9分钟只收1小时的钱。这是提供人情味的容错机制。"

2. **进阶阶梯计速参数 (仅选择阶梯算法时生效)** heading with info tooltip icon (`ri-information-line`): "阶梯算法适用于将计算切割为多个'块(计费周期)'的场景。例如：每10分钟收费5元，不满规定时间也可按逻辑进行舍去。这是一种更贴近实体的分段计费模型。" — then `grid grid-cols-2 gap-4`:
   - 算法模式 select: 精确计价(按比例) `exact` / 阶梯计价(按块) `step`
   - 计费块大小 N(分) — tooltip "每一个收费周期的时长。如设为'30'，代表每30分钟为一个计算切片。"
   - 每块收费 Y(元) — tooltip "对应上方 N(分) 产生的基础金额。例如 N=30，Y=15，代表每经过30分钟，产生 15 元。"
   - 进位分割系数 K — tooltip "内部进位算法系数。通常填1。若要实现特殊的四舍五入或向上取整逻辑可调整。默认情况下无需更改。"
   - 抹零免单界限 X(分) — tooltip "阶梯算法下的独立缓冲时间。每一个新的计费块开始时，前 X 分钟内结出不会被视作进入了这一个收费块（等于该计费块免单）。"

3. **🔔 超时提醒设置**: checkbox "启用超时铃声提醒" + helper text "开启后，当定额/团购卡片超时超过缓冲期时会自动弹窗并发出铃声"

4. **🎫 团购产品管理**: header with "＋添加团购方案" button (green). List (`space-y-4 max-h-80 overflow-y-auto`) of group-buy rows, each `border rounded bg-gray-50 p-3 pt-6 relative` with a "移除❌" button top-right, and a `grid grid-cols-2 md:grid-cols-5 gap-2` of: 展示名称 (text input, col-span-2/3), 团购类型 (select: 计时长(fixed)/包时间段(time_slot)/全天畅玩(unlimited)), 售价(元), 包含人数, 内含时长(分) (disabled when type=unlimited), 时段起/时段止 (both `type="time"`, disabled unless type=time_slot)

5. **📱 顾客号牌码**: info box showing "本店通用顾客入口" URL text, then `grid grid-cols-2 gap-2` of 4 buttons: 管理号牌码 (opens `CustomerCodeModal`, dark slate), 导出通用入口二维码, 导出通用入口NFC, 下载全部物料包 (last 3 are white/border, can be no-op/console.log since no backend)

6. Footer: 取消重置 / 保存设置 buttons, right-aligned

## CustomerCodeModal
Modal (`fixed inset-0 z-50 bg-black/40`) with header (title + description + × close), body: universal-entry URL box, mode toggle pills (连续编号/自定义号牌— same active/inactive pill style as the POS filter tabs: `bg-indigo-600 text-white` vs `bg-gray-100 text-gray-700`), range mode shows 前缀/起始/结束 inputs, custom mode shows a textarea, then a `grid grid-cols-2 gap-2` of 4 action buttons (生成/补齐号牌, 下载号牌二维码, 下载号牌NFC文件, 下载全部物料包), a small note box, and a list of existing codes (empty state: "暂无号牌，先生成一批或输入自定义号牌。"). Can operate on local mock state only (generating range codes should actually push mock entries into a local array — implement this small piece of real logic, it's cheap and makes the demo feel alive).

## Text content
All Chinese text above is verbatim from the source — do not paraphrase.

## Responsive
- 计费核心设置 / 阶梯参数 grids: `grid-cols-2` always (no mobile override in original)
- 团购管理 grid: `grid-cols-2` mobile → `md:grid-cols-5` desktop
- 号牌管理按钮 grid: `grid-cols-2` always

## Verification
`"use client"` components, local state only (no backend calls). Run `npx tsc --noEmit` before finishing.
