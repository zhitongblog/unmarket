# UnMarket 平台注册方式分析

## 注册方式分类

| 类型 | 说明 | 自动化程度 |
|------|------|------------|
| **A: Google OAuth** | 一键 Google 登录 | ✅ 全自动 |
| **B: 邮箱注册** | 邮箱+密码，可能需要验证邮件 | ✅ 可自动（需邮箱API） |
| **C: 手机验证** | 需要手机号接收验证码 | ⚠️ 半自动（需用户参与） |
| **D: 邀请制/审核** | 需要邀请码或审核 | ❌ 用户手动 |
| **E: 企业认证** | 需要企业资质 | ❌ 用户手动 |

---

## 一、产品发布平台

### 北美

| 平台 | 网址 | 注册方式 | Google登录 | 发布自动化 | 优先级 |
|------|------|----------|------------|------------|--------|
| Product Hunt | producthunt.com | A | ✅ | ✅ | P0 |
| Hacker News | news.ycombinator.com | B | ❌ | ✅ | P0 |
| BetaList | betalist.com | A | ✅ | ✅ | P1 |
| AlternativeTo | alternativeto.net | A | ✅ | ⚠️ 需审核 | P1 |
| G2 | g2.com | A/B | ✅ | ⚠️ 需审核 | P2 |
| Capterra | capterra.com | B | ❌ | ⚠️ 需审核 | P2 |
| AppSumo | appsumo.com | B | ❌ | ❌ 付费合作 | P3 |

### 欧洲

| 平台 | 网址 | 注册方式 | Google登录 | 发布自动化 | 优先级 |
|------|------|----------|------------|------------|--------|
| BetaPage | betapage.co | A | ✅ | ✅ | P2 |
| EU-Startups | eu-startups.com | D | ❌ | ❌ 投稿 | P3 |

---

## 二、社交媒体

### 全球通用

| 平台 | 网址 | 注册方式 | Google登录 | 发布自动化 | 备注 |
|------|------|----------|------------|------------|------|
| Twitter/X | twitter.com | A/B/C | ✅ | ✅ | 新号可能需手机验证 |
| LinkedIn | linkedin.com | A/B | ✅ | ✅ | |
| Reddit | reddit.com | A/B | ✅ | ✅ | 某些 subreddit 有 karma 要求 |
| YouTube | youtube.com | A | ✅ (Google账号) | ✅ | |
| Discord | discord.com | B/C | ❌ | ✅ | 可能需手机验证 |
| Facebook | facebook.com | B/C | ❌ | ⚠️ | 严格反自动化 |
| Instagram | instagram.com | B/C | ❌ | ⚠️ | 严格反自动化 |
| TikTok | tiktok.com | B/C | ❌ | ⚠️ | 严格反自动化 |

### 中国

| 平台 | 网址 | 注册方式 | 发布自动化 | 备注 |
|------|------|----------|------------|------|
| 微信公众号 | mp.weixin.qq.com | C (手机+企业) | ⚠️ API可用 | 需企业认证 |
| 微博 | weibo.com | C | ✅ | 需手机号 |
| 知乎 | zhihu.com | C | ✅ | 需手机号 |
| 小红书 | xiaohongshu.com | C | ⚠️ | 反自动化强 |
| B站 | bilibili.com | C | ✅ | 需手机号 |
| 即刻 | okjike.com | C | ✅ | 需手机号 |
| 抖音 | douyin.com | C | ⚠️ | 反自动化强 |

### 日本

| 平台 | 网址 | 注册方式 | Google登录 | 发布自动化 |
|------|------|----------|------------|------------|
| Twitter/X | twitter.com | A | ✅ | ✅ |
| LINE | line.me | C | ❌ | ⚠️ |
| note | note.com | A | ✅ | ✅ |

### 韩国

| 平台 | 网址 | 注册方式 | Google登录 | 发布自动化 |
|------|------|----------|------------|------------|
| Naver Blog | blog.naver.com | B (韩国号) | ❌ | ⚠️ |
| KakaoTalk | kakaocorp.com | C | ❌ | ⚠️ |

### 俄罗斯

| 平台 | 网址 | 注册方式 | Google登录 | 发布自动化 |
|------|------|----------|------------|------------|
| VK | vk.com | B/C | ❌ | ✅ |
| Telegram | telegram.org | C | ❌ | ✅ (Bot API) |

---

## 三、开发者社区

### 全球

| 平台 | 网址 | 注册方式 | Google登录 | 发布自动化 | 优先级 |
|------|------|----------|------------|------------|--------|
| GitHub | github.com | A | ✅ | ✅ (API) | P0 |
| Dev.to | dev.to | A | ✅ | ✅ | P1 |
| Medium | medium.com | A | ✅ | ✅ | P1 |
| Hashnode | hashnode.dev | A | ✅ | ✅ | P2 |
| Stack Overflow | stackoverflow.com | A | ✅ | ⚠️ 严格规则 | P2 |

### 中国

| 平台 | 网址 | 注册方式 | 发布自动化 | 优先级 |
|------|------|----------|------------|--------|
| V2EX | v2ex.com | B | ✅ | P1 |
| 掘金 | juejin.cn | C | ✅ | P1 |
| SegmentFault | segmentfault.com | B/C | ✅ | P2 |
| CSDN | csdn.net | C | ✅ | P2 |
| 开源中国 | oschina.net | B/C | ✅ | P2 |

### 日本

| 平台 | 网址 | 注册方式 | Google登录 | 发布自动化 |
|------|------|----------|------------|------------|
| Qiita | qiita.com | A | ✅ | ✅ |
| Zenn | zenn.dev | A | ✅ | ✅ |

### 俄罗斯

| 平台 | 网址 | 注册方式 | 发布自动化 |
|------|------|----------|------------|
| Habr | habr.com | B | ✅ |

---

## 四、科技媒体（投稿类）

> 这类平台通常不支持自动发布，需要投稿或联系编辑

| 平台 | 地区 | 投稿方式 | 自动化 |
|------|------|----------|--------|
| TechCrunch | 美国 | 邮件投稿 | ❌ |
| The Verge | 美国 | 邮件投稿 | ❌ |
| 36氪 | 中国 | 后台投稿 | ❌ |
| 少数派 | 中国 | 后台投稿 | ⚠️ 可提交 |
| Tech in Asia | 东南亚 | 邮件投稿 | ❌ |

---

## 五、注册自动化策略

### 策略 A：Google OAuth 自动登录

```
用户提供 Google 账号 session
    ↓
系统检测平台支持 Google 登录
    ↓
自动完成 OAuth 流程
    ↓
保存 session
```

**支持的平台：**
- Product Hunt, BetaList, AlternativeTo
- Twitter/X, LinkedIn, Reddit, YouTube
- GitHub, Dev.to, Medium, Hashnode
- Qiita, Zenn, note

### 策略 B：邮箱自动注册

```
用户提供邮箱（或系统生成）
    ↓
自动填写注册表单
    ↓
自动处理验证邮件（需邮箱 API）
    ↓
完成注册，保存 session
```

**支持的平台：**
- Hacker News, V2EX, Habr
- Discord（可能需手机验证）

### 策略 C：引导用户手动注册

```
系统检测需要手机验证
    ↓
打开注册页面
    ↓
提示用户完成验证
    ↓
用户完成后，系统保存 session
```

**需要此策略的平台：**
- 微博, 知乎, B站, 即刻, 掘金
- 小红书, 抖音（反自动化严格）
- Facebook, Instagram, TikTok

### 策略 D：完全手动

```
系统无法自动化
    ↓
提供注册链接和指南
    ↓
用户自行完成
    ↓
用户手动导入 cookies/session
```

**需要此策略的平台：**
- 公众号（需企业认证）
- 媒体投稿（需人工审核）
- 邀请制平台

---

## 六、Session 管理

### 6.1 Session 存储结构

```typescript
interface PlatformSession {
  platform: string;
  accountId: string;

  // 认证信息
  cookies: Cookie[];
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;

  // 状态
  status: 'valid' | 'expired' | 'blocked';
  lastValidated: Date;
  expiresAt?: Date;

  // 来源
  source: 'google_oauth' | 'email_register' | 'manual_import';
}
```

### 6.2 Session 生命周期

```
获取 Session
    │
    ├── Google OAuth → 自动获取
    ├── 邮箱注册 → 自动获取
    └── 手动导入 → 用户提供
    │
    ▼
定期验证（每天）
    │
    ├── 有效 → 继续使用
    ├── 过期 → 尝试刷新
    └── 失效 → 通知用户重新登录
    │
    ▼
使用 Session 发布内容
```

### 6.3 导入方式

**方式 1：浏览器扩展导入**
- 用户在 Chrome 登录后，通过扩展一键导入 cookies

**方式 2：手动导入 Cookies**
- 用户使用开发者工具导出 cookies
- 粘贴到 UnMarket 导入

**方式 3：OAuth 授权**
- 对于支持 OAuth 的平台，直接授权

---

## 七、平台优先级矩阵

### P0 - 首批支持（10个）

| 平台 | 注册方式 | 自动化程度 | 理由 |
|------|----------|------------|------|
| Twitter/X | A | ✅ | 科技圈主战场 |
| Product Hunt | A | ✅ | 产品发布必选 |
| Reddit | A | ✅ | 垂直社区讨论 |
| Hacker News | B | ✅ | 技术圈顶流 |
| LinkedIn | A | ✅ | B2B 必选 |
| GitHub | A | ✅ | 开源项目 |
| Dev.to | A | ✅ | 开发者博客 |
| 知乎 | C | ✅ | 中国问答平台 |
| V2EX | B | ✅ | 中国开发者 |
| 即刻 | C | ✅ | 产品经理社区 |

### P1 - 第二批（10个）

| 平台 | 注册方式 | 自动化程度 | 理由 |
|------|----------|------------|------|
| Medium | A | ✅ | 长文推广 |
| YouTube | A | ✅ | 视频演示 |
| BetaList | A | ✅ | 早期产品 |
| Hashnode | A | ✅ | 开发者博客 |
| 微博 | C | ✅ | 中国社交 |
| B站 | C | ✅ | 视频教程 |
| 掘金 | C | ✅ | 中国前端 |
| 少数派 | B | ⚠️ | 效率工具 |
| Qiita | A | ✅ | 日本开发者 |
| Telegram | C | ✅ | 社群运营 |

### P2 - 第三批

- 小红书, 公众号, 抖音（需特殊处理）
- 韩国/东南亚平台
- 欧洲本地媒体
- 其他垂直社区

---

## 八、账号管理 UI 设计

### 8.1 账号列表页

```
┌─────────────────────────────────────────────────────────────┐
│ Accounts                              [+ Add Account]       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Connected (8) ─────────────────────────────────────┐   │
│  │                                                      │   │
│  │  🐦 Twitter     @solomd_app    ✅ Healthy   [···]   │   │
│  │  📘 LinkedIn    /in/zhitong    ✅ Healthy   [···]   │   │
│  │  🤖 Reddit      u/solomd       ⚠️ Warning   [···]   │   │
│  │  🐙 GitHub      zhitong        ✅ Healthy   [···]   │   │
│  │  📝 Dev.to      zhitong        ✅ Healthy   [···]   │   │
│  │  📖 知乎        @知桐          ✅ Healthy   [···]   │   │
│  │  💬 V2EX        zhitong        ✅ Healthy   [···]   │   │
│  │  ⚡ 即刻        @知桐          ✅ Healthy   [···]   │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Needs Attention (2) ───────────────────────────────┐   │
│  │                                                      │   │
│  │  🔵 微博        Session 过期   [🔄 重新登录]        │   │
│  │  📺 B站         未连接         [➕ 连接账号]        │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Available Platforms ───────────────────────────────┐   │
│  │                                                      │   │
│  │  🚀 Product Hunt    [Connect with Google]           │   │
│  │  📰 Hacker News     [Register with Email]           │   │
│  │  📱 小红书          [Manual Setup Required]         │   │
│  │  📢 公众号          [Requires Business Account]     │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 添加账号流程

```
选择平台
    │
    ├── Google OAuth 支持
    │   └── [一键 Google 登录] → 自动完成
    │
    ├── 邮箱注册
    │   └── [自动注册] → 填写邮箱 → 验证 → 完成
    │
    ├── 手机验证
    │   └── [引导注册] → 打开网页 → 用户完成 → 保存 Session
    │
    └── 手动导入
        └── [导入 Cookies] → 粘贴 cookies → 验证 → 完成
```

### 8.3 Session 导入对话框

```
┌─────────────────────────────────────────────────────────────┐
│ Import Session for 微博                              [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This platform requires manual login.                       │
│                                                             │
│  ┌─ Step 1: Login in Browser ──────────────────────────┐   │
│  │                                                      │   │
│  │  [🌐 Open weibo.com in Unzoo Browser]               │   │
│  │                                                      │   │
│  │  Please login to your account in the browser.       │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Step 2: Save Session ──────────────────────────────┐   │
│  │                                                      │   │
│  │  After logging in, click below to save the session: │   │
│  │                                                      │   │
│  │  [📥 Capture Session from Browser]                  │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ── OR ──                                                   │
│                                                             │
│  ┌─ Manual Cookie Import ──────────────────────────────┐   │
│  │                                                      │   │
│  │  Paste cookies in Netscape format:                  │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │                                              │   │   │
│  │  │                                              │   │   │
│  │  │                                              │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│                              [Cancel]  [Verify & Save]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 九、实现计划

### Phase 1：Session 基础设施

- [ ] 设计 Session 存储结构
- [ ] 实现 Unzoo Cookie 导入
- [ ] 实现 Session 验证逻辑
- [ ] 实现 Session 定期检查

### Phase 2：Google OAuth 平台

- [ ] 实现 Google OAuth 流程
- [ ] 支持 Product Hunt
- [ ] 支持 Twitter/X
- [ ] 支持 LinkedIn
- [ ] 支持 Reddit
- [ ] 支持 Dev.to, Medium, Hashnode

### Phase 3：邮箱注册平台

- [ ] 实现邮箱注册自动化
- [ ] 支持 Hacker News
- [ ] 支持 V2EX
- [ ] 支持 Habr

### Phase 4：手动引导平台

- [ ] 实现引导注册流程
- [ ] 支持知乎、微博、B站
- [ ] 支持即刻、掘金
- [ ] 支持日本平台（Qiita, Zenn）

### Phase 5：完善

- [ ] 实现 Session 自动刷新
- [ ] 添加账号健康度监控
- [ ] 支持更多平台

---

## 十、安全校验处理策略

### 10.1 校验类型分析

| 校验类型 | 触发场景 | 难度 | 自动化可能性 |
|----------|----------|------|--------------|
| 邮箱验证 | 注册 | ★☆☆ | ✅ 可自动 |
| 手机验证码 | 注册/登录/敏感操作 | ★★★ | ⚠️ 需用户参与 |
| 图形验证码 | 登录/频繁操作 | ★★☆ | ⚠️ 可自动（需服务）|
| reCAPTCHA v2 | 注册/登录 | ★★☆ | ⚠️ 可自动（需服务）|
| reCAPTCHA v3 | 无感检测 | ★★★ | 需要高信誉环境 |
| hCaptcha | 注册/登录 | ★★★ | ⚠️ 可自动（需服务）|
| Cloudflare | 访问前 | ★★☆ | 使用真实浏览器 |
| 行为检测 | 全程 | ★★★ | 模拟人类行为 |
| 设备指纹 | 全程 | ★★☆ | 持久化配置 |

### 10.2 处理流程设计

```
开始注册/登录
    │
    ▼
┌─────────────────────────────────────┐
│          环境准备                    │
│  • 使用 Unzoo 真实 Chrome           │
│  • 加载持久化用户配置               │
│  • 设置合理的 User-Agent            │
│  • 使用用户本地 IP                  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│          行为模拟                    │
│  • 随机延迟 (1-3秒)                 │
│  • 模拟鼠标移动轨迹                 │
│  • 模拟打字速度 (50-150ms/字符)     │
│  • 随机停顿                         │
└─────────────────────────────────────┘
    │
    ▼
遇到验证?
    │
    ├── 邮箱验证
    │   ├── 有 Gmail API → 自动处理
    │   └── 无 → 引导用户查看邮箱
    │
    ├── 手机验证码
    │   └── 引导用户手动输入
    │
    ├── 图形验证码 / reCAPTCHA / hCaptcha
    │   ├── 集成打码服务 → 自动处理
    │   └── 无服务 → 引导用户手动解决
    │
    └── Cloudflare
        └── 等待浏览器自动通过
    │
    ▼
完成注册 → 保存 Session
```

### 10.3 邮箱验证自动化

```typescript
interface EmailVerificationConfig {
  // 邮箱类型
  provider: 'gmail' | 'outlook' | 'temp_mail' | 'custom_imap';

  // Gmail 配置
  gmail?: {
    accessToken: string;
    refreshToken: string;
  };

  // 临时邮箱服务
  tempMail?: {
    provider: 'temp-mail.org' | 'guerrillamail' | 'mailinator';
    apiKey?: string;
  };

  // 自定义 IMAP
  imap?: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
}

// 自动获取验证码/链接
async function getVerificationFromEmail(
  config: EmailVerificationConfig,
  platform: string,
  timeout: number = 60000
): Promise<{ type: 'code' | 'link'; value: string }> {
  // 1. 连接邮箱
  // 2. 等待新邮件
  // 3. 解析验证内容
  // 4. 返回验证码或链接
}
```

### 10.4 手机验证码处理

```typescript
interface PhoneVerificationUI {
  // 显示提示
  showPrompt(platform: string, phoneNumber: string): void;

  // 等待用户输入
  waitForCode(timeout: number): Promise<string>;

  // 用户完成后继续
  onComplete(): void;
}

// UI 流程
/*
┌─────────────────────────────────────────────────────────────┐
│ Phone Verification Required                          [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 微博 requires phone verification                        │
│                                                             │
│  We've sent a verification code to:                        │
│  +86 138****1234                                           │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Enter verification code:                          │    │
│  │                                                    │    │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │    │
│  │  │    │ │    │ │    │ │    │ │    │ │    │       │    │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘       │    │
│  │                                                    │    │
│  │  [Resend Code] (available in 58s)                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│                              [Cancel]  [Verify]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
*/
```

### 10.5 Captcha 处理

```typescript
interface CaptchaConfig {
  // 处理策略
  strategy: 'auto' | 'manual' | 'skip';

  // 自动处理服务
  autoSolve?: {
    provider: '2captcha' | 'anti-captcha' | 'capsolver';
    apiKey: string;
  };

  // 超时设置
  timeout: number;
}

// 处理流程
async function handleCaptcha(
  type: 'image' | 'recaptcha_v2' | 'recaptcha_v3' | 'hcaptcha',
  config: CaptchaConfig
): Promise<boolean> {

  if (config.strategy === 'auto' && config.autoSolve) {
    // 调用打码服务
    return await solveCaptchaAuto(type, config.autoSolve);
  }

  if (config.strategy === 'manual') {
    // 提示用户手动解决
    return await promptUserSolveCaptcha(type);
  }

  return false;
}

// 手动解决 UI
/*
┌─────────────────────────────────────────────────────────────┐
│ Captcha Verification                                 [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 Please complete the captcha in the browser             │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │                                                    │    │
│  │   [Browser window with captcha is open]           │    │
│  │                                                    │    │
│  │   Complete the captcha and click "Done" below     │    │
│  │                                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  💡 Tip: If you see a checkbox, just click it.             │
│         If you see images, select the matching ones.       │
│                                                             │
│                              [Cancel]  [✓ Done]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
*/
```

### 10.6 行为模拟策略

```typescript
interface HumanBehaviorSimulation {
  // 延迟设置
  delays: {
    beforeType: { min: 500, max: 1500 };      // 打字前
    betweenChars: { min: 50, max: 150 };      // 字符间
    afterType: { min: 300, max: 800 };        // 打字后
    beforeClick: { min: 200, max: 600 };      // 点击前
    pageLoad: { min: 1000, max: 3000 };       // 页面加载后
  };

  // 鼠标行为
  mouse: {
    moveSpeed: { min: 100, max: 300 };        // 移动速度 (px/s)
    bezierCurve: true;                        // 贝塞尔曲线移动
    randomJitter: true;                       // 随机抖动
    overshoot: 0.1;                           // 10% 概率移过目标
  };

  // 滚动行为
  scroll: {
    speed: { min: 200, max: 500 };            // 滚动速度
    pause: true;                              // 随机停顿
  };

  // 打字行为
  typing: {
    mistakeRate: 0.02;                        // 2% 打字错误率
    correctDelay: { min: 200, max: 500 };     // 纠错延迟
  };
}

// 示例：模拟人类打字
async function humanType(selector: string, text: string) {
  await randomDelay(500, 1500);

  for (const char of text) {
    // 小概率打错字
    if (Math.random() < 0.02) {
      await typeChar(selector, getRandomChar());
      await randomDelay(200, 500);
      await pressKey('Backspace');
    }

    await typeChar(selector, char);
    await randomDelay(50, 150);
  }
}
```

### 10.7 设备指纹持久化

```typescript
interface BrowserProfile {
  // 基础配置
  userAgent: string;
  viewport: { width: number; height: number };
  timezone: string;
  locale: string;

  // 硬件指纹
  hardwareConcurrency: number;
  deviceMemory: number;
  screenResolution: [number, number];

  // WebGL 指纹
  webglVendor: string;
  webglRenderer: string;

  // Canvas 指纹
  canvasNoise: number;

  // 字体列表
  fonts: string[];

  // 插件列表
  plugins: string[];
}

// Unzoo 配置持久化
// 每个用户账号使用独立的浏览器配置
// 配置在首次使用时生成，后续保持一致
```

### 10.8 综合配置

```typescript
interface SecurityBypassConfig {
  // 邮箱验证
  email: EmailVerificationConfig;

  // 手机验证
  phone: {
    strategy: 'prompt_user' | 'sms_api';
    smsApi?: {
      provider: string;
      apiKey: string;
    };
  };

  // Captcha
  captcha: CaptchaConfig;

  // 行为模拟
  humanBehavior: HumanBehaviorSimulation;

  // 浏览器配置
  browserProfile: BrowserProfile;

  // 失败处理
  onFailure: {
    maxRetries: number;
    fallbackToManual: boolean;
    notifyUser: boolean;
  };
}
```

### 10.9 设置界面

```
┌─────────────────────────────────────────────────────────────┐
│ Security & Verification Settings                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Email Verification ─────────────────────────────────┐  │
│  │                                                       │  │
│  │  Method: [Gmail API ▼]                               │  │
│  │                                                       │  │
│  │  [🔗 Connect Gmail Account]                          │  │
│  │  Status: ✅ Connected (user@gmail.com)               │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Phone Verification ─────────────────────────────────┐  │
│  │                                                       │  │
│  │  ● Prompt me to enter code manually                  │  │
│  │  ○ Use SMS API (advanced)                            │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Captcha Handling ───────────────────────────────────┐  │
│  │                                                       │  │
│  │  ● Let me solve manually                             │  │
│  │  ○ Auto-solve with service                           │  │
│  │      Provider: [2Captcha ▼]                          │  │
│  │      API Key:  [••••••••••••••••]                    │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─ Behavior Simulation ────────────────────────────────┐  │
│  │                                                       │  │
│  │  ☑ Simulate human typing speed                       │  │
│  │  ☑ Simulate mouse movements                          │  │
│  │  ☑ Add random delays                                 │  │
│  │                                                       │  │
│  │  Aggressiveness: [━━━━━━●━━━] Balanced               │  │
│  │  (More aggressive = faster but higher detection risk) │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│                                           [Save Settings]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
