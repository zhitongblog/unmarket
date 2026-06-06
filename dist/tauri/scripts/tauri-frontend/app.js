/**
 * UnMarket Desktop - Tauri Frontend Application
 */
import { invoke as tauriInvoke } from '@tauri-apps/api/core';
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
// State
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
    // Show browser mode warning if not in Tauri
    if (!isTauriEnv) {
        showBrowserModeWarning();
    }
    initNavigation();
    initModals();
    initTabs();
    initCampaignEvents();
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
    document.getElementById('btnGenerate')?.addEventListener('click', generateContent);
    document.getElementById('btnSimulate')?.addEventListener('click', simulatePublish);
    document.getElementById('btnPublish')?.addEventListener('click', queuePublishTask);
    // Tasks page
    document.getElementById('btnClearCompleted')?.addEventListener('click', clearCompletedTasks);
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
        showToast('Failed to load data', 'error');
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
function renderPlatformHealth(healthData) {
    const container = document.getElementById('dashPlatformHealth');
    if (!container)
        return;
    const platforms = ['twitter', 'reddit', 'linkedin', 'zhihu', 'weibo'];
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
    const platformIcons = {
        twitter: '🐦', reddit: '🔴', linkedin: '💼', zhihu: '知', weibo: '微'
    };
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
            <span class="campaign-platform-tag">${platformIcons[p] || ''} ${p}</span>
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
        showToast('Please select at least one platform', 'error');
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
        showToast('Please select at least one product', 'error');
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
        showToast('Product added successfully', 'success');
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
        showToast('Product deleted', 'success');
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
        return `
      <div class="account-item ${hasProfile ? 'has-profile' : ''}">
        <div class="account-info">
          <span class="account-platform">${escapeHtml(account.platform)}</span>
          <span class="account-username">${escapeHtml(account.username || account.email || 'N/A')}</span>
          ${healthBadge}
          <span class="account-badges">${stealthBadge}${fingerprintBadge}${proxyBadge}</span>
        </div>
        <div class="account-actions">
          ${!hasProfile ? `<button class="btn btn-small btn-secondary" onclick="createProfileForAccount('${account.id}', '${escapeHtml(account.platform)}')">Create Profile</button>` : ''}
          ${hasProfile ? `<button class="btn btn-small btn-secondary" onclick="toggleStealth('${profile.id}', ${!profile.stealth_enabled})" title="${profile.stealth_enabled ? 'Disable' : 'Enable'} Stealth">${profile.stealth_enabled ? '🛡️' : '⚡'}</button>` : ''}
          ${hasProfile ? `<button class="btn btn-small btn-secondary" onclick="randomizeFingerprint('${profile.id}')" title="Randomize Fingerprint">🎭</button>` : ''}
          ${hasProfile ? `<button class="btn btn-small btn-secondary" onclick="showProxyModal('${profile.id}')" title="Set Proxy">🌐</button>` : ''}
          <button class="btn btn-small btn-danger" onclick="deleteAccount('${account.id}')">Delete</button>
        </div>
      </div>
    `;
    }).join('');
}
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
        showToast('Please select at least one platform', 'error');
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
        showToast('Account added', 'success');
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
        showToast('Account deleted', 'success');
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
        showToast('Please select at least one product', 'error');
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
        showToast('No content to publish', 'error');
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
        showToast('All content published!', 'success');
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
        showToast('No content to publish', 'error');
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
        showToast('Please select at least one platform', 'error');
        return;
    }
    try {
        await invoke('add_keyword', { keyword, productId, platforms });
        closeModal('modalAddKeyword');
        await loadKeywords();
        showToast('Keyword added', 'success');
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
        showToast('Keyword deleted', 'success');
    }
    catch (error) {
        showToast('Failed to delete keyword', 'error');
    }
};
async function discoverPosts() {
    if (keywords.length === 0) {
        showToast('Please add keywords first', 'error');
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
        showToast('Reply generated', 'success');
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
        showToast('Please write a reply', 'error');
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
            showToast('Reply sent successfully!', 'success');
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
        const stats = await invoke('get_stats', { days: 30 });
        document.getElementById('statPosts').textContent = stats.total_posts.toString();
        document.getElementById('statViews').textContent = stats.total_views.toString();
        document.getElementById('statEngagements').textContent = stats.total_engagements.toString();
        document.getElementById('statRate').textContent = (stats.avg_engagement_rate * 100).toFixed(1) + '%';
    }
    catch (error) {
        console.error('Stats error:', error);
    }
}
// Settings
async function loadSettings() {
    // 无论后端是否可用，先填充默认模型
    populateDefaultModels();
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
        if (config.browser) {
            document.getElementById('unzooPath').value = config.browser.unzoo_path || 'Not found';
        }
        if (config.scheduler) {
            document.getElementById('schedulerMode').value = config.scheduler.mode || 'round-robin';
            document.getElementById('schedulerInterval').value = config.scheduler.interval_minutes?.toString() || '60';
            document.getElementById('schedulerMaxPosts').value = config.scheduler.max_daily_posts?.toString() || '50';
        }
        await loadAIConfig();
        // Load scheduled jobs from Unzoo
        await loadScheduledJobs();
    }
    catch (error) {
        console.error('Settings error:', error);
    }
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
            showToast('使用默认模型列表', 'info');
        }
    }
    catch (error) {
        console.error('Failed to refresh models:', error);
        // 使用默认模型作为后备
        populateDefaultModels();
        const errMsg = error?.toString() || '';
        if (errMsg.includes('No API key')) {
            showToast('API Key 未保存，请先保存设置', 'error');
        }
        else if (errMsg.includes('Failed to fetch')) {
            showToast('网络错误，使用默认模型列表', 'warning');
        }
        else {
            showToast('获取失败，使用默认模型列表', 'warning');
        }
    }
    finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 刷新模型列表';
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
        showToast('AI settings saved', 'success');
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
    const platformIcons = {
        zhihu: '🔵',
        wechat: '💬',
        medium: '📖',
        devto: '👩‍💻',
        toutiao: '📰',
        reddit: '🔴',
        blog: '🌐',
    };
    container.innerHTML = generatedArticles.map((article, i) => `
    <button class="article-version-tab ${i === currentArticleIndex ? 'active' : ''}" data-index="${i}">
      <span class="platform-icon">${platformIcons[article.platform] || '📄'}</span>
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
        showToast('Article copied to clipboard', 'success');
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
    for (let i = 0; i < contents.length; i++) {
        const content = contents[i];
        updateTask(task.id, { progress: i + 1 });
        try {
            await invoke('publish_content', { content });
        }
        catch (error) {
            console.error(`Failed to publish ${content.platform}:`, error);
        }
        // Wait between posts
        if (i < contents.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
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
    const statPending = document.getElementById('taskStatPending');
    const statRunning = document.getElementById('taskStatRunning');
    const statCompleted = document.getElementById('taskStatCompleted');
    if (statPending)
        statPending.textContent = `${pending} pending`;
    if (statRunning)
        statRunning.textContent = `${running} running`;
    if (statCompleted)
        statCompleted.textContent = `${completed} completed`;
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
            completed: '✓',
            failed: '✗'
        }[task.status];
        const progressPercent = task.total > 0 ? Math.round((task.progress / task.total) * 100) : 0;
        const timeAgo = formatTimeAgo(task.createdAt);
        return `
      <div class="task-item">
        <div class="task-status ${task.status}">${statusIcon}</div>
        <div class="task-info">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span>${task.type}</span>
            <span>${timeAgo}</span>
            ${task.error ? `<span class="text-error">${escapeHtml(task.error)}</span>` : ''}
          </div>
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
          ${task.status === 'failed' ? `<button class="btn btn-small btn-secondary" onclick="retryTask('${task.id}')">Retry</button>` : ''}
          ${task.status !== 'running' ? `<button class="btn btn-small btn-secondary" onclick="removeTask('${task.id}')">Remove</button>` : ''}
        </div>
      </div>
    `;
    }).join('');
}
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1)
        return 'just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
        return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}
function clearCompletedTasks() {
    tasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'failed');
    renderTasks();
    showToast('Cleared completed tasks', 'success');
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
        showToast('No content to publish', 'error');
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
        showToast('Please add keywords first', 'error');
        return;
    }
    createTask('discover', `Discover posts for ${keywords.length} keywords`, { keywords });
    showToast('Discovery task added to queue', 'success');
    navigateTo('tasks');
}
//# sourceMappingURL=app.js.map