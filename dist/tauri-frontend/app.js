/**
 * UnMarket Desktop - Tauri Frontend Application
 */
import { invoke as tauriInvoke } from '@tauri-apps/api/core';
let currentLanguage = 'zh';
const translations = {
    zh: {
        // Navigation
        'nav.dashboard': '仪表盘',
        'nav.campaigns': '推广活动',
        'nav.products': '产品管理',
        'nav.publish': '发布内容',
        'nav.articles': '文章管理',
        'nav.engage': '互动营销',
        'nav.accounts': '账号管理',
        'nav.tasks': '任务队列',
        'nav.statistics': '统计分析',
        'nav.settings': '设置',
        // Dashboard
        'dashboard.title': '仪表盘',
        'dashboard.activeTasks': '活动任务',
        'dashboard.publishedToday': '今日发布',
        'dashboard.accountHealth': '账号健康',
        'dashboard.successRate': '成功率',
        'dashboard.activeCampaigns': '活动中的推广',
        'dashboard.newCampaign': '+ 新建推广',
        'dashboard.noCampaigns': '暂无活动推广，创建一个开始发布！',
        'dashboard.recentActivity': '最近活动',
        'dashboard.noActivity': '暂无最近活动',
        'dashboard.platformHealth': '平台健康',
        'dashboard.quickActions': '快捷操作',
        'dashboard.addProduct': '添加产品',
        'dashboard.addAccount': '添加账号',
        'dashboard.createContent': '创建内容',
        'dashboard.startEngage': '开始互动',
        // Accounts
        'accounts.title': '平台账号',
        'accounts.addAccount': '+ 添加账号',
        'accounts.overallHealth': '整体健康',
        'accounts.active': '活跃',
        'accounts.warning': '警告',
        'accounts.banned': '封禁',
        'accounts.warming': '养号中',
        'accounts.autoRegister': '自动注册 (通过 Unzoo)',
        'accounts.checking': '检查中...',
        'accounts.connectGmail': '连接 Gmail',
        'accounts.selectPlatforms': '选择平台',
        'accounts.phone': '手机号',
        'accounts.googleOAuth': 'Google OAuth',
        'accounts.selectAll': '全选',
        'accounts.deselectAll': '取消全选',
        'accounts.autoLogin': '自动登录/注册所选',
        'accounts.syncAll': '同步全部',
        'accounts.syncAllHint': '"同步全部" 将检查你在 Unzoo 浏览器中已登录的平台',
        'accounts.existingAccounts': '现有账号',
        'accounts.delete': '删除',
        'accounts.useGlobalProfile': '-- 使用全局 Profile --',
        'accounts.createProfile': '创建 Profile',
        'accounts.noAccounts': '暂无账号',
        'accounts.autoRegisterHint': '使用自动注册或手动添加账号',
        // Nurturing (养号)
        'nurture.title': '账号养护',
        'nurture.description': '模拟正常用户浏览行为，提升账号权重',
        'nurture.quickNurture': '快速养号',
        'nurture.startNurture': '开始养号',
        'nurture.stopNurture': '停止养号',
        'nurture.totalTime': '累计养号时间',
        'nurture.lastNurture': '上次养号',
        'nurture.hours': '小时',
        'nurture.days': '天',
        'nurture.seconds': '秒',
        'nurture.selectAccount': '选择要养护的账号',
        'nurture.duration': '浏览时长',
        'nurture.30s': '30 秒',
        'nurture.60s': '1 分钟',
        'nurture.120s': '2 分钟',
        'nurture.300s': '5 分钟',
        'nurture.running': '养号中...',
        'nurture.completed': '养号完成',
        'nurture.failed': '养号失败',
        'nurture.stopped': '养号已停止',
        'nurture.noAccounts': '暂无账号，请先添加账号',
        // Settings
        'settings.title': '设置',
        'settings.aiConfig': 'AI 配置',
        'settings.aiConfigDesc': '配置 AI 用于生成自然的回复内容。填写你使用的 AI 服务的 API Key。',
        'settings.defaultProvider': '默认 AI Provider',
        'settings.model': '模型',
        'settings.refreshModels': '刷新模型列表',
        'settings.modelHint': '输入 API Key 后点击刷新获取最新模型列表',
        'settings.saveAI': '保存 AI 设置',
        'settings.testConnection': '测试连接',
        'settings.browser': '浏览器 (Unzoo)',
        'settings.browserProfile': '浏览器 Profile',
        'settings.browserProfileDesc': '选择用于发布内容的浏览器 Profile，下次会自动连接此 Profile',
        'settings.selectProfile': '-- 选择 Profile --',
        'settings.connect': '连接',
        'settings.connected': '已连接',
        'settings.unzooPath': 'Unzoo 路径',
        'settings.notFound': '未找到',
        'settings.language': '语言设置',
        'settings.languageDesc': '选择界面显示语言',
        'settings.chinese': '简体中文',
        'settings.english': 'English',
        'settings.scheduler': '调度器',
        'settings.schedulerMode': '模式',
        'settings.roundRobin': '轮询',
        'settings.weighted': '权重',
        'settings.priority': '优先级',
        'settings.smart': '智能 (AI)',
        'settings.interval': '间隔 (分钟)',
        'settings.maxDailyPosts': '每日最大发布数',
        'settings.saveScheduler': '保存调度器设置',
        'settings.proxyPool': '代理池',
        'settings.addProxy': '+ 添加代理',
        'settings.proxyDesc': '管理多账号操作的代理。每个账号可以使用不同的代理。',
        'settings.total': '总计',
        'settings.active': '活跃',
        'settings.inUse': '使用中',
        'settings.failed': '失败',
        'settings.bulkImport': '批量导入',
        'settings.bulkImportHint': '每行一个: protocol://ip:port 或 protocol://user:pass@ip:port',
        'settings.importProxies': '导入代理',
        'settings.noProxies': '暂无配置代理。添加一个代理开始使用。',
        'settings.scheduledJobs': '⏰ 定时任务 (Unzoo)',
        'settings.addJob': '+ 添加任务',
        'settings.jobsDesc': '使用 Unzoo 调度器 API 配置自动化任务。',
        // Common
        'common.save': '保存',
        'common.cancel': '取消',
        'common.delete': '删除',
        'common.edit': '编辑',
        'common.refresh': '刷新',
        'common.loading': '加载中...',
        'common.error': '错误',
        'common.success': '成功',
        'common.confirm': '确认',
        'common.viewAll': '查看全部',
        'common.quickPublish': '快速发布',
        // Campaigns
        'campaigns.title': '推广活动',
        'campaigns.create': '+ 创建活动',
        'campaigns.active': '进行中',
        'campaigns.scheduled': '已计划',
        'campaigns.completed': '已完成',
        'campaigns.totalTasks': '总任务数',
        'campaigns.noCampaigns': '暂无活动，创建第一个营销活动开始发布吧',
        'campaigns.createCampaign': '创建活动',
        'campaigns.allStatus': '所有状态',
        'campaigns.running': '运行中',
        'campaigns.paused': '已暂停',
        'campaigns.draft': '草稿',
        'campaigns.allPlatforms': '所有平台',
        // Products
        'products.title': '产品管理',
        'products.add': '+ 添加产品',
        'products.selectAll': '全选',
        'products.clear': '清除',
        'products.noSelection': '未选择',
        'products.publishSelected': '发布选中',
        'products.noProducts': '暂无产品',
        'products.addFirst': '添加第一个产品开始全球营销',
        // Publish
        'publish.title': '发布内容',
        'publish.refreshLimits': '🔄 刷新限制',
        'publish.platformStatus': '📊 平台发布状态',
        'publish.statusHint': '防封限制保护你的账号。绿色 = 可发布，黄色 = 等待，红色 = 达到每日限制。',
        'publish.selectProducts': '选择产品',
        'publish.platforms': '平台',
        'publish.languages': '语言',
        'publish.generate': '生成内容',
        'publish.preview': '内容预览',
        'publish.previewHint': '选择产品并生成内容进行预览',
        'publish.simulate': '模拟',
        'publish.publishAll': '发布全部',
        'publish.selected': '已选择',
        // Articles
        'articles.title': '文章管理 (软文)',
        'articles.new': '+ 新建文章',
        'articles.selectProduct': '选择产品',
        'articles.chooseProduct': '选择一个产品...',
        'articles.articleType': '文章类型',
        'articles.tutorial': '教程/指南',
        'articles.tutorialDesc': '使用方法，分步指南',
        'articles.comparison': '对比评测',
        'articles.comparisonDesc': '与竞品对比',
        'articles.problemSolving': '问题解决',
        'articles.problemSolvingDesc': '痛点 → 解决方案',
        'articles.story': '故事/案例',
        'articles.storyDesc': '用户故事，使用场景',
        'articles.listicle': '清单文章',
        'articles.listicleDesc': 'Top 10, 最佳 X 工具',
        'articles.targetPlatforms': '目标平台',
        'articles.seoKeywords': 'SEO 关键词',
        'articles.tone': '语调风格',
        'articles.professional': '专业',
        'articles.casual': '轻松友好',
        'articles.technical': '技术',
        'articles.storytelling': '叙事',
        'articles.generateArticles': '生成文章',
        'articles.generatedArticles': '生成的文章',
        'articles.generateHint': '选择产品并生成文章',
        'articles.copy': '复制',
        'articles.addToQueue': '加入队列',
        'articles.savedArticles': '已保存的文章',
        'articles.noSavedArticles': '暂无已保存的文章',
        // Engage
        'engage.title': '💬 互动营销 (回复系统)',
        'engage.addKeyword': '+ 添加关键词',
        'engage.replyStatus': '📊 回复状态',
        'engage.replyHint': '通过回复进行自然互动比发帖更安全有效。',
        'engage.monitorKeywords': '🔍 监控关键词',
        'engage.keywordsHint': '我们会找到匹配这些关键词的帖子并建议回复。',
        'engage.noKeywords': '暂无关键词。添加关键词开始发现相关帖子。',
        'engage.discoveredPosts': '📬 发现的帖子',
        'engage.discoverNow': '🔍 立即发现',
        'engage.discoverHint': '添加关键词并点击"立即发现"来查找相关帖子。',
        // Tasks
        'tasks.title': '任务队列',
        'tasks.clearCompleted': '清除已完成',
        'tasks.retryFailed': '重试失败',
        'tasks.pending': '待处理',
        'tasks.running': '运行中',
        'tasks.completed': '已完成',
        'tasks.noTasks': '暂无任务',
        'tasks.tasksHint': '发布或回复时会在这里显示任务',
        // Stats
        'stats.title': '统计分析',
        'stats.export': '📥 导出',
        'stats.last7days': '最近 7 天',
        'stats.last30days': '最近 30 天',
        'stats.last90days': '最近 90 天',
        'stats.lastYear': '最近一年',
        'stats.allTime': '所有时间',
        'stats.totalPosts': '总发布数',
        'stats.totalViews': '总浏览量',
        'stats.engagements': '互动数',
        'stats.engagementRate': '互动率',
        'stats.activityTrend': '📊 活动趋势',
        'stats.posts': '发布',
        'stats.views': '浏览',
        'stats.platformPerformance': '🌐 平台表现',
        'stats.contentBreakdown': '📑 内容类型分布',
        'stats.articles': '文章',
        'stats.replies': '回复',
        'stats.reposts': '转发',
        'stats.comments': '评论',
        // Messages
        'msg.profileBound': '已绑定 Profile',
        'msg.profileUnbound': '已解绑，将使用全局 Profile',
        'msg.bindFailed': '绑定失败',
        'msg.nurtureStarted': '开始养号',
        'msg.nurtureCompleted': '养号完成',
        'msg.nurtureFailed': '养号失败',
        'msg.selectProfileFirst': '请先选择一个 Profile',
        'msg.connecting': '正在连接...',
        'msg.profilesRefreshed': 'Profiles 已刷新',
        'msg.connectionFailed': '连接失败',
        'msg.browserMode': '浏览器模式 - 功能受限。请使用 Tauri 桌面应用以获取完整功能。',
        'msg.failedToLoad': '加载数据失败',
        'msg.enterCampaignName': '请输入活动名称',
        'msg.selectProduct': '请选择一个产品',
        'msg.selectPlatform': '请选择至少一个平台',
        'msg.campaignStarted': '活动已开始！',
        'msg.campaignPaused': '活动已暂停',
        'msg.campaignDeleted': '活动已删除',
        'msg.productAdded': '产品添加成功',
        'msg.productDeleted': '产品已删除',
        'msg.enterUrl': '请输入 URL',
        'msg.urlAnalyzed': 'URL 分析完成',
        'msg.nameUrlRequired': '名称和 URL 是必填项',
        'msg.gmailConnected': 'Gmail 连接成功！',
        'msg.accountAdded': '账号已添加',
        'msg.accountDeleted': '账号已删除',
        'msg.platformUsernameRequired': '平台和用户名是必填项',
        'msg.syncCompleted': '同步完成',
        'msg.profileCreated': 'Profile 已创建',
        'msg.proxyUpdated': '代理已更新',
        'msg.proxyAdded': '代理添加成功',
        'msg.proxyDeleted': '代理已删除',
        'msg.testingProxy': '正在测试代理...',
        'msg.jobCreated': '定时任务已创建',
        'msg.jobDeleted': '任务已删除',
        'msg.noContentToPublish': '没有内容可发布',
        'msg.allPublished': '全部发布完成！',
        'msg.publishCancelled': '发布已取消',
        'msg.keywordAdded': '关键词已添加',
        'msg.keywordDeleted': '关键词已删除',
        'msg.addKeywordsFirst': '请先添加关键词',
        'msg.replyGenerated': '回复已生成',
        'msg.replySent': '回复发送成功！',
        'msg.pleaseWriteReply': '请输入回复内容',
        'msg.aiSettingsSaved': 'AI 设置已保存',
        'msg.schedulerSettingsSaved': '调度器设置已保存',
        'msg.selectLanguage': '请选择至少一种语言',
        'msg.articleCopied': '文章已复制到剪贴板',
        'msg.articlesQueued': '文章已加入任务队列',
        'msg.taskAdded': '任务已加入队列',
        'msg.clearedTasks': '已清除完成的任务',
        'msg.comingSoon': '功能即将推出',
        'msg.simulationMode': '模拟模式 - 不会实际发布',
        'msg.usingDefaultModels': '使用默认模型列表',
        'msg.apiKeyNotSaved': 'API Key 未保存，请先保存设置',
        'msg.networkError': '网络错误',
        'msg.statsExported': '统计数据导出成功！',
        'msg.account': '账号',
        'msg.failed': '失败',
    },
    en: {
        // Navigation
        'nav.dashboard': 'Dashboard',
        'nav.campaigns': 'Campaigns',
        'nav.products': 'Products',
        'nav.publish': 'Publish',
        'nav.articles': 'Articles',
        'nav.engage': 'Engage',
        'nav.accounts': 'Accounts',
        'nav.tasks': 'Tasks',
        'nav.statistics': 'Statistics',
        'nav.settings': 'Settings',
        // Dashboard
        'dashboard.title': 'Dashboard',
        'dashboard.activeTasks': 'Active Tasks',
        'dashboard.publishedToday': 'Published Today',
        'dashboard.accountHealth': 'Account Health',
        'dashboard.successRate': 'Success Rate',
        'dashboard.activeCampaigns': 'Active Campaigns',
        'dashboard.newCampaign': '+ New Campaign',
        'dashboard.noCampaigns': 'No active campaigns. Create one to start publishing!',
        'dashboard.recentActivity': 'Recent Activity',
        'dashboard.noActivity': 'No recent activity',
        'dashboard.platformHealth': 'Platform Health',
        'dashboard.quickActions': 'Quick Actions',
        'dashboard.addProduct': 'Add Product',
        'dashboard.addAccount': 'Add Account',
        'dashboard.createContent': 'Create Content',
        'dashboard.startEngage': 'Start Engage',
        // Accounts
        'accounts.title': 'Platform Accounts',
        'accounts.addAccount': '+ Add Account',
        'accounts.overallHealth': 'Overall Health',
        'accounts.active': 'Active',
        'accounts.warning': 'Warning',
        'accounts.banned': 'Banned',
        'accounts.warming': 'Warming',
        'accounts.autoRegister': 'Auto-Register (via Unzoo)',
        'accounts.checking': 'Checking...',
        'accounts.connectGmail': 'Connect Gmail',
        'accounts.selectPlatforms': 'Select Platforms',
        'accounts.phone': 'phone',
        'accounts.googleOAuth': 'Google OAuth',
        'accounts.selectAll': 'Select All',
        'accounts.deselectAll': 'Deselect All',
        'accounts.autoLogin': 'Auto-Login/Register Selected',
        'accounts.syncAll': 'Sync All',
        'accounts.syncAllHint': '"Sync All" will check which platforms you\'re already logged into in Unzoo browser',
        'accounts.existingAccounts': 'Existing Accounts',
        'accounts.delete': 'Delete',
        'accounts.useGlobalProfile': '-- Use Global Profile --',
        'accounts.createProfile': 'Create Profile',
        'accounts.noAccounts': 'No accounts configured',
        'accounts.autoRegisterHint': 'Use auto-register or add accounts manually',
        // Nurturing
        'nurture.title': 'Account Nurturing',
        'nurture.description': 'Simulate normal user browsing to improve account weight',
        'nurture.quickNurture': 'Quick Nurture',
        'nurture.startNurture': 'Start Nurturing',
        'nurture.stopNurture': 'Stop Nurturing',
        'nurture.totalTime': 'Total Nurturing Time',
        'nurture.lastNurture': 'Last Nurtured',
        'nurture.hours': 'hours',
        'nurture.days': 'days',
        'nurture.seconds': 'seconds',
        'nurture.selectAccount': 'Select account to nurture',
        'nurture.duration': 'Duration',
        'nurture.30s': '30 seconds',
        'nurture.60s': '1 minute',
        'nurture.120s': '2 minutes',
        'nurture.300s': '5 minutes',
        'nurture.running': 'Nurturing...',
        'nurture.completed': 'Nurturing completed',
        'nurture.failed': 'Nurturing failed',
        'nurture.stopped': 'Nurturing stopped',
        'nurture.noAccounts': 'No accounts yet, please add accounts first',
        // Settings
        'settings.title': 'Settings',
        'settings.aiConfig': 'AI Configuration',
        'settings.aiConfigDesc': 'Configure AI for generating natural responses. Enter API Key for your AI service.',
        'settings.defaultProvider': 'Default AI Provider',
        'settings.model': 'Model',
        'settings.refreshModels': 'Refresh Model List',
        'settings.modelHint': 'Enter API Key then click refresh to get latest model list',
        'settings.saveAI': 'Save AI Settings',
        'settings.testConnection': 'Test Connection',
        'settings.browser': 'Browser (Unzoo)',
        'settings.browserProfile': 'Browser Profile',
        'settings.browserProfileDesc': 'Select browser profile for publishing, will auto-connect next time',
        'settings.selectProfile': '-- Select Profile --',
        'settings.connect': 'Connect',
        'settings.connected': 'Connected',
        'settings.unzooPath': 'Unzoo Path',
        'settings.notFound': 'Not found',
        'settings.language': 'Language',
        'settings.languageDesc': 'Select interface language',
        'settings.chinese': '简体中文',
        'settings.english': 'English',
        'settings.scheduler': 'Scheduler',
        'settings.schedulerMode': 'Mode',
        'settings.roundRobin': 'Round Robin',
        'settings.weighted': 'Weighted',
        'settings.priority': 'Priority',
        'settings.smart': 'Smart (AI)',
        'settings.interval': 'Interval (minutes)',
        'settings.maxDailyPosts': 'Max Daily Posts',
        'settings.saveScheduler': 'Save Scheduler Settings',
        'settings.proxyPool': 'Proxy Pool',
        'settings.addProxy': '+ Add Proxy',
        'settings.proxyDesc': 'Manage proxies for multi-account operations. Each account can use a different proxy.',
        'settings.total': 'Total',
        'settings.active': 'Active',
        'settings.inUse': 'In Use',
        'settings.failed': 'Failed',
        'settings.bulkImport': 'Bulk Import',
        'settings.bulkImportHint': 'One per line: protocol://ip:port or protocol://user:pass@ip:port',
        'settings.importProxies': 'Import Proxies',
        'settings.noProxies': 'No proxies configured. Add a proxy to get started.',
        'settings.scheduledJobs': '⏰ Scheduled Jobs (Unzoo)',
        'settings.addJob': '+ Add Job',
        'settings.jobsDesc': 'Configure automated tasks using Unzoo\'s scheduler API.',
        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.refresh': 'Refresh',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.confirm': 'Confirm',
        'common.viewAll': 'View All',
        'common.quickPublish': 'Quick Publish',
        // Campaigns
        'campaigns.title': 'Campaigns',
        'campaigns.create': '+ Create Campaign',
        'campaigns.active': 'Active',
        'campaigns.scheduled': 'Scheduled',
        'campaigns.completed': 'Completed',
        'campaigns.totalTasks': 'Total Tasks',
        'campaigns.noCampaigns': 'No campaigns yet. Create your first marketing campaign to start publishing',
        'campaigns.createCampaign': 'Create Campaign',
        'campaigns.allStatus': 'All Status',
        'campaigns.running': 'Running',
        'campaigns.paused': 'Paused',
        'campaigns.draft': 'Draft',
        'campaigns.allPlatforms': 'All Platforms',
        // Products
        'products.title': 'Products',
        'products.add': '+ Add Product',
        'products.selectAll': 'Select All',
        'products.clear': 'Clear',
        'products.noSelection': 'No selection',
        'products.publishSelected': 'Publish Selected',
        'products.noProducts': 'No products yet',
        'products.addFirst': 'Add your first product to start marketing globally',
        // Publish
        'publish.title': 'Publish Content',
        'publish.refreshLimits': '🔄 Refresh Limits',
        'publish.platformStatus': '📊 Platform Publishing Status',
        'publish.statusHint': 'Anti-ban limits protect your accounts. Green = can post, Yellow = wait, Red = daily limit reached.',
        'publish.selectProducts': 'Select Products',
        'publish.platforms': 'Platforms',
        'publish.languages': 'Languages',
        'publish.generate': 'Generate Content',
        'publish.preview': 'Content Preview',
        'publish.previewHint': 'Select a product and generate content to preview',
        'publish.simulate': 'Simulate',
        'publish.publishAll': 'Publish All',
        'publish.selected': 'selected',
        // Articles
        'articles.title': 'Articles',
        'articles.new': '+ New Article',
        'articles.selectProduct': 'Select Product',
        'articles.chooseProduct': 'Choose a product...',
        'articles.articleType': 'Article Type',
        'articles.tutorial': 'Tutorial/Guide',
        'articles.tutorialDesc': 'How to use, step-by-step guide',
        'articles.comparison': 'Comparison',
        'articles.comparisonDesc': 'Compare with alternatives',
        'articles.problemSolving': 'Problem-Solving',
        'articles.problemSolvingDesc': 'Pain point → Solution',
        'articles.story': 'Story/Case',
        'articles.storyDesc': 'User story, use case',
        'articles.listicle': 'Listicle',
        'articles.listicleDesc': 'Top 10, Best X tools',
        'articles.targetPlatforms': 'Target Platforms',
        'articles.seoKeywords': 'SEO Keywords',
        'articles.tone': 'Tone',
        'articles.professional': 'Professional',
        'articles.casual': 'Casual/Friendly',
        'articles.technical': 'Technical',
        'articles.storytelling': 'Storytelling',
        'articles.generateArticles': 'Generate Articles',
        'articles.generatedArticles': 'Generated Articles',
        'articles.generateHint': 'Select a product and generate articles',
        'articles.copy': 'Copy',
        'articles.addToQueue': 'Add to Queue',
        'articles.savedArticles': 'Saved Articles',
        'articles.noSavedArticles': 'No saved articles yet',
        // Engage
        'engage.title': '💬 Engage (Reply System)',
        'engage.addKeyword': '+ Add Keyword',
        'engage.replyStatus': '📊 Reply Status',
        'engage.replyHint': 'Natural engagement through replies is safer and more effective than posting.',
        'engage.monitorKeywords': '🔍 Monitoring Keywords',
        'engage.keywordsHint': 'We\'ll find posts matching these keywords and suggest replies.',
        'engage.noKeywords': 'No keywords yet. Add keywords to start discovering relevant posts.',
        'engage.discoveredPosts': '📬 Discovered Posts',
        'engage.discoverNow': '🔍 Discover Now',
        'engage.discoverHint': 'Add keywords and click "Discover Now" to find relevant posts.',
        // Tasks
        'tasks.title': 'Tasks',
        'tasks.clearCompleted': 'Clear Completed',
        'tasks.retryFailed': 'Retry Failed',
        'tasks.pending': 'pending',
        'tasks.running': 'running',
        'tasks.completed': 'completed',
        'tasks.noTasks': 'No tasks yet',
        'tasks.tasksHint': 'Tasks will appear here when you publish or reply',
        // Stats
        'stats.title': 'Statistics & Analytics',
        'stats.export': '📥 Export',
        'stats.last7days': 'Last 7 days',
        'stats.last30days': 'Last 30 days',
        'stats.last90days': 'Last 90 days',
        'stats.lastYear': 'Last year',
        'stats.allTime': 'All time',
        'stats.totalPosts': 'Total Posts',
        'stats.totalViews': 'Total Views',
        'stats.engagements': 'Engagements',
        'stats.engagementRate': 'Engagement Rate',
        'stats.activityTrend': '📊 Activity Trend',
        'stats.posts': 'Posts',
        'stats.views': 'Views',
        'stats.platformPerformance': '🌐 Platform Performance',
        'stats.contentBreakdown': '📑 Content Type Breakdown',
        'stats.articles': 'Articles',
        'stats.replies': 'Replies',
        'stats.reposts': 'Reposts',
        'stats.comments': 'Comments',
        // Messages
        'msg.profileBound': 'Profile bound',
        'msg.profileUnbound': 'Profile unbound, will use global profile',
        'msg.bindFailed': 'Bind failed',
        'msg.nurtureStarted': 'Nurturing started',
        'msg.nurtureCompleted': 'Nurturing completed',
        'msg.nurtureFailed': 'Nurturing failed',
        'msg.selectProfileFirst': 'Please select a profile first',
        'msg.connecting': 'Connecting...',
        'msg.profilesRefreshed': 'Profiles refreshed',
        'msg.connectionFailed': 'Connection failed',
        'msg.browserMode': 'Browser Mode - Features limited. Please use the Tauri desktop app for full functionality.',
        'msg.failedToLoad': 'Failed to load data',
        'msg.enterCampaignName': 'Please enter a campaign name',
        'msg.selectProduct': 'Please select a product',
        'msg.selectPlatform': 'Please select at least one platform',
        'msg.campaignStarted': 'Campaign started!',
        'msg.campaignPaused': 'Campaign paused',
        'msg.campaignDeleted': 'Campaign deleted',
        'msg.productAdded': 'Product added successfully',
        'msg.productDeleted': 'Product deleted',
        'msg.enterUrl': 'Please enter a URL',
        'msg.urlAnalyzed': 'URL analyzed',
        'msg.nameUrlRequired': 'Name and URL are required',
        'msg.gmailConnected': 'Gmail connected successfully!',
        'msg.accountAdded': 'Account added',
        'msg.accountDeleted': 'Account deleted',
        'msg.platformUsernameRequired': 'Platform and username are required',
        'msg.syncCompleted': 'Sync completed',
        'msg.profileCreated': 'Profile created',
        'msg.proxyUpdated': 'Proxy updated',
        'msg.proxyAdded': 'Proxy added successfully',
        'msg.proxyDeleted': 'Proxy deleted',
        'msg.testingProxy': 'Testing proxy...',
        'msg.jobCreated': 'Scheduled job created',
        'msg.jobDeleted': 'Job deleted',
        'msg.noContentToPublish': 'No content to publish',
        'msg.allPublished': 'All content published!',
        'msg.publishCancelled': 'Publishing cancelled',
        'msg.keywordAdded': 'Keyword added',
        'msg.keywordDeleted': 'Keyword deleted',
        'msg.addKeywordsFirst': 'Please add keywords first',
        'msg.replyGenerated': 'Reply generated',
        'msg.replySent': 'Reply sent successfully!',
        'msg.pleaseWriteReply': 'Please write a reply',
        'msg.aiSettingsSaved': 'AI settings saved',
        'msg.schedulerSettingsSaved': 'Scheduler settings saved',
        'msg.selectLanguage': 'Select at least one language',
        'msg.articleCopied': 'Article copied to clipboard',
        'msg.articlesQueued': 'Articles added to task queue',
        'msg.taskAdded': 'Task added to queue',
        'msg.clearedTasks': 'Cleared completed tasks',
        'msg.comingSoon': 'Coming soon',
        'msg.simulationMode': 'Simulation mode - no actual posts',
        'msg.usingDefaultModels': 'Using default model list',
        'msg.apiKeyNotSaved': 'API Key not saved, please save settings first',
        'msg.networkError': 'Network error',
        'msg.statsExported': 'Statistics exported successfully!',
        'msg.account': 'Account',
        'msg.failed': 'failed',
    }
};
function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}
// Update all elements with data-i18n attribute
function updateAllTranslations() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            el.textContent = t(key);
        }
    });
    // Update elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
            el.placeholder = t(key);
        }
    });
    // Update navigation sidebar
    const navMapping = {
        'dashboard': 'nav.dashboard',
        'campaigns': 'nav.campaigns',
        'products': 'nav.products',
        'publish': 'nav.publish',
        'articles': 'nav.articles',
        'engage': 'nav.engage',
        'accounts': 'nav.accounts',
        'tasks': 'nav.tasks',
        'stats': 'nav.statistics',
        'settings': 'nav.settings'
    };
    document.querySelectorAll('.nav-item').forEach(item => {
        const page = item.dataset.page;
        if (page && navMapping[page]) {
            const textEl = item.querySelector('.nav-text');
            if (textEl) {
                textEl.textContent = t(navMapping[page]);
            }
        }
    });
}
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('unmarket_language', lang);
    // Update all static translations
    updateAllTranslations();
    // Re-render current page to apply new language to dynamic content
    if (typeof renderCurrentPage === 'function') {
        renderCurrentPage();
    }
}
function loadSavedLanguage() {
    const saved = localStorage.getItem('unmarket_language');
    if (saved && (saved === 'zh' || saved === 'en')) {
        currentLanguage = saved;
    }
}
// ============================================================================
// Tauri Environment Check
// ============================================================================
// Check if running in Tauri environment
let isTauriEnv = false;
try {
    isTauriEnv = !!window.__TAURI_INTERNALS__;
}
catch {
    isTauriEnv = false;
}
// Safe invoke wrapper that handles browser environment
async function invoke(cmd, args) {
    if (!isTauriEnv) {
        console.warn(`[Browser Mode] invoke('${cmd}') not available outside Tauri`);
        throw new Error('Please use the Tauri desktop app, not browser');
    }
    return tauriInvoke(cmd, args);
}
// ============================================================================
// State
// ============================================================================
let currentPage = 'products';
let products = [];
let accounts = [];
let generatedContents = [];
let selectedProductIds = new Set(); // Track selected products for batch operations
let tasks = [];
let taskRunning = false;
let generatedArticles = [];
let currentArticleIndex = 0;
let savedArticles = [];
let browserProfiles = [];
let scheduledJobs = [];
// 默认 AI providers (作为备用)
const defaultAiProviders = {
    gemini: { name: 'Google Gemini', models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
    openai: { name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'] },
    deepseek: { name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
    qwen: { name: '阿里千问', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'] },
};
let aiProviders = { ...defaultAiProviders };
// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Tauri app initializing...');
    // Load saved language preference
    loadSavedLanguage();
    // Apply translations to static HTML elements
    updateAllTranslations();
    // Show browser mode warning if not in Tauri
    if (!isTauriEnv) {
        showBrowserModeWarning();
    }
    initNavigation();
    initModals();
    initTabs();
    initCampaignEvents();
    initProxyEvents();
    await loadInitialData();
    checkBrowserStatus();
});
// Show warning banner when running in browser instead of Tauri
function showBrowserModeWarning() {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ff5722;color:white;padding:10px;text-align:center;z-index:9999;font-size:14px;';
    banner.innerHTML = '⚠️ Browser Mode - Features limited. Please use the Tauri desktop app for full functionality. <button onclick="this.parentElement.remove()" style="margin-left:10px;padding:2px 8px;cursor:pointer;">✕</button>';
    document.body.prepend(banner);
}
// Navigation
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            if (page)
                navigateTo(page);
        });
    });
}
function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === `page-${page}`);
    });
    currentPage = page;
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'campaigns':
            loadCampaigns();
            break;
        case 'products':
            loadProducts();
            break;
        case 'publish':
            loadPublishPage();
            break;
        case 'articles':
            loadArticlesPage();
            break;
        case 'engage':
            loadEngagePage();
            break;
        case 'accounts':
            loadAccounts();
            break;
        case 'tasks':
            loadTasksPage();
            break;
        case 'stats':
            loadStats();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}
// Make navigateTo globally accessible
window.navigateTo = navigateTo;
// Re-render current page (used when language changes)
function renderCurrentPage() {
    navigateTo(currentPage);
}
// Language switcher
window.setLanguage = function (lang) {
    setLanguage(lang);
    // Update language selector UI
    const selector = document.getElementById('languageSelect');
    if (selector)
        selector.value = lang;
    showToast(lang === 'zh' ? '语言已切换为中文' : 'Language switched to English', 'success');
};
// Modals
function initModals() {
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        });
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal)
                modal.classList.remove('active');
        });
    });
    document.getElementById('btnAddProduct')?.addEventListener('click', () => openModal('modalAddProduct'));
    document.getElementById('btnAddProductEmpty')?.addEventListener('click', () => openModal('modalAddProduct'));
    document.getElementById('btnSaveProduct')?.addEventListener('click', saveProduct);
    // Product batch selection
    document.getElementById('btnSelectAllProducts')?.addEventListener('click', selectAllProducts);
    document.getElementById('btnClearSelection')?.addEventListener('click', clearProductSelection);
    document.getElementById('btnBatchPublish')?.addEventListener('click', batchPublishSelected);
    // Publish page product selection
    document.getElementById('btnSelectAllPublish')?.addEventListener('click', selectAllPublishProducts);
    document.getElementById('btnClearPublish')?.addEventListener('click', clearPublishProducts);
    document.getElementById('btnAnalyze')?.addEventListener('click', analyzeUrl);
    document.getElementById('btnAddAccount')?.addEventListener('click', () => openModal('modalAddAccount'));
    document.getElementById('btnAddAccountEmpty')?.addEventListener('click', () => openModal('modalAddAccount'));
    document.getElementById('btnSaveAccount')?.addEventListener('click', saveAccount);
    document.getElementById('btnSetupGmail')?.addEventListener('click', setupGmail);
    document.getElementById('btnAutoRegister')?.addEventListener('click', autoRegister);
    document.getElementById('btnSyncAll')?.addEventListener('click', syncAllPlatforms);
    document.getElementById('registerPlatforms')?.addEventListener('change', updateRegisterButton);
    document.getElementById('btnSelectAll')?.addEventListener('click', selectAllPlatforms);
    document.getElementById('btnDeselectAll')?.addEventListener('click', deselectAllPlatforms);
    // Publish page platform selection
    document.getElementById('btnSelectAllPublishPlatforms')?.addEventListener('click', selectAllPublishPlatforms);
    document.getElementById('btnDeselectAllPublishPlatforms')?.addEventListener('click', deselectAllPublishPlatforms);
    // Campaign page platform selection
    document.getElementById('btnSelectAllCampaignPlatforms')?.addEventListener('click', selectAllCampaignPlatforms);
    document.getElementById('btnDeselectAllCampaignPlatforms')?.addEventListener('click', deselectAllCampaignPlatforms);
    document.getElementById('btnGenerate')?.addEventListener('click', generateContent);
    document.getElementById('btnSimulate')?.addEventListener('click', simulatePublish);
    document.getElementById('btnPublish')?.addEventListener('click', queuePublishTask);
    // Tasks page
    document.getElementById('btnClearCompleted')?.addEventListener('click', clearCompletedTasks);
    document.getElementById('btnCreateNurtureTask')?.addEventListener('click', openBatchNurtureModal);
    // Articles page
    document.getElementById('btnGenerateArticle')?.addEventListener('click', generateArticles);
    document.getElementById('btnCopyArticle')?.addEventListener('click', copyCurrentArticle);
    document.getElementById('btnPublishArticle')?.addEventListener('click', queueArticleTask);
    initArticleTypeSelection();
    document.getElementById('btnRefreshStrategies')?.addEventListener('click', loadPublishStrategies);
    document.getElementById('btnSaveAI')?.addEventListener('click', saveAISettings);
    document.getElementById('btnSaveScheduler')?.addEventListener('click', saveSchedulerSettings);
    document.getElementById('aiProvider')?.addEventListener('change', () => populateDefaultModels());
    document.getElementById('btnRefreshModels')?.addEventListener('click', refreshModels);
    // Engage page
    document.getElementById('btnAddKeyword')?.addEventListener('click', () => openKeywordModal());
    document.getElementById('btnSaveKeyword')?.addEventListener('click', saveKeyword);
    document.getElementById('btnDiscoverNow')?.addEventListener('click', discoverPosts);
    document.getElementById('btnGenerateReply')?.addEventListener('click', generateReplyContent);
    document.getElementById('btnSendReply')?.addEventListener('click', sendReply);
    // Profile & Scheduler management
    document.getElementById('btnSaveProxy')?.addEventListener('click', saveProxy);
    document.getElementById('btnAddSchedule')?.addEventListener('click', () => openModal('modalAddSchedule'));
    document.getElementById('btnSaveSchedule')?.addEventListener('click', createScheduledJob);
}
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }
window.openModal = openModal;
window.closeModal = closeModal;
// Tabs
function initTabs() {
    document.querySelectorAll('.tabs').forEach(tabGroup => {
        tabGroup.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabGroup.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const tabId = tab.dataset.tab;
                const parent = tabGroup.parentElement;
                parent?.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.toggle('active', content.id === `tab-${tabId}`);
                });
            });
        });
    });
}
// Load initial data
async function loadInitialData() {
    try {
        console.log('Loading initial data...');
        products = await invoke('list_products');
        const providers = await invoke('get_ai_providers');
        aiProviders = { ...defaultAiProviders, ...(providers || {}) };
        console.log('Products loaded:', products.length);
        // Load dashboard as default page
        await loadDashboard();
    }
    catch (error) {
        console.error('Failed to load initial data:', error);
        showToast(t('msg.failedToLoad'), 'error');
    }
}
// Dashboard
async function loadDashboard() {
    try {
        // Load dashboard stats
        const dashboardData = await invoke('get_dashboard_stats');
        // Update stat cards
        document.getElementById('dashActiveTasks').textContent = dashboardData.active_tasks?.toString() || '0';
        document.getElementById('dashTodayPosts').textContent = dashboardData.today_posts?.toString() || '0';
        document.getElementById('dashAccountHealth').textContent = (dashboardData.account_health || 0) + '%';
        document.getElementById('dashSuccessRate').textContent = (dashboardData.success_rate || 0) + '%';
        // Render active campaigns
        renderDashboardCampaigns(dashboardData.campaigns || []);
        // Render recent activity
        renderDashboardActivity(dashboardData.recent_activity || []);
        // Render platform health
        renderPlatformHealth(dashboardData.platform_health || {});
    }
    catch (error) {
        console.error('Failed to load dashboard:', error);
        // Set default values on error
        document.getElementById('dashActiveTasks').textContent = '0';
        document.getElementById('dashTodayPosts').textContent = '0';
        document.getElementById('dashAccountHealth').textContent = '--%';
        document.getElementById('dashSuccessRate').textContent = '--%';
    }
}
function renderDashboardCampaigns(campaigns) {
    const container = document.getElementById('dashCampaignsList');
    if (!container)
        return;
    if (campaigns.length === 0) {
        container.innerHTML = `
      <div class="empty-state-inline">
        <p>No active campaigns. Create one to start publishing!</p>
      </div>
    `;
        return;
    }
    container.innerHTML = campaigns.map(c => `
    <div class="campaign-item">
      <div class="campaign-info">
        <div class="campaign-name">${escapeHtml(c.name)}</div>
        <div class="campaign-meta">${c.platforms?.length || 0} platforms • ${c.status}</div>
      </div>
      <div class="campaign-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${c.progress || 0}%"></div>
        </div>
        <div class="progress-text">${c.progress || 0}%</div>
      </div>
      <div class="campaign-actions">
        <button class="btn btn-small btn-secondary" onclick="viewCampaign('${c.id}')">View</button>
      </div>
    </div>
  `).join('');
}
function renderDashboardActivity(activities) {
    const container = document.getElementById('dashActivityList');
    if (!container)
        return;
    if (activities.length === 0) {
        container.innerHTML = `
      <div class="empty-state-inline">
        <p>No recent activity</p>
      </div>
    `;
        return;
    }
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✅';
            case 'failed': return '❌';
            case 'warning': return '⚠️';
            case 'running': return '⏳';
            default: return '📋';
        }
    };
    container.innerHTML = activities.slice(0, 5).map(a => `
    <div class="activity-item">
      <span class="activity-time">${formatTime(a.time)}</span>
      <span class="activity-icon">${getStatusIcon(a.status)}</span>
      <span class="activity-text">${escapeHtml(a.message)}</span>
    </div>
  `).join('');
}
// 全局平台图标映射
const PLATFORM_ICONS = {
    // 国际社交
    twitter: '🐦', reddit: '🔴', linkedin: '💼', facebook: '📘',
    // 开发者平台
    github: '🐙', devto: '💻', producthunt: '🚀', hackernews: '🟠',
    medium: '📝', hashnode: '#️⃣', indiehackers: '💡', betalist: '🎯', alternativeto: '🔄',
    // 中国平台
    zhihu: '知', weibo: '微', v2ex: 'V2', sspai: '派', jike: '⚡', xiaohongshu: '📕',
    segmentfault: 'SF', csdn: 'C', oschina: '开',
    // 日本平台
    qiita: 'Q', zenn: 'Z', note: '📓',
    // 韩国平台
    naver_blog: 'N',
    // 俄罗斯平台
    habr: 'H', vk: 'VK',
    // 通讯
    telegram: '✈️', discord: '💬', slack: '💼'
};
function renderPlatformHealth(healthData) {
    const container = document.getElementById('dashPlatformHealth');
    if (!container)
        return;
    // 显示前 8 个有数据的平台
    const allPlatforms = ['twitter', 'reddit', 'linkedin', 'zhihu', 'weibo', 'github', 'v2ex', 'producthunt', 'hackernews', 'medium'];
    const platforms = allPlatforms.filter(p => healthData[p] !== undefined).slice(0, 8);
    if (platforms.length === 0) {
        // 默认显示主要平台
        platforms.push('twitter', 'reddit', 'linkedin', 'zhihu', 'weibo');
    }
    container.innerHTML = platforms.map(platform => {
        const health = healthData[platform] || 0;
        const healthClass = health >= 70 ? '' : health >= 40 ? 'warning' : 'error';
        return `
      <div class="platform-health-item">
        <span class="platform-name">${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
        <div class="health-bar">
          <div class="health-fill ${healthClass}" style="width: ${health}%"></div>
        </div>
        <span class="health-value">${health > 0 ? health + '%' : '--'}</span>
      </div>
    `;
    }).join('');
}
function formatTime(timeStr) {
    if (!timeStr)
        return '--:--';
    try {
        const date = new Date(timeStr);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    catch {
        return '--:--';
    }
}
let campaigns = [];
async function loadCampaigns() {
    try {
        const data = await invoke('list_campaigns');
        campaigns = data.campaigns || [];
        updateCampaignStats(data.stats || {});
        renderCampaigns();
    }
    catch (error) {
        console.error('Failed to load campaigns:', error);
        campaigns = [];
        renderCampaigns();
    }
}
function updateCampaignStats(stats) {
    document.getElementById('campaignStatActive').textContent = stats.active?.toString() || '0';
    document.getElementById('campaignStatScheduled').textContent = stats.scheduled?.toString() || '0';
    document.getElementById('campaignStatCompleted').textContent = stats.completed?.toString() || '0';
    document.getElementById('campaignStatTotalTasks').textContent = stats.total_tasks?.toString() || '0';
}
function renderCampaigns() {
    const container = document.getElementById('campaignsList');
    const empty = document.getElementById('emptyCampaigns');
    if (!container)
        return;
    // Apply filters
    const statusFilter = document.getElementById('campaignFilterStatus')?.value || 'all';
    const platformFilter = document.getElementById('campaignFilterPlatform')?.value || 'all';
    let filtered = campaigns;
    if (statusFilter !== 'all') {
        filtered = filtered.filter(c => c.status === statusFilter);
    }
    if (platformFilter !== 'all') {
        filtered = filtered.filter(c => c.platforms?.includes(platformFilter));
    }
    if (filtered.length === 0) {
        if (empty)
            empty.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    if (empty)
        empty.style.display = 'none';
    container.innerHTML = filtered.map(c => renderCampaignCard(c)).join('');
}
function renderCampaignCard(campaign) {
    const progress = campaign.total_tasks > 0
        ? Math.round((campaign.completed_tasks / campaign.total_tasks) * 100)
        : 0;
    return `
    <div class="campaign-card" data-id="${campaign.id}">
      <div class="campaign-card-header">
        <div class="campaign-info">
          <div class="campaign-name">${escapeHtml(campaign.name)}</div>
          <div class="campaign-product">${escapeHtml(campaign.product_name || 'No product')}</div>
        </div>
        <span class="campaign-status ${campaign.status}">${campaign.status}</span>
      </div>
      <div class="campaign-card-body">
        <div class="campaign-platforms">
          ${(campaign.platforms || []).map(p => `
            <span class="campaign-platform-tag">${PLATFORM_ICONS[p] || '📄'} ${p}</span>
          `).join('')}
        </div>
        <div class="campaign-progress-section">
          <div class="campaign-progress-header">
            <span class="campaign-progress-label">Progress</span>
            <span class="campaign-progress-value">${campaign.completed_tasks}/${campaign.total_tasks} tasks</span>
          </div>
          <div class="campaign-progress-bar">
            <div class="campaign-progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>
        <div class="campaign-stats-row">
          <span class="campaign-stat-item">📊 <strong>${progress}%</strong> complete</span>
          <span class="campaign-stat-item">📅 ${formatDate(campaign.created_at)}</span>
        </div>
      </div>
      <div class="campaign-card-footer">
        <span class="campaign-timing">
          ${campaign.started_at ? 'Started ' + formatDate(campaign.started_at) : 'Not started'}
        </span>
        <div class="campaign-actions">
          ${campaign.status === 'running' ? `
            <button class="btn btn-small btn-secondary" onclick="pauseCampaign('${campaign.id}')">Pause</button>
          ` : campaign.status === 'paused' || campaign.status === 'draft' ? `
            <button class="btn btn-small btn-primary" onclick="startCampaign('${campaign.id}')">Start</button>
          ` : ''}
          <button class="btn btn-small btn-secondary" onclick="viewCampaign('${campaign.id}')">Details</button>
          ${campaign.status === 'draft' ? `
            <button class="btn btn-small btn-danger" onclick="deleteCampaign('${campaign.id}')">Delete</button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}
function formatDate(dateStr) {
    if (!dateStr)
        return '--';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    catch {
        return '--';
    }
}
function showCreateCampaignModal() {
    // Populate product dropdown
    const productSelect = document.getElementById('campaignProduct');
    if (productSelect) {
        productSelect.innerHTML = '<option value="">Select a product...</option>' +
            products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    }
    // Setup schedule type toggle
    const scheduleType = document.getElementById('campaignScheduleType');
    const timeGroup = document.getElementById('scheduleTimeGroup');
    if (scheduleType && timeGroup) {
        scheduleType.onchange = () => {
            timeGroup.style.display = scheduleType.value === 'scheduled' ? 'block' : 'none';
        };
    }
    openModal('createCampaignModal');
}
window.showCreateCampaignModal = showCreateCampaignModal;
async function createCampaign(startImmediately = false) {
    const name = document.getElementById('campaignName')?.value?.trim();
    const productId = document.getElementById('campaignProduct')?.value;
    const description = document.getElementById('campaignDescription')?.value?.trim();
    if (!name) {
        showToast('Please enter a campaign name', 'error');
        return;
    }
    if (!productId) {
        showToast('Please select a product', 'error');
        return;
    }
    // Get selected platforms
    const platformCheckboxes = document.querySelectorAll('input[name="campaignPlatform"]:checked');
    const platforms = Array.from(platformCheckboxes).map(cb => cb.value);
    if (platforms.length === 0) {
        showToast(t('msg.selectPlatform'), 'error');
        return;
    }
    // Get post types
    const postTypeCheckboxes = document.querySelectorAll('input[name="postType"]:checked');
    const postTypes = Array.from(postTypeCheckboxes).map(cb => cb.value);
    // Get languages
    const langCheckboxes = document.querySelectorAll('input[name="campaignLang"]:checked');
    const languages = Array.from(langCheckboxes).map(cb => cb.value);
    // Get keywords
    const keywordsText = document.getElementById('campaignKeywords')?.value || '';
    const keywords = keywordsText.split('\n').map(k => k.trim()).filter(k => k);
    // Get schedule
    const scheduleType = document.getElementById('campaignScheduleType')?.value || 'immediate';
    const startTime = document.getElementById('campaignStartTime')?.value;
    const postsPerDay = parseInt(document.getElementById('campaignPostsPerDay')?.value) || 3;
    const duration = parseInt(document.getElementById('campaignDuration')?.value) || 7;
    try {
        await invoke('create_campaign', {
            name,
            productId,
            description,
            platforms,
            postTypes,
            languages,
            keywords,
            scheduleType: startImmediately ? 'immediate' : scheduleType,
            startTime: scheduleType === 'scheduled' ? startTime : null,
            postsPerDay,
            duration,
            startImmediately
        });
        closeModal('createCampaignModal');
        showToast(startImmediately ? 'Campaign started!' : 'Campaign saved as draft', 'success');
        loadCampaigns();
    }
    catch (error) {
        console.error('Failed to create campaign:', error);
        showToast('Failed to create campaign: ' + error, 'error');
    }
}
async function startCampaign(id) {
    try {
        await invoke('start_campaign', { id });
        showToast('Campaign started!', 'success');
        loadCampaigns();
    }
    catch (error) {
        console.error('Failed to start campaign:', error);
        showToast('Failed to start campaign: ' + error, 'error');
    }
}
window.startCampaign = startCampaign;
async function pauseCampaign(id) {
    try {
        await invoke('pause_campaign', { id });
        showToast('Campaign paused', 'success');
        loadCampaigns();
    }
    catch (error) {
        console.error('Failed to pause campaign:', error);
        showToast('Failed to pause campaign: ' + error, 'error');
    }
}
window.pauseCampaign = pauseCampaign;
async function deleteCampaign(id) {
    if (!confirm('Are you sure you want to delete this campaign?'))
        return;
    try {
        await invoke('delete_campaign', { id });
        showToast('Campaign deleted', 'success');
        loadCampaigns();
    }
    catch (error) {
        console.error('Failed to delete campaign:', error);
        showToast('Failed to delete campaign: ' + error, 'error');
    }
}
window.deleteCampaign = deleteCampaign;
function viewCampaign(id) {
    // TODO: Show campaign detail modal
    console.log('View campaign:', id);
    showToast('Campaign details coming soon', 'info');
}
window.viewCampaign = viewCampaign;
function initCampaignEvents() {
    // Create campaign button
    document.getElementById('btnCreateCampaign')?.addEventListener('click', showCreateCampaignModal);
    document.getElementById('btnNewCampaign')?.addEventListener('click', showCreateCampaignModal);
    // Save/Start buttons
    document.getElementById('btnSaveCampaignDraft')?.addEventListener('click', () => createCampaign(false));
    document.getElementById('btnStartCampaign')?.addEventListener('click', () => createCampaign(true));
    // Filter change handlers
    document.getElementById('campaignFilterStatus')?.addEventListener('change', renderCampaigns);
    document.getElementById('campaignFilterPlatform')?.addEventListener('change', renderCampaigns);
}
// Products
async function loadProducts() {
    try {
        products = await invoke('list_products');
        renderProducts();
    }
    catch (error) {
        console.error('Failed to load products:', error);
    }
}
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const empty = document.getElementById('emptyProducts');
    const batchBar = document.getElementById('productsBatchBar');
    if (!grid || !empty)
        return;
    if (products.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'block';
        if (batchBar)
            batchBar.style.display = 'none';
        return;
    }
    grid.style.display = 'grid';
    empty.style.display = 'none';
    if (batchBar)
        batchBar.style.display = 'flex';
    grid.innerHTML = products.map(product => {
        const isSelected = selectedProductIds.has(product.id);
        return `
    <div class="product-card ${isSelected ? 'selected' : ''}" data-id="${product.id}">
      <label class="product-checkbox">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="toggleProductSelection('${product.id}', this.checked)">
      </label>
      <div class="product-header">
        <span class="product-name">${escapeHtml(product.name)}</span>
        <span class="product-type">${product.product_type || 'tool'}</span>
      </div>
      <div class="product-tagline">${escapeHtml(product.tagline || '')}</div>
      <div class="product-url">${escapeHtml(product.url)}</div>
      <div class="product-meta">
        <span>Priority: ${product.priority}</span>
        <span>Weight: ${product.weight}</span>
      </div>
      <div class="product-actions">
        <button class="btn btn-small btn-secondary" onclick="editProduct('${product.id}')">Edit</button>
        <button class="btn btn-small btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
      </div>
    </div>
  `;
    }).join('');
    updateBatchBarStatus();
}
// Product selection functions
window.toggleProductSelection = function (id, checked) {
    if (checked) {
        selectedProductIds.add(id);
    }
    else {
        selectedProductIds.delete(id);
    }
    // Update card visual state
    const card = document.querySelector(`.product-card[data-id="${id}"]`);
    if (card)
        card.classList.toggle('selected', checked);
    updateBatchBarStatus();
};
function selectAllProducts() {
    products.forEach(p => selectedProductIds.add(p.id));
    renderProducts();
}
function clearProductSelection() {
    selectedProductIds.clear();
    renderProducts();
}
function updateBatchBarStatus() {
    const countEl = document.getElementById('selectedCount');
    const publishBtn = document.getElementById('btnBatchPublish');
    const count = selectedProductIds.size;
    if (countEl) {
        countEl.textContent = count > 0 ? `${count} selected` : 'No selection';
    }
    if (publishBtn) {
        publishBtn.disabled = count === 0;
        publishBtn.textContent = count > 0 ? `Publish ${count} Products` : 'Publish Selected';
    }
}
async function batchPublishSelected() {
    if (selectedProductIds.size === 0) {
        showToast(t('msg.selectProduct'), 'error');
        return;
    }
    // Navigate to publish page with selected products
    navigateTo('publish');
}
async function saveProduct() {
    const name = document.getElementById('productName')?.value;
    const url = document.getElementById('productUrl')?.value;
    const tagline = document.getElementById('productTagline')?.value;
    const description = document.getElementById('productDescription')?.value;
    const productType = document.getElementById('productType')?.value;
    const priority = parseInt(document.getElementById('productPriority')?.value) || 5;
    if (!name || !url) {
        showToast('Name and URL are required', 'error');
        return;
    }
    try {
        await invoke('create_product', {
            name,
            url,
            tagline: tagline || null,
            description: description || null,
            productType: productType || 'tool',
            priority,
            weight: 5
        });
        closeModal('modalAddProduct');
        await loadProducts();
        showToast(t('msg.productAdded'), 'success');
    }
    catch (error) {
        console.error('Failed to save product:', error);
        showToast('Failed to save product', 'error');
    }
}
async function analyzeUrl() {
    const url = document.getElementById('analyzeUrl')?.value;
    if (!url) {
        showToast('Please enter a URL', 'error');
        return;
    }
    try {
        const result = await invoke('analyze_url', { url });
        document.getElementById('productName').value = result.name || '';
        document.getElementById('productUrl').value = result.url || url;
        document.getElementById('productTagline').value = result.tagline || '';
        document.getElementById('productDescription').value = result.description || '';
        // Switch to manual tab with filled data
        document.querySelector('.tab[data-tab="manual"]')?.dispatchEvent(new Event('click'));
        showToast('URL analyzed', 'success');
    }
    catch (error) {
        console.error('Failed to analyze URL:', error);
        showToast('Failed to analyze URL', 'error');
    }
}
window.deleteProduct = async function (id) {
    if (!confirm('Delete this product?'))
        return;
    try {
        await invoke('delete_product', { id });
        await loadProducts();
        showToast(t('msg.productDeleted'), 'success');
    }
    catch (error) {
        console.error('Failed to delete product:', error);
        showToast('Failed to delete product', 'error');
    }
};
window.editProduct = function (id) {
    // TODO: Implement edit
    showToast('Edit feature coming soon', 'info');
};
// Accounts
async function loadAccounts() {
    try {
        accounts = await invoke('list_accounts');
        // Also load browser profiles to show profile info for each account
        await loadBrowserProfiles();
        // Load available profiles for the binding dropdown
        await loadAvailableProfiles();
        // Load account lifecycle data for nurture tracking
        await loadAccountLifecycles();
        renderAccounts();
        updateHealthOverview();
        await loadRegisterPlatforms();
        await loadGmailStatus();
    }
    catch (error) {
        console.error('Failed to load accounts:', error);
    }
}
function updateHealthOverview() {
    const totalAccounts = accounts.length;
    if (totalAccounts === 0) {
        document.getElementById('overallHealthPercent').textContent = '--%';
        document.getElementById('healthStatActive').textContent = '0';
        document.getElementById('healthStatWarning').textContent = '0';
        document.getElementById('healthStatBanned').textContent = '0';
        document.getElementById('healthStatWarmup').textContent = '0';
        return;
    }
    const activeCount = accounts.filter(a => a.status === 'active').length;
    const warningCount = accounts.filter(a => a.status === 'warning' || a.status === 'limited').length;
    const bannedCount = accounts.filter(a => a.status === 'banned' || a.status === 'suspended').length;
    const warmupCount = accounts.filter(a => a.status === 'warmup').length;
    const healthyCount = activeCount + warmupCount;
    const healthPercent = Math.round((healthyCount / totalAccounts) * 100);
    // Update health circle
    const circle = document.querySelector('.health-circle .circle-progress');
    if (circle) {
        circle.setAttribute('stroke-dasharray', `${healthPercent}, 100`);
        circle.classList.remove('warning', 'error');
        if (healthPercent < 50)
            circle.classList.add('error');
        else if (healthPercent < 80)
            circle.classList.add('warning');
    }
    document.getElementById('overallHealthPercent').textContent = healthPercent + '%';
    document.getElementById('healthStatActive').textContent = activeCount.toString();
    document.getElementById('healthStatWarning').textContent = warningCount.toString();
    document.getElementById('healthStatBanned').textContent = bannedCount.toString();
    document.getElementById('healthStatWarmup').textContent = warmupCount.toString();
}
function getHealthBadge(account) {
    const status = account.status || 'active';
    const healthScore = account.health_score || 100;
    const warmupStage = account.warmup_stage || 'none';
    if (status === 'banned' || status === 'suspended') {
        return '<span class="account-health-badge danger">🔴 Banned</span>';
    }
    if (status === 'warning' || status === 'limited' || healthScore < 50) {
        return '<span class="account-health-badge warning">⚠️ At Risk</span>';
    }
    if (warmupStage !== 'none' && warmupStage !== 'complete') {
        const warmupPercent = warmupStage === 'day1' ? 20 : warmupStage === 'day3' ? 40 : warmupStage === 'day7' ? 70 : 90;
        return `<span class="account-health-badge warmup">🔥 Warming ${warmupPercent}%</span>`;
    }
    return '<span class="account-health-badge healthy">✅ Healthy</span>';
}
// Store available profiles for account binding dropdown
let availableProfiles = [];
async function loadAvailableProfiles() {
    try {
        availableProfiles = await invoke('get_available_browser_profiles');
    }
    catch (error) {
        console.error('Failed to load available profiles:', error);
        availableProfiles = [];
    }
}
// Account lifecycle data cache
let accountLifecycles = new Map();
async function loadAccountLifecycles() {
    for (const account of accounts) {
        try {
            const lifecycle = await invoke('get_account_lifecycle', { accountId: account.id });
            accountLifecycles.set(account.id, lifecycle);
        }
        catch (e) {
            console.error('Failed to load lifecycle for', account.id, e);
        }
    }
}
function renderAccounts() {
    const list = document.getElementById('accountsList');
    const empty = document.getElementById('emptyAccounts');
    if (!list || !empty)
        return;
    if (accounts.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    list.style.display = 'block';
    empty.style.display = 'none';
    // Find matching profiles for each account
    const getProfileForAccount = (accountId) => browserProfiles.find(p => p.account_id === accountId);
    list.innerHTML = accounts.map(account => {
        const profile = getProfileForAccount(account.id);
        const hasProfile = !!profile;
        const stealthBadge = profile?.stealth_enabled
            ? '<span class="badge badge-stealth" title="Stealth Mode">🛡️</span>'
            : '';
        const fingerprintBadge = profile?.fingerprint_id
            ? '<span class="badge badge-fingerprint" title="Fingerprint Randomized">🎭</span>'
            : '';
        const proxyBadge = profile?.proxy
            ? `<span class="badge badge-proxy" title="${escapeHtml(profile.proxy)}">🌐</span>`
            : '';
        const healthBadge = getHealthBadge(account);
        // Get lifecycle data
        const lifecycle = accountLifecycles.get(account.id);
        const stage = lifecycle?.stage || 'new';
        const daysRemaining = lifecycle?.days_remaining || 0;
        const progressPercent = lifecycle?.progress_percent || 0;
        const todaySessions = lifecycle?.today?.sessions_completed || 0;
        const todayTarget = lifecycle?.today?.sessions_min || 2;
        const todayCompleted = todaySessions >= todayTarget;
        // Stage badge
        const stageBadges = {
            'new': '<span class="badge badge-new" style="background:#6c757d;color:white;">🆕 新账号</span>',
            'warming': `<span class="badge badge-warming" style="background:#ffc107;color:black;">🔥 养号中 (${daysRemaining}天)</span>`,
            'active': '<span class="badge badge-active" style="background:#28a745;color:white;">✅ 正常</span>'
        };
        const stageBadge = stageBadges[stage] || stageBadges['new'];
        // Today's nurture progress
        const todayProgress = lifecycle ? `
      <div class="nurture-today" style="margin: 8px 0; padding: 8px; background: var(--bg-secondary); border-radius: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <span style="font-size: 12px; color: var(--text-muted);">今日养号进度</span>
          <span style="font-size: 12px; font-weight: bold; color: ${todayCompleted ? 'var(--success)' : 'var(--warning)'};">
            ${todaySessions} / ${todayTarget} 次
          </span>
        </div>
        <div style="background: var(--border); border-radius: 4px; height: 6px; overflow: hidden;">
          <div style="background: ${todayCompleted ? 'var(--success)' : 'var(--primary)'}; height: 100%; width: ${Math.min(100, (todaySessions / todayTarget) * 100)}%; transition: width 0.3s;"></div>
        </div>
        ${stage === 'warming' ? `
          <div style="margin-top: 5px; font-size: 11px; color: var(--text-muted);">
            养号进度: ${progressPercent}% (剩余 ${daysRemaining} 天)
          </div>
        ` : ''}
      </div>
    ` : '';
        // Build profile binding dropdown options
        const profileOptions = availableProfiles.map(p => `<option value="${escapeHtml(p.id)}" ${account.profile_id === p.id ? 'selected' : ''}>${escapeHtml(p.name)} (${escapeHtml(p.id)})</option>`).join('');
        const boundProfileBadge = account.profile_id
            ? `<span class="badge badge-profile" title="绑定 Profile: ${escapeHtml(account.profile_id)}">🔗 ${escapeHtml(account.profile_id.substring(0, 15))}...</span>`
            : '<span class="badge badge-no-profile" title="使用全局 Profile">📌 全局</span>';
        return `
      <div class="account-item ${hasProfile ? 'has-profile' : ''}">
        <div class="account-info">
          <span class="account-platform">${escapeHtml(account.platform)}</span>
          <span class="account-username">${escapeHtml(account.username || account.email || 'N/A')}</span>
          ${stageBadge}
          ${healthBadge}
          ${boundProfileBadge}
          <span class="account-badges">${stealthBadge}${fingerprintBadge}${proxyBadge}</span>
        </div>
        ${todayProgress}
        <div class="account-profile-binding" style="margin: 8px 0;">
          <select class="select select-small" onchange="bindProfileToAccount('${account.id}', this.value)" style="width: auto; min-width: 200px;">
            <option value="">-- 使用全局 Profile --</option>
            ${profileOptions}
          </select>
        </div>
        <div class="account-nurture-stats" style="margin: 5px 0; font-size: 12px; color: var(--text-muted);">
          ${account.total_nurture_seconds > 0 ? `🌱 累计: ${formatNurtureTime(account.total_nurture_seconds)}` : ''}
          ${account.last_nurture_at ? ` • ${t('nurture.lastNurture')}: ${formatTimeAgo(account.last_nurture_at)}` : ''}
        </div>
        <div class="account-actions">
          <button class="btn btn-small btn-success" data-nurture-account="${account.id}" onclick="openNurtureModal('${account.id}', '${escapeHtml(account.platform)}', '${escapeHtml(account.username || account.email || 'N/A')}')" title="${t('nurture.quickNurture')}">🌱 ${t('nurture.quickNurture')}</button>
          ${stage === 'new' ? `<button class="btn btn-small btn-warning" onclick="startWarmup('${account.id}')" title="开始养号">🔥 开始养号</button>` : ''}
          ${!hasProfile ? `<button class="btn btn-small btn-secondary" onclick="createProfileForAccount('${account.id}', '${escapeHtml(account.platform)}')">${t('accounts.createProfile')}</button>` : ''}
          ${hasProfile ? `<button class="btn btn-small btn-secondary" onclick="toggleStealth('${profile.id}', ${!profile.stealth_enabled})" title="${profile.stealth_enabled ? 'Disable' : 'Enable'} Stealth">${profile.stealth_enabled ? '🛡️' : '⚡'}</button>` : ''}
          ${hasProfile ? `<button class="btn btn-small btn-secondary" onclick="randomizeFingerprint('${profile.id}')" title="Randomize Fingerprint">🎭</button>` : ''}
          ${hasProfile ? `<button class="btn btn-small btn-secondary" onclick="showProxyModal('${profile.id}')" title="Set Proxy">🌐</button>` : ''}
          <button class="btn btn-small btn-danger" onclick="deleteAccount('${account.id}')">${t('accounts.delete')}</button>
        </div>
      </div>
    `;
    }).join('');
}
// Start warmup for a new account
window.startWarmup = async function (accountId) {
    try {
        await invoke('start_account_nurture', { accountId });
        showToast(currentLanguage === 'zh' ? '已开始养号' : 'Warmup started', 'success');
        await loadAccounts(); // This also loads lifecycles and renders accounts
    }
    catch (error) {
        showToast(`Error: ${error}`, 'error');
    }
};
async function loadRegisterPlatforms() {
    try {
        const platforms = await invoke('get_register_platforms');
        const container = document.getElementById('registerPlatforms');
        if (!container)
            return;
        let html = '';
        for (const [category, platformList] of Object.entries(platforms)) {
            html += `<div class="platform-category"><h4>${category}</h4>`;
            for (const p of platformList) {
                const icons = `${p.phone ? '📱' : ''} ${p.google_oauth ? '🔗' : ''}`;
                html += `<label class="checkbox"><input type="checkbox" value="${p.id}"> ${p.name} ${icons}</label>`;
            }
            html += '</div>';
        }
        container.innerHTML = html;
    }
    catch (error) {
        console.error('Failed to load platforms:', error);
    }
}
async function loadGmailStatus() {
    try {
        const status = await invoke('get_gmail_status');
        const badge = document.getElementById('gmailBadge');
        const email = document.getElementById('gmailEmail');
        if (badge && email) {
            if (status.connected) {
                badge.textContent = 'Connected';
                badge.className = 'status-badge connected';
                email.textContent = status.email || '';
            }
            else {
                badge.textContent = 'Not Connected';
                badge.className = 'status-badge disconnected';
                email.textContent = '';
            }
        }
        updateRegisterButton();
    }
    catch (error) {
        console.error('Gmail status error:', error);
    }
}
async function setupGmail() {
    try {
        console.log('Setting up Gmail...');
        const result = await invoke('setup_gmail');
        console.log('Gmail setup result:', result);
        await loadGmailStatus();
        showToast('Gmail connected successfully!', 'success');
    }
    catch (error) {
        console.error('Gmail setup error:', error);
        showToast(error.toString(), 'error');
    }
}
function selectAllPlatforms() {
    document.querySelectorAll('#registerPlatforms input[type="checkbox"]').forEach((cb) => {
        cb.checked = true;
    });
    updateRegisterButton();
}
function deselectAllPlatforms() {
    document.querySelectorAll('#registerPlatforms input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
    });
    updateRegisterButton();
}
// Publish page platform selection
function selectAllPublishPlatforms() {
    document.querySelectorAll('#platformsGroup input[type="checkbox"]').forEach((cb) => {
        cb.checked = true;
    });
}
function deselectAllPublishPlatforms() {
    document.querySelectorAll('#platformsGroup input[type="checkbox"]').forEach((cb) => {
        cb.checked = false;
    });
}
// Campaign page platform selection
function selectAllCampaignPlatforms() {
    document.querySelectorAll('input[name="campaignPlatform"]').forEach((cb) => {
        cb.checked = true;
    });
}
function deselectAllCampaignPlatforms() {
    document.querySelectorAll('input[name="campaignPlatform"]').forEach((cb) => {
        cb.checked = false;
    });
}
function updateRegisterButton() {
    const btn = document.getElementById('btnAutoRegister');
    if (!btn)
        return;
    const checked = document.querySelectorAll('#registerPlatforms input:checked').length;
    btn.disabled = checked === 0;
    btn.textContent = checked > 0 ? `Auto-Login/Register (${checked})` : 'Auto-Login/Register Selected';
}
async function autoRegister() {
    const selected = Array.from(document.querySelectorAll('#registerPlatforms input:checked'))
        .map((cb) => cb.value);
    if (selected.length === 0) {
        showToast(t('msg.selectPlatform'), 'error');
        return;
    }
    const progress = document.getElementById('registerProgress');
    if (progress) {
        progress.style.display = 'block';
        progress.innerHTML = '<p>Starting auto-login/register...</p>';
    }
    for (const platform of selected) {
        try {
            if (progress)
                progress.innerHTML += `<p>⏳ ${platform}...</p>`;
            const result = await invoke('register_platform', { platform });
            if (result.success) {
                if (progress)
                    progress.innerHTML += `<p class="success">✓ ${platform}: logged in${result.username ? ` as ${result.username}` : ''}</p>`;
            }
            else if (result.needs_manual_verification) {
                if (progress)
                    progress.innerHTML += `<p class="warning">⚠ ${platform}: ${result.verification_reason || result.error}</p>`;
            }
            else {
                if (progress)
                    progress.innerHTML += `<p class="error">✗ ${platform}: ${result.error}</p>`;
            }
        }
        catch (error) {
            if (progress)
                progress.innerHTML += `<p class="error">✗ ${platform}: ${error}</p>`;
        }
    }
    await loadAccounts();
    showToast('Auto-login/register completed', 'success');
}
// Sync all platforms to detect which ones are already logged in
async function syncAllPlatforms() {
    const progress = document.getElementById('registerProgress');
    if (progress) {
        progress.style.display = 'block';
        progress.innerHTML = '<p>🔄 Syncing all platforms...</p>';
    }
    try {
        const results = await invoke('sync_all_platforms');
        let loggedIn = 0;
        let notLoggedIn = 0;
        for (const result of results) {
            if (result.success) {
                loggedIn++;
                if (progress)
                    progress.innerHTML += `<p class="success">✓ ${result.platform}: logged in</p>`;
            }
            else {
                notLoggedIn++;
                if (progress)
                    progress.innerHTML += `<p class="muted">○ ${result.platform}: not logged in</p>`;
            }
        }
        if (progress)
            progress.innerHTML += `<p><strong>Summary: ${loggedIn} logged in, ${notLoggedIn} not logged in</strong></p>`;
        await loadAccounts();
        showToast(`Synced: ${loggedIn} accounts found`, 'success');
    }
    catch (error) {
        console.error('Sync error:', error);
        if (progress)
            progress.innerHTML += `<p class="error">Sync failed: ${error}</p>`;
        showToast('Failed to sync platforms', 'error');
    }
}
async function saveAccount() {
    const platform = document.getElementById('accountPlatform')?.value;
    const username = document.getElementById('accountUsername')?.value;
    const password = document.getElementById('accountPassword')?.value;
    if (!platform || !username) {
        showToast('Platform and username are required', 'error');
        return;
    }
    try {
        await invoke('add_account', { platform, username, password: password || '' });
        closeModal('modalAddAccount');
        await loadAccounts();
        showToast(t('msg.accountAdded'), 'success');
    }
    catch (error) {
        console.error('Failed to save account:', error);
        showToast('Failed to save account', 'error');
    }
}
window.deleteAccount = async function (id) {
    if (!confirm('Delete this account?'))
        return;
    try {
        await invoke('delete_account', { id });
        await loadAccounts();
        showToast(t('msg.accountDeleted'), 'success');
    }
    catch (error) {
        showToast('Failed to delete account', 'error');
    }
};
// Browser Profile Management (Unzoo Integration)
async function loadBrowserProfiles() {
    try {
        browserProfiles = await invoke('unzoo_list_profiles');
    }
    catch (error) {
        console.error('Failed to load browser profiles:', error);
        browserProfiles = [];
    }
}
// Bind a browser profile to an account
window.bindProfileToAccount = async function (accountId, profileId) {
    try {
        if (profileId) {
            await invoke('bind_account_profile', { accountId, profileId });
            showToast(`已绑定 Profile: ${profileId}`, 'success');
        }
        else {
            await invoke('unbind_account_profile', { accountId });
            showToast(t('msg.profileUnbound'), 'success');
        }
        await loadAccounts();
    }
    catch (error) {
        console.error('Failed to bind profile:', error);
        showToast(t('msg.bindFailed'), 'error');
    }
};
window.createProfileForAccount = async function (accountId, platform) {
    try {
        const profileName = `${platform}_${accountId.substring(0, 8)}`;
        await invoke('unzoo_create_profile', {
            name: profileName,
            platform,
            accountId
        });
        showToast('Profile created', 'success');
        await loadBrowserProfiles();
        renderAccounts();
    }
    catch (error) {
        console.error('Failed to create profile:', error);
        showToast('Failed to create profile', 'error');
    }
};
window.toggleStealth = async function (profileId, enabled) {
    try {
        await invoke('unzoo_set_stealth_mode', { profileId, enabled });
        showToast(enabled ? 'Stealth mode enabled' : 'Stealth mode disabled', 'success');
        await loadBrowserProfiles();
        renderAccounts();
    }
    catch (error) {
        console.error('Failed to toggle stealth:', error);
        showToast('Failed to toggle stealth mode', 'error');
    }
};
window.randomizeFingerprint = async function (profileId) {
    try {
        await invoke('unzoo_randomize_fingerprint', { profileId });
        showToast('Fingerprint randomized', 'success');
        await loadBrowserProfiles();
        renderAccounts();
    }
    catch (error) {
        console.error('Failed to randomize fingerprint:', error);
        showToast('Failed to randomize fingerprint', 'error');
    }
};
window.showProxyModal = function (profileId) {
    const profile = browserProfiles.find(p => p.id === profileId);
    const modal = document.getElementById('modalSetProxy');
    if (modal) {
        document.getElementById('proxyProfileId').value = profileId;
        document.getElementById('proxyUrl').value = profile?.proxy || '';
        modal.classList.add('show');
    }
};
async function saveProxy() {
    const profileId = document.getElementById('proxyProfileId')?.value;
    const proxy = document.getElementById('proxyUrl')?.value || null;
    try {
        await invoke('unzoo_update_profile_proxy', { profileId, proxy });
        closeModal('modalSetProxy');
        showToast('Proxy updated', 'success');
        await loadBrowserProfiles();
        renderAccounts();
    }
    catch (error) {
        console.error('Failed to update proxy:', error);
        showToast('Failed to update proxy', 'error');
    }
}
// ============================================================================
// Account Nurturing (养号功能)
// ============================================================================
let nurtureInProgress = null;
// Alias for backwards compatibility
window.showNurtureModal = function (accountId, platform, username = '') {
    window.openNurtureModal(accountId, platform, username);
};
// Main function called by account card buttons
window.openNurtureModal = function (accountId, platform, username = '') {
    const modal = document.getElementById('modalNurture');
    if (modal) {
        // Reset modal to setup state
        resetNurtureModal();
        document.getElementById('nurtureAccountId').value = accountId;
        document.getElementById('nurturePlatform').value = platform;
        document.getElementById('nurtureAccountInfo').textContent = `${platform} - ${username || t('msg.account')}`;
        modal.classList.add('show');
    }
};
window.quickNurtureAccount = async function (accountId, platform, seconds = 60) {
    if (nurtureInProgress) {
        showToast(t('nurture.running'), 'warning');
        return;
    }
    nurtureInProgress = accountId;
    const btn = document.querySelector(`[data-nurture-account="${accountId}"]`);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-small"></span> ${t('nurture.running')}`;
    }
    try {
        showToast(`${t('nurture.startNurture')} (${seconds}${t('nurture.seconds')})`, 'info');
        // Note: Rust uses snake_case parameter names, platform is retrieved from DB
        const result = await invoke('quick_nurture', {
            account_id: accountId,
            seconds: seconds
        });
        showToast(`${t('nurture.completed')}: ${result}`, 'success');
        await loadAccounts(); // Refresh to show updated nurture stats
    }
    catch (error) {
        console.error('Nurture failed:', error);
        showToast(`${t('nurture.failed')}: ${error}`, 'error');
    }
    finally {
        nurtureInProgress = null;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `🌱 ${t('nurture.quickNurture')}`;
        }
    }
};
// Nurture state management
let nurtureTimerInterval = null;
let nurtureStartTime = 0;
let nurtureTotalSeconds = 0;
let nurtureAborted = false;
let currentNurtureTaskId = null;
window.startNurtureFromModal = async function () {
    const accountId = document.getElementById('nurtureAccountId')?.value;
    const platform = document.getElementById('nurturePlatform')?.value;
    const accountInfo = document.getElementById('nurtureAccountInfo')?.textContent || '';
    const seconds = parseInt(document.getElementById('nurtureDuration')?.value || '60');
    // Switch to progress view
    const setupDiv = document.getElementById('nurtureSetup');
    const progressDiv = document.getElementById('nurtureProgress');
    const completeDiv = document.getElementById('nurtureComplete');
    const btnStart = document.getElementById('btnNurtureStart');
    const btnStop = document.getElementById('btnNurtureStop');
    const btnCancel = document.getElementById('btnNurtureCancel');
    const btnClose = document.getElementById('btnNurtureClose');
    if (setupDiv)
        setupDiv.style.display = 'none';
    if (progressDiv)
        progressDiv.style.display = 'block';
    if (completeDiv)
        completeDiv.style.display = 'none';
    if (btnStart)
        btnStart.style.display = 'none';
    if (btnStop)
        btnStop.style.display = 'inline-block';
    if (btnCancel)
        btnCancel.style.display = 'none';
    if (btnClose)
        btnClose.style.display = 'none';
    // Initialize timer
    nurtureStartTime = Date.now();
    nurtureTotalSeconds = seconds;
    nurtureAborted = false;
    nurtureInProgress = accountId;
    // Create task for tracking
    const taskId = `nurture-${Date.now()}`;
    currentNurtureTaskId = taskId;
    const nurtureTask = {
        id: taskId,
        type: 'nurture',
        title: `🌱 ${t('nurture.title')}: ${accountInfo}`,
        status: 'running',
        progress: 0,
        total: seconds,
        createdAt: new Date(),
        data: { accountId, platform, seconds }
    };
    tasks.unshift(nurtureTask);
    renderTasks();
    // Start countdown timer
    updateNurtureTimer();
    nurtureTimerInterval = window.setInterval(updateNurtureTimer, 1000);
    try {
        // Call backend
        const result = await invoke('quick_nurture', {
            account_id: accountId,
            seconds: seconds
        });
        // Clear timer
        if (nurtureTimerInterval) {
            clearInterval(nurtureTimerInterval);
            nurtureTimerInterval = null;
        }
        if (!nurtureAborted) {
            // Update task as completed
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.status = 'completed';
                task.progress = seconds;
                task.completedAt = new Date();
            }
            renderTasks();
            // Show completion
            showNurtureComplete(seconds, result);
        }
        await loadAccounts(); // Refresh to show updated nurture stats
    }
    catch (error) {
        console.error('Nurture failed:', error);
        if (nurtureTimerInterval) {
            clearInterval(nurtureTimerInterval);
            nurtureTimerInterval = null;
        }
        // Update task as failed
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'failed';
            task.error = String(error);
            task.completedAt = new Date();
        }
        renderTasks();
        showToast(`${t('nurture.failed')}: ${error}`, 'error');
        resetNurtureModal();
    }
    finally {
        nurtureInProgress = null;
    }
};
function updateNurtureTimer() {
    const elapsed = Math.floor((Date.now() - nurtureStartTime) / 1000);
    const remaining = Math.max(0, nurtureTotalSeconds - elapsed);
    const progress = Math.min(100, (elapsed / nurtureTotalSeconds) * 100);
    // Update timer display
    const timerEl = document.getElementById('nurtureTimer');
    if (timerEl) {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    // Update progress bar
    const progressBar = document.getElementById('nurtureProgressBar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    // Update status text
    const statusEl = document.getElementById('nurtureStatusText');
    if (statusEl) {
        const elapsedMins = Math.floor(elapsed / 60);
        const elapsedSecs = elapsed % 60;
        statusEl.innerHTML = `<span class="spinner-small"></span> ${t('nurture.running')} - ${elapsedMins}:${elapsedSecs.toString().padStart(2, '0')} / ${Math.floor(nurtureTotalSeconds / 60)}:${(nurtureTotalSeconds % 60).toString().padStart(2, '0')}`;
    }
    // Update task progress in Tasks page
    if (currentNurtureTaskId) {
        const task = tasks.find(t => t.id === currentNurtureTaskId);
        if (task) {
            task.progress = elapsed;
            // Only re-render every 5 seconds to avoid performance issues
            if (elapsed % 5 === 0) {
                renderTasks();
            }
        }
    }
}
function showNurtureComplete(seconds, result) {
    const setupDiv = document.getElementById('nurtureSetup');
    const progressDiv = document.getElementById('nurtureProgress');
    const completeDiv = document.getElementById('nurtureComplete');
    const btnStop = document.getElementById('btnNurtureStop');
    const btnClose = document.getElementById('btnNurtureClose');
    const summaryEl = document.getElementById('nurtureCompleteSummary');
    if (setupDiv)
        setupDiv.style.display = 'none';
    if (progressDiv)
        progressDiv.style.display = 'none';
    if (completeDiv)
        completeDiv.style.display = 'block';
    if (btnStop)
        btnStop.style.display = 'none';
    if (btnClose)
        btnClose.style.display = 'inline-block';
    if (summaryEl) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        summaryEl.textContent = currentLanguage === 'zh'
            ? `本次养号 ${mins > 0 ? mins + ' 分钟 ' : ''}${secs} 秒`
            : `Nurtured for ${mins > 0 ? mins + ' min ' : ''}${secs} sec`;
    }
    showToast(`${t('nurture.completed')}`, 'success');
}
window.stopNurture = function () {
    nurtureAborted = true;
    if (nurtureTimerInterval) {
        clearInterval(nurtureTimerInterval);
        nurtureTimerInterval = null;
    }
    // Update task as stopped/failed
    if (currentNurtureTaskId) {
        const task = tasks.find(t => t.id === currentNurtureTaskId);
        if (task) {
            const elapsed = Math.floor((Date.now() - nurtureStartTime) / 1000);
            task.status = 'failed';
            task.error = t('nurture.stopped');
            task.progress = elapsed;
            task.completedAt = new Date();
        }
        currentNurtureTaskId = null;
        renderTasks();
    }
    showToast(t('nurture.stopped'), 'info');
    resetNurtureModal();
};
function resetNurtureModal() {
    const setupDiv = document.getElementById('nurtureSetup');
    const progressDiv = document.getElementById('nurtureProgress');
    const completeDiv = document.getElementById('nurtureComplete');
    const btnStart = document.getElementById('btnNurtureStart');
    const btnStop = document.getElementById('btnNurtureStop');
    const btnCancel = document.getElementById('btnNurtureCancel');
    const btnClose = document.getElementById('btnNurtureClose');
    const progressBar = document.getElementById('nurtureProgressBar');
    if (setupDiv)
        setupDiv.style.display = 'block';
    if (progressDiv)
        progressDiv.style.display = 'none';
    if (completeDiv)
        completeDiv.style.display = 'none';
    if (btnStart)
        btnStart.style.display = 'inline-block';
    if (btnStop)
        btnStop.style.display = 'none';
    if (btnCancel)
        btnCancel.style.display = 'inline-block';
    if (btnClose)
        btnClose.style.display = 'none';
    if (progressBar)
        progressBar.style.width = '0%';
}
// ============================================================================
// Batch Nurture Task Modal (批量养号任务)
// ============================================================================
async function openBatchNurtureModal() {
    // Load accounts first
    if (accounts.length === 0) {
        try {
            const data = await invoke('list_accounts');
            accounts = data || [];
        }
        catch (error) {
            console.error('Failed to load accounts:', error);
        }
    }
    // Populate the account list
    const container = document.getElementById('nurtureAccountList');
    if (!container)
        return;
    if (accounts.length === 0) {
        container.innerHTML = `<p class="text-muted">${t('nurture.noAccounts')}</p>`;
    }
    else {
        const platformIcons = {
            twitter: '🐦',
            linkedin: '💼',
            reddit: '🤖',
            facebook: '👤',
            devto: '👩‍💻',
            medium: '📝',
            discord: '💬',
            telegram: '✈️',
            weibo: '🌐',
            xiaohongshu: '📕',
            douyin: '🎵',
            bilibili: '📺'
        };
        container.innerHTML = accounts.map(account => {
            const icon = platformIcons[account.platform] || '📱';
            const name = account.username || account.email || 'N/A';
            const nurtureStats = account.total_nurture_seconds > 0
                ? ` (累计: ${formatNurtureTime(account.total_nurture_seconds)})`
                : '';
            return `
        <label class="checkbox nurture-account-item">
          <input type="checkbox" name="nurtureAccount" value="${account.id}">
          <span>${icon} ${account.platform} - ${escapeHtml(name)}${nurtureStats}</span>
        </label>
      `;
        }).join('');
    }
    openModal('modalBatchNurture');
}
window.selectAllNurtureAccounts = function () {
    document.querySelectorAll('input[name="nurtureAccount"]').forEach((cb) => {
        cb.checked = true;
    });
};
window.deselectAllNurtureAccounts = function () {
    document.querySelectorAll('input[name="nurtureAccount"]').forEach((cb) => {
        cb.checked = false;
    });
};
window.startBatchNurtureTask = function () {
    const selectedAccounts = Array.from(document.querySelectorAll('input[name="nurtureAccount"]:checked')).map((cb) => cb.value);
    if (selectedAccounts.length === 0) {
        showToast('Please select at least one account / 请至少选择一个账号', 'error');
        return;
    }
    const duration = parseInt(document.getElementById('batchNurtureDuration')?.value || '60');
    const continuous = document.getElementById('batchNurtureContinuous')?.checked || false;
    // Create the nurture task
    window.createNurtureTask(selectedAccounts, duration, continuous);
    // Close modal
    closeModal('modalBatchNurture');
};
function renderNurtureSection() {
    const container = document.getElementById('nurtureSection');
    if (!container)
        return;
    const accountsWithNurture = accounts.filter(a => a.total_nurture_seconds > 0);
    container.innerHTML = `
    <div class="card nurture-card">
      <div class="card-header">
        <h3>🌱 ${t('nurture.title')}</h3>
        <p class="text-muted">${t('nurture.description')}</p>
      </div>
      <div class="card-body">
        ${accounts.length === 0 ? `<p class="text-muted">${t('nurture.noAccounts')}</p>` : `
          <div class="nurture-accounts-grid">
            ${accounts.map(account => `
              <div class="nurture-account-card">
                <div class="nurture-account-header">
                  <span class="platform-icon">${getPlatformIcon(account.platform)}</span>
                  <span class="account-name">${escapeHtml(account.username || account.email || 'N/A')}</span>
                </div>
                <div class="nurture-stats">
                  <div class="stat">
                    <span class="stat-label">${t('nurture.totalTime')}</span>
                    <span class="stat-value">${formatNurtureTime(account.total_nurture_seconds || 0)}</span>
                  </div>
                  ${account.last_nurture_at ? `
                    <div class="stat">
                      <span class="stat-label">${t('nurture.lastNurture')}</span>
                      <span class="stat-value">${formatTimeAgo(account.last_nurture_at)}</span>
                    </div>
                  ` : ''}
                </div>
                <button
                  class="btn btn-small btn-primary nurture-btn"
                  data-nurture-account="${account.id}"
                  onclick="quickNurtureAccount('${account.id}', '${escapeHtml(account.platform)}', 60)"
                  ${nurtureInProgress === account.id ? 'disabled' : ''}
                >
                  ${nurtureInProgress === account.id ? `<span class="spinner-small"></span> ${t('nurture.running')}` : `🌱 ${t('nurture.quickNurture')}`}
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}
function formatNurtureTime(seconds) {
    if (seconds < 60)
        return `${seconds} ${t('nurture.seconds')}`;
    if (seconds < 3600)
        return `${Math.floor(seconds / 60)} min`;
    const hours = seconds / 3600;
    if (hours < 24)
        return `${hours.toFixed(1)} ${t('nurture.hours')}`;
    return `${(hours / 24).toFixed(1)} ${t('nurture.days')}`;
}
function formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60)
        return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
function getPlatformIcon(platform) {
    const icons = {
        'twitter': '𝕏',
        'x': '𝕏',
        'reddit': '🔴',
        'linkedin': '💼',
        'facebook': '📘',
        'instagram': '📷',
        'weibo': '🔴',
        'zhihu': '🔵',
        'xiaohongshu': '📕',
        'producthunt': '🐱',
        'v2ex': '🔷',
        'hackernews': '🟠',
    };
    return icons[platform.toLowerCase()] || '🌐';
}
// ============================================================================
// Scheduler Management
async function loadScheduledJobs() {
    try {
        scheduledJobs = await invoke('unzoo_list_scheduled_jobs');
        renderScheduledJobs();
    }
    catch (error) {
        console.error('Failed to load scheduled jobs:', error);
        scheduledJobs = [];
    }
}
function renderScheduledJobs() {
    const container = document.getElementById('scheduledJobsList');
    if (!container)
        return;
    if (scheduledJobs.length === 0) {
        container.innerHTML = '<p class="text-muted">No scheduled jobs</p>';
        return;
    }
    container.innerHTML = scheduledJobs.map(job => `
    <div class="scheduled-job-item ${job.enabled ? '' : 'disabled'}">
      <div class="job-info">
        <span class="job-name">${escapeHtml(job.name)}</span>
        <span class="job-schedule">${escapeHtml(job.schedule)}</span>
        <span class="job-type">${escapeHtml(job.task_type)}</span>
      </div>
      <div class="job-actions">
        <button class="btn btn-small btn-secondary" onclick="toggleScheduledJob('${job.id}', ${!job.enabled})">${job.enabled ? 'Pause' : 'Resume'}</button>
        <button class="btn btn-small btn-danger" onclick="deleteScheduledJob('${job.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}
window.toggleScheduledJob = async function (jobId, enabled) {
    try {
        if (enabled) {
            await invoke('unzoo_resume_scheduled_job', { jobId });
        }
        else {
            await invoke('unzoo_pause_scheduled_job', { jobId });
        }
        showToast(enabled ? 'Job resumed' : 'Job paused', 'success');
        await loadScheduledJobs();
    }
    catch (error) {
        console.error('Failed to toggle job:', error);
        showToast('Failed to toggle job', 'error');
    }
};
window.deleteScheduledJob = async function (jobId) {
    if (!confirm('Delete this scheduled job?'))
        return;
    try {
        await invoke('unzoo_delete_scheduled_job', { jobId });
        showToast('Job deleted', 'success');
        await loadScheduledJobs();
    }
    catch (error) {
        console.error('Failed to delete job:', error);
        showToast('Failed to delete job', 'error');
    }
};
async function createScheduledJob() {
    const name = document.getElementById('jobName')?.value;
    const schedule = document.getElementById('jobSchedule')?.value;
    const taskType = document.getElementById('jobTaskType')?.value;
    const taskData = document.getElementById('jobTaskData')?.value;
    if (!name || !schedule || !taskType) {
        showToast('Name, schedule and task type are required', 'error');
        return;
    }
    try {
        let parsedData = {};
        if (taskData) {
            try {
                parsedData = JSON.parse(taskData);
            }
            catch {
                showToast('Invalid JSON in task data', 'error');
                return;
            }
        }
        await invoke('unzoo_create_scheduled_job', {
            name,
            schedule,
            taskType,
            taskData: parsedData
        });
        closeModal('modalAddSchedule');
        showToast('Scheduled job created', 'success');
        await loadScheduledJobs();
    }
    catch (error) {
        console.error('Failed to create job:', error);
        showToast('Failed to create job', 'error');
    }
}
// Publish
let publishStrategies = [];
let publishSelectedProducts = new Set();
async function loadPublishPage() {
    // Copy from products page selection if any
    if (selectedProductIds.size > 0) {
        publishSelectedProducts = new Set(selectedProductIds);
    }
    renderPublishProductsList();
    // Load publishing strategies
    await loadPublishStrategies();
}
function renderPublishProductsList() {
    const container = document.getElementById('publishProductsList');
    if (!container)
        return;
    if (products.length === 0) {
        container.innerHTML = '<p class="text-muted">No products. Add products first.</p>';
        return;
    }
    container.innerHTML = products.map(p => {
        const isSelected = publishSelectedProducts.has(p.id);
        return `
      <label class="checkbox publish-product-item ${isSelected ? 'selected' : ''}">
        <input type="checkbox" value="${p.id}" ${isSelected ? 'checked' : ''} onchange="togglePublishProduct('${p.id}', this.checked)">
        <span>${escapeHtml(p.name)}</span>
      </label>
    `;
    }).join('');
    updatePublishProductsCount();
}
window.togglePublishProduct = function (id, checked) {
    if (checked) {
        publishSelectedProducts.add(id);
    }
    else {
        publishSelectedProducts.delete(id);
    }
    // Update item visual state
    const items = document.querySelectorAll('#publishProductsList .publish-product-item');
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.value === id) {
            item.classList.toggle('selected', checked);
        }
    });
    updatePublishProductsCount();
};
function updatePublishProductsCount() {
    const countEl = document.getElementById('publishProductsCount');
    if (countEl) {
        countEl.textContent = `${publishSelectedProducts.size} selected`;
    }
}
function selectAllPublishProducts() {
    products.forEach(p => publishSelectedProducts.add(p.id));
    renderPublishProductsList();
}
function clearPublishProducts() {
    publishSelectedProducts.clear();
    renderPublishProductsList();
}
async function loadPublishStrategies() {
    try {
        publishStrategies = await invoke('get_publish_strategies');
        renderStrategies();
    }
    catch (error) {
        console.error('Failed to load publish strategies:', error);
    }
}
function renderStrategies() {
    const grid = document.getElementById('strategiesGrid');
    if (!grid || publishStrategies.length === 0)
        return;
    grid.innerHTML = publishStrategies.map(s => {
        let statusClass = 'strategy-ok';
        let statusIcon = '✅';
        let statusText = 'Ready to post';
        if (s.is_warming_up && s.max_daily === 0) {
            statusClass = 'strategy-warmup';
            statusIcon = '🔥';
            statusText = `Warmup (${s.warmup_days_left} days left)`;
        }
        else if (!s.can_post_now) {
            if (s.wait_minutes < 0) {
                statusClass = 'strategy-limit';
                statusIcon = '🚫';
                statusText = `Limit reached (${s.posts_today}/${s.max_daily})`;
            }
            else {
                statusClass = 'strategy-wait';
                statusIcon = '⏳';
                statusText = `Wait ${s.wait_minutes} min`;
            }
        }
        else if (s.is_warming_up) {
            statusClass = 'strategy-warmup';
            statusIcon = '🔥';
            statusText = `Warmup: ${s.posts_today}/${s.max_daily}`;
        }
        return `
      <div class="strategy-card ${statusClass}">
        <div class="strategy-header">
          <span class="strategy-platform">${escapeHtml(s.platform)}</span>
          <span class="strategy-status">${statusIcon}</span>
        </div>
        <div class="strategy-info">
          <div>${statusText}</div>
          <div class="strategy-meta">Today: ${s.posts_today}/${s.max_daily} | Interval: ${s.min_interval}min</div>
        </div>
      </div>
    `;
    }).join('');
    // Update platform checkboxes based on availability
    updatePlatformCheckboxes();
}
function updatePlatformCheckboxes() {
    const platformsGroup = document.getElementById('platformsGroup');
    if (!platformsGroup)
        return;
    platformsGroup.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        const strategy = publishStrategies.find(s => s.platform === cb.value);
        const label = cb.parentElement;
        if (strategy) {
            if (strategy.can_post_now) {
                cb.disabled = false;
                label.style.opacity = '1';
                label.title = 'Ready to post';
            }
            else {
                cb.disabled = true;
                cb.checked = false;
                label.style.opacity = '0.5';
                if (strategy.wait_minutes < 0) {
                    label.title = `Daily limit reached (${strategy.posts_today}/${strategy.max_daily})`;
                }
                else {
                    label.title = `Wait ${strategy.wait_minutes} minutes`;
                }
            }
        }
    });
}
async function generateContent() {
    const productIds = Array.from(publishSelectedProducts);
    if (productIds.length === 0) {
        showToast(t('msg.selectProduct'), 'error');
        return;
    }
    const platforms = Array.from(document.querySelectorAll('#platformsGroup input:checked'))
        .map((cb) => cb.value);
    const languages = Array.from(document.querySelectorAll('#languagesGroup input:checked'))
        .map((cb) => cb.value);
    if (platforms.length === 0 || languages.length === 0) {
        showToast('Select at least one platform and language', 'error');
        return;
    }
    const btn = document.getElementById('btnGenerate');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Generating...';
    }
    try {
        // Generate content for all selected products
        generatedContents = [];
        const total = productIds.length;
        let current = 0;
        for (const productId of productIds) {
            current++;
            const product = products.find(p => p.id === productId);
            if (btn)
                btn.textContent = `Generating (${current}/${total})...`;
            const contents = await invoke('generate_content', { productId, platforms, languages });
            generatedContents.push(...contents);
        }
        renderPreview();
        document.getElementById('btnPublish').disabled = false;
        showToast(`Generated ${generatedContents.length} contents for ${productIds.length} products`, 'success');
    }
    catch (error) {
        console.error('Failed to generate content:', error);
        showToast('Failed to generate content', 'error');
    }
    finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Generate Content';
        }
    }
}
function renderPreview() {
    const tabs = document.getElementById('previewTabs');
    const content = document.getElementById('previewContent');
    if (!tabs || !content || generatedContents.length === 0)
        return;
    // Group by product for better display
    tabs.innerHTML = generatedContents.map((c, i) => {
        const shortName = c.product_name ? c.product_name.substring(0, 12) : 'Product';
        return `<button class="preview-tab ${i === 0 ? 'active' : ''}" data-index="${i}" title="${c.product_name || ''} - ${c.platform} (${c.language})">${shortName} · ${c.platform}</button>`;
    }).join('');
    tabs.querySelectorAll('.preview-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.querySelectorAll('.preview-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const idx = parseInt(tab.dataset.index || '0');
            showPreviewContent(idx);
        });
    });
    showPreviewContent(0);
}
function showPreviewContent(index) {
    const content = document.getElementById('previewContent');
    if (!content || !generatedContents[index])
        return;
    const c = generatedContents[index];
    content.innerHTML = `
    <div class="preview-meta">
      <span class="preview-product">${escapeHtml(c.product_name || 'Product')}</span>
      <span class="preview-platform">${escapeHtml(c.platform)}</span>
      <span class="preview-lang">${escapeHtml(c.language)}</span>
    </div>
    <div class="preview-body">${escapeHtml(c.body)}</div>
    <div class="preview-hashtags">${c.hashtags.map((h) => `#${h}`).join(' ')}</div>
  `;
}
function simulatePublish() {
    showToast('Simulation mode - no actual posts', 'info');
}
// 当前正在预览的内容索引
let currentPreviewIndex = 0;
let pendingPublishContents = [];
// 预览并确认发布流程
async function publishAll() {
    if (generatedContents.length === 0) {
        showToast(t('msg.noContentToPublish'), 'error');
        return;
    }
    pendingPublishContents = [...generatedContents];
    currentPreviewIndex = 0;
    // 开始预览第一个内容
    await prepareAndPreview(0);
}
// 准备并预览单个内容
async function prepareAndPreview(index) {
    if (index >= pendingPublishContents.length) {
        showToast(t('msg.allPublished'), 'success');
        resetPublishUI();
        return;
    }
    const content = pendingPublishContents[index];
    currentPreviewIndex = index;
    const btn = document.getElementById('btnPublish');
    const simBtn = document.getElementById('btnSimulate');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Preparing...';
    }
    if (simBtn)
        simBtn.disabled = true;
    const previewContent = document.getElementById('previewContent');
    // 显示准备状态
    if (previewContent) {
        previewContent.innerHTML = `
      <div class="publish-preview">
        <div class="preview-header">
          <span class="preview-step">Step ${index + 1} of ${pendingPublishContents.length}</span>
          <span class="preview-platform-badge">${escapeHtml(content.platform)}</span>
        </div>
        <div class="preview-status preparing">
          <div class="spinner"></div>
          <span>Preparing content for ${content.platform}...</span>
        </div>
      </div>
    `;
    }
    try {
        // 调用 prepare_publish 填充内容但不发布
        const preview = await invoke('prepare_publish', { content });
        if (previewContent) {
            if (preview.ready) {
                // 显示预览和确认按钮
                previewContent.innerHTML = `
          <div class="publish-preview">
            <div class="preview-header">
              <span class="preview-step">Step ${index + 1} of ${pendingPublishContents.length}</span>
              <span class="preview-platform-badge">${escapeHtml(content.platform)}</span>
              <span class="preview-lang-badge">${escapeHtml(content.language)}</span>
            </div>

            ${preview.screenshot ? `
              <div class="preview-screenshot">
                <img src="data:image/png;base64,${preview.screenshot}" alt="Preview" />
              </div>
            ` : ''}

            <div class="preview-content-box">
              <div class="preview-label">Content to be posted:</div>
              <div class="preview-text">${escapeHtml(content.body)}</div>
            </div>

            <div class="preview-warning">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>Please verify the content in the browser before confirming.</span>
            </div>

            <div class="preview-actions">
              <button class="btn-secondary" onclick="skipCurrentPublish()">
                Skip
              </button>
              <button class="btn-danger" onclick="cancelAllPublish()">
                Cancel All
              </button>
              <button class="btn-primary" onclick="confirmCurrentPublish()">
                ✓ Confirm & Publish
              </button>
            </div>
          </div>
        `;
            }
            else {
                // 显示错误
                previewContent.innerHTML = `
          <div class="publish-preview">
            <div class="preview-header">
              <span class="preview-step">Step ${index + 1} of ${pendingPublishContents.length}</span>
              <span class="preview-platform-badge error">${escapeHtml(content.platform)}</span>
            </div>

            <div class="preview-error">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>${escapeHtml(preview.error || 'Unknown error')}</span>
            </div>

            <div class="preview-actions">
              <button class="btn-secondary" onclick="skipCurrentPublish()">
                Skip & Continue
              </button>
              <button class="btn-danger" onclick="cancelAllPublish()">
                Cancel All
              </button>
            </div>
          </div>
        `;
            }
        }
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Publish All';
        }
    }
    catch (error) {
        if (previewContent) {
            previewContent.innerHTML = `
        <div class="publish-preview">
          <div class="preview-error">
            <span>Error: ${error}</span>
          </div>
          <div class="preview-actions">
            <button class="btn-secondary" onclick="skipCurrentPublish()">Skip</button>
            <button class="btn-danger" onclick="cancelAllPublish()">Cancel</button>
          </div>
        </div>
      `;
        }
    }
}
// 确认发布当前内容
async function confirmCurrentPublish() {
    const content = pendingPublishContents[currentPreviewIndex];
    const previewContent = document.getElementById('previewContent');
    if (previewContent) {
        previewContent.innerHTML = `
      <div class="publish-preview">
        <div class="preview-status publishing">
          <div class="spinner"></div>
          <span>Publishing to ${content.platform}...</span>
        </div>
      </div>
    `;
    }
    try {
        const result = await invoke('confirm_publish', {
            platform: content.platform,
            productId: content.product_id,
            contentBody: content.body,
        });
        if (result.success) {
            showToast(`Published to ${content.platform}!`, 'success');
        }
        else {
            showToast(`Failed: ${result.error}`, 'error');
        }
    }
    catch (error) {
        showToast(`Error: ${error}`, 'error');
    }
    // 继续下一个
    await prepareAndPreview(currentPreviewIndex + 1);
}
// 跳过当前内容
async function skipCurrentPublish() {
    const content = pendingPublishContents[currentPreviewIndex];
    try {
        await invoke('cancel_publish', { platform: content.platform });
    }
    catch (e) {
        // Ignore cancel errors
    }
    showToast(`Skipped ${content.platform}`, 'info');
    await prepareAndPreview(currentPreviewIndex + 1);
}
// 取消所有发布
async function cancelAllPublish() {
    const content = pendingPublishContents[currentPreviewIndex];
    try {
        await invoke('cancel_publish', { platform: content.platform });
    }
    catch (e) {
        // Ignore
    }
    pendingPublishContents = [];
    resetPublishUI();
    showToast('Publishing cancelled', 'info');
}
// 重置发布 UI
function resetPublishUI() {
    const btn = document.getElementById('btnPublish');
    const simBtn = document.getElementById('btnSimulate');
    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Publish All';
    }
    if (simBtn)
        simBtn.disabled = false;
    // 恢复预览显示
    if (generatedContents.length > 0) {
        showPreviewContent(0);
    }
}
// 暴露到全局以便 HTML onclick 调用
window.confirmCurrentPublish = confirmCurrentPublish;
window.skipCurrentPublish = skipCurrentPublish;
window.cancelAllPublish = cancelAllPublish;
// 旧的直接发布方式（保留用于任务队列）
async function publishAllDirect() {
    if (generatedContents.length === 0) {
        showToast(t('msg.noContentToPublish'), 'error');
        return;
    }
    const btn = document.getElementById('btnPublish');
    const simBtn = document.getElementById('btnSimulate');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Publishing...';
    }
    if (simBtn)
        simBtn.disabled = true;
    const previewContent = document.getElementById('previewContent');
    const total = generatedContents.length;
    let successCount = 0;
    let failCount = 0;
    // Initialize progress display
    if (previewContent) {
        previewContent.innerHTML = `
      <div class="publish-progress">
        <div class="progress-header">
          <span class="progress-title">Publishing Content</span>
          <span class="progress-count">0 / ${total}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: 0%"></div>
        </div>
        <div class="publish-log"></div>
      </div>
    `;
    }
    const progressBar = previewContent?.querySelector('.progress-bar');
    const progressCount = previewContent?.querySelector('.progress-count');
    const publishLog = previewContent?.querySelector('.publish-log');
    for (let i = 0; i < generatedContents.length; i++) {
        const content = generatedContents[i];
        const current = i + 1;
        // Update progress
        if (progressBar)
            progressBar.style.width = `${(current / total) * 100}%`;
        if (progressCount)
            progressCount.textContent = `${current} / ${total}`;
        // Add "publishing" log entry
        if (publishLog) {
            publishLog.innerHTML += `<div class="log-entry publishing" id="log-${i}">⏳ ${content.platform} (${content.language})...</div>`;
            publishLog.scrollTop = publishLog.scrollHeight;
        }
        try {
            const result = await invoke('publish_content', { content });
            const logEntry = document.getElementById(`log-${i}`);
            if (result.success) {
                successCount++;
                if (logEntry) {
                    logEntry.className = 'log-entry success';
                    logEntry.innerHTML = `✓ ${content.platform} (${content.language}) - Published`;
                }
            }
            else {
                failCount++;
                if (logEntry) {
                    logEntry.className = 'log-entry error';
                    logEntry.innerHTML = `✗ ${content.platform} (${content.language}) - ${result.error}`;
                }
            }
            // Wait between posts
            if (i < generatedContents.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        catch (error) {
            failCount++;
            const logEntry = document.getElementById(`log-${i}`);
            if (logEntry) {
                logEntry.className = 'log-entry error';
                logEntry.innerHTML = `✗ ${content.platform} (${content.language}) - ${error}`;
            }
        }
    }
    // Show summary
    if (publishLog) {
        publishLog.innerHTML += `
      <div class="log-summary">
        <strong>Complete:</strong> ${successCount} succeeded, ${failCount} failed
      </div>
    `;
    }
    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Publish All';
    }
    if (simBtn)
        simBtn.disabled = false;
    showToast(`Published ${successCount}/${total} posts`, successCount > 0 ? 'success' : 'error');
    // Refresh strategies to show updated limits
    await loadPublishStrategies();
}
// ==========================================
// Engage Page - Reply System
// ==========================================
let keywords = [];
let discoveredPosts = [];
let currentReplyPost = null;
async function loadEngagePage() {
    // Load keywords
    await loadKeywords();
    // Load reply strategies
    await loadReplyStrategies();
    // Load discovered posts
    await loadDiscoveredPosts();
    // Populate product dropdown in keyword modal
    const select = document.getElementById('keywordProduct');
    if (select) {
        select.innerHTML = '<option value="">No specific product</option>' +
            products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    }
    // Same for reply modal
    const replySelect = document.getElementById('replyProduct');
    if (replySelect) {
        replySelect.innerHTML = '<option value="">No product (generic reply)</option>' +
            products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    }
}
async function loadKeywords() {
    try {
        keywords = await invoke('list_keywords');
        renderKeywords();
    }
    catch (error) {
        console.error('Failed to load keywords:', error);
    }
}
function renderKeywords() {
    const container = document.getElementById('keywordsList');
    if (!container)
        return;
    if (keywords.length === 0) {
        container.innerHTML = '<p class="text-muted">No keywords yet. Add keywords to start discovering relevant posts.</p>';
        return;
    }
    container.innerHTML = keywords.map(k => `
    <div class="keyword-item">
      <span class="keyword-text">${escapeHtml(k.keyword)}</span>
      <span class="keyword-platforms">${k.platforms.join(', ')}</span>
      <button class="keyword-delete" onclick="deleteKeyword('${k.id}')">×</button>
    </div>
  `).join('');
}
async function loadReplyStrategies() {
    try {
        const strategies = await invoke('get_reply_strategies');
        renderReplyStrategies(strategies);
    }
    catch (error) {
        console.error('Failed to load reply strategies:', error);
    }
}
function renderReplyStrategies(strategies) {
    const grid = document.getElementById('replyStrategiesGrid');
    if (!grid || strategies.length === 0)
        return;
    grid.innerHTML = strategies.map(s => {
        let statusClass = 'strategy-ok';
        let statusIcon = '✅';
        let statusText = 'Ready to reply';
        if (!s.can_reply_now) {
            if (s.wait_minutes < 0) {
                statusClass = 'strategy-limit';
                statusIcon = '🚫';
                statusText = `Limit: ${s.replies_today}/${s.max_daily}`;
            }
            else {
                statusClass = 'strategy-wait';
                statusIcon = '⏳';
                statusText = `Wait ${s.wait_minutes} min`;
            }
        }
        return `
      <div class="strategy-card ${statusClass}">
        <div class="strategy-header">
          <span class="strategy-platform">${escapeHtml(s.platform)}</span>
          <span class="strategy-status">${statusIcon}</span>
        </div>
        <div class="strategy-info">
          <div>${statusText}</div>
          <div class="strategy-meta">
            Today: ${s.replies_today}/${s.max_daily} |
            📬 ${s.discovered_posts} posts
          </div>
        </div>
      </div>
    `;
    }).join('');
}
async function loadDiscoveredPosts() {
    try {
        const platform = document.getElementById('filterPlatform')?.value || undefined;
        discoveredPosts = await invoke('list_discovered_posts', { platform, status: 'new' });
        renderDiscoveredPosts();
    }
    catch (error) {
        console.error('Failed to load discovered posts:', error);
    }
}
function renderDiscoveredPosts() {
    const container = document.getElementById('discoveredPosts');
    if (!container)
        return;
    if (discoveredPosts.length === 0) {
        container.innerHTML = '<p class="text-muted">No posts discovered yet. Add keywords and click "Discover Now".</p>';
        return;
    }
    container.innerHTML = discoveredPosts.map(p => `
    <div class="post-item" data-id="${p.id}">
      <div class="post-header">
        <span class="post-platform">${escapeHtml(p.platform)}</span>
        <span class="post-relevance">${Math.round(p.relevance_score * 100)}% match</span>
      </div>
      <div class="post-title">${escapeHtml(p.post_title || 'Untitled')}</div>
      <div class="post-url">${escapeHtml(p.post_url)}</div>
      ${p.keyword_matched ? `<span class="post-keyword">🔍 ${escapeHtml(p.keyword_matched)}</span>` : ''}
      <div class="post-actions">
        <button class="btn btn-small btn-primary" onclick="openReplyModal('${p.id}')">💬 Reply</button>
        <button class="btn btn-small btn-secondary" onclick="viewPost('${p.post_url}')">👁 View</button>
        <button class="btn btn-small btn-secondary" onclick="skipPost('${p.id}')">Skip</button>
      </div>
    </div>
  `).join('');
}
function openKeywordModal() {
    // Reset form
    document.getElementById('keywordText').value = '';
    document.getElementById('keywordProduct').value = '';
    document.querySelectorAll('#keywordPlatforms input').forEach((cb) => cb.checked = cb.value === 'reddit' || cb.value === 'twitter');
    openModal('modalAddKeyword');
}
async function saveKeyword() {
    const keyword = document.getElementById('keywordText')?.value?.trim();
    const productId = document.getElementById('keywordProduct')?.value || null;
    const platforms = Array.from(document.querySelectorAll('#keywordPlatforms input:checked'))
        .map((cb) => cb.value);
    if (!keyword) {
        showToast('Please enter a keyword', 'error');
        return;
    }
    if (platforms.length === 0) {
        showToast(t('msg.selectPlatform'), 'error');
        return;
    }
    try {
        await invoke('add_keyword', { keyword, productId, platforms });
        closeModal('modalAddKeyword');
        await loadKeywords();
        showToast(t('msg.keywordAdded'), 'success');
    }
    catch (error) {
        showToast('Failed to add keyword: ' + error, 'error');
    }
}
window.deleteKeyword = async function (id) {
    if (!confirm('Delete this keyword?'))
        return;
    try {
        await invoke('delete_keyword', { id });
        await loadKeywords();
        showToast(t('msg.keywordDeleted'), 'success');
    }
    catch (error) {
        showToast('Failed to delete keyword', 'error');
    }
};
async function discoverPosts() {
    if (keywords.length === 0) {
        showToast(t('msg.addKeywordsFirst'), 'error');
        return;
    }
    const btn = document.getElementById('btnDiscoverNow');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Discovering...';
    }
    let totalFound = 0;
    for (const k of keywords) {
        for (const platform of k.platforms) {
            try {
                const posts = await invoke('discover_posts', { platform, keyword: k.keyword });
                totalFound += posts.length;
            }
            catch (error) {
                console.error(`Failed to discover on ${platform}:`, error);
            }
            // Wait between searches
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    if (btn) {
        btn.disabled = false;
        btn.textContent = '🔍 Discover Now';
    }
    await loadDiscoveredPosts();
    await loadReplyStrategies();
    showToast(`Discovered ${totalFound} new posts`, 'success');
}
window.openReplyModal = function (postId) {
    currentReplyPost = discoveredPosts.find(p => p.id === postId);
    if (!currentReplyPost)
        return;
    const postInfo = document.getElementById('replyPostInfo');
    if (postInfo) {
        postInfo.innerHTML = `
      <span class="post-platform">${escapeHtml(currentReplyPost.platform)}</span>
      <div style="margin-top: 8px; font-weight: 500;">${escapeHtml(currentReplyPost.post_title || 'Untitled')}</div>
      <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${escapeHtml(currentReplyPost.post_url)}</div>
    `;
    }
    document.getElementById('replyContent').value = '';
    openModal('modalReply');
};
window.viewPost = function (url) {
    window.open(url, '_blank');
};
window.skipPost = async function (postId) {
    try {
        await invoke('update_post_status', { postId, status: 'skipped' });
        await loadDiscoveredPosts();
        showToast('Post skipped', 'info');
    }
    catch (error) {
        showToast('Failed to update post', 'error');
    }
};
async function generateReplyContent() {
    if (!currentReplyPost)
        return;
    const productId = document.getElementById('replyProduct')?.value;
    const product = products.find(p => p.id === productId);
    const generateBtn = document.getElementById('btnGenerateReply');
    try {
        // Show loading state
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.textContent = 'Generating...';
        }
        const reply = await invoke('generate_ai_reply', {
            postTitle: currentReplyPost.post_title || '',
            postContent: currentReplyPost.post_content || '',
            keyword: currentReplyPost.keyword_matched || '',
            productName: product?.name || null,
            productTagline: product?.tagline || null,
        });
        document.getElementById('replyContent').value = reply;
        showToast(t('msg.replyGenerated'), 'success');
    }
    catch (error) {
        console.error('Failed to generate reply:', error);
        // Fallback to template
        const templates = [
            `I've been using ${product?.name || 'a similar tool'} for this. ${product?.tagline || 'It works well'}. Worth checking out!`,
            `Have you tried ${product?.name || 'looking into alternatives'}? ${product?.tagline || 'Might help with your use case'}.`,
        ];
        const reply = templates[Math.floor(Math.random() * templates.length)];
        document.getElementById('replyContent').value = reply;
        showToast('Using template (AI unavailable)', 'warning');
    }
    finally {
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.textContent = '✨ Generate with AI';
        }
    }
}
async function sendReply() {
    if (!currentReplyPost)
        return;
    const replyContent = document.getElementById('replyContent')?.value?.trim();
    const productId = document.getElementById('replyProduct')?.value || undefined;
    if (!replyContent) {
        showToast(t('msg.pleaseWriteReply'), 'error');
        return;
    }
    const btn = document.getElementById('btnSendReply');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
    }
    try {
        const result = await invoke('reply_to_post', {
            postId: currentReplyPost.id,
            productId,
            customReply: replyContent
        });
        if (result.success) {
            closeModal('modalReply');
            await loadDiscoveredPosts();
            await loadReplyStrategies();
            showToast(t('msg.replySent'), 'success');
        }
        else {
            showToast(result.error || 'Failed to send reply', 'error');
        }
    }
    catch (error) {
        showToast('Failed to send reply: ' + error, 'error');
    }
    finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Send Reply';
        }
    }
}
// Stats
async function loadStats() {
    try {
        const days = parseInt(document.getElementById('statsTimeRange')?.value || '30');
        const stats = await invoke('get_detailed_stats', { days });
        // Update overview stats
        updateOverviewStats(stats);
        // Render activity chart
        renderActivityChart(stats.daily_data || []);
        // Render platform performance
        renderPlatformPerformance(stats.platform_stats || {});
        // Render content breakdown
        renderContentBreakdown(stats.content_breakdown || {});
        // Render best performing content
        renderBestContent(stats.best_content || []);
        // Render activity heatmap
        renderActivityHeatmap(stats.heatmap_data || []);
        // Setup event listeners
        initStatsEvents();
    }
    catch (error) {
        console.error('Stats error:', error);
        // Set default values on error
        setDefaultStatsUI();
    }
}
function updateOverviewStats(stats) {
    document.getElementById('statPosts').textContent = formatNumber(stats.total_posts || 0);
    document.getElementById('statViews').textContent = formatNumber(stats.total_views || 0);
    document.getElementById('statEngagements').textContent = formatNumber(stats.total_engagements || 0);
    document.getElementById('statRate').textContent = ((stats.avg_engagement_rate || 0) * 100).toFixed(1) + '%';
    // Update change indicators
    const postsChange = stats.posts_change || 0;
    const viewsChange = stats.views_change || 0;
    const engChange = stats.engagements_change || 0;
    const rateChange = stats.rate_change || 0;
    setChangeIndicator('statPostsChange', postsChange);
    setChangeIndicator('statViewsChange', viewsChange);
    setChangeIndicator('statEngagementsChange', engChange);
    setChangeIndicator('statRateChange', rateChange, true);
}
function setChangeIndicator(elementId, change, isPercent = false) {
    const el = document.getElementById(elementId);
    if (!el)
        return;
    if (change === 0) {
        el.textContent = '--';
        el.className = 'stat-change';
    }
    else {
        const prefix = change > 0 ? '+' : '';
        el.textContent = prefix + (isPercent ? change.toFixed(1) + '%' : formatNumber(change));
        el.className = 'stat-change ' + (change > 0 ? 'positive' : 'negative');
    }
}
function formatNumber(num) {
    if (num >= 1000000)
        return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000)
        return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
function renderActivityChart(dailyData) {
    const barsContainer = document.getElementById('chartBars');
    const labelsContainer = document.getElementById('chartLabels');
    if (!barsContainer || !labelsContainer)
        return;
    if (dailyData.length === 0) {
        barsContainer.innerHTML = '<div class="empty-state-inline"><p>No data available</p></div>';
        labelsContainer.innerHTML = '';
        return;
    }
    // Find max values for scaling
    const maxPosts = Math.max(...dailyData.map(d => d.posts || 0), 1);
    const maxViews = Math.max(...dailyData.map(d => d.views || 0), 1);
    barsContainer.innerHTML = dailyData.slice(-14).map(d => {
        const postsHeight = ((d.posts || 0) / maxPosts) * 100;
        const viewsHeight = ((d.views || 0) / maxViews) * 50;
        const engHeight = ((d.engagements || 0) / Math.max(d.views, 1)) * 100;
        return `
      <div class="chart-bar-group" title="${d.date}: ${d.posts} posts, ${d.views} views">
        <div class="chart-bar posts" style="height: ${postsHeight}%"></div>
      </div>
    `;
    }).join('');
    labelsContainer.innerHTML = dailyData.slice(-14).map((d, i) => {
        if (i % 2 === 0 || dailyData.length <= 7) {
            const date = new Date(d.date);
            return `<span class="chart-label">${date.getDate()}/${date.getMonth() + 1}</span>`;
        }
        return '<span class="chart-label"></span>';
    }).join('');
}
function renderPlatformPerformance(platformStats) {
    const container = document.getElementById('platformStats');
    if (!container)
        return;
    // 动态显示有数据的平台，最多显示 10 个
    const sortedPlatforms = Object.entries(platformStats)
        .filter(([_, value]) => value > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    if (sortedPlatforms.length === 0) {
        container.innerHTML = '<div class="empty-state">No platform data yet</div>';
        return;
    }
    const maxValue = Math.max(...sortedPlatforms.map(([_, v]) => v), 1);
    container.innerHTML = sortedPlatforms.map(([key, value]) => {
        const percent = (value / maxValue) * 100;
        const icon = PLATFORM_ICONS[key] || '📄';
        const name = key.charAt(0).toUpperCase() + key.slice(1);
        return `
      <div class="platform-perf-item">
        <div class="platform-perf-info">
          <span class="platform-perf-icon">${icon}</span>
          <span class="platform-perf-name">${name}</span>
        </div>
        <div class="platform-perf-bar-container">
          <div class="platform-perf-bar" style="width: ${percent}%"></div>
        </div>
        <span class="platform-perf-value">${formatNumber(value)}</span>
      </div>
    `;
    }).join('');
}
function renderContentBreakdown(breakdown) {
    const total = (breakdown.articles || 0) + (breakdown.replies || 0) +
        (breakdown.reposts || 0) + (breakdown.comments || 0);
    if (total === 0)
        return;
    const calcPercent = (val) => (val / total) * 100;
    document.getElementById('breakdownArticles').textContent = (breakdown.articles || 0).toString();
    document.getElementById('breakdownReplies').textContent = (breakdown.replies || 0).toString();
    document.getElementById('breakdownReposts').textContent = (breakdown.reposts || 0).toString();
    document.getElementById('breakdownComments').textContent = (breakdown.comments || 0).toString();
    document.getElementById('breakdownArticlesBar').style.width = calcPercent(breakdown.articles || 0) + '%';
    document.getElementById('breakdownRepliesBar').style.width = calcPercent(breakdown.replies || 0) + '%';
    document.getElementById('breakdownRepostsBar').style.width = calcPercent(breakdown.reposts || 0) + '%';
    document.getElementById('breakdownCommentsBar').style.width = calcPercent(breakdown.comments || 0) + '%';
}
function renderBestContent(bestContent) {
    const container = document.getElementById('bestContentList');
    if (!container)
        return;
    if (bestContent.length === 0) {
        container.innerHTML = `
      <div class="empty-state-inline">
        <p>No content published yet. Start posting to see your top performers!</p>
      </div>
    `;
        return;
    }
    const rankClasses = ['gold', 'silver', 'bronze'];
    container.innerHTML = bestContent.slice(0, 5).map((item, i) => `
    <div class="best-content-item">
      <div class="best-content-rank ${rankClasses[i] || ''}">${i + 1}</div>
      <div class="best-content-info">
        <div class="best-content-title">${escapeHtml(item.title || item.content?.substring(0, 50) || 'Untitled')}</div>
        <div class="best-content-meta">
          <span>${PLATFORM_ICONS[item.platform] || '📄'} ${item.platform}</span>
          <span>${formatDate(item.published_at)}</span>
        </div>
      </div>
      <div class="best-content-stats">
        <div class="best-content-stat">
          <span class="best-content-stat-value">${formatNumber(item.views || 0)}</span>
          <span class="best-content-stat-label">views</span>
        </div>
        <div class="best-content-stat">
          <span class="best-content-stat-value">${formatNumber(item.engagements || 0)}</span>
          <span class="best-content-stat-label">engagements</span>
        </div>
      </div>
    </div>
  `).join('');
}
function renderActivityHeatmap(heatmapData) {
    const container = document.getElementById('heatmapGrid');
    if (!container)
        return;
    // Generate last 90 days of cells
    const cells = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = heatmapData.find(d => d.date === dateStr);
        const count = dayData?.count || 0;
        let level = 'level-0';
        if (count > 0)
            level = 'level-1';
        if (count >= 3)
            level = 'level-2';
        if (count >= 5)
            level = 'level-3';
        if (count >= 10)
            level = 'level-4';
        cells.push(`<div class="heatmap-cell ${level}" title="${dateStr}: ${count} posts"></div>`);
    }
    container.innerHTML = cells.join('');
}
function setDefaultStatsUI() {
    document.getElementById('statPosts').textContent = '0';
    document.getElementById('statViews').textContent = '0';
    document.getElementById('statEngagements').textContent = '0';
    document.getElementById('statRate').textContent = '0%';
    ['statPostsChange', 'statViewsChange', 'statEngagementsChange', 'statRateChange'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '--';
            el.className = 'stat-change';
        }
    });
}
function initStatsEvents() {
    const timeRange = document.getElementById('statsTimeRange');
    if (timeRange && !timeRange.hasAttribute('data-listener')) {
        timeRange.addEventListener('change', () => loadStats());
        timeRange.setAttribute('data-listener', 'true');
    }
    const exportBtn = document.getElementById('btnExportStats');
    if (exportBtn && !exportBtn.hasAttribute('data-listener')) {
        exportBtn.addEventListener('click', exportStats);
        exportBtn.setAttribute('data-listener', 'true');
    }
}
async function exportStats() {
    try {
        const days = parseInt(document.getElementById('statsTimeRange')?.value || '30');
        const stats = await invoke('get_detailed_stats', { days });
        const csvContent = generateStatsCSV(stats);
        downloadCSV(csvContent, `unmarket_stats_${new Date().toISOString().split('T')[0]}.csv`);
        showToast('Statistics exported successfully!', 'success');
    }
    catch (error) {
        showToast('Failed to export statistics', 'error');
    }
}
function generateStatsCSV(stats) {
    let csv = 'Date,Posts,Views,Engagements\n';
    (stats.daily_data || []).forEach((d) => {
        csv += `${d.date},${d.posts || 0},${d.views || 0},${d.engagements || 0}\n`;
    });
    return csv;
}
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
// Settings
async function loadSettings() {
    // 无论后端是否可用，先填充默认模型
    populateDefaultModels();
    // Initialize language selector
    const langSelector = document.getElementById('languageSelect');
    if (langSelector) {
        langSelector.value = currentLanguage;
    }
    try {
        // 尝试从后端加载 providers
        try {
            const providers = await invoke('get_ai_providers');
            aiProviders = { ...defaultAiProviders, ...(providers || {}) };
            populateDefaultModels(); // 用后端数据更新
        }
        catch {
            // 使用默认值，已经填充了
        }
        const config = await invoke('get_config');
        // Detect Unzoo path
        try {
            const unzooPath = await invoke('detect_unzoo_path');
            document.getElementById('unzooPath').value = unzooPath;
        }
        catch {
            document.getElementById('unzooPath').value = t('settings.notFound');
        }
        if (config.scheduler) {
            document.getElementById('schedulerMode').value = config.scheduler.mode || 'round-robin';
            document.getElementById('schedulerInterval').value = config.scheduler.interval_minutes?.toString() || '60';
            document.getElementById('schedulerMaxPosts').value = config.scheduler.max_daily_posts?.toString() || '50';
        }
        await loadAIConfig();
        // Load scheduled jobs from Unzoo
        await loadScheduledJobs();
        // Load proxies
        await loadProxies();
        // Load browser profiles for settings page
        await loadSettingsProfiles();
        // Setup profile event handlers
        setupProfileHandlers();
    }
    catch (error) {
        console.error('Settings error:', error);
    }
}
// ===== Browser Profile Selection (Settings Page) =====
async function loadSettingsProfiles() {
    const select = document.getElementById('browserProfile');
    const statusDiv = document.getElementById('profileStatus');
    if (!select)
        return;
    try {
        // Get available profiles
        const profiles = await invoke('get_available_browser_profiles');
        // Get currently selected profile
        const selectedProfile = await invoke('get_selected_browser_profile');
        // Populate select
        select.innerHTML = '<option value="">-- Select Profile --</option>';
        profiles.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.name} (${p.id})`;
            if (p.id === selectedProfile) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        // Update status
        if (selectedProfile && statusDiv) {
            statusDiv.innerHTML = `<span style="color: var(--success);">✓ 已选择: ${selectedProfile}</span>`;
        }
        // Get browser connection status
        const status = await invoke('get_browser_status');
        if (status.connected) {
            if (statusDiv) {
                statusDiv.innerHTML = `<span style="color: var(--success);">✓ 已连接 (Tab: ${status.active_tab || 'Unknown'})</span>`;
            }
        }
    }
    catch (error) {
        console.error('Failed to load browser profiles:', error);
        if (statusDiv) {
            statusDiv.innerHTML = `<span style="color: var(--danger);">⚠ 无法加载 Profiles: ${error}</span>`;
        }
    }
}
function setupProfileHandlers() {
    // Refresh button
    document.getElementById('btnRefreshProfiles')?.addEventListener('click', async () => {
        await loadSettingsProfiles();
        showToast('Profiles refreshed', 'success');
    });
    // Connect button
    document.getElementById('btnConnectProfile')?.addEventListener('click', async () => {
        const select = document.getElementById('browserProfile');
        const statusDiv = document.getElementById('profileStatus');
        const profileId = select?.value;
        if (!profileId) {
            showToast(t('msg.selectProfileFirst'), 'error');
            return;
        }
        if (statusDiv) {
            statusDiv.innerHTML = '<span style="color: var(--warning);">正在连接...</span>';
        }
        try {
            const result = await invoke('connect_browser_profile', { profileId });
            if (result.success) {
                showToast(`已连接到 ${profileId}`, 'success');
                if (statusDiv) {
                    statusDiv.innerHTML = `<span style="color: var(--success);">✓ 已连接: ${profileId} (Tab: ${result.tab_id})</span>`;
                }
            }
        }
        catch (error) {
            console.error('Failed to connect profile:', error);
            showToast(`连接失败: ${error}`, 'error');
            if (statusDiv) {
                statusDiv.innerHTML = `<span style="color: var(--danger);">⚠ 连接失败: ${error}</span>`;
            }
        }
    });
}
let proxies = [];
async function loadProxies() {
    try {
        const data = await invoke('list_proxies');
        proxies = data.proxies || [];
        updateProxyStats(data.stats || {});
        renderProxies();
    }
    catch (error) {
        console.error('Failed to load proxies:', error);
        proxies = [];
        renderProxies();
    }
}
function updateProxyStats(stats) {
    document.getElementById('proxyStatTotal').textContent = stats.total?.toString() || '0';
    document.getElementById('proxyStatActive').textContent = stats.active?.toString() || '0';
    document.getElementById('proxyStatUsed').textContent = stats.in_use?.toString() || '0';
    document.getElementById('proxyStatFailed').textContent = stats.failed?.toString() || '0';
}
function renderProxies() {
    const container = document.getElementById('proxyList');
    if (!container)
        return;
    if (proxies.length === 0) {
        container.innerHTML = `
      <div class="empty-state-inline">
        <p>No proxies configured. Add a proxy to get started.</p>
      </div>
    `;
        return;
    }
    container.innerHTML = proxies.map(p => `
    <div class="proxy-item" data-id="${p.id}">
      <div class="proxy-info">
        <span class="proxy-name">${escapeHtml(p.name || 'Unnamed')}</span>
        <span class="proxy-address">${p.protocol}://${p.host}:${p.port}</span>
      </div>
      <div class="proxy-meta">
        <span class="proxy-status ${p.status}">${p.status}</span>
        ${p.in_use ? '<span class="proxy-tag">In Use</span>' : ''}
        ${(p.tags || []).map(t => `<span class="proxy-tag">${escapeHtml(t)}</span>`).join('')}
      </div>
      <div class="proxy-actions">
        <button class="btn btn-small btn-secondary" onclick="testProxy('${p.id}')" title="Test Proxy">🔍</button>
        <button class="btn btn-small btn-danger" onclick="deleteProxy('${p.id}')" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
}
function showAddProxyModal() {
    // Clear form
    document.getElementById('proxyName').value = '';
    document.getElementById('proxyProtocol').value = 'socks5';
    document.getElementById('proxyHost').value = '';
    document.getElementById('proxyPort').value = '';
    document.getElementById('proxyUsername').value = '';
    document.getElementById('proxyPassword').value = '';
    document.getElementById('proxyTags').value = '';
    openModal('modalAddProxy');
}
window.showAddProxyModal = showAddProxyModal;
async function savePoolProxy() {
    const name = document.getElementById('proxyName')?.value?.trim();
    const protocol = document.getElementById('proxyProtocol')?.value;
    const host = document.getElementById('proxyHost')?.value?.trim();
    const port = parseInt(document.getElementById('proxyPort')?.value) || 0;
    const username = document.getElementById('proxyUsername')?.value?.trim();
    const password = document.getElementById('proxyPassword')?.value?.trim();
    const tagsStr = document.getElementById('proxyTags')?.value?.trim();
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
    if (!host || !port) {
        showToast('Please enter host and port', 'error');
        return;
    }
    try {
        await invoke('add_proxy', { name, protocol, host, port, username, password, tags });
        closeModal('modalAddProxy');
        showToast(t('msg.proxyAdded'), 'success');
        await loadProxies();
    }
    catch (error) {
        console.error('Failed to add proxy:', error);
        showToast('Failed to add proxy: ' + error, 'error');
    }
}
async function bulkImportProxies() {
    const input = document.getElementById('bulkProxyInput')?.value?.trim();
    if (!input) {
        showToast('Please enter proxy URLs', 'error');
        return;
    }
    const lines = input.split('\n').filter(l => l.trim());
    let added = 0;
    let failed = 0;
    for (const line of lines) {
        try {
            // Parse proxy URL: protocol://user:pass@host:port or protocol://host:port
            const match = line.match(/^(https?|socks5?):\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)$/i);
            if (!match) {
                failed++;
                continue;
            }
            const [, protocol, username, password, host, port] = match;
            await invoke('add_proxy', {
                name: `${host}:${port}`,
                protocol: protocol.toLowerCase(),
                host,
                port: parseInt(port),
                username: username || null,
                password: password || null,
                tags: []
            });
            added++;
        }
        catch {
            failed++;
        }
    }
    document.getElementById('bulkProxyInput').value = '';
    showToast(`Imported ${added} proxies${failed > 0 ? `, ${failed} failed` : ''}`, added > 0 ? 'success' : 'error');
    await loadProxies();
}
async function testProxy(id) {
    try {
        showToast('Testing proxy...', 'info');
        const result = await invoke('test_proxy', { id });
        if (result.success) {
            showToast(`Proxy working! Latency: ${result.latency_ms}ms`, 'success');
        }
        else {
            showToast(`Proxy failed: ${result.error}`, 'error');
        }
        await loadProxies();
    }
    catch (error) {
        console.error('Failed to test proxy:', error);
        showToast('Failed to test proxy: ' + error, 'error');
    }
}
window.testProxy = testProxy;
async function deleteProxy(id) {
    if (!confirm('Delete this proxy?'))
        return;
    try {
        await invoke('delete_proxy', { id });
        showToast('Proxy deleted', 'success');
        await loadProxies();
    }
    catch (error) {
        console.error('Failed to delete proxy:', error);
        showToast('Failed to delete proxy: ' + error, 'error');
    }
}
window.deleteProxy = deleteProxy;
function initProxyEvents() {
    document.getElementById('btnAddProxy')?.addEventListener('click', showAddProxyModal);
    document.getElementById('btnSavePoolProxy')?.addEventListener('click', savePoolProxy);
    document.getElementById('btnBulkImportProxy')?.addEventListener('click', bulkImportProxies);
}
// 填充默认模型列表（不需要API调用）
function populateDefaultModels() {
    const provider = document.getElementById('aiProvider')?.value;
    const modelSelect = document.getElementById('aiModel');
    if (!modelSelect || !aiProviders[provider])
        return;
    modelSelect.innerHTML = aiProviders[provider].models
        .map((m) => `<option value="${m}">${m}</option>`)
        .join('');
}
// updateModelOptions removed - use populateDefaultModels for defaults, refreshModels for API
async function refreshModels() {
    const provider = document.getElementById('aiProvider')?.value;
    const btn = document.getElementById('btnRefreshModels');
    const modelSelect = document.getElementById('aiModel');
    // 先保存当前输入的 API key
    const geminiKey = document.getElementById('aiKeyGemini')?.value;
    const openaiKey = document.getElementById('aiKeyOpenai')?.value;
    const deepseekKey = document.getElementById('aiKeyDeepseek')?.value;
    const qwenKey = document.getElementById('aiKeyQwen')?.value;
    // 检查是否输入了当前provider的API key
    const currentKey = provider === 'gemini' ? geminiKey :
        provider === 'openai' ? openaiKey :
            provider === 'deepseek' ? deepseekKey :
                provider === 'qwen' ? qwenKey : '';
    if (!currentKey || currentKey.trim() === '') {
        showToast(`请先输入 ${aiProviders[provider]?.name || provider} 的 API Key`, 'warning');
        return;
    }
    try {
        if (btn) {
            btn.disabled = true;
            btn.textContent = '获取中...';
        }
        // 先保存 API key 到数据库
        await invoke('configure_ai', {
            provider,
            model: modelSelect?.value || '',
            gemini_key: geminiKey || null,
            openai_key: openaiKey || null,
            deepseek_key: deepseekKey || null,
            qwen_key: qwenKey || null,
        });
        // 然后获取模型
        const models = await invoke('fetch_available_models', { provider });
        if (models && models.length > 0) {
            modelSelect.innerHTML = models
                .map((m) => `<option value="${m}">${m}</option>`)
                .join('');
            showToast(`获取到 ${models.length} 个可用模型`, 'success');
        }
        else {
            // 如果没有获取到模型，使用默认模型
            populateDefaultModels();
            showToast(t('msg.usingDefaultModels'), 'info');
        }
    }
    catch (error) {
        console.error('Failed to refresh models:', error);
        // Use default models as fallback
        populateDefaultModels();
        const errMsg = error?.toString() || '';
        if (errMsg.includes('No API key')) {
            showToast(t('msg.apiKeyNotSaved'), 'error');
        }
        else if (errMsg.includes('Failed to fetch')) {
            showToast(`${t('msg.networkError')}, ${t('msg.usingDefaultModels')}`, 'warning');
        }
        else {
            showToast(`${t('msg.failed')}, ${t('msg.usingDefaultModels')}`, 'warning');
        }
    }
    finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = `🔄 ${t('settings.refreshModels')}`;
        }
    }
}
async function saveAISettings() {
    const provider = document.getElementById('aiProvider')?.value;
    const model = document.getElementById('aiModel')?.value;
    const geminiKey = document.getElementById('aiKeyGemini')?.value;
    const openaiKey = document.getElementById('aiKeyOpenai')?.value;
    const deepseekKey = document.getElementById('aiKeyDeepseek')?.value;
    const qwenKey = document.getElementById('aiKeyQwen')?.value;
    try {
        await invoke('configure_ai', {
            provider,
            model,
            gemini_key: geminiKey || null,
            openai_key: openaiKey || null,
            deepseek_key: deepseekKey || null,
            qwen_key: qwenKey || null,
        });
        showToast(t('msg.aiSettingsSaved'), 'success');
    }
    catch (error) {
        console.error('Failed to save AI settings:', error);
        showToast('Failed to save AI settings', 'error');
    }
}
async function loadAIConfig() {
    try {
        const config = await invoke('get_ai_config');
        if (config.provider) {
            const providerSelect = document.getElementById('aiProvider');
            if (providerSelect)
                providerSelect.value = config.provider;
            populateDefaultModels();
        }
        if (config.model) {
            const modelSelect = document.getElementById('aiModel');
            if (modelSelect)
                modelSelect.value = config.model;
        }
        // Load keys (show masked for security)
        if (config.gemini_key) {
            document.getElementById('aiKeyGemini').value = config.gemini_key;
        }
        if (config.openai_key) {
            document.getElementById('aiKeyOpenai').value = config.openai_key;
        }
        if (config.deepseek_key) {
            document.getElementById('aiKeyDeepseek').value = config.deepseek_key;
        }
        if (config.qwen_key) {
            document.getElementById('aiKeyQwen').value = config.qwen_key;
        }
    }
    catch (error) {
        console.error('Failed to load AI config:', error);
    }
}
async function saveSchedulerSettings() {
    const mode = document.getElementById('schedulerMode')?.value;
    const interval = document.getElementById('schedulerInterval')?.value;
    const maxPosts = document.getElementById('schedulerMaxPosts')?.value;
    try {
        await invoke('set_config', { key: 'scheduler.mode', value: mode });
        await invoke('set_config', { key: 'scheduler.interval_minutes', value: interval });
        await invoke('set_config', { key: 'scheduler.max_daily_posts', value: maxPosts });
        showToast('Scheduler settings saved', 'success');
    }
    catch (error) {
        showToast('Failed to save scheduler settings', 'error');
    }
}
// Browser status
async function checkBrowserStatus() {
    try {
        const available = await invoke('check_browser_status');
        const el = document.getElementById('browserStatus');
        if (el) {
            el.innerHTML = available
                ? '<span class="status-dot online"></span><span class="status-text">Unzoo Ready</span>'
                : '<span class="status-dot offline"></span><span class="status-text">Unzoo Not Found</span>';
        }
    }
    catch (error) {
        console.error('Browser status error:', error);
    }
}
// Utils
function escapeHtml(str) {
    if (!str)
        return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container)
        return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
// ==========================================
// Articles System (软文)
// ==========================================
function loadArticlesPage() {
    // Populate product dropdown
    const select = document.getElementById('articleProduct');
    if (select) {
        select.innerHTML = '<option value="">Choose a product...</option>' +
            products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
    }
    // Load saved articles
    renderSavedArticles();
}
function initArticleTypeSelection() {
    document.querySelectorAll('.radio-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const input = card.querySelector('input[type="radio"]');
            if (input)
                input.checked = true;
        });
    });
}
async function generateArticles() {
    const productId = document.getElementById('articleProduct')?.value;
    if (!productId) {
        showToast('Please select a product', 'error');
        return;
    }
    const product = products.find(p => p.id === productId);
    if (!product)
        return;
    const articleType = document.querySelector('input[name="articleType"]:checked')?.value || 'tutorial';
    const platforms = Array.from(document.querySelectorAll('#articlePlatforms input:checked')).map((cb) => cb.value);
    const languages = Array.from(document.querySelectorAll('#articleLanguages input:checked')).map((cb) => cb.value);
    const keywords = document.getElementById('articleKeywords')?.value?.split(',').map(k => k.trim()).filter(k => k) || [];
    const tone = document.getElementById('articleTone')?.value || 'casual';
    if (platforms.length === 0 || languages.length === 0) {
        showToast('Select at least one platform and language', 'error');
        return;
    }
    const btn = document.getElementById('btnGenerateArticle');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Generating...';
    }
    try {
        generatedArticles = [];
        const total = platforms.length * languages.length;
        let current = 0;
        for (const platform of platforms) {
            for (const language of languages) {
                current++;
                if (btn)
                    btn.textContent = `Generating (${current}/${total})...`;
                const article = await generateSingleArticle(product, articleType, platform, language, keywords, tone);
                generatedArticles.push(article);
            }
        }
        currentArticleIndex = 0;
        renderArticleVersions();
        renderCurrentArticle();
        document.getElementById('btnPublishArticle').disabled = false;
        showToast(`Generated ${generatedArticles.length} articles`, 'success');
    }
    catch (error) {
        console.error('Failed to generate articles:', error);
        showToast('Failed to generate articles', 'error');
    }
    finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Generate Articles';
        }
    }
}
async function generateSingleArticle(product, type, platform, language, keywords, tone) {
    // Platform-specific length targets
    const lengthTargets = {
        zhihu: 1500,
        wechat: 2000,
        medium: 1500,
        devto: 1200,
        toutiao: 1000,
        reddit: 500,
        blog: 1800,
    };
    const targetLength = lengthTargets[platform] || 1000;
    try {
        // Try to use backend AI generation
        const results = await invoke('generate_article', {
            productId: product.id,
            articleType: type,
            platforms: [platform],
            languages: [language],
            keywords,
            tone,
        });
        // Backend returns array, get first result
        if (results && results.length > 0) {
            const result = results[0];
            return {
                id: result.id || generateTaskId(),
                productId: product.id,
                productName: product.name,
                type,
                platform,
                language,
                title: result.title,
                body: result.body,
                keywords: result.keywords || keywords,
                wordCount: result.word_count || result.body.split(/\s+/).length,
                createdAt: new Date(),
            };
        }
        throw new Error('No article generated');
    }
    catch (error) {
        // Fallback to template-based generation
        console.warn('AI generation failed, using template:', error);
        return generateArticleFromTemplate(product, type, platform, language, keywords, targetLength);
    }
}
function generateArticleFromTemplate(product, type, platform, language, keywords, targetLength) {
    const isZh = language === 'zh';
    const templates = getArticleTemplates(isZh);
    const template = templates[type] || templates.tutorial;
    // Replace placeholders
    let title = template.title
        .replace('{product}', product.name)
        .replace('{tagline}', product.tagline || '');
    let body = template.body
        .replace(/{product}/g, product.name)
        .replace(/{tagline}/g, product.tagline || '')
        .replace(/{description}/g, product.description || product.tagline || '')
        .replace(/{url}/g, product.url)
        .replace(/{keywords}/g, keywords.join(', '));
    // Add platform-specific formatting
    if (platform === 'zhihu') {
        body = body + (isZh ? '\n\n---\n\n希望这篇文章对你有帮助！欢迎点赞、收藏和关注。' : '\n\n---\n\nHope this helps! Feel free to upvote if you found it useful.');
    }
    else if (platform === 'medium') {
        body = body + '\n\n---\n\n*If you enjoyed this article, please clap and follow for more content!*';
    }
    else if (platform === 'wechat') {
        body = body + '\n\n---\n\n觉得有用的话，欢迎点赞在看，分享给更多朋友！';
    }
    return {
        id: generateTaskId(),
        productId: product.id,
        productName: product.name,
        type,
        platform,
        language,
        title,
        body,
        keywords,
        wordCount: body.length,
        createdAt: new Date(),
    };
}
function getArticleTemplates(isZh) {
    if (isZh) {
        return {
            tutorial: {
                title: '{product} 使用指南：从入门到精通',
                body: `# {product} 使用指南

## 前言

{tagline}

在这篇文章中，我将详细介绍 {product} 的核心功能和使用技巧，帮助你快速上手。

## 什么是 {product}？

{description}

## 核心功能

### 1. 主要特性

{product} 提供了以下强大功能：

- **简洁易用**：界面直观，上手简单
- **功能强大**：满足专业需求
- **持续更新**：团队活跃，功能不断完善

### 2. 使用场景

无论你是个人用户还是团队，{product} 都能满足你的需求：

- 日常工作
- 项目管理
- 团队协作

## 快速开始

1. 访问 {url}
2. 注册账号
3. 开始使用

## 进阶技巧

掌握以下技巧，让你的效率翻倍：

1. 善用快捷键
2. 自定义设置
3. 探索高级功能

## 总结

{product} 是一款值得尝试的工具。{tagline}

立即体验：{url}`,
            },
            comparison: {
                title: '{product} vs 竞品对比：为什么我选择 {product}',
                body: `# {product} vs 竞品对比

## 我的选择困难

在众多工具中选择合适的产品并不容易。今天，我想分享一下为什么我最终选择了 {product}。

## 产品介绍

{description}

## 对比维度

### 易用性

{product} 的界面设计简洁直观，学习成本极低。

### 功能性

核心功能完备，满足日常需求。

### 性价比

相比同类产品，{product} 提供了更好的价值。

## 为什么选择 {product}

1. **{tagline}**
2. 持续的产品迭代
3. 活跃的社区支持

## 结论

如果你正在寻找一款可靠的工具，{product} 值得一试。

了解更多：{url}`,
            },
            problem: {
                title: '解决 {keywords} 问题，我找到了 {product}',
                body: `# 如何解决 {keywords} 问题

## 困扰

相信很多人都遇到过这样的问题：效率低下、工具不顺手、工作流程繁琐。

我也曾深受其扰，直到我发现了 {product}。

## 解决方案

{product} - {tagline}

{description}

## 它是如何帮助我的

### 问题1：效率问题
{product} 通过智能化功能大幅提升了我的工作效率。

### 问题2：易用性
简洁的界面设计让我能快速上手。

### 问题3：协作需求
完善的协作功能满足了团队需求。

## 实际效果

使用 {product} 后，我的效率提升了至少 30%。

## 如何开始

访问 {url} 立即体验。

你也有类似的困扰吗？试试 {product} 吧！`,
            },
            story: {
                title: '我与 {product} 的故事',
                body: `# 我与 {product} 的故事

## 遇见

几个月前，我在寻找一款合适的工具时，偶然发现了 {product}。

{tagline}

## 初体验

第一次使用 {product}，我就被它的设计所吸引。{description}

## 日常使用

现在，{product} 已经成为我工作中不可或缺的一部分。

### 早上
打开 {product}，开始一天的工作。

### 工作中
利用各种功能提升效率。

### 总结
完成当天任务，做好规划。

## 推荐理由

如果你也在寻找一款好用的工具，我真心推荐 {product}。

体验地址：{url}`,
            },
            listicle: {
                title: '2024 年最值得尝试的 {keywords} 工具推荐（含 {product}）',
                body: `# 2024 年最值得尝试的工具推荐

## 前言

今天给大家推荐几款优秀的工具，帮助提升你的工作效率。

## 推荐列表

### 1. {product} ⭐ 强烈推荐

{tagline}

{description}

**优点：**
- 功能强大
- 界面简洁
- 持续更新

**官网：** {url}

### 2. 其他备选工具

市面上还有一些其他选择，但综合考虑功能、价格和体验，{product} 是我的首选。

## 如何选择

选择工具时，建议考虑：
1. 是否满足核心需求
2. 学习成本
3. 价格和性价比

## 总结

如果你正在寻找一款可靠的工具，不妨试试 {product}。

立即体验：{url}`,
            },
        };
    }
    else {
        return {
            tutorial: {
                title: 'Complete Guide to {product}: From Beginner to Pro',
                body: `# Complete Guide to {product}

## Introduction

{tagline}

In this comprehensive guide, I'll walk you through everything you need to know about {product}.

## What is {product}?

{description}

## Key Features

### 1. Core Capabilities

{product} offers powerful features:

- **User-friendly**: Intuitive interface
- **Powerful**: Professional-grade capabilities
- **Active development**: Regular updates

### 2. Use Cases

Whether you're an individual or team, {product} fits your needs:

- Daily workflows
- Project management
- Team collaboration

## Getting Started

1. Visit {url}
2. Create an account
3. Start using

## Pro Tips

Master these techniques to boost your productivity:

1. Learn keyboard shortcuts
2. Customize settings
3. Explore advanced features

## Conclusion

{product} is a tool worth trying. {tagline}

Get started: {url}`,
            },
            comparison: {
                title: '{product} vs Alternatives: Why I Made the Switch',
                body: `# {product} vs Alternatives

## The Challenge

Choosing the right tool isn't easy. Here's why I ultimately chose {product}.

## About {product}

{description}

## Comparison Points

### Usability
{product} features a clean, intuitive interface.

### Features
Comprehensive functionality for daily needs.

### Value
Better value compared to alternatives.

## Why {product}?

1. **{tagline}**
2. Continuous improvements
3. Active community

## Conclusion

If you're looking for a reliable tool, give {product} a try.

Learn more: {url}`,
            },
            problem: {
                title: 'How I Solved {keywords} Problems with {product}',
                body: `# Solving {keywords} Problems

## The Struggle

Many of us face these challenges: low efficiency, clunky tools, tedious workflows.

I was there too, until I discovered {product}.

## The Solution

{product} - {tagline}

{description}

## How It Helped

### Problem 1: Efficiency
{product}'s smart features dramatically improved my workflow.

### Problem 2: Usability
Clean design means minimal learning curve.

### Problem 3: Collaboration
Robust collaboration features for teams.

## Results

Since using {product}, my productivity increased by at least 30%.

## Get Started

Visit {url} to try it yourself.

Have similar challenges? Give {product} a try!`,
            },
            story: {
                title: 'My Journey with {product}',
                body: `# My Journey with {product}

## Discovery

A few months ago, I stumbled upon {product} while searching for the right tool.

{tagline}

## First Impressions

I was immediately impressed by the design. {description}

## Daily Use

Now, {product} is an essential part of my workflow.

### Morning
Open {product} to start the day.

### During Work
Leverage features to stay productive.

### End of Day
Wrap up tasks and plan ahead.

## My Recommendation

If you're looking for a great tool, I genuinely recommend {product}.

Try it: {url}`,
            },
            listicle: {
                title: 'Best {keywords} Tools in 2024 (Including {product})',
                body: `# Best Tools in 2024

## Introduction

Here are my top tool recommendations to boost your productivity.

## The List

### 1. {product} ⭐ Highly Recommended

{tagline}

{description}

**Pros:**
- Powerful features
- Clean interface
- Regular updates

**Website:** {url}

### 2. Other Options

There are alternatives, but considering features, price, and experience, {product} is my top pick.

## How to Choose

When selecting tools, consider:
1. Core functionality
2. Learning curve
3. Pricing and value

## Conclusion

Looking for a reliable tool? Give {product} a try.

Get started: {url}`,
            },
        };
    }
}
function renderArticleVersions() {
    const container = document.getElementById('articleVersions');
    if (!container || generatedArticles.length === 0)
        return;
    container.innerHTML = generatedArticles.map((article, i) => `
    <button class="article-version-tab ${i === currentArticleIndex ? 'active' : ''}" data-index="${i}">
      <span class="platform-icon">${PLATFORM_ICONS[article.platform] || '📄'}</span>
      <span>${article.platform}</span>
      <span class="word-count">${article.language.toUpperCase()}</span>
    </button>
  `).join('');
    container.querySelectorAll('.article-version-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentArticleIndex = parseInt(tab.dataset.index || '0');
            container.querySelectorAll('.article-version-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCurrentArticle();
        });
    });
}
function renderCurrentArticle() {
    const container = document.getElementById('articleContent');
    if (!container || !generatedArticles[currentArticleIndex])
        return;
    const article = generatedArticles[currentArticleIndex];
    container.innerHTML = `
    <h1 class="article-title">${escapeHtml(article.title)}</h1>
    <div class="article-meta">
      <span class="article-meta-item">📝 ${article.type}</span>
      <span class="article-meta-item">🌐 ${article.platform}</span>
      <span class="article-meta-item">💬 ${article.language.toUpperCase()}</span>
      <span class="article-meta-item">📊 ${article.wordCount} chars</span>
    </div>
    <div class="article-body">${formatArticleBody(article.body)}</div>
    ${article.keywords.length > 0 ? `
      <div class="article-tags">
        ${article.keywords.map(k => `<span class="article-tag">#${escapeHtml(k)}</span>`).join('')}
      </div>
    ` : ''}
  `;
}
function formatArticleBody(body) {
    // Convert markdown-like syntax to HTML
    return escapeHtml(body)
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
        .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[hulo])(.+)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '')
        .replace(/---/g, '<hr>');
}
function copyCurrentArticle() {
    if (!generatedArticles[currentArticleIndex])
        return;
    const article = generatedArticles[currentArticleIndex];
    const text = `${article.title}\n\n${article.body}`;
    navigator.clipboard.writeText(text).then(() => {
        showToast(t('msg.articleCopied'), 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}
function queueArticleTask() {
    if (generatedArticles.length === 0) {
        showToast('No articles to publish', 'error');
        return;
    }
    const platforms = [...new Set(generatedArticles.map(a => a.platform))];
    const title = `Publish ${generatedArticles.length} articles to ${platforms.join(', ')}`;
    createTask('publish', title, { contents: generatedArticles.map(a => ({
            platform: a.platform,
            language: a.language,
            product_name: a.productName,
            body: `${a.title}\n\n${a.body}`,
            hashtags: a.keywords,
        })) });
    // Save articles
    savedArticles.push(...generatedArticles);
    renderSavedArticles();
    showToast('Articles added to task queue', 'success');
    navigateTo('tasks');
}
function renderSavedArticles() {
    const container = document.getElementById('savedArticlesList');
    if (!container)
        return;
    if (savedArticles.length === 0) {
        container.innerHTML = '<p class="text-muted">No saved articles yet</p>';
        return;
    }
    container.innerHTML = savedArticles.slice(0, 10).map(article => `
    <div class="saved-article-item">
      <div class="saved-article-info">
        <div class="saved-article-title">${escapeHtml(article.title)}</div>
        <div class="saved-article-meta">
          <span>${article.platform}</span>
          <span>${article.language.toUpperCase()}</span>
          <span>${formatTimeAgo(article.createdAt)}</span>
        </div>
      </div>
      <div class="saved-article-actions">
        <button class="btn btn-small btn-secondary" onclick="viewSavedArticle('${article.id}')">View</button>
      </div>
    </div>
  `).join('');
}
window.viewSavedArticle = function (id) {
    const article = savedArticles.find(a => a.id === id);
    if (article) {
        generatedArticles = [article];
        currentArticleIndex = 0;
        renderArticleVersions();
        renderCurrentArticle();
    }
};
// ==========================================
// Task Queue System
// ==========================================
function generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
function createTask(type, title, data) {
    const task = {
        id: generateTaskId(),
        type,
        title,
        status: 'pending',
        progress: 0,
        total: 0,
        createdAt: new Date(),
        data
    };
    tasks.unshift(task);
    renderTasks();
    processTaskQueue();
    return task;
}
function updateTask(taskId, updates) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        Object.assign(task, updates);
        renderTasks();
    }
}
async function processTaskQueue() {
    if (taskRunning)
        return;
    const pendingTask = tasks.find(t => t.status === 'pending');
    if (!pendingTask)
        return;
    taskRunning = true;
    updateTask(pendingTask.id, { status: 'running' });
    try {
        switch (pendingTask.type) {
            case 'publish':
                await executePublishTask(pendingTask);
                break;
            case 'reply':
                await executeReplyTask(pendingTask);
                break;
            case 'discover':
                await executeDiscoverTask(pendingTask);
                break;
            case 'nurture':
                await executeNurtureTask(pendingTask);
                break;
        }
        updateTask(pendingTask.id, { status: 'completed', completedAt: new Date() });
    }
    catch (error) {
        updateTask(pendingTask.id, { status: 'failed', error: error?.toString() });
    }
    taskRunning = false;
    // Process next task
    setTimeout(processTaskQueue, 500);
}
async function executePublishTask(task) {
    const contents = task.data.contents;
    task.total = contents.length;
    updateTask(task.id, { total: contents.length });
    let successCount = 0;
    let failCount = 0;
    const results = [];
    // Group contents by platform for account rotation
    const platformContents = {};
    contents.forEach(c => {
        if (!platformContents[c.platform]) {
            platformContents[c.platform] = [];
        }
        platformContents[c.platform].push(c);
    });
    // Get available accounts for each platform
    const platformAccounts = {};
    try {
        const accountsData = await invoke('list_accounts');
        (accountsData || []).forEach((acc) => {
            if (acc.status === 'active') {
                if (!platformAccounts[acc.platform]) {
                    platformAccounts[acc.platform] = [];
                }
                platformAccounts[acc.platform].push(acc);
            }
        });
    }
    catch (e) {
        console.warn('Could not load accounts for rotation:', e);
    }
    let currentIndex = 0;
    for (const content of contents) {
        currentIndex++;
        updateTask(task.id, { progress: currentIndex });
        try {
            // Select account for this platform (round-robin rotation)
            const platformAccs = platformAccounts[content.platform] || [];
            let selectedAccount = null;
            if (platformAccs.length > 0) {
                const accIndex = (platformContents[content.platform].indexOf(content)) % platformAccs.length;
                selectedAccount = platformAccs[accIndex];
            }
            // Publish with account rotation
            const publishContent = {
                ...content,
                account_id: selectedAccount?.id || null
            };
            const result = await invoke('publish_content', { content: publishContent });
            if (result.success) {
                successCount++;
                results.push({ platform: content.platform, success: true, url: result.post_url });
            }
            else {
                failCount++;
                results.push({ platform: content.platform, success: false, error: result.error });
                // Retry once on failure with different account
                if (platformAccs.length > 1) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    const retryAccount = platformAccs[(platformContents[content.platform].indexOf(content) + 1) % platformAccs.length];
                    const retryContent = { ...content, account_id: retryAccount?.id };
                    try {
                        const retryResult = await invoke('publish_content', { content: retryContent });
                        if (retryResult.success) {
                            successCount++;
                            failCount--;
                            results[results.length - 1] = { platform: content.platform, success: true, url: retryResult.post_url, retried: true };
                        }
                    }
                    catch (retryError) {
                        console.error(`Retry also failed for ${content.platform}:`, retryError);
                    }
                }
            }
        }
        catch (error) {
            failCount++;
            results.push({ platform: content.platform, success: false, error: String(error) });
            console.error(`Failed to publish to ${content.platform}:`, error);
        }
        // Smart delay based on platform
        if (currentIndex < contents.length) {
            const delay = getPublishDelay(content.platform);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    // Store results in task data
    task.data.results = results;
    task.data.successCount = successCount;
    task.data.failCount = failCount;
    if (failCount > 0 && successCount === 0) {
        showToast(`Publishing failed for all ${failCount} posts`, 'error');
    }
    else if (failCount > 0) {
        showToast(`Published ${successCount}/${contents.length} posts (${failCount} failed)`, 'warning');
    }
    else {
        showToast(`Successfully published ${successCount} posts!`, 'success');
    }
}
function getPublishDelay(platform) {
    // Different delays for different platforms based on their rate limits
    const delays = {
        twitter: 3000, // Twitter is more lenient
        reddit: 120000, // Reddit needs longer waits (2 min)
        linkedin: 30000, // LinkedIn 30 sec
        zhihu: 60000, // 知乎 1 min
        weibo: 30000, // 微博 30 sec
        hackernews: 120000, // HN is strict
        producthunt: 60000,
        medium: 30000,
        devto: 30000,
    };
    return delays[platform.toLowerCase()] || 5000;
}
async function executeReplyTask(task) {
    const { postId, productId, replyContent } = task.data;
    task.total = 1;
    updateTask(task.id, { total: 1 });
    await invoke('reply_to_post', { postId, productId, customReply: replyContent });
    updateTask(task.id, { progress: 1 });
}
async function executeDiscoverTask(task) {
    const { keywords } = task.data;
    task.total = keywords.length;
    updateTask(task.id, { total: keywords.length });
    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        updateTask(task.id, { progress: i + 1 });
        for (const platform of keyword.platforms) {
            try {
                await invoke('discover_posts', { platform, keyword: keyword.keyword });
            }
            catch (error) {
                console.error(`Failed to discover on ${platform}:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}
// Execute batch nurture task - nurtures multiple accounts sequentially
async function executeNurtureTask(task) {
    const { accountIds, seconds, continuous } = task.data;
    task.total = accountIds.length;
    updateTask(task.id, { total: accountIds.length });
    let successCount = 0;
    let failCount = 0;
    const results = [];
    for (let i = 0; i < accountIds.length; i++) {
        const accountId = accountIds[i];
        updateTask(task.id, { progress: i + 1 });
        try {
            const result = await invoke('quick_nurture', {
                account_id: accountId,
                seconds: seconds || 60
            });
            successCount++;
            results.push({ accountId, success: true, duration: seconds });
            // Small delay between accounts to be more natural
            if (i < accountIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        catch (error) {
            failCount++;
            results.push({ accountId, success: false, error: String(error) });
            console.error(`Nurture failed for account ${accountId}:`, error);
        }
    }
    // Store results
    task.data.results = results;
    task.data.successCount = successCount;
    task.data.failCount = failCount;
    // If continuous mode, create another task after completion
    if (continuous && successCount > 0) {
        // Wait 5 minutes before next round
        setTimeout(() => {
            createTask('nurture', `🌱 ${t('nurture.title')} (Loop)`, {
                accountIds,
                seconds,
                continuous: true
            });
        }, 5 * 60 * 1000);
    }
    // Refresh accounts to show updated nurture stats
    await loadAccounts();
}
// Create a nurture task from the modal
window.createNurtureTask = function (accountIds, seconds, continuous = false) {
    if (!accountIds || accountIds.length === 0) {
        showToast(t('nurture.noAccounts'), 'error');
        return;
    }
    const task = createTask('nurture', `🌱 ${t('nurture.title')} (${accountIds.length} ${t('msg.account')})`, {
        accountIds,
        seconds,
        continuous
    });
    showToast(`${t('msg.taskAdded')}: ${accountIds.length} ${t('msg.account')}`, 'success');
    navigateTo('tasks');
    return task;
};
function loadTasksPage() {
    renderTasks();
}
function renderTasks() {
    const container = document.getElementById('tasksList');
    if (!container)
        return;
    // Update stats
    const pending = tasks.filter(t => t.status === 'pending').length;
    const running = tasks.filter(t => t.status === 'running').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const statPending = document.getElementById('taskStatPending');
    const statRunning = document.getElementById('taskStatRunning');
    const statCompleted = document.getElementById('taskStatCompleted');
    if (statPending)
        statPending.textContent = `${pending} pending`;
    if (statRunning)
        statRunning.textContent = `${running} running`;
    if (statCompleted)
        statCompleted.textContent = `${completed + failed} done`;
    if (tasks.length === 0) {
        container.innerHTML = `
      <div class="tasks-empty">
        <div class="tasks-empty-icon">📋</div>
        <p>No tasks yet</p>
        <p class="text-muted">Tasks will appear here when you publish or reply</p>
      </div>
    `;
        return;
    }
    container.innerHTML = tasks.map(task => {
        const statusIcon = {
            pending: '⏳',
            running: '⚡',
            completed: '✅',
            failed: '❌'
        }[task.status];
        const progressPercent = task.total > 0 ? Math.round((task.progress / task.total) * 100) : 0;
        const timeAgo = formatTimeAgo(task.createdAt);
        // Build result summary for completed tasks
        let resultSummary = '';
        if (task.status === 'completed' && task.data?.results) {
            const successCount = task.data.successCount || 0;
            const failCount = task.data.failCount || 0;
            resultSummary = `
        <div class="task-results">
          <span class="result-success">${successCount} success</span>
          ${failCount > 0 ? `<span class="result-fail">${failCount} failed</span>` : ''}
        </div>
      `;
        }
        // Build completion time
        let completionInfo = '';
        if (task.completedAt) {
            const duration = Math.round((task.completedAt.getTime() - task.createdAt.getTime()) / 1000);
            completionInfo = `<span>in ${formatDuration(duration)}</span>`;
        }
        return `
      <div class="task-item ${task.status}">
        <div class="task-status ${task.status}">${statusIcon}</div>
        <div class="task-info">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="task-type-badge">${task.type}</span>
            <span>${timeAgo}</span>
            ${completionInfo}
            ${task.error ? `<span class="text-error">${escapeHtml(task.error)}</span>` : ''}
          </div>
          ${resultSummary}
        </div>
        ${task.status === 'running' || task.status === 'pending' ? `
          <div class="task-progress">
            <div class="task-progress-bar">
              <div class="task-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="task-progress-text">${task.progress}/${task.total}</div>
          </div>
        ` : ''}
        <div class="task-actions">
          ${task.status === 'completed' && task.data?.results ? `<button class="btn btn-small btn-secondary" onclick="viewTaskResults('${task.id}')">Details</button>` : ''}
          ${task.status === 'failed' ? `<button class="btn btn-small btn-secondary" onclick="retryTask('${task.id}')">Retry</button>` : ''}
          ${task.status !== 'running' ? `<button class="btn btn-small btn-secondary" onclick="removeTask('${task.id}')">Remove</button>` : ''}
        </div>
      </div>
    `;
    }).join('');
}
function formatDuration(seconds) {
    if (seconds < 60)
        return `${seconds}s`;
    if (seconds < 3600)
        return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
function viewTaskResults(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task?.data?.results)
        return;
    const results = task.data.results;
    const html = `
    <div class="modal active" id="taskResultsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Task Results</h3>
          <button class="modal-close" onclick="closeModal('taskResultsModal')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="results-summary">
            <span class="result-success-badge">${task.data.successCount || 0} Success</span>
            ${task.data.failCount > 0 ? `<span class="result-fail-badge">${task.data.failCount} Failed</span>` : ''}
          </div>
          <div class="results-list">
            ${results.map(r => `
              <div class="result-item ${r.success ? 'success' : 'failed'}">
                <span class="result-platform">${PLATFORM_ICONS[r.platform] || '📄'} ${r.platform}</span>
                <span class="result-status">${r.success ? '✅' : '❌'}</span>
                ${r.url ? `<a href="${r.url}" target="_blank" class="result-link">View</a>` : ''}
                ${r.error ? `<span class="result-error">${r.error}</span>` : ''}
                ${r.retried ? '<span class="result-retry-badge">retried</span>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="closeModal('taskResultsModal')">Close</button>
        </div>
      </div>
    </div>
  `;
    // Remove existing modal if any
    document.getElementById('taskResultsModal')?.remove();
    document.body.insertAdjacentHTML('beforeend', html);
}
window.viewTaskResults = viewTaskResults;
// formatTimeAgo is defined earlier in the file
function clearCompletedTasks() {
    tasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'failed');
    renderTasks();
    showToast(t('msg.clearedTasks'), 'success');
}
window.retryTask = function (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status === 'failed') {
        task.status = 'pending';
        task.progress = 0;
        task.error = undefined;
        renderTasks();
        processTaskQueue();
    }
};
window.removeTask = function (taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    renderTasks();
};
// Queue-based publish
function queuePublishTask() {
    if (generatedContents.length === 0) {
        showToast(t('msg.noContentToPublish'), 'error');
        return;
    }
    const productNames = [...new Set(generatedContents.map(c => c.product_name || 'Product'))];
    const title = productNames.length > 1
        ? `Publish ${generatedContents.length} posts for ${productNames.length} products`
        : `Publish ${generatedContents.length} posts for ${productNames[0]}`;
    createTask('publish', title, { contents: generatedContents });
    showToast('Task added to queue', 'success');
    // Navigate to tasks page
    navigateTo('tasks');
}
// Queue-based discover
function queueDiscoverTask() {
    if (keywords.length === 0) {
        showToast(t('msg.addKeywordsFirst'), 'error');
        return;
    }
    createTask('discover', `Discover posts for ${keywords.length} keywords`, { keywords });
    showToast('Discovery task added to queue', 'success');
    navigateTo('tasks');
}
//# sourceMappingURL=app.js.map