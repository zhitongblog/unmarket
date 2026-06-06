# UnMarket 多账号隔离架构（persona × profile × 机场节点）

> 状态：设计已定稿，待开工。决策已锁：**自带独立 Mihomo 内核**（不复用用户的 Clash Verge）。
> 承重假设已验证：Mihomo `listeners` 支持 `proxy:` 字段，可把每个本地端口绑死到一个指定节点。

## 1. 要解决的问题

- **现状不适合多账号**：多个平台账号共用一个 profile（`Profile_TestProfile1`）→ 共享 cookie / 出口 IP / 指纹 → 平台一眼看出同源 → **关联封号**。
- **首页"账号被封"误报**：体检逻辑在"全局 profile"里去查没绑定 profile 的账号（必然没登录）→ 假阳性；且登录检测是脆弱的文字关键词启发式。实测 14 个账号里 **0 个真被封**，12 个是误报。
- **目标模型**：`1 真实 Gmail (persona) = 1 Unzoo profile = 1 机场节点(独立出口 IP) = 1 套随机指纹`。同渠道要多账号 → 多开几个 Gmail persona，天然隔离。

## 2. 核心模型

```
真实 Gmail 地址 ─┬─ 1 个 Unzoo profile（独立 cookie / 登录态）
   (persona)     ├─ 1 套随机指纹（canvas/webgl/audio/...）
                 ├─ 1 个 Mihomo listener 本地端口（= 1 个机场节点 = 1 个出口 IP，固定绑定）
                 └─ 它在各平台注册的账号，全部绑到这个 profile
同渠道要 N 个账号 → 开 N 个 Gmail persona → 各自独立 profile + IP + 指纹
```

## 3. 组件设计

### 3.1 自带 Mihomo sidecar（独立内核）
- **打包**：Tauri `externalBin`（sidecar）方式内置 `mihomo-windows-amd64.exe`（MetaCubeX/mihomo 官方发布，~15-30MB）。
- **独立实例，避开用户的 Clash Verge**：
  - external-controller: `127.0.0.1:19090`（Verge 用 9097，错开）
  - listener 基址: `30000+`（每 persona 一个，Verge 用 7897，错开）
  - 配置/数据目录: `%APPDATA%/unmarket/mihomo/`（config.yaml + secret + 缓存）
- **生命周期**：App 启动时拉起内核，退出时优雅关闭。用户开/关/切 Clash Verge **完全不受影响**，反之亦然。

### 3.2 订阅 & 节点池
- 拉订阅（用 Clash UA 取 YAML 格式）→ 解析节点 → 存入 `nodes` 表缓存。
- 当前订阅：147 节点（vless ×141 + anytls ×6），地区覆盖港/新/日/美/台/韩/英/德… anytls 仅新内核支持，Mihomo 正好支持。
- 定期刷新（如每 6h）：处理节点新增/下线；已绑定的 persona 尽量保留原节点，节点消失才迁移。

### 3.3 listener 编排（"自动开节点"的本质）
- 新 persona → 从池里取一个空闲节点 → 在 mihomo config 追加一条 `listeners`（端口↔节点**固定绑定**）→ reload（`PUT /configs` 或重启自有实例，秒级）。
- 固定绑定的理由：出口 IP 稳定，登录态才稳；IP 老变会触发平台二次验证。
- 删 persona → 移除该 listener + 释放节点回池。

### 3.4 persona provisioning（一键自动隔离）
```
输入真实 Gmail
  → unzoo_create_profile（建独立 profile）          [现成]
  → unzoo_randomize_fingerprint（随机指纹）          [现成]
  → 分配空闲节点 + 生成 listener 端口
  → unzoo_set_profile_proxy(socks5://127.0.0.1:30007) [现成]
  → 写入 personas 表
```
三个 unzoo 函数都已存在，只差编排 + mihomo listener 这层。

### 3.5 体检误报修复
- 只体检"已绑定 profile 的 persona"，未配置的不查。
- 状态机分清：`unconfigured`（未配置）/ `never_logged_in`（从未登录）/ `logged_out`（掉登录）/ `banned`（被封）/ `healthy`。
- 只有 `logged_out`/`banned` 才计入首页"问题"；首页文案拆开：「X 个待配置(去设置)」vs「X 个掉登录/被封(去重登)」。
- persona 化后，体检在**自己的 profile** 里查 → 结果才可信。

## 4. 数据模型改动

```sql
-- 新增：persona（隔离单元，主键=真实 Gmail）
CREATE TABLE personas (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,        -- 真实 Gmail
  profile_id TEXT,                   -- Unzoo profile（path 末段）
  node_name TEXT,                    -- 绑定的机场节点名
  local_port INTEGER,               -- mihomo listener 本地端口
  fingerprint TEXT,                  -- 指纹摘要（可选）
  status TEXT DEFAULT 'provisioning',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 新增：节点池（来自订阅，缓存）
CREATE TABLE nodes (
  name TEXT PRIMARY KEY,
  region TEXT,
  type TEXT,                          -- vless | anytls | ...
  in_use INTEGER DEFAULT 0,
  last_seen TEXT
);

-- accounts 增加外键，挂到 persona
ALTER TABLE accounts ADD COLUMN persona_id TEXT;
```
> 现有 `proxies` 表（host/port/protocol）保留给"原生 socks5 代理"场景；机场节点走 mihomo，不进这张表。

## 5. 端口/隔离约定

| | 用途 | 端口 |
|---|---|---|
| 用户的 Clash Verge | 日常科学上网（App 不碰）| mixed 7897 / api 9097 |
| UnMarket 自带 mihomo | 多账号采集发帖专用 | api 19090 / listeners 30000+ |

## 6. 安全 / 限制（诚实记录）

- 订阅链接 = 代理钥匙，存本地、不外泄、不入日志明文。
- **机场是共享 IP**（与机场其他客户共用），非住宅独享。对自己多 persona 间防关联够用；但对强风控平台（Reddit/小红书）机场 IP 段可能已被标记——真要硬刚需上**住宅代理**。
- 人压不可逆按钮：真实发布/注册由人确认。

## 7. 分期

- **P1（不依赖代理，可独立交付）**：persona 表 + 加账号时自动建 profile + 随机指纹 + 回填 + 体检误报修复。
- **P2（代理层）**：mihomo sidecar 打包 + 订阅拉取 + 节点池 + listener 自动编排 + persona 绑定。

## 8. 待定输入（开工前需确认）

1. **真实 Gmail 清单**：现有 14 个账号 email 全是占位 `"Gmail (via Unzoo)"`，需要真实邮箱作为 persona 主键。是 1 个 Gmail 注册了所有平台，还是多个 Gmail？决定迁移成 1 个还是多个 persona。
2. 是否按 P1 → P2 分期开工。
