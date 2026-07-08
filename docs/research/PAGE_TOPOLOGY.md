# TimerPro 页面拓扑

来源：https://timerpro.top/index.html （原始 HTML 已存档于 `docs/research/timerpro-source.html`）

## 技术栈（原站）
- Vue 3（`unpkg.com/vue@3/dist/vue.global.js`，无构建步骤，模板即 `#app` 的 innerHTML）
- Tailwind CSS（`cdn.tailwindcss.com` JIT，class 全部是标准 Tailwind utility class，**可直接照抄**，不需要 getComputedStyle 反推）
- RemixIcon 图标字体（仅在"设置"tab 的 tooltip 图标用到 `ri-question-line` / `ri-alert-line` / `ri-information-line`，其余图标全部是 emoji 文本，无需抽取 SVG 组件）
- 无自定义字体（`font-family: ui-sans-serif, system-ui, ...`），无自定义图片/视频资源
- 真实后端：`fetch` 拦截器注入 `Authorization`/`X-Shop-Code`，401 跳转 `/login.html`（未在本次克隆范围内，按 mock 数据处理）

## 整体结构
- **Header**（sticky top-0，`bg-gradient-to-r from-indigo-600 to-purple-600`）：Logo+店铺名、桌面端 3 个 tab 按钮（收银台/报表与历史/系统设置）、右侧用户信息+刷新+登出按钮；移动端有单独的底部 tab 栏（`md:hidden`）
- **Main**：三个 tab 面板，用 `v-show` 切换（**click-driven，非 scroll-driven**，无滚动触发的动画/吸顶变化）
  1. `pos` 收银台
  2. `history` 报表与历史
  3. `settings` 系统设置
- **全局模态框**（不属于任何 tab，`v-if` 控制显示）：
  - 修改备注 modal
  - 结账/挂账详情 modal
  - 加时间/加团购券 modal
  - 超时预警弹窗（红色渐变头部，脉冲动画 `pulse-alert`）
  - 顾客号牌码管理 modal（设置 tab 内触发）

## Tab 1: 收银台 (pos) — INTERACTION MODEL: click-driven
两栏布局 `grid lg:grid-cols-3`：
- **左栏（开台操作）**：数量输入、顾客号牌动态列表（v-for 输入框，随数量变化）、计费模式下拉（先玩后付/固定时长/团购套餐/时段优惠/全天畅玩/单板不限时）、根据模式显示不同的条件表单、"开台"按钮
- **右栏（活跃订单，col-span-2）**：
  - 头部：标题+订单数、刷新按钮
  - 过滤栏：6 个 filter tab pill（全部/先玩后付/定额/团购/不限时/超时）+ 排序下拉 + 搜索框
  - 订单卡片网格 `grid md:grid-cols-2`：每卡片显示号牌、状态徽章、模式/开始时间/已用时长/应付金额、倒计时进度条（定额/团购限时类）、团购核销标签、备注（点击编辑）、操作按钮（结账/挂账、暂停/继续、取消挂账、加时）
  - 卡片有 3 种特殊状态样式：暂停中(`bg-yellow-50`)、挂账中(`suspended-card` 紫色左边框)、超时(`overtime-card` 红色边框+`blink-red`闪烁动画)

## Tab 2: 报表与历史 (history) — INTERACTION MODEL: click-driven
- 顶部：标题、批量删除按钮(有选中项时出现)、导出CSV按钮、日期范围选择器+检索按钮
- 搜索框
- 统计卡片 `grid grid-cols-2 lg:grid-cols-5`：订单总数/累计客数/营业实收/已核销团购/订单总价值（5种配色 indigo/blue/green/purple/orange）
- 明细表格（12列，横向滚动）：勾选框、起止时段、标识、模式与时长、定额与暂离明细、团购类型、团购核销值、账面总金额(删除线)、订单总价值、结算实收额、备注、删除操作

## Tab 3: 系统设置 (settings) — INTERACTION MODEL: click-driven
单列 `max-w-2xl mx-auto`，一个大卡片，多个子分区：
1. 基础价格参数（通用基准价/基准时长/加时单价/全天畅玩价/单板不限时/计费缓冲，每项都是 input，部分带 tooltip hover 说明）
2. 阶梯计速参数（算法模式下拉 精确/阶梯、块大小N/每块收费Y/进位系数K/免单界限X）
3. 超时提醒设置（复选框+说明文字）
4. 团购产品管理（v-for 列表，每项：名称/类型/售价/人数/时长/时段起止，可移除，可新增）
5. 顾客号牌码（通用入口链接展示 + 4个操作按钮，点开"管理号牌码"modal 做批量生成/导出）
6. 底部：取消重置 / 保存设置 按钮

## 响应式断点
- `md` (768px)：header 从底部tab栏切换为顶部横向nav；报表统计卡片从2列→5列；团购管理表单从2列→5列
- `lg` (1024px)：收银台从1列→3列(1+2分栏)

## 需要新增的依赖
- RemixIcon（`remixicon` npm 包或直接引入 CDN css）用于设置页 tooltip 图标
