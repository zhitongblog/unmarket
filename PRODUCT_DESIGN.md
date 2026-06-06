# UnMarket 产品设计文档

> 新产品多平台智能发布系统
> 目标用户：流量增长黑客 (Growth Hacker)

## 一、产品定位

### 1.1 核心价值主张

**一句话描述：** 新产品发布时，自动完成多平台曝光，智能调度，动态优化。

**解决的核心问题：**
- 手动发布 10+ 平台需要 3-5 小时 → 自动化完成
- 各平台格式/风格不同 → AI 自动适配
- 账号容易被封 → 智能防封策略
- 不知道哪个渠道效果好 → 数据追踪反馈

### 1.2 目标用户

| 用户类型 | 特征 | 核心需求 |
|---------|------|----------|
| 独立开发者 | 单人/小团队，产品多 | 省时间，低成本曝光 |
| 增长黑客 | 专业做增长，管理多项目 | 规模化，数据驱动 |
| 营销团队 | 企业内部，多产品线 | 协作，合规，可控 |

### 1.3 产品边界

**做：**
- 多平台内容发布自动化
- 智能发布策略调度
- 账号健康度管理
- 发布效果追踪

**不做：**
- 社交媒体运营（日常互动）
- 广告投放
- 客服自动化
- 深度数据分析（BI）

---

## 二、核心概念模型

### 2.1 实体关系

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Product │────<│ Campaign│>────│ Platform│
│  产品   │     │  活动   │     │  平台   │
└─────────┘     └────┬────┘     └─────────┘
                     │
                     │ 包含
                     ▼
                ┌─────────┐     ┌─────────┐
                │  Task   │────>│ Account │
                │  任务   │     │  账号   │
                └────┬────┘     └─────────┘
                     │
                     │ 产生
                     ▼
                ┌─────────┐
                │ Result  │
                │  结果   │
                └─────────┘
```

### 2.2 核心实体定义

#### Product（产品）
```typescript
interface Product {
  id: string;
  name: string;
  url: string;
  tagline: string;           // 一句话描述
  description: string;       // 详细描述
  type: ProductType;         // SaaS/App/Tool/Game/...
  assets: {
    logo: string;
    screenshots: string[];
    video?: string;
  };
  keywords: string[];        // SEO 关键词
  targetAudience: string;    // 目标用户描述
  competitors: string[];     // 竞品
  launchDate?: Date;         // 计划发布日期
  status: 'draft' | 'ready' | 'launched';
}
```

#### Campaign（发布活动）
```typescript
interface Campaign {
  id: string;
  productId: string;
  name: string;              // "ProductHunt Launch" / "全平台首发"
  type: CampaignType;        // 'launch' | 'update' | 'promotion'

  // 目标平台配置
  platforms: PlatformConfig[];

  // 调度策略
  schedule: ScheduleConfig;

  // 内容策略
  content: ContentConfig;

  // 状态
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';

  // 统计
  stats: CampaignStats;
}

interface PlatformConfig {
  platform: string;          // 'twitter' | 'reddit' | ...
  enabled: boolean;
  priority: number;          // 1-10，影响发布顺序
  accountId?: string;        // 指定账号，不指定则自动选择
  languages: string[];       // ['en', 'zh', ...]
  customContent?: string;    // 自定义内容（覆盖AI生成）
}

interface ScheduleConfig {
  mode: 'immediate' | 'scheduled' | 'smart';

  // immediate: 立即开始，按策略自动排期
  // scheduled: 指定开始时间
  // smart: AI 选择最佳时机

  startTime?: Date;

  // 发布节奏
  pacing: {
    mode: 'aggressive' | 'balanced' | 'conservative';
    // aggressive: 尽快发完（1-2小时内）
    // balanced: 分散在一天内
    // conservative: 分散在多天

    maxPerHour: number;      // 每小时最大发布数
    maxPerDay: number;       // 每天最大发布数

    // 时间窗口
    activeHours: {
      start: number;         // 0-23
      end: number;
    };
    timezone: string;
  };
}

interface ContentConfig {
  // AI 内容生成配置
  tone: 'professional' | 'casual' | 'enthusiastic' | 'technical';
  style: 'informative' | 'promotional' | 'storytelling';

  // 通用元素
  includeUrl: boolean;
  includeHashtags: boolean;
  includeCTA: boolean;       // Call to Action

  // A/B 测试
  variants: number;          // 生成几个变体
}
```

#### Account（账号）
```typescript
interface Account {
  id: string;
  platform: string;
  username: string;
  displayName: string;

  // 健康度
  health: {
    score: number;           // 0-100
    status: 'healthy' | 'warning' | 'restricted' | 'banned';
    lastCheck: Date;
    issues: string[];
  };

  // 使用统计
  usage: {
    postsToday: number;
    postsThisWeek: number;
    postsThisMonth: number;
    lastPostTime: Date;
  };

  // 限制
  limits: {
    maxPostsPerDay: number;
    minIntervalMinutes: number;
    warmupDaysLeft: number;  // 预热期剩余天数
  };

  // 元数据
  createdAt: Date;
  isWarmedUp: boolean;
  tags: string[];            // 'primary' | 'backup' | 'test'
}
```

#### Task（发布任务）
```typescript
interface Task {
  id: string;
  campaignId: string;

  // 目标
  platform: string;
  accountId: string;
  language: string;

  // 内容
  content: {
    title?: string;
    body: string;
    images: string[];
    hashtags: string[];
    url?: string;
  };

  // 调度
  scheduledTime: Date;
  priority: number;

  // 状态
  status: TaskStatus;
  attempts: number;
  lastAttempt?: Date;
  error?: string;

  // 结果
  result?: TaskResult;
}

type TaskStatus =
  | 'pending'      // 等待执行
  | 'scheduled'    // 已排期
  | 'preparing'    // 准备中（打开浏览器）
  | 'ready'        // 内容已填充，等待确认
  | 'publishing'   // 发布中
  | 'completed'    // 完成
  | 'failed'       // 失败
  | 'skipped'      // 跳过
  | 'cancelled';   // 取消

interface TaskResult {
  success: boolean;
  postUrl?: string;
  postId?: string;
  publishedAt: Date;
  screenshot?: string;

  // 后续追踪
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
    lastUpdated: Date;
  };
}
```

---

## 三、策略引擎设计

### 3.1 策略层级

```
全局默认策略
    ↓ 覆盖
平台级策略
    ↓ 覆盖
账号级策略
    ↓ 覆盖
活动级策略
    ↓ 覆盖
任务级策略
```

### 3.2 策略规则

#### 3.2.1 发布频率规则

```typescript
interface FrequencyRule {
  // 基础限制
  maxPostsPerHour: number;
  maxPostsPerDay: number;
  maxPostsPerWeek: number;

  // 间隔要求
  minIntervalMinutes: number;

  // 动态调整
  adjustments: {
    // 新账号降频
    newAccountMultiplier: number;     // 0.3 = 30% of normal
    newAccountDays: number;           // 多少天算新账号

    // 失败后降频
    failureBackoff: {
      enabled: boolean;
      multiplier: number;             // 每次失败后频率乘以这个
      maxBackoffHours: number;        // 最大退避时间
      resetAfterSuccess: number;      // 连续成功N次后重置
    };

    // 高峰期调整
    peakHours: {
      hours: number[];                // [9, 10, 11, 14, 15, 16]
      multiplier: number;             // 1.5 = 高峰期可以更频繁
    };
  };
}
```

#### 3.2.2 平台优先级规则

```typescript
interface PriorityRule {
  // 静态优先级
  basePriority: number;               // 1-10

  // 动态调整因子
  factors: {
    // 历史表现
    performanceWeight: number;        // 历史转化率的权重

    // 竞争环境
    competitionPenalty: number;       // 竞争激烈时降低优先级

    // 账号健康
    healthBonus: number;              // 健康账号加分

    // 时效性
    freshnessBonus: number;           // 新平台尝试加分
  };

  // 计算公式
  // finalPriority = basePriority
  //   + performance * performanceWeight
  //   - competition * competitionPenalty
  //   + health * healthBonus
  //   + freshness * freshnessBonus
}
```

#### 3.2.3 熔断规则

```typescript
interface CircuitBreakerRule {
  // 触发条件
  triggers: {
    consecutiveFailures: number;      // 连续失败N次
    failureRateThreshold: number;     // 失败率超过X%
    timeWindow: number;               // 统计时间窗口（分钟）
  };

  // 熔断动作
  actions: {
    pauseDuration: number;            // 暂停多长时间（分钟）
    alertUser: boolean;               // 是否通知用户
    switchAccount: boolean;           // 是否切换账号
    requireManualReset: boolean;      // 是否需要手动恢复
  };

  // 恢复条件
  recovery: {
    mode: 'auto' | 'manual';
    autoRecoveryMinutes: number;
    testBeforeResume: boolean;        // 恢复前先测试
  };
}
```

#### 3.2.4 内容适配规则

```typescript
interface ContentRule {
  platform: string;

  // 格式限制
  limits: {
    maxTitleLength: number;
    maxBodyLength: number;
    maxHashtags: number;
    maxImages: number;
    maxVideoLength: number;           // 秒
  };

  // 风格要求
  style: {
    tone: string[];                   // 推荐语气
    avoidWords: string[];             // 避免的词
    requiredElements: string[];       // 必须包含的元素
    hashtagStyle: 'inline' | 'end' | 'none';
  };

  // 最佳实践
  bestPractices: {
    optimalPostingTimes: number[];    // UTC 小时
    optimalLength: number;            // 最佳字数
    imageRecommended: boolean;
    videoPreferred: boolean;
  };
}
```

### 3.3 策略引擎架构

```
┌────────────────────────────────────────────────────────┐
│                    Strategy Engine                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Rule Engine  │  │ ML Optimizer │  │ A/B Testing  │ │
│  │  规则引擎    │  │  机器学习    │  │   A/B测试    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         ▼                 ▼                 ▼          │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Decision Aggregator                 │  │
│  │                 决策聚合器                       │  │
│  │  • 综合各模块建议                               │  │
│  │  • 冲突解决                                     │  │
│  │  • 最终决策                                     │  │
│  └─────────────────────┬───────────────────────────┘  │
│                        │                               │
│                        ▼                               │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Action Generator                    │  │
│  │                行动生成器                        │  │
│  │  • 生成具体任务                                 │  │
│  │  • 分配资源（账号、时间）                       │  │
│  │  • 设置优先级                                   │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 四、平台覆盖

### 4.1 平台分类

| 类别 | 平台 | 优先级 | 特点 |
|------|------|--------|------|
| **产品发布** | Product Hunt | P0 | 产品发布首选，但每天只能一个 |
| | Hacker News | P0 | 技术产品必选，但风险高 |
| | BetaList | P1 | 早期产品 |
| | Indie Hackers | P1 | 独立开发者社区 |
| **社交媒体** | Twitter/X | P0 | 即时性强，传播快 |
| | LinkedIn | P1 | B2B 产品 |
| | Facebook | P2 | 大众产品 |
| **技术社区** | Reddit | P0 | 多个相关 subreddit |
| | Dev.to | P1 | 开发者 |
| | Hashnode | P2 | 开发者博客 |
| **内容平台** | Medium | P1 | 长文推广 |
| | YouTube | P2 | 视频介绍 |
| **中文平台** | 知乎 | P0 | 问答+文章 |
| | 微博 | P1 | 即时传播 |
| | 公众号 | P1 | 深度内容 |
| | 即刻 | P1 | 产品圈 |
| | V2EX | P1 | 技术社区 |
| | 少数派 | P2 | 效率工具 |

### 4.2 平台实现状态

| 平台 | 发布 | 回复 | 数据追踪 | 状态 |
|------|------|------|----------|------|
| Twitter/X | ✅ | ⚠️ | ❌ | 基本可用 |
| Reddit | ⚠️ | ❌ | ❌ | 待完善 |
| Product Hunt | ❌ | ❌ | ❌ | 待开发 |
| LinkedIn | ❌ | ❌ | ❌ | 待开发 |
| 知乎 | ⚠️ | ❌ | ❌ | 待完善 |
| 微博 | ⚠️ | ❌ | ❌ | 待完善 |
| 公众号 | ❌ | - | ❌ | 待开发 |

### 4.3 平台接入优先级

**Phase 1 (MVP):**
- Twitter/X (完善)
- Reddit (完善)
- Product Hunt

**Phase 2:**
- LinkedIn
- Hacker News
- 知乎 (完善)

**Phase 3:**
- 公众号
- Medium
- Dev.to
- 其他

---

## 五、用户界面设计

### 5.1 核心页面

#### 5.1.1 Dashboard（仪表盘）

```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                          [+ New] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Active      │  │ Scheduled   │  │ Completed   │         │
│  │ Campaigns   │  │ Tasks       │  │ Today       │         │
│  │     3       │  │     12      │  │     28      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Active Campaigns                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 🚀 SoloMD Launch        Running   ████████░░ 80%    │   │
│  │    Twitter ✓  Reddit ✓  HN ⏳  PH 📅               │   │
│  │                                                      │   │
│  │ 📱 NewApp Beta          Scheduled  Starts in 2h     │   │
│  │    Twitter 📅  LinkedIn 📅                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Recent Activity                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ ✓ 10:30  Twitter    SoloMD post published           │   │
│  │ ✓ 10:15  Reddit     Posted to r/SideProject         │   │
│  │ ⚠ 10:00  HN         Rate limited, retry in 30m      │   │
│  │ ✓ 09:45  Twitter    Generated content approved      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Platform Health      │  │ Today's Performance      │    │
│  │                      │  │                          │    │
│  │ Twitter   ████████░░ │  │ Posts: 28               │    │
│  │ Reddit    ██████░░░░ │  │ Views: 1,234            │    │
│  │ LinkedIn  ██████████ │  │ Clicks: 89              │    │
│  │ HN        ████░░░░░░ │  │ Engagement: 4.2%        │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.1.2 Campaign Builder（活动创建器）

```
┌─────────────────────────────────────────────────────────────┐
│ New Campaign                                    [Save Draft]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1: Select Product                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [🔍 Search products...]                              │   │
│  │                                                      │   │
│  │ ● SoloMD          Markdown editor with AI           │   │
│  │ ○ UnMarket        Marketing automation              │   │
│  │ ○ + Add New Product                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Step 2: Choose Platforms                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Quick Select: [All] [English] [Chinese] [Tech]      │   │
│  │                                                      │   │
│  │ ☑ Twitter     @solomd_app    ████████░░ Healthy    │   │
│  │ ☑ Reddit      u/solomd       ██████░░░░ Warning    │   │
│  │ ☐ Product Hunt (Scheduled for tomorrow)             │   │
│  │ ☑ LinkedIn    /in/zhitong    ██████████ Healthy    │   │
│  │ ☑ 知乎        @知桐          ████████░░ Healthy    │   │
│  │ ☐ 公众号      (Not connected)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Step 3: Content Strategy                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Tone:    [Professional ▼]                           │   │
│  │ Style:   [Informative ▼]                            │   │
│  │                                                      │   │
│  │ ☑ Include product URL                               │   │
│  │ ☑ Include relevant hashtags                         │   │
│  │ ☑ Generate multiple variants (A/B test)             │   │
│  │                                                      │   │
│  │ Languages: [EN ☑] [ZH ☑] [JA ☐] [KO ☐]             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Step 4: Schedule                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ● Start immediately                                  │   │
│  │ ○ Schedule for: [____-__-__ __:__]                  │   │
│  │ ○ Let AI choose best time                           │   │
│  │                                                      │   │
│  │ Pacing: [Balanced ▼]                                │   │
│  │         Spread posts throughout the day             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                      [Preview] [Launch Campaign]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.1.3 Campaign Monitor（活动监控）

```
┌─────────────────────────────────────────────────────────────┐
│ Campaign: SoloMD Launch                    [Pause] [Stop]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Progress: ████████████████░░░░ 80% (16/20 tasks)          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Timeline                                             │   │
│  │                                                      │   │
│  │ 10:00 ──●── Twitter EN     ✓ Published   [View]     │   │
│  │ 10:15 ──●── Twitter ZH     ✓ Published   [View]     │   │
│  │ 10:30 ──●── Reddit         ✓ Published   [View]     │   │
│  │ 11:00 ──●── LinkedIn       ✓ Published   [View]     │   │
│  │ 11:30 ──◐── HN             ⏳ Waiting    [Skip]     │   │
│  │ 12:00 ──○── 知乎           📅 Scheduled  [Edit]     │   │
│  │ 14:00 ──○── Product Hunt   📅 Scheduled  [Edit]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ Live Stats           │  │ Alerts                   │    │
│  │                      │  │                          │    │
│  │ Total Reach: 2,341   │  │ ⚠ HN rate limited       │    │
│  │ Engagements: 127     │  │   Retry scheduled 11:30 │    │
│  │ Link Clicks: 45      │  │                          │    │
│  │ CTR: 1.9%            │  │ ℹ Reddit post approved  │    │
│  └──────────────────────┘  └──────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 核心交互流程

#### 5.2.1 账号注册流程（首次使用）

```
┌─────────────────────────────────────────────────────────────┐
│                    账号注册流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  用户选择要注册的平台                                        │
│      │                                                       │
│      ▼                                                       │
│  系统检查平台注册方式                                        │
│      │                                                       │
│      ├─── Google OAuth ───► 一键登录，自动完成              │
│      │    (Twitter, Medium,                                  │
│      │     Reddit, Dev.to...)                                │
│      │                                                       │
│      ├─── 邮箱注册 ───► 自动填写表单                        │
│      │    (ProductHunt,        │                             │
│      │     HackerNews...)      ▼                             │
│      │                   等待邮箱验证                        │
│      │                         │                             │
│      │                         ▼                             │
│      │                   用户点击验证链接                    │
│      │                                                       │
│      ├─── 需要手机验证 ───► 提示用户手动完成                │
│      │    (知乎, 微博,         │                             │
│      │     公众号...)          ▼                             │
│      │                   打开浏览器，用户操作                │
│      │                         │                             │
│      │                         ▼                             │
│      │                   检测登录成功，保存 Session          │
│      │                                                       │
│      └─── 手动注册 ───► 提供注册指南，用户自行完成          │
│           (少数派, 即刻...)                                  │
│                                                              │
│  注册完成后:                                                 │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────────────────────────────────────┐                │
│  │ Unzoo Profiles API                       │                │
│  │ • 创建独立配置文件                       │                │
│  │ • 随机化浏览器指纹                       │                │
│  │ • 保存 Cookies & Session                 │                │
│  │ • 设置代理（如需要）                     │                │
│  └─────────────────────────────────────────┘                │
│      │                                                       │
│      ▼                                                       │
│  账号进入预热期（7-14天）                                   │
│  • 每天自动登录，保持活跃                                   │
│  • 逐步增加发布频率                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.2 新产品发布流程

```
┌─────────────────────────────────────────────────────────────┐
│                    新产品发布流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: 添加产品                                           │
│  ┌─────────────────────────────────────────┐                │
│  │ 输入产品 URL                             │                │
│  │     │                                    │                │
│  │     ▼                                    │                │
│  │ AI 自动分析:                             │                │
│  │ • 产品名称、描述、截图                  │                │
│  │ • 目标用户、竞品分析                    │                │
│  │ • 推荐发布平台                          │                │
│  └─────────────────────────────────────────┘                │
│      │                                                       │
│      ▼                                                       │
│  Step 2: 创建发布活动                                       │
│  ┌─────────────────────────────────────────┐                │
│  │ • 选择目标平台（带健康度指示）          │                │
│  │ • 配置内容策略（语气、风格）            │                │
│  │ • 设置发布计划（立即/定时/智能）        │                │
│  └─────────────────────────────────────────┘                │
│      │                                                       │
│      ▼                                                       │
│  Step 3: AI 生成内容                                        │
│  ┌─────────────────────────────────────────┐                │
│  │ 为每个平台生成适配的内容:               │                │
│  │ • Twitter: 简短 + Hashtags              │                │
│  │ • Reddit: 标题 + 详细正文               │                │
│  │ • 知乎: 问答 + 文章形式                 │                │
│  │ • ...                                   │                │
│  └─────────────────────────────────────────┘                │
│      │                                                       │
│      ▼                                                       │
│  Step 4: 预览 & 确认                                        │
│  ┌─────────────────────────────────────────┐                │
│  │ • 查看所有生成的内容                    │                │
│  │ • 可编辑调整                            │                │
│  │ • 预览发布效果（截图）                  │                │
│  └─────────────────────────────────────────┘                │
│      │                                                       │
│      ▼                                                       │
│  Step 5: 启动发布                                           │
│  ┌─────────────────────────────────────────┐                │
│  │ Unzoo Scheduler API:                     │                │
│  │ • 创建定时任务                          │                │
│  │ • 按策略自动调度                        │                │
│  │                                         │                │
│  │ Unzoo Brain API:                         │                │
│  │ • 自主执行发布任务                      │                │
│  │ • 自动处理验证/弹窗                     │                │
│  │ • 失败自动重试                          │                │
│  └─────────────────────────────────────────┘                │
│      │                                                       │
│      ▼                                                       │
│  Step 6: 监控 & 报告                                        │
│  ┌─────────────────────────────────────────┐                │
│  │ • 实时查看发布进度                      │                │
│  │ • 异常告警（熔断触发）                  │                │
│  │ • 效果追踪（阅读/点赞/评论）            │                │
│  │ • 生成发布报告                          │                │
│  └─────────────────────────────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.3 单次发布流程（详细）

```
┌─────────────────────────────────────────────────────────────┐
│                    单次发布任务流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 任务开始                                                 │
│     │                                                        │
│     ▼                                                        │
│  2. 检查账号状态                                             │
│     ├── 健康 → 继续                                         │
│     └── 异常 → 切换备用账号或跳过                           │
│     │                                                        │
│     ▼                                                        │
│  3. 启动浏览器配置文件 (Unzoo Profiles)                      │
│     • 加载 Cookies/Session                                   │
│     • 应用指纹配置                                           │
│     • 设置代理                                               │
│     │                                                        │
│     ▼                                                        │
│  4. 切换 Stealth 模式 (Unzoo Performance)                    │
│     │                                                        │
│     ▼                                                        │
│  5. 导航到目标平台                                           │
│     │                                                        │
│     ▼                                                        │
│  6. 检查登录状态                                             │
│     ├── 已登录 → 继续                                       │
│     └── 未登录 → 尝试自动登录                               │
│              ├── 成功 → 继续                                 │
│              └── 失败 → 标记账号异常，切换账号              │
│     │                                                        │
│     ▼                                                        │
│  7. 准备发布 (Prepare Mode)                                  │
│     • 导航到发布页面                                        │
│     • 填充内容（使用 execCommand 或 ProseMirror）           │
│     • 上传图片（剪贴板方式）                                │
│     │                                                        │
│     ▼                                                        │
│  8. 截图预览                                                 │
│     • 生成预览截图                                          │
│     • 等待用户确认（如启用）或自动确认                      │
│     │                                                        │
│     ▼                                                        │
│  9. 执行发布                                                 │
│     • 点击发布按钮                                          │
│     • 处理确认对话框 (Unzoo Dialog)                         │
│     • 处理弹窗提示 (Unzoo Toast)                            │
│     │                                                        │
│     ▼                                                        │
│  10. 验证结果                                                │
│      • 检查是否发布成功                                     │
│      • 获取发布链接                                         │
│      • 截图保存证据                                         │
│      │                                                       │
│      ▼                                                       │
│  11. 记录结果                                                │
│      • 更新任务状态                                         │
│      • 保存发布链接                                         │
│      • 更新账号使用统计                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.4 日常操作流程

```
打开 Dashboard
    │
    ├── 查看活动状态
    │   └── 处理异常（如需要）
    │
    ├── 查看平台健康度
    │   └── 处理问题账号（重新登录/更换代理）
    │
    ├── 查看账号预热状态
    │   └── 确认预热完成的账号
    │
    └── 查看数据报告
        └── 优化策略
```

---

## 六、技术架构

### 6.1 Unzoo 能力整合

UnMarket 深度整合 Unzoo Browser API，充分利用其 150+ REST 端点和 220+ MCP 工具。

#### 6.1.1 核心能力映射

| Unzoo API | UnMarket 应用场景 | 优先级 |
|-----------|-------------------|--------|
| **Brain** | 自主 AI 代理执行复杂发布任务，自动规划→执行→修复 | P0 |
| **Profiles** | 每个平台账号独立浏览器配置文件，session 隔离 | P0 |
| **Fingerprint** | 随机化 GPU/Canvas/Audio/WebGL 指纹，反检测 | P0 |
| **Performance** | Stealth 模式，绕过反爬检测 | P0 |
| **Scheduler** | 定时发布任务，Cron 级别调度 | P0 |
| **Cookies** | Native Cookie API，支持 httpOnly，session 持久化 | P0 |
| **Proxy** | 每账号独立代理，IP 隔离 | P1 |
| **Dialog** | JS 对话框处理，自动确认发布 | P1 |
| **Toast** | Toast/Modal 拦截，处理弹窗 | P1 |
| **DevTools** | Network 拦截，处理平台挑战 | P1 |
| **Workflow** | 可视化工作流，复杂发布流程 | P2 |
| **Data** | 守护进程级 KV 存储，状态持久化 | P2 |

#### 6.1.2 账号隔离架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Unzoo Profiles                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Profile A   │  │ Profile B   │  │ Profile C   │         │
│  │ twitter_01  │  │ reddit_01   │  │ zhihu_01    │         │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤         │
│  │ • Cookies   │  │ • Cookies   │  │ • Cookies   │         │
│  │ • Session   │  │ • Session   │  │ • Session   │         │
│  │ • Fingerprint│  │ • Fingerprint│  │ • Fingerprint│        │
│  │ • Proxy     │  │ • Proxy     │  │ • Proxy     │         │
│  │ • History   │  │ • History   │  │ • History   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                              │
│  API 调用:                                                   │
│  • POST /api/v1/profiles/create          创建新配置文件      │
│  • POST /api/v1/profiles/fingerprint/randomize 随机化指纹   │
│  • POST /api/v1/profiles/proxy           设置代理           │
│  • POST /api/v1/profiles/launch          启动独立浏览器     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 6.1.3 反检测策略

```typescript
interface AntiDetectionConfig {
  // Unzoo Performance API
  stealthMode: 'full' | 'light' | 'stealth';  // POST /api/v1/performance/mode

  // Unzoo Profiles API
  fingerprint: {
    randomize: boolean;       // POST /api/v1/profiles/fingerprint/randomize
    gpu: string;              // 随机 GPU 信息
    canvas: string;           // 随机 Canvas 签名
    audio: string;            // 随机 Audio 指纹
    webgl: string;            // 随机 WebGL 信息
  };

  // 行为模拟（已在 lib.rs 实现）
  humanBehavior: {
    typingDelay: { min: number; max: number };
    mouseMovement: boolean;
    randomPauses: boolean;
    scrollBehavior: 'natural' | 'instant';
  };

  // 代理轮换
  proxy: {
    enabled: boolean;
    pool: string[];           // 代理池
    rotateOnError: boolean;   // 出错时轮换
  };
}
```

#### 6.1.4 Brain API 集成

```typescript
// 使用 Brain API 执行自主发布任务
interface BrainTask {
  goal: string;               // "发布产品到 Twitter，处理任何登录验证"
  profile_id: string;         // 使用的浏览器配置文件
  max_steps: number;          // 最大步骤数
  timeout_seconds: number;    // 超时时间

  // 任务参数
  context: {
    platform: string;
    content: string;
    images?: string[];
    hashtags?: string[];
  };
}

// API 调用
// POST /api/v1/brain/execute  执行任务
// GET /api/v1/brain/status/{task_id}  查询状态
```

### 6.2 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        UnMarket                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Frontend (Tauri)                  │   │
│  │  • Dashboard / Campaign Builder / Monitor            │   │
│  │  • Settings / Accounts Management                    │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │ IPC                            │
│  ┌─────────────────────────▼───────────────────────────┐   │
│  │                   Backend (Rust)                     │   │
│  │                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │ Campaign │  │ Strategy │  │ Content  │          │   │
│  │  │ Manager  │  │  Engine  │  │Generator │          │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘          │   │
│  │       │             │             │                 │   │
│  │  ┌────▼─────────────▼─────────────▼─────┐          │   │
│  │  │      Unzoo Scheduler Integration      │ ◄── NEW │   │
│  │  │  • Cron jobs for scheduled posts      │          │   │
│  │  │  • Pause/Resume support               │          │   │
│  │  └────────────────┬─────────────────────┘          │   │
│  │                   │                                 │   │
│  │  ┌────────────────▼─────────────────────┐          │   │
│  │  │           Task Executor               │          │   │
│  │  │  • Unzoo Brain API (autonomous)  ◄── NEW        │   │
│  │  │  • Unzoo Profiles (account isolation)           │   │
│  │  │  • Anti-detection (stealth + fingerprint)       │   │
│  │  └────────────────┬─────────────────────┘          │   │
│  │                   │                                 │   │
│  │  ┌────────────────▼─────────────────────┐          │   │
│  │  │           Data Collector              │          │   │
│  │  │  • Result tracking                    │          │   │
│  │  │  • Metrics collection                 │          │   │
│  │  └──────────────────────────────────────┘          │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────┐          │   │
│  │  │           SQLite Database             │          │   │
│  │  └──────────────────────────────────────┘          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Unzoo Browser Daemon                    │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │ REST API (150+ endpoints)                    │    │   │
│  │  │ MCP Tools (220+)                             │    │   │
│  │  ├─────────────────────────────────────────────┤    │   │
│  │  │ • Brain: Autonomous AI agent                 │    │   │
│  │  │ • Profiles: Per-AI browser isolation         │    │   │
│  │  │ • Fingerprint: Anti-detection                │    │   │
│  │  │ • Scheduler: Cron jobs                       │    │   │
│  │  │ • Performance: Stealth mode                  │    │   │
│  │  │ • Cookies: Native httpOnly support           │    │   │
│  │  │ • Dialog/Toast: Popup handling               │    │   │
│  │  │ • DevTools: Network interception             │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              External Services                       │   │
│  │  • AI APIs (Gemini/OpenAI/DeepSeek)                  │   │
│  │  • Platform APIs (where available)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 数据库设计

```sql
-- 产品表
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT,
    tagline TEXT,
    description TEXT,
    type TEXT,
    assets TEXT,           -- JSON
    keywords TEXT,         -- JSON array
    target_audience TEXT,
    status TEXT DEFAULT 'draft',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

-- 活动表
CREATE TABLE campaigns (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'launch',
    platforms TEXT,        -- JSON
    schedule TEXT,         -- JSON
    content_config TEXT,   -- JSON
    status TEXT DEFAULT 'draft',
    stats TEXT,            -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 账号表
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    username TEXT NOT NULL,
    display_name TEXT,
    health TEXT,           -- JSON
    usage TEXT,            -- JSON
    limits TEXT,           -- JSON
    cookies TEXT,          -- Encrypted
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME
);

-- 任务表
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    account_id TEXT,
    language TEXT DEFAULT 'en',
    content TEXT,          -- JSON
    scheduled_time DATETIME,
    priority INTEGER DEFAULT 5,
    status TEXT DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    last_attempt DATETIME,
    error TEXT,
    result TEXT,           -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- 策略规则表
CREATE TABLE strategy_rules (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,    -- 'frequency' | 'priority' | 'circuit_breaker' | 'content'
    scope TEXT NOT NULL,   -- 'global' | 'platform' | 'account' | 'campaign'
    scope_id TEXT,         -- platform name or account id or campaign id
    rules TEXT NOT NULL,   -- JSON
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 发布历史表
CREATE TABLE publish_history (
    id TEXT PRIMARY KEY,
    task_id TEXT,
    platform TEXT NOT NULL,
    account_id TEXT,
    product_id TEXT,
    content TEXT,
    post_url TEXT,
    post_id TEXT,
    status TEXT,
    metrics TEXT,          -- JSON
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_tasks_campaign ON tasks(campaign_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_scheduled ON tasks(scheduled_time);
CREATE INDEX idx_history_platform ON publish_history(platform);
CREATE INDEX idx_history_product ON publish_history(product_id);
```

---

## 七、实现路线图

### Phase 0: Unzoo 深度集成 (1 week)

**目标：** 充分利用 Unzoo 能力，建立坚实基础

- [ ] **Profiles 集成**
  - [ ] 每个账号创建独立 Profile
  - [ ] 实现指纹随机化
  - [ ] 实现代理设置
- [ ] **Stealth 模式**
  - [ ] 启用 Performance stealth mode
  - [ ] 测试反检测效果
- [ ] **Scheduler 集成**
  - [ ] 使用 Unzoo Scheduler 替代本地调度
  - [ ] 实现 Cron 任务管理
- [ ] **Cookie 管理**
  - [ ] 使用 Native Cookie API
  - [ ] 实现 Session 持久化

### Phase 1: 核心功能完善 (2 weeks)

**目标：** 单产品、单平台发布流程完整可用

- [ ] 完善 Twitter 发布（含图片）
- [ ] 完善 Reddit 发布
- [ ] 实现任务队列基础功能
- [ ] 实现基础策略引擎（频率控制）
- [ ] 优化 UI 交互
- [ ] **账号注册引导流程**
  - [ ] Google OAuth 自动登录
  - [ ] 邮箱注册自动填表
  - [ ] 手机验证提示用户参与

### Phase 2: 多平台扩展 (2 weeks)

**目标：** 支持 5+ 主流平台

- [ ] 添加 Product Hunt 支持
- [ ] 添加 LinkedIn 支持
- [ ] 添加 Hacker News 支持
- [ ] 完善知乎发布
- [ ] 实现平台优先级调度
- [ ] **Brain API 集成（试验）**
  - [ ] 复杂平台使用自主代理
  - [ ] 自动处理验证挑战

### Phase 3: 智能调度 (2 weeks)

**目标：** 策略引擎完整可用

- [ ] 实现熔断机制
- [ ] 实现动态调整
- [ ] 添加账号健康度监控
- [ ] 实现最佳时机选择
- [ ] 添加 A/B 测试支持
- [ ] **账号预热系统**
  - [ ] 自动每日登录
  - [ ] 渐进式增加活动频率

### Phase 4: 数据与优化 (2 weeks)

**目标：** 数据驱动优化

- [ ] 实现发布结果追踪
- [ ] 添加数据报告
- [ ] 实现策略自动优化
- [ ] 添加导出功能
- [ ] **Workflow 可视化（可选）**
  - [ ] 使用 Unzoo Workflow API
  - [ ] 可视化编辑发布流程

### Phase 5: 中文平台 (2 weeks)

**目标：** 完整支持中文生态

- [ ] 添加公众号支持
- [ ] 添加微博支持
- [ ] 添加即刻支持
- [ ] 添加 V2EX 支持
- [ ] 添加少数派支持

---

## 八、风险与对策

### 8.1 技术风险

| 风险 | 影响 | 对策 |
|------|------|------|
| 平台反爬 | 发布失败 | 多账号轮换、降低频率、模拟人类行为 |
| API 变更 | 功能失效 | 监控 + 快速修复机制 |
| 浏览器自动化不稳定 | 任务失败 | 重试机制、截图记录、手动恢复选项 |

### 8.2 业务风险

| 风险 | 影响 | 对策 |
|------|------|------|
| 账号被封 | 用户损失 | 预热策略、保守默认值、风险提示 |
| 内容质量差 | 效果不好 | AI 优化、用户可编辑、A/B 测试 |
| 平台规则变化 | 策略失效 | 持续监控、快速更新 |

### 8.3 合规风险

| 风险 | 影响 | 对策 |
|------|------|------|
| 违反平台 ToS | 法律风险 | 用户须知、风险提示、责任声明 |
| 垃圾内容 | 平台处罚 | 质量控制、频率限制 |

---

## 九、成功指标

### 9.1 产品指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 发布成功率 | > 95% | 任务成功完成比例 |
| 平均发布时间 | < 5 分钟 | 从创建活动到全部发布完成 |
| 用户留存 | > 60% (7日) | 首次使用后继续使用 |

### 9.2 业务指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 用户获取成本 | < $10 | 每个付费用户获取成本 |
| 月活跃用户 | 1000+ | 每月至少使用一次 |
| 付费转化率 | > 5% | 免费用户转付费 |

---

## 附录

### A. 竞品分析

| 产品 | 定位 | 优势 | 劣势 |
|------|------|------|------|
| Buffer | 社媒管理 | 成熟稳定 | 不支持产品发布平台 |
| Hootsuite | 企业社媒 | 功能全面 | 贵，复杂 |
| Typefully | Twitter 专用 | 体验好 | 单平台 |
| Ship | PH Launch | PH 专注 | 只有 PH |

**UnMarket 差异化：** 专注新产品发布场景，多平台一键发布，智能调度。

### B. 术语表

| 术语 | 定义 |
|------|------|
| Campaign | 发布活动，围绕一个产品的一次多平台发布 |
| Task | 单个发布任务，对应一个平台的一次发布 |
| Strategy | 发布策略，控制何时、如何发布 |
| Circuit Breaker | 熔断器，异常时自动暂停 |
| Warmup | 账号预热，新账号需要逐步增加活跃度 |
| Profile | Unzoo 浏览器配置文件，包含独立的 Cookies、指纹、代理 |
| Stealth Mode | Unzoo 隐身模式，用于绕过反爬检测 |
| Brain | Unzoo 自主 AI 代理，可执行复杂多步骤任务 |

---

## 附录 C: Unzoo API 集成详细说明

### C.1 关键 API 端点

#### Profiles API
```bash
# 列出所有配置文件
GET /api/v1/profiles

# 创建新配置文件
POST /api/v1/profiles/create
{
  "name": "twitter_account_01",
  "group": "twitter"
}

# 随机化指纹
POST /api/v1/profiles/fingerprint/randomize
{
  "profile_id": "xxx",
  "components": ["gpu", "canvas", "audio", "webgl"]
}

# 设置代理
POST /api/v1/profiles/proxy
{
  "profile_id": "xxx",
  "proxy": "socks5://user:pass@host:port"
}

# 启动配置文件
POST /api/v1/profiles/launch
{
  "profile_id": "xxx"
}
```

#### Performance API
```bash
# 获取当前模式
GET /api/v1/performance/mode

# 设置 Stealth 模式
POST /api/v1/performance/mode
{
  "mode": "stealth"
}
```

#### Scheduler API
```bash
# 列出定时任务
GET /api/v1/scheduler

# 创建定时任务
POST /api/v1/scheduler
{
  "name": "publish_twitter_001",
  "cron": "0 10 * * *",  # 每天10点
  "action": {
    "type": "mcp_tool",
    "tool": "browser_navigate",
    "args": { "url": "https://twitter.com/compose/tweet" }
  }
}

# 暂停任务
POST /api/v1/scheduler/{job_id}/pause

# 恢复任务
POST /api/v1/scheduler/{job_id}/resume

# 删除任务
DELETE /api/v1/scheduler/{job_id}
```

#### Brain API
```bash
# 执行自主任务
POST /api/v1/brain/execute
{
  "goal": "登录 Twitter 并发布一条推文",
  "profile_id": "twitter_01",
  "context": {
    "content": "Hello World! #test",
    "images": []
  },
  "max_steps": 20,
  "timeout_seconds": 300
}

# 查询任务状态
GET /api/v1/brain/status/{task_id}
```

#### Cookies API
```bash
# 获取所有 Cookies
GET /api/v1/cookies?url=https://twitter.com

# 设置 Cookie
POST /api/v1/cookies
{
  "name": "auth_token",
  "value": "xxx",
  "domain": ".twitter.com",
  "httpOnly": true,
  "secure": true
}

# 导入 Cookies（Netscape 格式或 JSON）
POST /api/v1/cookies/import
{
  "cookies": "..."
}
```

### C.2 集成最佳实践

#### 1. 账号隔离策略
```
每个社交平台账号 → 独立的 Unzoo Profile
    │
    ├── 独立的 Cookies（登录状态）
    ├── 独立的浏览器指纹（防关联）
    ├── 独立的代理 IP（可选）
    └── 独立的浏览历史（行为一致性）
```

#### 2. 反检测配置
```typescript
// 推荐配置
const antiDetectionConfig = {
  // 启用 Stealth 模式
  performanceMode: 'stealth',

  // 指纹随机化（每个 Profile 创建时执行一次）
  fingerprint: {
    randomize: true,
    persist: true,  // 持久化，不要每次都变
  },

  // 行为模拟
  behavior: {
    typingDelay: { min: 50, max: 150 },
    mouseMovement: true,
    naturalScrolling: true,
    randomPauses: true,
  },

  // 代理（高风险平台）
  proxy: {
    enabled: true,
    rotateOnBan: true,
  }
};
```

#### 3. 发布任务流程
```typescript
async function publishToTwitter(content: Content) {
  // 1. 获取/创建 Profile
  const profile = await getOrCreateProfile('twitter', content.accountId);

  // 2. 设置 Stealth 模式
  await setPerformanceMode('stealth');

  // 3. 启动 Profile
  const tab = await launchProfile(profile.id);

  // 4. 执行发布（可选：使用 Brain API 自主执行）
  if (useBrainAPI) {
    await executeBrainTask({
      goal: `发布推文到 Twitter`,
      profile_id: profile.id,
      context: { content: content.body, images: content.images }
    });
  } else {
    // 手动控制流程
    await navigate(tab, 'https://twitter.com/compose/tweet');
    await typeContent(tab, content.body);
    await uploadImages(tab, content.images);
    await clickPublish(tab);
  }

  // 5. 验证结果
  const result = await verifyPublished(tab);

  // 6. 清理
  await closeTab(tab);

  return result;
}
```

### C.3 错误处理策略

| 错误类型 | Unzoo 能力 | 处理策略 |
|---------|-----------|----------|
| 登录失效 | Cookies API | 提示用户重新登录，保存新 Session |
| 验证码 | Brain API | 自主代理尝试处理，失败则请求用户介入 |
| 弹窗/对话框 | Dialog/Toast API | 自动处理，记录日志 |
| 网络限制 | Proxy API | 自动切换代理 |
| 反爬检测 | Fingerprint API | 重新生成指纹，更换 Profile |
| 发布频率限制 | Scheduler API | 调整定时任务，增加间隔 |

---

## 附录 D: 产品优化建议

### D.1 当前状态评估

基于代码审查，UnMarket 当前已实现:
- ✅ 产品管理（增删改查、批量操作）
- ✅ 多产品批量发布
- ✅ 内容生成（AI 多语言）
- ✅ 任务队列系统
- ✅ 账号管理（自动注册、同步）
- ✅ 回复系统（关键词监控）
- ✅ 软文系统（多类型文章）
- ✅ 基础策略引擎

### D.2 待优化项（基于 Unzoo 能力）

#### 高优先级 (P0)

| 模块 | 当前状态 | 优化方向 | Unzoo API |
|------|---------|----------|-----------|
| **账号隔离** | 共享浏览器 | 每账号独立 Profile | Profiles API |
| **反检测** | 基础行为模拟 | 指纹随机化 + Stealth 模式 | Fingerprint + Performance |
| **定时发布** | 本地定时器 | 守护进程级 Cron | Scheduler API |
| **Session 管理** | localStorage | Native Cookie + httpOnly | Cookies API |

#### 中优先级 (P1)

| 模块 | 当前状态 | 优化方向 | Unzoo API |
|------|---------|----------|-----------|
| **代理支持** | 未实现 | 每账号独立代理 | Proxy API |
| **弹窗处理** | 手动处理 | 自动拦截处理 | Dialog + Toast API |
| **验证码挑战** | 失败退出 | Brain API 自主处理 | Brain API |
| **网络拦截** | 未使用 | 请求监控和修改 | DevTools API |

#### 低优先级 (P2)

| 模块 | 当前状态 | 优化方向 | Unzoo API |
|------|---------|----------|-----------|
| **可视化工作流** | 代码定义 | 拖拽编辑 | Workflow API |
| **状态持久化** | SQLite | 额外用 KV 存储 | Data API |
| **远程调试** | 截图 | VNC 式远程控制 | Remote API |

### D.3 UI 优化建议

#### 仪表盘改进
```
现有:
- 无仪表盘首页

建议添加:
┌─────────────────────────────────────────────────────────┐
│ Dashboard                                                │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│ │ 活跃任务│ │ 今日发布│ │ 账号健康│ │ 成功率  │        │
│ │   12    │ │   28    │ │  85%    │ │  96%    │        │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘        │
│                                                         │
│ 【进行中的活动】                                         │
│ ├─ SoloMD Launch    ████████░░ 80%   [暂停] [查看]     │
│ └─ NewApp Beta      等待中...          [开始] [编辑]     │
│                                                         │
│ 【最近活动】                                             │
│ ├─ 10:30 ✅ Twitter 发布成功                            │
│ ├─ 10:15 ⚠️ Reddit 频率限制，30分钟后重试               │
│ └─ 10:00 ✅ 生成内容完成                                │
└─────────────────────────────────────────────────────────┘
```

#### 账号管理改进
```
现有:
- 账号列表
- 自动注册按钮

建议添加:
┌─────────────────────────────────────────────────────────┐
│ Account: twitter_main                                    │
├─────────────────────────────────────────────────────────┤
│ 状态: 🟢 健康 (88/100)                                  │
│                                                         │
│ 【Profile 设置】                                        │
│ ├─ 浏览器指纹: randomized_20240520                      │
│ │   [🔄 重新生成]                                       │
│ ├─ 代理: socks5://proxy.example.com:1080               │
│ │   [✏️ 修改] [❌ 清除]                                 │
│ └─ Stealth 模式: ✅ 已启用                              │
│                                                         │
│ 【使用统计】                                            │
│ ├─ 今日发布: 3/10                                       │
│ ├─ 本周发布: 15/50                                      │
│ └─ 上次发布: 2小时前                                    │
│                                                         │
│ 【预热状态】                                            │
│ ├─ 账号年龄: 14天                                       │
│ └─ 预热进度: ████████████░░░░ 已完成                    │
└─────────────────────────────────────────────────────────┘
```

#### 发布流程改进
```
现有:
- 选择产品 → 选择平台 → 生成内容 → 发布

建议改进:
Step 1: 选择产品 (✅ 已有)
    │
Step 2: 选择平台 + 显示可用性
    │   ├─ Twitter @main   🟢 可发布 (剩余 7 次)
    │   ├─ Reddit u/demo   🟡 等待 15 分钟
    │   └─ LinkedIn        🔴 今日已达上限
    │
Step 3: 配置发布选项 (新增)
    │   ├─ ☑ 启用 Stealth 模式
    │   ├─ ☑ 随机延迟 (30-120秒)
    │   └─ ☑ 自动重试失败任务
    │
Step 4: 预览内容 + 截图 (✅ 已有，增强)
    │   ├─ 实时预览发布效果
    │   └─ 支持编辑调整
    │
Step 5: 确认发布 (✅ 已有)
    │
Step 6: 进度监控 (新增)
        ├─ 实时显示每个平台状态
        ├─ 失败任务一键重试
        └─ 查看发布证据（截图）
```

### D.4 实现优先级建议

**立即实现 (Phase 0):**
1. Profiles API 集成 - 每账号独立配置文件
2. Fingerprint API 集成 - 指纹随机化
3. Performance API 集成 - Stealth 模式

**短期实现 (Phase 1):**
1. Scheduler API 集成 - 定时发布
2. Cookies API 集成 - 更好的 Session 管理
3. Dashboard 仪表盘页面

**中期实现 (Phase 2):**
1. Proxy API 集成 - 代理管理
2. Brain API 集成 - 自主代理处理复杂情况
3. 账号预热自动化

**长期实现 (Phase 3+):**
1. Workflow API 集成 - 可视化工作流
2. 数据分析和报告增强
3. A/B 测试系统
