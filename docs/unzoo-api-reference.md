# Unzoo Browser REST API 参考 (v1.8.13)

> 实测自 `http://127.0.0.1:9399/api/v1/openapi.json`。共 180 个端点。
> `*` = 必填参数。所有动作类接口走 `POST`，返回 `{success, data, error}`。

---

## ⚠️ 关键 gotcha（和直觉/Playwright 不一样，移植必看）

| 误区 | 真相 |
|---|---|
| `/click` 按 selector 点 | ❌ **按坐标**：`/click {*x,*y,tab_id}`。要按元素点 → 走 MCP `browser_click` 或 `/page/analyze`+`/page/execute` 的 ref 模型 |
| `/type` 带 selector | ❌ **只带 `*text`**：先 focus/点中输入框，再 `/type` 或 `/type-human` |
| `/hover` `/mouse-move` 按 selector | ❌ 同样按坐标 `{*x,*y}` |
| 文件上传要绕 CDP | ❌ `/upload {selector,file_path[s]}` 直接塞进 `<input type=file>`（实测 trusted File） |
| 等文本出现有专门接口 | ❌ 没有 wait-for-text，轮询 `/get-text`（或 MCP `browser_wait_for_selector` 按 selector 等） |

**按元素操作的正确姿势**：`/page/analyze`（DOM→ref 标记树，省 token）→ `/page/execute`（按 ref 点/填），或 MCP `browser_a11y_snapshot`→`browser_click ref=N`。坐标接口（`/click /hover /mouse-move`）配合 `browser_get_bounding_box` 用。

---

## 输入 / 交互（isTrusted 真实事件）
| 端点 | 参数 | 说明 |
|---|---|---|
| `/click` | `*x,*y,tab_id` | 坐标点击 |
| `/click-human` | — | 带轨迹的人类点击 |
| `/double_click`(MCP) / `/long-press` | — | 双击 / 长按 |
| `/hover` `/mouse-move` | `*x,*y,tab_id` | 悬停 / 移动 |
| `/type` | `*text,tab_id` | 模拟键盘逐字输入（先聚焦） |
| `/type-human` | `*text` | 带节奏的人类输入 |
| `/ime-composition` | — | **中文输入法合成**（抖音/小红书反合成检测关键） |
| `/press-key` | `*key,tab_id` | 单键（Enter/Escape/Tab…） |
| `/scroll` | `selector,x,y,tab_id` | 滚动（真实滚轮） |
| `/touch` `/fling` `/pressure`(压感) | — | 触屏/惯性滑动/压力 |
| `/drag-drop-file` | `x,y,file_path` | 拖拽文件到投放区 |
| `/upload` | `*selector,*file_path|file_paths` | **塞文件进 input（实测✅）** |
| `/clipboard/{copy,cut,paste,read,write}` | — | 剪贴板全套 |

## 页面观测 / 定位
| 端点 | 说明 |
|---|---|
| `/page/analyze` | DOM 脱水成 ref 标记树（token 高效，**首选定位**） |
| `/page/execute` | 按 ref 执行动作 |
| `/page/inject` `/page/cleanup` | 注入/清除 page-agent |
| `/snapshot` `/page/snapshot` | 无障碍快照（取 ref） |
| `/get-text` | innerText（轮询等文本） |
| `/get-html` | `selector,tab_id` outerHTML |
| `/evaluate` | `*expression,tab_id` 跑 JS |
| `/frames` `/frames/switch` | **iframe 列举/切换**（富文本编辑器常在 iframe） |
| `/mutation/{enable,events,disable}` | DOM 变更事件（监测上传完成更稳） |
| `/network/requests` `/network/intercept/{enable,disable}` | 网络请求观测/拦截（等上传 XHR 200） |
| `/console` | 控制台消息 |
| `/media-urls` `/media/capture/*` | 嗅探/抓取页面媒体流 |

## 导航 / 标签 / 窗口
`/navigate{,/back,/forward}` `*url` · `/nav-entries` · `/reload` · `/tabs{,/create,/activate,/close}` · `/window/{maximize,minimize,fullscreen,move,resize}` · `/screenshot`（扫码登录展示） · `/print-pdf`

## 账号 / 反检测
| 端点 | 说明 |
|---|---|
| `/profiles{,/create,/get,/update,/delete}` | 每 AI 隔离的 Chromium profile |
| `/profiles/launch` `/profiles/stop` | 启停浏览器窗口 |
| `/profiles/fingerprint{,/randomize}` | 指纹（GPU/canvas/audio/WebGL）读取/随机化 |
| `/profiles/proxy` · `/proxy-pool/*` | 单 profile 代理 / 代理池（add/assign/health-check/providers） |
| `/cookies{,/set,/delete,/clear-all}` | 原生 cookie（支持 httpOnly），登录态持久化/校验 |
| `/performance/mode` | full / light / **stealth** |
| `/geolocation/override` `/sensor/override` `/geoip/{host}` | 地理位置/传感器伪装 |
| `/blocklist/{enable,disable,status}` | 广告/追踪拦截 |

## 内置内容发现 / 抓取（UnMarket 可直接用，少造轮子）
`/search/{twitter,web,youtube,github}` · `/fetch/{tweet,web,youtube,github,rss}` · `/discover/rss` · `/youtube_transcript` · `/ytdlp/{info,download,list,get,remove}` · `/media/download/smart`（yt-dlp 智能路由）

## 调度 / 自动化 / AI
| 端点 | 说明 |
|---|---|
| `/scheduler{,/{id}/pause,/resume}` GET/POST/DELETE | **内置 cron 调度**（= social-auto-upload 的定时发布，平台级） |
| `/brain/execute` `/brain/status/{id}` | 自主 AI 目标执行（agentic） |
| `/ai/chat` | 配置的 LLM 对话 |
| `/page/analyze` + `/tools/call` | 统一工具分发 |
| `/dialog/handle` | JS 弹窗 accept/dismiss |
| `/toast/{enable,events,disable}` | 拦截 toast/模态（发布时自动消弹窗） |
| `/permission/respond` | 权限弹窗应答 |
| `/plugins/*` | 插件安装/启停/调用 |
| `/workflows/editor` `/remote` | 可视化工作流 / 远程操控 UI |

## 服务 / 运维
`/health` `/status{,/services,/mcp-clients}` · `/service/version` · `/logs{,/stats}` · `/telemetry/crashes` · `/settings/{ai,bot,proxy,mail,google,data-sources,service}` · `/mcp/tools/{list,call}` · `/data/*`（KV 存储） · `/shutdown` `/repair/services`

---

## UnMarket 应采纳但当前没用的高价值端点
1. **`/page/analyze` + `/page/execute`（ref 模型）** —— 取代脆弱的固定 selector，抗"随机类名"（抖音/小红书必需）。
2. **`/ime-composition`** —— 中文平台输入，过反合成检测。
3. **`/upload` / `/drag-drop-file`** —— 解锁抖音/小红书/视频号视频图文发布。
4. **`/frames/switch`** —— 富文本编辑器在 iframe 时（LinkedIn/某些站）直接切入。
5. **`/network/requests`（或 `/mutation/events`）** —— 判定"上传完成/发布成功"，比轮询文本稳。
6. **`/search/twitter` `/fetch/web`** —— 关键词发现 & analyze_url 用官方接口，别自己渲染。
7. **`/profiles/fingerprint/randomize` + `/proxy-pool`** —— 多账号反关联。
8. **`/performance/mode=stealth`** —— 发布/养号时降被测概率。
