# UnMarket 架构设计

> 全自动营销工具 - 账号注册、养号、自动化运营

## 核心流程

```
┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐
│  1. 账号注册  │ →  │   2. 养号    │ →  │    3. 自动化运营       │
│   全自动     │    │    全自动    │    │   半自动 / 全自动      │
│ +异常人工介入│    │  按任务执行   │    │    7×24 运行          │
└──────────────┘    └──────────────┘    └──────────────────────┘
```

## 完整架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UnMarket 核心架构                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        调度系统 (Scheduler)                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │ │
│  │  │  定时触发    │  │  事件触发   │  │  手动触发   │               │ │
│  │  │  (Cron)     │  │  (Event)    │  │  (Manual)   │               │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘               │ │
│  │         └────────────────┼────────────────┘                       │ │
│  │                          ↓                                        │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │                    任务队列 (Task Queue)                     │ │ │
│  │  │  优先级队列 │ 延迟队列 │ 重试队列 │ 死信队列                 │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        任务系统 (Task Engine)                      │ │
│  │                                                                    │ │
│  │   任务类型                                                         │ │
│  │   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│ │
│  │   │ 注册任务  │ │ 养号任务 │ │ 生成任务 │ │ 发布任务 │ │互动任务││ │
│  │   │ REGISTER │ │ NURTURE  │ │ GENERATE │ │ PUBLISH  │ │ENGAGE  ││ │
│  │   └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘│ │
│  │                                                                    │ │
│  │   任务状态: PENDING → RUNNING → SUCCESS/FAILED/BLOCKED            │ │
│  │                          ↓                                         │ │
│  │                    BLOCKED → 人工介入 → RUNNING                    │ │
│  │                                                                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                    ↓                                    │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        执行引擎 (Executor)                         │ │
│  │                                                                    │ │
│  │   ┌─────────────────────────────────────────────────────────────┐ │ │
│  │   │                   平台适配层 (Platform Adapter)              │ │ │
│  │   │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │ │ │
│  │   │  │ Twitter │ │ Reddit  │ │LinkedIn │ │  更多... │           │ │ │
│  │   │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │ │ │
│  │   └─────────────────────────────────────────────────────────────┘ │ │
│  │                              ↓                                     │ │
│  │   ┌─────────────────────────────────────────────────────────────┐ │ │
│  │   │                   Unzoo Browser MCP                          │ │ │
│  │   └─────────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                        通知系统 (Notifier)                         │ │
│  │   桌面通知 │ Telegram │ 微信 │ 邮件                               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 核心模块

### 1. Task 任务模型

```typescript
interface Task {
  id: string;
  type: 'register' | 'nurture' | 'generate' | 'publish' | 'engage';
  status: 'pending' | 'running' | 'success' | 'failed' | 'blocked';
  priority: number;           // 优先级 1-10
  platform: string;           // 目标平台
  accountId?: string;         // 关联账号
  productId?: string;         // 关联产品
  payload: Record<string, any>; // 任务参数
  retryCount: number;
  maxRetries: number;
  scheduledAt?: Date;         // 计划执行时间
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  blockedReason?: string;     // 阻塞原因（需人工介入）
}
```

### 2. Platform 平台适配器接口

```typescript
interface Platform {
  name: string;

  // 账号
  register(gmail: string): Promise<RegisterResult>;
  login(account: Account): Promise<LoginResult>;
  checkLoginStatus(): Promise<boolean>;

  // 养号
  nurture(actions: NurtureAction[]): Promise<NurtureResult>;

  // 发布
  publish(content: Content): Promise<PublishResult>;

  // 互动
  engage(action: EngageAction): Promise<EngageResult>;
}
```

### 3. TaskQueue 任务队列

```typescript
interface TaskQueue {
  // 入队
  enqueue(task: Task): void;
  enqueueDelayed(task: Task, delay: number): void;

  // 出队
  dequeue(): Task | null;
  peek(): Task | null;

  // 状态
  size(): number;
  getPending(): Task[];
  getRunning(): Task[];
  getBlocked(): Task[];

  // 操作
  retry(taskId: string): void;
  cancel(taskId: string): void;
  unblock(taskId: string): void;
}
```

### 4. Scheduler 调度器

```typescript
interface Scheduler {
  // 启动/停止
  start(): void;
  stop(): void;

  // 调度
  scheduleTask(task: Task): void;
  scheduleCron(cron: string, taskFactory: () => Task): void;

  // 状态
  isRunning(): boolean;
  getStatus(): SchedulerStatus;
}
```

### 5. Executor 执行引擎

```typescript
interface Executor {
  // 执行
  execute(task: Task): Promise<TaskResult>;

  // 并发控制
  setMaxConcurrency(n: number): void;

  // 平台管理
  registerPlatform(platform: Platform): void;
  getPlatform(name: string): Platform | null;
}
```

### 6. Notifier 通知系统

```typescript
interface Notifier {
  // 通知
  notify(message: string, level: 'info' | 'warn' | 'error'): void;
  notifyBlocked(task: Task): void;

  // 渠道
  addChannel(channel: NotifyChannel): void;
}
```

## 重构计划

1. **Task 任务模型 + TaskQueue 队列** - 基础设施
2. **Platform 平台接口 + Twitter 实现** - 第一个平台
3. **Scheduler 调度器** - 定时和事件触发
4. **Executor 执行引擎** - 任务执行
5. **Notifier 通知系统** - 异常通知

## 目录结构（重构后）

```
src/
├── core/
│   ├── task/
│   │   ├── task.ts           # Task 模型
│   │   ├── task-queue.ts     # 任务队列
│   │   └── task-store.ts     # 任务持久化
│   ├── scheduler/
│   │   ├── scheduler.ts      # 调度器
│   │   └── cron.ts           # Cron 表达式
│   ├── executor/
│   │   ├── executor.ts       # 执行引擎
│   │   └── worker.ts         # 工作线程
│   └── notifier/
│       ├── notifier.ts       # 通知管理
│       ├── desktop.ts        # 桌面通知
│       └── telegram.ts       # Telegram 通知
├── platforms/
│   ├── platform.ts           # Platform 接口
│   ├── twitter/
│   │   ├── index.ts
│   │   ├── register.ts
│   │   ├── nurture.ts
│   │   └── publish.ts
│   ├── reddit/
│   └── linkedin/
├── cli/                      # CLI 命令（保留）
├── storage/                  # 数据存储（保留）
└── browser/                  # Unzoo 客户端（保留）
```

## 平台优先级

**第一批（跑通流程）**
- Twitter/X
- Reddit
- LinkedIn

**第二批（补充）**
- Product Hunt, Hacker News, Dev.to
- V2EX, 即刻, 小红书

---

## 实现状态（已落地，收敛到 Tauri/Rust）

> 重要决策：执行引擎**在 Tauri 的 Rust 后端（`src-tauri/src/lib.rs`）实现**，复用应用
> 已有的浏览器/发布/回复/限流代码，单一进程、无 Node 边车。共享契约是应用自己的
> SQLite 库 `%APPDATA%\unmarket\unmarket.db`（`dirs::data_dir()/unmarket`）。
> 本仓库早先用 TypeScript 搭的同名引擎已移至 `_archived/ts-engine-reference/`，仅作设计参考。

### Rust 执行引擎（`src-tauri/src/lib.rs`）

| 能力 | 实现 |
|------|------|
| 任务状态机 | `pending → running → completed / failed / blocked / cancelled` |
| 认领 | `engine_claim_next`（到期+创建序，原子置 running，单消费者） |
| 派发 | `engine_execute` 按 `task_type`：`publish` 复用 `publish_content`；`reply`/`reply_keyword` 走智能回复管线；`reply_mention` 抓自有帖评论后回复 |
| 重试退避 | 失败 `2^n` 分钟退避（封顶 60min），超 `ENGINE_MAX_RETRIES=3` 转 `failed` |
| 阻塞→人工 | 信息不全/需人工 → `blocked` + 原因，UI 可解除/重试/取消 |
| 崩溃恢复 | 启动时把遗留 `running` 重置为 `pending` |
| 安静时段 | `engine_quiet_start/end`（config），仅抑制 `OUTBOUND_TYPES` |
| 心跳/状态 | 写入 `config` 表（engine_running/heartbeat/processed） |
| 命令 | `start_engine` `stop_engine` `get_engine_status` `list_tasks` `unblock_task` `cancel_task` `retry_task` `check_selector` `get/set_engine_reply_mode` `list_pending_replies` `approve_reply` `reject_reply` |
| 自启动 | 环境变量 `UNMARKET_ENGINE_AUTOSTART=1`（headless/验证用；常规为手动启动） |

### 智能回复管线（"正确的回复内容"）
回复不再用写死模板，而是**读真帖 → AI 判定 → 生成针对性内容 → 模式闸门**：

1. **发现** `discover_posts`：轮询 `post_link_selector` 直到帖子链接渲染出来（SPA 容错，最多等 14s）。
2. **读真帖** `fetch_post_detail(url)`：打开帖子抓真实标题+正文（截断 2000 字），回填 `discovered_posts.post_content`。**这是正确回复的前提**——此前只有 URL 末段当标题，等于瞎回。
3. **判定+生成** `generate_smart_reply`：一次 LLM 调用返回 JSON `{relevant, mention_product, reply, reason}`。不相关 → 标记 `skipped` 不刷屏；相关 → 生成"针对本帖、像真人、按需软提产品"的回复。复用 `read_ai_config`（gemini/openai/deepseek/qwen）。LLM 瞬时报错 → `Retry`（不把模板兜底塞进队列）。
4. **模式闸门** `engine_reply_mode`（config，默认 `review`）：
   - `auto` 全自动：`reply_to_post(custom_reply=…)` 直接发布（含 `check_can_reply` 限流）。
   - `review` 半自动：写入 `reply_history` 状态 `pending_review`，对应帖标 `pending_review`，**不发布**，等人工 `approve_reply`（可编辑）/`reject_reply`。
5. **演练** `engine_dry_run=1`：照常读帖+生成并打印回复内容供评估，但不发布、不入库。

两种回复分型共用上述生成器：`reply_keyword`（陌生帖、获客、严格限流、`mention=true` 时软提产品）与 `reply_mention`（自有帖评论、社区运营、作者口吻、不广告）。

### 前端（`src/tauri-frontend/app.ts` → `dist/tauri`，esbuild 打包为 `scripts/app.js`）
- 任务队列页读真实 `tasks` 表（`list_tasks`），引擎启停按钮 + 状态徽标 + 每 3s 实时刷新 +
  逐任务「解除阻塞 / 重试 / 取消」。
- **回复模式切换**（半自动/全自动）+ **审核队列**：待审回复卡片可就地编辑、批准发布、驳回。
- **选择器自检** `check_selector`：填平台+关键词，实时报告命中数+样本，校准 `post_link_selector`。

### 验证（真实数据，2026-05）
- 引擎自动认领 `pending` 任务逐条流转。`reply_keyword` 经"发现→读真帖→Gemini 判定+生成"，
  实测对 reddit/twitter 生成的回复均**引用帖子真实内容、像真人、仅在契合时软提产品**（6 条里 1 条提及）。
- 选择器实测：reddit `a[href*="/comments/"]`、twitter `article a[href*="/status/"]` 各命中 16；
  二者需登录态 profile。LinkedIn 内容搜索页**不暴露帖子永久链接**，需改"信息流就地回复"（见下）。
- 半自动审核队列实测：`review` 模式下引擎生成回复入 `pending_review`、**不发布**，UI 可批准/驳回。

### LinkedIn 信息流就地回复（已实现）
LinkedIn 内容搜索页不暴露帖子永久链接，故 LinkedIn 走独立路径 `engine_linkedin_keyword`：
1. 导航搜索页 → 分段滚动加载 → `linkedin_extract_posts`：按多语言匹配「评论」按钮（搜索结果里该按钮**无 aria-label、仅文本**），上溯定位帖子容器，给容器打 `data-um-idx`、评论按钮打 `data-um-cbtn`，抽取作者+正文。
2. 按 作者+正文片段 哈希去重（复用 `discovered_posts`，`post_url` 存合成键 `linkedin-infeed:<hash>`）。
3. `generate_smart_reply` 判定相关性 + 生成回复（实测能按帖子语言作答，如对西语帖回西语）。
4. `linkedin_infeed_reply`：点开评论 → 全局定位评论框（**TipTap/ProseMirror** contenteditable，渲染在帖子容器之外）→ real_keyboard 输入 → **输入后**发布按钮（文本"评论"）才出现，上溯定位并点击。
5. 模式：dry-run 只打开评论框验证机制（不输入不提交）；review 入审核队列（`locator` 存正文片段）；auto 直接发布。
6. **审核批准**：LinkedIn 无 URL，`approve_reply` 重新导航搜索页、按 `locator` 片段在实时信息流重新定位帖子再就地发布。

### 养号调度引擎 + 账号健康监测（已实现，P0-1/P0-3）
养号不再是前端内存里的一次性按钮，已并入 Rust 引擎，成为 7×24 自动调度的"地基"：
- **养号任务** `engine_execute("nurture")`：选 profile → `simulate_platform_browsing(平台,时长)` 模拟真人浏览 → 写 `nurture_sessions` + upsert `nurture_daily_logs` + 累加 `accounts.total_nurture_seconds`。dry-run 只记日志；未登录 → 标 `health_status='logged_out'` 并 blocked。
- **养号调度** `nurture_schedule_tick`（引擎循环内，节流 5 分钟）：遍历 active+已绑 profile 账号 → 读 `nurture_strategies` → **按号龄分期定当日目标**（新号=min / 成长=max / 成熟=均值）→ 校验活跃时段 + 当日已完成 + 按活跃窗口均摊的最小间隔 → 入队一条 `nurture`（已有 pending/running 则跳过防堆积）。
- **账号体检** `engine_execute("health_check")` + `health_schedule_tick`（每账号每 ~20h）：导航首页 `check_platform_login_status` 判登录 → 写 `accounts.health_status`（healthy/logged_out…）+ `last_health_check`。掉登录/封禁账号在养号调度里被跳过。
- **命令/UI**：`get_nurture_overview`（每号 分期/今日 x/目标/累计/健康）+ `enqueue_nurture`（手动入队，持久化）；任务页「🌱 养号调度」面板每 3s 刷新展示。"新建养号任务"已从前端内存队列改为写 DB 任务。

### 发帖前防封闸门（已实现，P0-2）
把养号期/健康度/平台规则接进"发不发"的决策，由 `account_outbound_guard(conn, platform, account_id, kind)` 统一执行，串到 reply_keyword / publish / reply_mention / LinkedIn 四个对外路径：
- **健康闸门**（所有对外动作）：账号 `health_status` 为 logged_out/banned/shadowbanned → 阻塞。
- **养号期闸门**（仅 keyword/publish 高风险）：号龄 < 平台 `warmup_days` → 阻塞"养号期未满（x/y 天）"；回自己帖评论（mention）低风险放行。实测：healthy 的 twitter（12 天 < 14）被正确拦在养号期，与健康闸门独立。
- **Reddit 版规检查** `reddit_sub_blocks_promo`：发评论前拉 `/r/<sub>/about/rules.json`，命中禁推广/广告/spam 关键词的版块直接 `skipped`，避免删帖封号。
- 复用既有 `check_can_reply` 限流 + 安静时段。

### 增长质量层（已实现，P1）
- **买家意向打分 0–100（P1-4）**：`generate_smart_reply` 的 LLM JSON 增 `intent` 字段（此人是否在主动找/评估解决方案）。写入 `discovered_posts.intent_score` + `reply_history.intent_score`。**意向闸门** `engine_intent_min`（默认 40）：低于阈值直接 `skipped`，把额度留给高意向。审核队列按意向降序排。实测对 X 帖打分 60、通过闸门入队。
- **转化闭环 / 轻 CRM（P1-5）**：`leads` 表。每条**真实发出**的回复（auto 发布 / 批准发布 / LinkedIn 就地发）经 `record_lead` 记一条线索；`list_leads` / `update_lead_status`（engaged→replied_back→converted/dismissed）。UI 线索看板可标转化。
- **效果分析（P1-6）**：`get_marketing_stats` 按平台聚合 发现/跳过/回复/待审/均意向/线索/转化，+ 热门关键词（发现量+均意向）。UI 漏斗卡片 + 平台表 + 关键词。

### X/Twitter 回复硬化（已实现）
X 的回复框是 Draft.js contenteditable，通用 click+type（合成键入）**无效**（文本进不去）。实测得出可靠流程，封装为 `twitter_reply`：
1. `clean_x_status_url`：把帖子链接归一为基础 status 链接（去 `/analytics`、`/photo/N`、查询串——否则落到子页没有回复框）。
2. 轮询等待 `[data-testid="tweetTextarea_0"]`。
3. `focus()` + `execCommand('selectAll'/'delete'/'insertText')` 注入文本（Draft.js 友好；text 用 `serde_json::to_string` 编码成安全 JS 字面量）。
4. 输入后内联发布按钮 `[data-testid="tweetButtonInline"]` 才出现且启用 → 轮询后点击。
`post_reply_to_url` 对 twitter/x 走此专用流程，其余平台走通用流程（带轮询+步骤级报错）；`reply_to_post`（全自动）也统一改走 `post_reply_to_url`，三处发布路径一致。

### 拟人化交互层（已实现，反风控）
所有键鼠操作改走 Unzoo v1.8.4 的 `browser_*` MCP 工具（经 `unzoo_mcp` 统一调用），发出 **isTrusted=true 的真实事件**，比裸 REST 更难被平台判定为自动化：
- `unzoo_type` → `browser_type`：每字符真实 WebKeyboardEvent + 拟人间隔（`delay_ms` ~45–110ms），CJK 走 ImeCommitText。实测向 X 搜索框输入成功落字。
- `unzoo_click` → `browser_click`：自动等待元素 + 真实鼠标 + 支持 text=/role=/data-testid=/ref= 选择器。
- `unzoo_scroll` → `browser_scroll`：delta_y → 5 步真实滚轮事件（phase Began/Changed/Ended）。
- `unzoo_hover` → `browser_hover`：真实 mouse-move，触发 :hover/mouseenter（假事件触发不了）。
- X 回复正文仍走 `execCommand insertText`（Draft.js 专用）；其余输入统一走 browser_type。

### 市场提交（MCP/Skill 上架，已实现）
把产品的 MCP 服务 / Skill 一键铺到各大市场。`marketplaces` 表种子收录 15 个主流市场（实测整理，2025）：
- **MCP**：Official MCP Registry(cli)、mcp.so(form)、Smithery(cli)、Glama(auto_index)、PulseMCP(form)、Awesome MCP Servers(pr)、MCP Market(form)、LobeHub MCP(pr)、Docker MCP(pr)
- **Skill**：anthropics/skills(pr)、SkillsMP(auto_index)、SkillHub(auto_index)、LobeHub Skills(form)、MCP Market Skills(form)；Claude Marketplaces(both, auto_index)
四种提交方式：`form`（浏览器自动预填）/ `github_pr` / `cli` / `auto_index`（推 GitHub 即被收录）。

流程：产品填 `repo_url`+`install_cmd` → `generate_marketplace_listing`（AI 按每个市场格式生成 一句话/简介/标签/安装片段/awesome 条目，模板兜底）→ `submit_marketplace`：form 类入队 `marketplace_submit` 任务（引擎打开表单 + `marketplace_prefill` 按字段语义尽力预填，**不自动点提交**，留人工核对）；pr/cli/auto_index 类备好资料 + 给提交入口由人工完成。`marketplace_submissions` 表跟踪每产品×市场状态（pending/materials_ready/prefilled/submitted/listed）。UI：「🏪 市场提交」页。

### 待接续
- 线索回访自动检测（重新抓取我方评论所在帖，判断对方是否回复 → 自动置 replied_back）。
- Reddit 评论发布专用硬化（当前走通用流程 + 轮询 + 拟人事件）。
- `scheduled_jobs` 与 cron 触发接入引擎（定时生成 campaign 任务）。
- 私信/外联序列（Lemlist/Dripify 类）、代理 IP 池接入（`proxies` 表已存在未接）。
- `reply_mention` 当前仅 Reddit 支持抓评论；其余平台优雅阻塞，待补抓取
- 旧前端内存队列 `processTaskQueue`（publish/reply 按钮）逐步并入 `tasks` 表，彻底收敛
