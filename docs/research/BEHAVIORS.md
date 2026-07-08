# TimerPro 交互行为记录

## 整体交互模型
**纯 click-driven**，无 scroll-driven 行为，无 IntersectionObserver，无 scroll-snap，无 smooth-scroll 库。页面本身内容不多，不需要滚动触发任何动画。

## Tab 切换
- 点击顶部 3 个按钮之一，`currentTab` 状态切换，用 `v-show`（对应 React 中直接条件渲染或 CSS 隐藏）
- 当前激活 tab 按钮背景变为 `bg-indigo-800`（桌面）/ 底部白色下划线 `border-b-2 border-white`（移动端），无过渡动画（无 transition class）

## 收银台 tab 内部行为
- **计费模式下拉切换**：根据 `newOrder.mode` 值，条件显示不同的子表单（定额时长/团购选择/时段优惠选择/不限时价格展示），无动画，直接显示/隐藏
- **过滤 tab pill**：点击后 `orderFilterMode` 切换，激活态 `bg-indigo-600 text-white shadow`，非激活 `bg-gray-100 text-gray-600 hover:bg-gray-200`
- **订单卡片 hover**：`hover:shadow-md transition-all duration-200`
- **超时卡片**：`overtime-card` class 触发 `blink-red` 无限循环动画（1.5s ease-in-out），边框颜色在 `#ef4444` ↔ `#fca5a5` 之间闪烁，同时 box-shadow 强度变化
- **进度条**：宽度 `width: min(percent,100)%`，`transition-all duration-1000`；剩余≥80%时橙色(`bg-orange-400`)，≥100%时红色(`bg-red-500`)，否则靛蓝(`bg-indigo-500`)
- **按钮点击态**：`.btn-action:active { transform: scale(0.95) }`（全局 CSS，非 Tailwind）
- **备注区**：点击整个备注 div 触发打开"修改备注"modal（不是按钮，是可点击的 div + `cursor-pointer hover:bg-gray-100`）
- **刷新按钮图标**：加载中时 `animate-spin`

## 报表与历史 tab
- 勾选任意历史行后，"批量删除"按钮才出现（`v-if="selectedHistory.length > 0"`）
- 全选框：`toggleSelectAllHistory`
- 表格超宽时横向滚动 `overflow-x-auto`

## 系统设置 tab
- **Tooltip**：自定义 `.tooltip` / `.tooltip-text` class（非 Tailwind），hover 图标触发文字提示淡入淡出（`transition: opacity 0.3s`），提示框在图标上方居中弹出，箭头用 `::after` 伪元素
- 团购产品每行可点击"移除❌"直接从数组 splice 删除；"+添加团购方案"新增一行空白表单
- 号牌管理是独立 modal，内部有"连续编号"/"自定义号牌"两种模式切换（pill 按钮组，同过滤 tab 视觉一致）

## 模态框（4个 + 1个警告弹窗）
所有 modal 共用：
- `.modal-overlay`：`position:fixed; inset:0; background:rgba(0,0,0,0.5)`，点击遮罩自身关闭（`@click.self`）
- `.modal-box`：白底、`border-radius:12px`、`padding:24px`、`max-width:420px`（部分480px）、`box-shadow: 0 20px 60px rgba(0,0,0,0.3)`
- 超时预警弹窗使用独立样式（渐变红橙头部+`pulse-alert`脉冲动画，1s循环，scale 1↔1.02 + box-shadow 扩散），层级最高 `z-[9999]`

## 响应式
- **桌面 (1440px)**：header 顶部横向 nav；收银台 3 栏；报表统计 5 列
- **平板 (768px, md breakpoint)**：与桌面基本一致（md 是主要断点）
- **移动 (390px)**：header 变为底部 tab 栏；收银台变 1 栏堆叠；报表统计变 2 列；表格保持横向滚动
