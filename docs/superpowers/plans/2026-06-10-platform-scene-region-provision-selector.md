# 平台场景/地区分类 + 开通账号平台选择器 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 「检查并开通账号」改为弹出按场景分组的平台选择器，已开通平台预选锁定，只开通用户新选中的平台。

**Architecture:** 后端用单一 `platform_meta()` 函数集中维护 29 个平台的 场景/地区/开通模式（相比 spec 的"PlatformConfig 加字段"，改为独立函数以 DRY + 可单测）。新增 `persona_platform_catalog` 命令把目录（含 provisioned 状态）给前端；`persona_provision_all` 改为按传入平台列表开通。前端用动态分组复选框 modal 收集选择。

**Tech Stack:** Rust (Tauri command, rusqlite, cargo test) + TypeScript (Tauri webview, esbuild bundle)。后端用 `cargo test` 单测纯函数；Tauri 命令与前端 UI 用手动验证（项目暂无前端测试基建，不在本次引入）。

---

## 文件结构

- `src-tauri/src/lib.rs`
  - 新增：`PlatformMeta` 结构体、`PLATFORM_KEYS` 常量、`platform_meta()` 函数、`#[cfg(test)] mod platform_meta_tests`
  - 新增：`PlatformCatalogItem` 结构体、`persona_platform_catalog` 命令；在 `generate_handler!` 注册
  - 修改：`persona_provision_all` 签名加 `platforms: Vec<String>`，循环改为遍历该参数；删除已不再使用的 `PROVISION_PLATFORMS` 常量
- `src/tauri-frontend/app.ts`
  - 新增：`SCENE_LABELS`/`SCENE_ORDER`/`REGION_FLAGS` 展示映射、`CatalogItem` 接口、`pickProvisionPlatforms()` modal
  - 修改：`(window as any).personaProvisionAll` 改为拉目录 → 弹选择器 → 开通选中项

---

## Task 1: 后端平台分类元数据 + 单元测试

**Files:**
- Modify: `src-tauri/src/lib.rs`（在 `struct PlatformConfig`（903 行）之后插入新代码）

- [ ] **Step 1: 写失败的单元测试**

在 `src-tauri/src/lib.rs` **文件末尾**追加测试模块：

```rust
#[cfg(test)]
mod platform_meta_tests {
    use super::*;

    #[test]
    fn all_29_keys_have_meta() {
        assert_eq!(PLATFORM_KEYS.len(), 29);
        for k in PLATFORM_KEYS {
            assert!(platform_meta(k).is_some(), "missing meta for {}", k);
        }
    }

    #[test]
    fn mode_counts_15_auto_14_manual() {
        let auto = PLATFORM_KEYS.iter().filter(|k| platform_meta(k).unwrap().mode == "auto").count();
        let manual = PLATFORM_KEYS.iter().filter(|k| platform_meta(k).unwrap().mode == "manual").count();
        assert_eq!(auto, 15, "auto count");
        assert_eq!(manual, 14, "manual count");
    }

    #[test]
    fn spot_checks() {
        let g = platform_meta("github").unwrap();
        assert_eq!((g.scene, g.region, g.mode), ("research", "us", "auto"));
        let x = platform_meta("xiaohongshu").unwrap();
        assert_eq!((x.scene, x.region, x.mode), ("lifestyle", "cn", "manual"));
        // 敌意平台：虽支持 google_oauth 但仍为 manual
        assert_eq!(platform_meta("twitter").unwrap().mode, "manual");
        assert_eq!(platform_meta("reddit").unwrap().mode, "manual");
        // 别名解析
        assert!(platform_meta("redbook").is_some());
        assert!(platform_meta("okjike").is_some());
        // 未知平台
        assert!(platform_meta("unknown_xyz").is_none());
    }

    #[test]
    fn all_six_scenes_present() {
        use std::collections::HashSet;
        let scenes: HashSet<_> = PLATFORM_KEYS.iter().map(|k| platform_meta(k).unwrap().scene).collect();
        for s in ["research","product","social","content","career","lifestyle"] {
            assert!(scenes.contains(s), "missing scene {}", s);
        }
    }
}
```

- [ ] **Step 2: 运行测试，确认失败**

Run: `cd src-tauri && cargo test platform_meta_tests 2>&1 | tail -20`
Expected: 编译失败（`cannot find value PLATFORM_KEYS` / `cannot find function platform_meta`）

- [ ] **Step 3: 实现 PlatformMeta + PLATFORM_KEYS + platform_meta()**

在 `src-tauri/src/lib.rs` 的 `struct PlatformConfig { ... }`（903–909 行）**之后**插入：

```rust
/// 平台分类元数据：场景(scene) / 地区(region) / 开通模式(mode)。
/// 单一事实来源；前端「开通账号」选择器据此分组与渲染。
#[derive(Clone, Copy)]
struct PlatformMeta {
    scene: &'static str,   // research|product|social|content|career|lifestyle
    region: &'static str,  // us|jp|kr|ru|cn|global
    mode: &'static str,    // auto(🟢 Google自动) | manual(🟡 开登录页手动)
}

/// 可在「开通账号」里分类展示的全部平台 key（29 个）。
const PLATFORM_KEYS: &[&str] = &[
    "github", "devto", "hashnode", "hackernews", "qiita", "zenn", "habr", "v2ex", "segmentfault", "csdn", "oschina",
    "producthunt", "betalist", "alternativeto", "indiehackers",
    "twitter", "reddit", "facebook", "telegram", "weibo", "jike", "vk",
    "medium", "note", "zhihu", "naver_blog",
    "linkedin",
    "xiaohongshu", "sspai",
];

/// 平台 → 场景/地区/开通模式。mode=auto 当且仅当支持 Google 登录且非敌意平台(X/Reddit)。
fn platform_meta(platform: &str) -> Option<PlatformMeta> {
    let (scene, region, mode) = match platform {
        "github" => ("research", "us", "auto"),
        "devto" => ("research", "us", "auto"),
        "hashnode" => ("research", "us", "auto"),
        "hackernews" => ("research", "us", "manual"),
        "qiita" => ("research", "jp", "auto"),
        "zenn" => ("research", "jp", "auto"),
        "habr" => ("research", "ru", "auto"),
        "v2ex" => ("research", "cn", "auto"),
        "segmentfault" => ("research", "cn", "auto"),
        "csdn" => ("research", "cn", "manual"),
        "oschina" => ("research", "cn", "manual"),
        "producthunt" => ("product", "us", "auto"),
        "betalist" => ("product", "us", "auto"),
        "alternativeto" => ("product", "us", "auto"),
        "indiehackers" => ("product", "us", "auto"),
        "twitter" | "x" => ("social", "us", "manual"),
        "reddit" => ("social", "us", "manual"),
        "facebook" => ("social", "us", "manual"),
        "telegram" => ("social", "global", "manual"),
        "weibo" => ("social", "cn", "manual"),
        "jike" | "okjike" => ("social", "cn", "manual"),
        "vk" => ("social", "ru", "manual"),
        "medium" => ("content", "us", "auto"),
        "note" | "note_japan" => ("content", "jp", "auto"),
        "zhihu" => ("content", "cn", "manual"),
        "naver_blog" => ("content", "kr", "manual"),
        "linkedin" => ("career", "us", "auto"),
        "xiaohongshu" | "redbook" => ("lifestyle", "cn", "manual"),
        "sspai" => ("lifestyle", "cn", "manual"),
        _ => return None,
    };
    Some(PlatformMeta { scene, region, mode })
}
```

- [ ] **Step 4: 运行测试，确认通过**

Run: `cd src-tauri && cargo test platform_meta_tests 2>&1 | tail -20`
Expected: `test result: ok. 4 passed`

- [ ] **Step 5: 提交**

```bash
git add src-tauri/src/lib.rs
git commit -m "feat(platform): 新增平台场景/地区/模式分类元数据 platform_meta + 单测"
```

---

## Task 2: persona_platform_catalog 命令

**Files:**
- Modify: `src-tauri/src/lib.rs`（在 `platform_meta()` 之后新增命令；在 `generate_handler!`（15445 行起）注册）

- [ ] **Step 1: 写失败的单元测试（纯目录构建逻辑）**

把这个测试加进 Task 1 的 `mod platform_meta_tests`（同文件末尾模块内）：

```rust
    #[test]
    fn catalog_items_cover_all_keys_with_name() {
        // 不依赖 DB：仅验证 name 解析 + meta 覆盖
        for k in PLATFORM_KEYS {
            let m = platform_meta(k).unwrap();
            let name = get_platform_config(k).map(|c| c.name.to_string());
            assert!(name.is_some(), "platform {} 在 get_platform_config 里没有配置", k);
            assert!(!m.scene.is_empty() && !m.region.is_empty() && !m.mode.is_empty());
        }
    }
```

- [ ] **Step 2: 运行测试，确认失败或暴露缺失配置**

Run: `cd src-tauri && cargo test platform_meta_tests::catalog_items_cover_all_keys_with_name 2>&1 | tail -20`
Expected: 若某平台 key 在 `get_platform_config` 没有对应配置则该测试失败（提示具体 key）；否则需先有 `persona_platform_catalog` 才算完整——本步只锁定 name 覆盖。

- [ ] **Step 3: 实现 PlatformCatalogItem + persona_platform_catalog**

在 `platform_meta()` 函数之后插入：

```rust
#[derive(Serialize)]
struct PlatformCatalogItem {
    platform: String,
    name: String,
    scene: String,
    region: String,
    mode: String,
    provisioned: bool,
}

/// 返回某身份的平台开通目录：全部 29 个平台 + 该身份是否已开通(登录态 healthy)。
/// 供前端「开通账号」选择器分组渲染、决定哪些预选锁定。
#[tauri::command]
fn persona_platform_catalog(state: State<AppState>, persona_id: String) -> Result<Vec<PlatformCatalogItem>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut out = Vec::with_capacity(PLATFORM_KEYS.len());
    for &p in PLATFORM_KEYS {
        let meta = match platform_meta(p) { Some(m) => m, None => continue };
        let name = get_platform_config(p).map(|c| c.name.to_string()).unwrap_or_else(|| p.to_string());
        let provisioned: bool = conn.query_row(
            "SELECT 1 FROM accounts WHERE persona_id=?1 AND platform=?2 AND health_status='healthy' LIMIT 1",
            params![persona_id, p],
            |_| Ok(true),
        ).unwrap_or(false);
        out.push(PlatformCatalogItem {
            platform: p.to_string(),
            name,
            scene: meta.scene.to_string(),
            region: meta.region.to_string(),
            mode: meta.mode.to_string(),
            provisioned,
        });
    }
    Ok(out)
}
```

- [ ] **Step 4: 在 generate_handler! 注册命令**

在 `src-tauri/src/lib.rs` 的 `.invoke_handler(tauri::generate_handler![` 列表里、`persona_test_ip,`（约 15588 行）一行附近，新增一行：

```rust
            persona_platform_catalog,
```

- [ ] **Step 5: 运行测试 + 编译，确认通过**

Run: `cd src-tauri && cargo test platform_meta_tests 2>&1 | tail -15 && cargo build 2>&1 | grep -E "error|Finished"`
Expected: 测试 `5 passed`；`Finished` 无 error。

- [ ] **Step 6: 提交**

```bash
git add src-tauri/src/lib.rs
git commit -m "feat(platform): 新增 persona_platform_catalog 命令（含已开通状态）"
```

---

## Task 3: persona_provision_all 按选中平台开通

**Files:**
- Modify: `src-tauri/src/lib.rs`（`persona_provision_all` 4661 行；`PROVISION_PLATFORMS` 4653 行）

- [ ] **Step 1: 改签名 — 增加 platforms 参数**

把 `persona_provision_all` 的签名（约 4661 行）：

```rust
async fn persona_provision_all(app: AppHandle, persona_id: String) -> Result<String, String> {
```

改为：

```rust
async fn persona_provision_all(app: AppHandle, persona_id: String, platforms: Vec<String>) -> Result<String, String> {
```

- [ ] **Step 2: 改循环 — 遍历传入平台**

把循环头（约 4671 行）：

```rust
    for plat in PROVISION_PLATFORMS {
```

改为：

```rust
    for plat in &platforms {
        let plat = plat.as_str();
```

（注意：原循环体内 `plat` 用于 `params![]` 与 `format!`，改为 `&str` 后均兼容；新增的 `let plat = plat.as_str();` 必须是循环体第一行。）

- [ ] **Step 3: 删除不再使用的 PROVISION_PLATFORMS 常量**

删除（约 4653–4656 行）：

```rust
const PROVISION_PLATFORMS: &[&str] = &[
    "reddit", "producthunt", "devto", "medium", "hashnode", "indiehackers",
    "betalist", "alternativeto", "hackernews", "github", "linkedin", "twitter",
];
```

- [ ] **Step 4: 编译，确认无未使用警告/错误**

Run: `cd src-tauri && cargo build 2>&1 | grep -E "error|warning: .*PROVISION|Finished"`
Expected: `Finished`，无 `error`，无 `PROVISION_PLATFORMS` 相关 unused 警告。

- [ ] **Step 5: 提交**

```bash
git add src-tauri/src/lib.rs
git commit -m "feat(provision): persona_provision_all 按传入平台列表开通"
```

---

## Task 4: 前端平台选择器 modal + 改造 personaProvisionAll

**Files:**
- Modify: `src/tauri-frontend/app.ts`（`uiConfirm` 之后新增映射与 modal；`personaProvisionAll` 约 1984 行改造）

- [ ] **Step 1: 新增展示映射 + CatalogItem 接口 + pickProvisionPlatforms**

在 `app.ts` 里 `(window as any).uiConfirm = uiConfirm;` 一行**之后**插入：

```ts
// ===== 开通账号：平台选择器（场景分组 + 地区标签 + 模式徽章） =====
const SCENE_LABELS: Record<string, string> = {
  research: '💻 研发/技术', product: '🚀 产品/创业', social: '🌐 通用/大众社交',
  content: '📝 知识/内容', career: '💼 职场/商务', lifestyle: '🛍️ 生活/种草',
};
const SCENE_ORDER = ['research', 'product', 'social', 'content', 'career', 'lifestyle'];
const REGION_FLAGS: Record<string, string> = { us: '🇺🇸', jp: '🇯🇵', kr: '🇰🇷', ru: '🇷🇺', cn: '🇨🇳', global: '🌐' };

interface CatalogItem { platform: string; name: string; scene: string; region: string; mode: string; provisioned: boolean; }

// 弹出分组复选框，返回用户【新勾选】的平台 key（已开通的锁定不计入）；取消返回 null
function pickProvisionPlatforms(email: string, catalog: CatalogItem[]): Promise<string[] | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal active';
    const groups = SCENE_ORDER.map(s => ({ s, items: catalog.filter(c => c.scene === s) })).filter(g => g.items.length);
    const groupHtml = groups.map(g => `
      <div style="margin:12px 0 6px;font-weight:700;">${SCENE_LABELS[g.s] || g.s}</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${g.items.map(c => {
          const flag = REGION_FLAGS[c.region] || '🌐';
          const badge = c.provisioned
            ? '<span style="color:#16a34a;">已开通·锁定</span>'
            : (c.mode === 'auto' ? '<span style="color:#16a34a;">🟢自动</span>' : '<span style="color:#d97706;">🟡需手动</span>');
          return `<label style="display:flex;align-items:center;gap:6px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;${c.provisioned ? 'opacity:.6;' : 'cursor:pointer;'}">
            <input type="checkbox" data-plat="${escapeHtml(c.platform)}" ${c.provisioned ? 'checked disabled' : ''}>
            <span>${escapeHtml(c.name)} ${flag} ${badge}</span>
          </label>`;
        }).join('')}
      </div>`).join('');

    overlay.innerHTML = `
      <div class="modal-content" style="max-width:700px;max-height:82vh;display:flex;flex-direction:column;">
        <div class="modal-header"><h3>用 ${escapeHtml(email)} 开通平台</h3><button class="modal-close" data-cancel>&times;</button></div>
        <div class="modal-body" style="overflow:auto;">${groupHtml}</div>
        <div class="modal-footer" style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn-secondary btn-small" data-selauto>全选可开通的</button>
          <span style="flex:1;"></span>
          <button class="btn btn-secondary" data-cancel>取消</button>
          <button class="btn btn-primary" data-ok>开始开通 (0)</button>
        </div>
      </div>`;

    const boxes = (): HTMLInputElement[] => Array.from(overlay.querySelectorAll('input[type=checkbox]'));
    const picked = (): string[] => boxes().filter(b => b.checked && !b.disabled).map(b => b.getAttribute('data-plat') as string);
    const okBtn = overlay.querySelector('[data-ok]') as HTMLElement;
    const refresh = () => { okBtn.textContent = `开始开通 (${picked().length})`; };

    let done = false;
    const finish = (val: string[] | null) => { if (done) return; done = true; overlay.remove(); resolve(val); };
    overlay.querySelectorAll('[data-cancel]').forEach(el => el.addEventListener('click', () => finish(null)));
    okBtn.addEventListener('click', () => finish(picked()));
    overlay.querySelector('[data-selauto]')?.addEventListener('click', () => {
      catalog.filter(c => c.mode === 'auto' && !c.provisioned).forEach(c => {
        const b = overlay.querySelector(`input[data-plat="${c.platform}"]`) as HTMLInputElement | null;
        if (b && !b.disabled) b.checked = true;
      });
      refresh();
    });
    overlay.addEventListener('change', refresh);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) finish(null); });
    document.body.appendChild(overlay);
  });
}
(window as any).pickProvisionPlatforms = pickProvisionPlatforms;
```

- [ ] **Step 2: 改造 personaProvisionAll**

把现有函数（约 1984 行）：

```ts
(window as any).personaProvisionAll = async function(id: string, email: string) {
  if (!(await uiConfirm(`用 ${email} 检查并开通各平台账号？\n会逐个平台：有就登录、没有就注册（友好平台全自动；X/Reddit 会打开登录页让你点一下）。\n前提：这个邮箱的 Gmail 已在它的浏览器里登录。`))) return;
  showToast(`正在用 ${email} 开通各平台账号…（逐个平台跑，可能要几分钟，请耐心等）`, 'info');
  try {
    const msg = await invoke<string>('persona_provision_all', { personaId: id });
    showToast('' + msg, 'success');
    await loadAccounts();
  } catch (e) { showToast('' + e, 'error'); }
};
```

整体替换为：

```ts
(window as any).personaProvisionAll = async function(id: string, email: string) {
  let catalog: CatalogItem[];
  try {
    catalog = await invoke<CatalogItem[]>('persona_platform_catalog', { personaId: id });
  } catch (e) { showToast('加载平台列表失败：' + e, 'error'); return; }
  const platforms = await pickProvisionPlatforms(email, catalog);
  if (!platforms) return;                       // 取消
  if (!platforms.length) { showToast('没有新选择的平台', 'info'); return; }
  showToast(`正在用 ${email} 开通 ${platforms.length} 个平台…（逐个跑，请耐心等）`, 'info');
  try {
    const msg = await invoke<string>('persona_provision_all', { personaId: id, platforms });
    showToast('' + msg, 'success');
    await loadAccounts();
  } catch (e) { showToast('' + e, 'error'); }
};
```

- [ ] **Step 3: 编译前端（tsc 类型检查）**

Run: `npm run build 2>&1 | tail -10`
Expected: 无报错（仅 `> tsc` 输出）。若报 `CatalogItem` 未用等错误，按提示修正。

- [ ] **Step 4: 打包前端 bundle**

Run: `npx esbuild src/tauri-frontend/app.ts --bundle --outfile=dist/tauri/scripts/app.js 2>&1 | tail -3`
Expected: `⚡ Done`，输出 `dist/tauri/scripts/app.js`。

- [ ] **Step 5: 提交**

```bash
git add src/tauri-frontend/app.ts dist/tauri/scripts/app.js
git commit -m "feat(provision): 开通账号改为场景分组平台选择器（已开通预选锁定）"
```

---

## Task 5: 端到端手动验证

**Files:** 无（运行态验证）

- [ ] **Step 1: 启动/刷新应用**

若应用未运行：`npm run tauri:dev`（后台）。已运行则到**设置页点「🔄 刷新界面」**加载新 bundle。后端有改动需等 cargo 重新编译完成。

- [ ] **Step 2: 打开选择器**

到「账号管理」选中一个邮箱身份 → 点「🚀 检查并开通账号」。
Expected:
- 弹出选择器，平台按 6 个场景分组（💻研发 / 🚀产品创业 / 🌐通用 / 📝知识 / 💼职场 / 🛍️生活）。
- 每个平台显示 名称 + 地区国旗 + 模式徽章（🟢自动 / 🟡需手动）。
- 已 healthy 的平台 ✅ 预选 + 置灰 + 标"已开通·锁定"。

- [ ] **Step 3: 全选与计数**

点「全选可开通的」→ 仅 `🟢自动` 且未开通的被勾上；底部按钮计数 `开始开通 (N)` 随勾选实时变化；锁定项不受影响。

- [ ] **Step 4: 不选直接确定**

取消全选后直接点「开始开通」→ Expected: toast「没有新选择的平台」，不发起开通。

- [ ] **Step 5: 选 1 个自动平台开通**

勾选一个 🟢自动平台（如 Product Hunt）→「开始开通」→ Expected: 走开通流程，结束 toast 形如「开通完成：✓ 已登录/注册 X · 需你点一下 Y · 失败 Z」；账号列表刷新出现该平台。

- [ ] **Step 6: 回归——再次打开选择器**

再次点「检查并开通账号」→ Expected: 上一步成功登录的平台现在显示为"已开通·锁定"（若其登录态判定为 healthy）。

- [ ] **Step 7: 标记完成**

全部通过后，此计划完成。

---

## Self-Review 记录

- **Spec 覆盖**：scene/region/mode 定义 → Task 1；全 29 平台分类表 → Task 1 `platform_meta`；catalog 命令(provisioned=healthy) → Task 2；provision 收 platforms → Task 3；前端分组选择器+预选锁定+全选可开通+空选拦截 → Task 4；测试要点 → Task 5。无遗漏。
- **偏离 spec 说明**：spec 写"PlatformConfig 加 scene/region/mode 字段"，本计划改为独立 `platform_meta()` 函数集中维护（DRY + 可 `cargo test`，避免改 29 个 match 臂）。元数据仍在后端，对外行为一致。
- **类型一致性**：`PlatformCatalogItem`(后端) 字段 ↔ `CatalogItem`(前端) 字段一一对应（platform/name/scene/region/mode/provisioned）。命令名 `persona_platform_catalog`、`persona_provision_all` 前后端一致；参数 `personaId`/`platforms` 一致。
- **占位符**：无 TBD/TODO；每个改码步骤含完整代码与命令。
