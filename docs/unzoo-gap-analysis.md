# Unzoo 能力缺口分析 — 对标 social-auto-upload

> 结论先行：**Unzoo 不缺硬能力。** social-auto-upload（抖音/小红书/视频号/B站/快手/TikTok/YouTube 自动发布）所需的全部动作，Unzoo 现有 180 个 REST 接口都能直接做到，而且在"真实人类操作 / 中文输入法 / 指纹反检测 / 定时调度"上**比 social-auto-upload 的 Playwright 方案更强**。
>
> 唯一缺的是 **4 个"便利 / 稳健性"端点**——补上能让发布流程更确定、代码更短，但都不是阻塞项（今天用现有接口组合即可实现）。

---

## 一、关键纠错：中文视频可以直接走 Unzoo

之前我误判"文件上传要绕 CDP shim"。实测推翻：

```http
POST /api/v1/upload   { "selector": "#f", "file_path": "C:/.../video.mp4" }
→ { "data": { "count": 1, "uploaded": true }, "success": true }

# /evaluate 验证：input.files[0] = "sau_probe.txt / 18B" —— 真实 File 对象（trusted）
```

`/api/v1/upload` 直接把文件塞进 `<input type=file>`，等价于 Playwright 的 `set_input_files`。
抖音/小红书/视频号上传视频/图文，**直接走 Unzoo MCP/REST 即可，无需任何绕路。**

另有 `POST /api/v1/drag-drop-file {x,y,file_path}` 覆盖拖拽上传区。

---

## 二、social-auto-upload 需求 → Unzoo 覆盖映射

| social-auto-upload 的动作 | Unzoo 接口 | 状态 |
|---|---|---|
| 打开发布页 / 前进后退 | `/navigate` `/navigate/back` `/nav-entries` | ✅ |
| 多账号 + 指纹 + 代理 | `/profiles/*` `/profiles/fingerprint` `/proxy-pool/*` | ✅ 更强 |
| 视频/图片塞进 `<input type=file>` | `/upload {selector,file_path[s]}` | ✅ 实测通过 |
| 拖拽上传区 | `/drag-drop-file {x,y,file_path}` | ✅ |
| 填标题 input | `/type` `/type-human` | ✅ |
| 填正文 contenteditable | `/type-human` + `/ime-composition` | ✅ 更强 |
| 加话题 #tag + 空格 | `/press-key` | ✅ |
| 设封面（点"选择封面"→弹窗→上传） | `/click` + `/upload` | ✅ |
| 定时发布（点单选 + 键盘填日期时间） | `/click` + `/type` + `/press-key` | ✅ |
| 富文本编辑器在 iframe 内 | `/frames` `/frames/switch` | ✅ |
| 中文输入（抖音/小红书反合成输入检测） | `/ime-composition` 真实输入法合成 | ✅ 独有 |
| 等上传完成（文本"重新上传"出现） | `/get-text` 轮询 | ⚠️ 便利缺口 #1 |
| 判上传失败（文本"上传失败"） | `/get-text` 轮询 | ⚠️ 便利缺口 #1 |
| 点"发布"按钮（getByRole name=发布） | `/click` + `/snapshot` 取 ref | ⚠️ 便利缺口 #4 |
| 等跳转到内容管理页 | `/network/requests` 轮询 / MCP wait_for_navigation | ⚠️ 便利缺口 #2 |
| Cookie 保存 / 加载 / 校验登录态 | `/cookies` `/cookies/set` `/cookies/clear-all` | ✅ |
| 扫码登录展示二维码 | `/screenshot` | ✅ |
| 定时发布（平台级排期） | `/scheduler/*` 内置 cron 调度 | ✅ 独有 |
| 无头运行 | `/profiles/launch` | ✅ |

**Unzoo 额外白送（social-auto-upload 没有的）：**
真实人类输入全家桶 `/type-human` `/click-human` `/long-press` `/pressure` `/touch` `/fling` `/mouse-move`（全 isTrusted）、剪贴板 `/clipboard/*`、DOM 变更事件 `/mutation/events`、网络拦截 `/network/intercept`、AI 页面理解 `/page/analyze` `/brain/execute`、内置定时 `/scheduler`。

---

## 三、真正建议 Unzoo 补的 4 个端点（按价值排序）

### 1. `POST /api/v1/wait-for` —— 按文本/状态等待（最高价值）
上传完成靠"重新上传"文本出现、失败靠"上传失败"文本判断；现在只能轮询 `/get-text`，竞态且啰嗦。
```jsonc
POST /api/v1/wait-for
{
  "selector": "[class^='long-card']",   // 可选
  "text": "重新上传",                     // 等该文本出现
  "text_gone": "上传中",                  // 或等该文本消失
  "state": "visible",                    // attached/visible/hidden
  "timeout_ms": 120000
}
→ { "success": true, "data": { "matched": true, "elapsed_ms": 8421 } }
```

### 2. `POST /api/v1/network/wait-for` —— 等某个上传请求完成（最稳健）
大视频上传最可靠的"完成"信号是上传 XHR 返回 200。已有 `/network/requests` 能拉列表，但没有"等到某请求出现/完成"。
```jsonc
POST /api/v1/network/wait-for
{ "url_glob": "**/upload**", "status": 200, "timeout_ms": 300000 }
→ { "success": true, "data": { "url": "...", "status": 200, "elapsed_ms": 43120 } }
```

### 3. `POST /api/v1/filechooser/set` —— 拦截原生系统文件框
`/upload` 需 selector 指向 `<input type=file>`；少数按钮点击直接弹**系统**文件框（无 input 元素），`/dialog/handle` 只处理 JS alert/confirm，喂不了路径。创作平台几乎都用隐藏 input（已被 `/upload` 覆盖），故优先级较低，但为通用性建议补。
```jsonc
POST /api/v1/filechooser/set   // 点击前预置，拦截下一个 filechooser
{ "file_paths": ["C:/.../video.mp4"], "timeout_ms": 15000 }
```

### 4. `/api/v1/click` 支持 `{role, name}` / `{text}` 定位（便利）
social-auto-upload 用 `getByRole("button", name="发布", exact=True)`。Unzoo 现在按坐标/selector 点；按可见文本/role 定位要先 `/snapshot` 取 ref 再点，多一跳。
```jsonc
POST /api/v1/click   { "role": "button", "name": "发布", "exact": true }
POST /api/v1/click   { "text": "选择封面" }
```

---

## 四、给 UnMarket 的落地结论

- **可借鉴的核心**：social-auto-upload 的价值是"原创内容多平台发布 + 定时发布"，正好补 UnMarket 只会"回复别人、不会发自己内容"的空缺。
- **全部直接走 Unzoo**：文本平台（X/LinkedIn/Reddit）和中文视频平台（抖音/小红书/视频号）都能用现有 Unzoo 接口实现，无需绕路。
- **缺口不阻塞**：上面 4 个端点没补之前，用"轮询 `/get-text` + 轮询 `/network/requests` + `/snapshot` 取 ref"即可跑通；补了之后代码更短、更确定。

> 移植时一律用 Unzoo 接口替换 social-auto-upload 的 Playwright 调用：
> `page.set_input_files` → `/upload`；`page.fill` → `/type-human`；`page.click` → `/click`（或 snapshot ref）；`page.wait_for_selector(text)` → 轮询 `/get-text`（待 #1 落地后换 `/wait-for`）；`page.on(filechooser)` → 隐藏 input + `/upload`。
