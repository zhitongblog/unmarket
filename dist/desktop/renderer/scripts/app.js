/**
 * UnMarket Desktop - Frontend Application
 */

// State
let currentPage = 'products';
let products = [];
let accounts = [];
let generatedContents = [];
let aiProviders = {};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initModals();
  initTabs();
  await loadInitialData();
  checkBrowserStatus();
});

// Navigation
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      navigateTo(page);
    });
  });

  // Listen for navigation from main process
  window.api.onNavigate((page) => {
    navigateTo(page);
  });
}

function navigateTo(page) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('active', p.id === `page-${page}`);
  });

  currentPage = page;

  // Load page data
  switch (page) {
    case 'products':
      loadProducts();
      break;
    case 'publish':
      loadPublishPage();
      break;
    case 'accounts':
      loadAccounts();
      break;
    case 'stats':
      loadStats();
      break;
    case 'settings':
      loadSettings();
      break;
  }
}

// Modals
function initModals() {
  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    });
  });

  // Click outside to close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Add product buttons
  document.getElementById('btnAddProduct')?.addEventListener('click', () => openModal('modalAddProduct'));
  document.getElementById('btnAddProductEmpty')?.addEventListener('click', () => openModal('modalAddProduct'));
  document.getElementById('btnSaveProduct')?.addEventListener('click', saveProduct);
  document.getElementById('btnAnalyze')?.addEventListener('click', analyzeUrl);

  // Add account buttons
  document.getElementById('btnAddAccount')?.addEventListener('click', () => openModal('modalAddAccount'));
  document.getElementById('btnAddAccountEmpty')?.addEventListener('click', () => openModal('modalAddAccount'));
  document.getElementById('btnSaveAccount')?.addEventListener('click', saveAccount);

  // Auto-registration buttons
  document.getElementById('btnSetupGmail')?.addEventListener('click', setupGmail);
  document.getElementById('btnAutoRegister')?.addEventListener('click', autoRegister);
  document.getElementById('registerPlatforms')?.addEventListener('change', updateRegisterButton);
  document.getElementById('btnSelectAll')?.addEventListener('click', selectAllPlatforms);
  document.getElementById('btnDeselectAll')?.addEventListener('click', deselectAllPlatforms);

  // Publish buttons
  document.getElementById('btnGenerate')?.addEventListener('click', generateContent);
  document.getElementById('btnSimulate')?.addEventListener('click', simulatePublish);
  document.getElementById('btnPublish')?.addEventListener('click', publishAll);

  // Settings buttons
  document.getElementById('btnSaveAI')?.addEventListener('click', saveAISettings);
  document.getElementById('btnSaveScheduler')?.addEventListener('click', saveSchedulerSettings);
  document.getElementById('aiProvider')?.addEventListener('change', updateModelOptions);
}

function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

// Tabs
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Update tabs
        tabGroup.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update content
        const tabId = tab.dataset.tab;
        const parent = tabGroup.parentElement;
        parent.querySelectorAll('.tab-content').forEach(content => {
          content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
      });
    });
  });
}

// Load initial data
async function loadInitialData() {
  try {
    products = await window.api.products.list();
    aiProviders = await window.api.ai.providers();
    await loadProducts();
  } catch (error) {
    console.error('Failed to load initial data:', error);
    showToast('Failed to load data', 'error');
  }
}

// Products
async function loadProducts() {
  try {
    products = await window.api.products.list();
    renderProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyProducts');

  if (products.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  grid.style.display = 'grid';
  empty.style.display = 'none';

  grid.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-header">
        <span class="product-name">${escapeHtml(product.name)}</span>
        <span class="product-type">${product.type}</span>
      </div>
      <div class="product-tagline">${escapeHtml(product.tagline || '')}</div>
      <div class="product-url">${escapeHtml(product.url)}</div>
      <div class="product-meta">
        <span>Priority: ${product.priority}</span>
        <span>Weight: ${product.weight}</span>
      </div>
      <div class="product-actions">
        <button class="btn btn-secondary btn-small" onclick="previewProduct('${product.id}')">Preview</button>
        <button class="btn btn-primary btn-small" onclick="quickPublish('${product.id}')">Publish</button>
        <button class="btn btn-danger btn-small" onclick="deleteProduct('${product.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

async function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const url = document.getElementById('productUrl').value.trim();
  const tagline = document.getElementById('productTagline').value.trim();
  const description = document.getElementById('productDescription').value.trim();
  const type = document.getElementById('productType').value;
  const priority = parseInt(document.getElementById('productPriority').value) || 5;

  if (!name || !url) {
    showToast('Name and URL are required', 'error');
    return;
  }

  try {
    await window.api.products.create({
      name,
      url,
      tagline,
      description,
      type,
      priority,
      weight: 5,
      recommendedPlatforms: ['twitter', 'linkedin', 'reddit', 'hackernews'],
      recommendedLanguages: ['en', 'zh']
    });

    closeModal('modalAddProduct');
    clearProductForm();
    await loadProducts();
    showToast('Product added successfully', 'success');
  } catch (error) {
    showToast('Failed to add product: ' + error.message, 'error');
  }
}

function clearProductForm() {
  document.getElementById('productName').value = '';
  document.getElementById('productUrl').value = '';
  document.getElementById('productTagline').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('productType').value = 'tool';
  document.getElementById('productPriority').value = '5';
}

async function analyzeUrl() {
  const url = document.getElementById('analyzeUrl').value.trim();
  if (!url) {
    showToast('Please enter a URL', 'error');
    return;
  }

  const btn = document.getElementById('btnAnalyze');
  const spinner = btn.querySelector('.loading-spinner');
  const text = btn.querySelector('span:last-child');

  spinner.style.display = 'inline-block';
  text.textContent = 'Analyzing...';
  btn.disabled = true;

  try {
    const result = await window.api.products.analyze(url);

    // Show result
    const resultDiv = document.getElementById('analyzeResult');
    resultDiv.innerHTML = `
      <div class="preview-item" style="margin-top: 15px;">
        <h4>${escapeHtml(result.name)}</h4>
        <p>${escapeHtml(result.tagline || '')}</p>
        <p class="text-muted">${escapeHtml(result.description || '')}</p>
        <button class="btn btn-primary btn-full" style="margin-top: 10px;" onclick="saveAnalyzedProduct()">Save This Product</button>
      </div>
    `;
    resultDiv.style.display = 'block';

    // Store analyzed data
    window.analyzedProduct = result;
  } catch (error) {
    showToast('Failed to analyze URL: ' + error.message, 'error');
  } finally {
    spinner.style.display = 'none';
    text.textContent = 'Analyze URL';
    btn.disabled = false;
  }
}

async function saveAnalyzedProduct() {
  if (!window.analyzedProduct) return;

  try {
    await window.api.products.create({
      name: window.analyzedProduct.name,
      url: window.analyzedProduct.url,
      tagline: window.analyzedProduct.tagline,
      description: window.analyzedProduct.description,
      type: window.analyzedProduct.type || 'tool',
      features: window.analyzedProduct.features,
      recommendedPlatforms: window.analyzedProduct.recommendedPlatforms,
      recommendedLanguages: window.analyzedProduct.recommendedLanguages,
      priority: 5,
      weight: 5
    });

    closeModal('modalAddProduct');
    await loadProducts();
    showToast('Product added successfully', 'success');
  } catch (error) {
    showToast('Failed to save product: ' + error.message, 'error');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    await window.api.products.delete(id);
    await loadProducts();
    showToast('Product deleted', 'success');
  } catch (error) {
    showToast('Failed to delete product: ' + error.message, 'error');
  }
}

function previewProduct(id) {
  navigateTo('publish');
  document.getElementById('publishProduct').value = id;
}

function quickPublish(id) {
  navigateTo('publish');
  document.getElementById('publishProduct').value = id;
  generateContent();
}

// Publish Page
async function loadPublishPage() {
  const select = document.getElementById('publishProduct');
  select.innerHTML = '<option value="">Choose a product...</option>' +
    products.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
}

async function generateContent() {
  const productId = document.getElementById('publishProduct').value;
  if (!productId) {
    showToast('Please select a product', 'error');
    return;
  }

  const platforms = getSelectedValues('platformsGroup');
  const languages = getSelectedValues('languagesGroup');

  if (platforms.length === 0 || languages.length === 0) {
    showToast('Please select at least one platform and language', 'error');
    return;
  }

  const btn = document.getElementById('btnGenerate');
  btn.disabled = true;
  btn.textContent = 'Generating...';

  try {
    // Check if AI is configured
    const aiConfigured = await window.api.ai.isConfigured();

    if (!aiConfigured) {
      // Generate demo content
      const product = products.find(p => p.id === productId);
      generatedContents = generateDemoContent(product, platforms, languages);
    } else {
      generatedContents = await window.api.content.generate(productId, platforms, languages);
    }

    renderPreview();
    document.getElementById('btnPublish').disabled = false;
    showToast(`Generated ${generatedContents.length} content items`, 'success');
  } catch (error) {
    showToast('Failed to generate content: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Generate Content';
  }
}

function generateDemoContent(product, platforms, languages) {
  const contents = [];
  const templates = {
    twitter: {
      en: (p) => `🚀 ${p.name} - ${p.tagline || 'Check it out!'}\n\n${(p.features || []).slice(0, 2).join(' | ')}\n\n👉 ${p.url}`,
      zh: (p) => `🚀 ${p.name} - ${p.tagline || '值得一试!'}\n\n${(p.features || []).slice(0, 2).join(' | ')}\n\n👉 ${p.url}`
    },
    linkedin: {
      en: (p) => `I'm excited to share ${p.name}!\n\n${p.description || p.tagline || ''}\n\nKey features:\n${(p.features || []).slice(0, 3).map(f => '• ' + f).join('\n')}\n\nLearn more: ${p.url}`,
      zh: (p) => `很高兴向大家介绍 ${p.name}！\n\n${p.description || p.tagline || ''}\n\n主要功能：\n${(p.features || []).slice(0, 3).map(f => '• ' + f).join('\n')}\n\n了解更多：${p.url}`
    },
    reddit: {
      en: (p) => `${p.name} - ${p.tagline || ''}\n\n${p.description || ''}\n\nHas anyone tried this? Share your experience!\n\n${p.url}`,
      zh: (p) => `${p.name} - ${p.tagline || ''}\n\n${p.description || ''}\n\n有人用过吗？欢迎分享！\n\n${p.url}`
    }
  };

  for (const platform of platforms) {
    for (const language of languages) {
      const template = templates[platform]?.[language] || templates[platform]?.en || templates.twitter.en;
      contents.push({
        platform,
        language,
        productId: product.id,
        body: template(product),
        hashtags: ['tech', 'productivity', 'tools']
      });
    }
  }

  return contents;
}

function renderPreview() {
  const tabs = document.getElementById('previewTabs');
  const content = document.getElementById('previewContent');

  if (generatedContents.length === 0) {
    content.innerHTML = '<div class="preview-placeholder"><p>No content generated</p></div>';
    tabs.innerHTML = '';
    return;
  }

  // Render tabs
  const uniqueKeys = [...new Set(generatedContents.map(c => `${c.platform}-${c.language}`))];
  tabs.innerHTML = uniqueKeys.map((key, i) =>
    `<button class="preview-tab ${i === 0 ? 'active' : ''}" data-key="${key}">${key}</button>`
  ).join('');

  // Add tab click handlers
  tabs.querySelectorAll('.preview-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.querySelectorAll('.preview-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      showPreviewContent(tab.dataset.key);
    });
  });

  // Show first content
  showPreviewContent(uniqueKeys[0]);
}

function showPreviewContent(key) {
  const content = document.getElementById('previewContent');
  const [platform, language] = key.split('-');
  const item = generatedContents.find(c => c.platform === platform && c.language === language);

  if (!item) {
    content.innerHTML = '<div class="preview-placeholder"><p>Content not found</p></div>';
    return;
  }

  content.innerHTML = `
    <div class="preview-item">
      <div class="preview-item-header">
        <span>${platform}</span>
        <span>${language}</span>
      </div>
      <div class="preview-item-body">${escapeHtml(item.body)}</div>
      ${item.hashtags?.length ? `<div class="preview-item-hashtags">${item.hashtags.map(h => '#' + h).join(' ')}</div>` : ''}
    </div>
  `;
}

async function simulatePublish() {
  if (generatedContents.length === 0) {
    showToast('No content to publish', 'error');
    return;
  }

  showToast(`Simulated publishing ${generatedContents.length} items`, 'success');
}

async function publishAll() {
  if (generatedContents.length === 0) {
    showToast('No content to publish', 'error');
    return;
  }

  const btn = document.getElementById('btnPublish');
  btn.disabled = true;
  btn.textContent = 'Publishing...';

  try {
    const results = await window.api.publish.all(generatedContents);
    const successCount = [...results.values()].filter(r => r.success).length;
    showToast(`Published ${successCount}/${generatedContents.length} items`, 'success');
  } catch (error) {
    showToast('Failed to publish: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Publish All';
  }
}

// Accounts
async function loadAccounts() {
  try {
    accounts = await window.api.accounts.list();
    renderAccounts();
    await loadGmailStatus();
  } catch (error) {
    console.error('Failed to load accounts:', error);
  }
}

function renderAccounts() {
  const list = document.getElementById('accountsList');
  const empty = document.getElementById('emptyAccounts');

  if (accounts.length === 0) {
    list.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  list.style.display = 'flex';
  empty.style.display = 'none';

  const icons = {
    twitter: '🐦',
    linkedin: '💼',
    reddit: '🤖',
    facebook: '👤',
    devto: '👩‍💻',
    medium: '📝',
    discord: '💬',
    telegram: '✈️',
    mastodon: '🐘',
    weibo: '🌐'
  };

  list.innerHTML = accounts.map(account => `
    <div class="account-item">
      <div class="account-info">
        <span class="account-platform">${icons[account.platform] || '📱'}</span>
        <div class="account-details">
          <h4>${account.platform}</h4>
          <span>${account.username || account.email || 'API Key'}</span>
        </div>
      </div>
      <button class="btn btn-danger btn-small" onclick="deleteAccount('${account.id}')">Remove</button>
    </div>
  `).join('');
}

async function saveAccount() {
  const platform = document.getElementById('accountPlatform').value;
  const username = document.getElementById('accountUsername').value.trim();
  const password = document.getElementById('accountPassword').value;

  if (!username || !password) {
    showToast('Username and password are required', 'error');
    return;
  }

  try {
    await window.api.accounts.add(platform, { username, password });
    closeModal('modalAddAccount');
    document.getElementById('accountUsername').value = '';
    document.getElementById('accountPassword').value = '';
    await loadAccounts();
    showToast('Account added successfully', 'success');
  } catch (error) {
    showToast('Failed to add account: ' + error.message, 'error');
  }
}

async function deleteAccount(id) {
  if (!confirm('Are you sure you want to remove this account?')) return;

  try {
    await window.api.accounts.delete(id);
    await loadAccounts();
    showToast('Account removed', 'success');
  } catch (error) {
    showToast('Failed to remove account: ' + error.message, 'error');
  }
}

// Auto-registration
async function loadGmailStatus() {
  try {
    const status = await window.api.register.gmailStatus();
    const badge = document.getElementById('gmailBadge');
    const email = document.getElementById('gmailEmail');
    const btn = document.getElementById('btnSetupGmail');

    if (status.connected) {
      badge.textContent = 'Connected';
      badge.className = 'status-badge online';
      email.textContent = status.email;
      btn.textContent = 'Reconnect Gmail';
    } else {
      badge.textContent = 'Not Connected';
      badge.className = 'status-badge offline';
      email.textContent = '';
      btn.textContent = 'Connect Gmail';
    }

    // Load platforms
    await loadRegisterPlatforms();
  } catch (error) {
    console.error('Failed to get Gmail status:', error);
  }
}

async function loadRegisterPlatforms() {
  try {
    const platforms = await window.api.register.platforms();
    const container = document.getElementById('registerPlatforms');

    const categoryNames = {
      international: '🌍 International Social',
      developer: '👨‍💻 Developer Platforms',
      chinese: '🇨🇳 Chinese Platforms',
      japanese: '🇯🇵 Japanese Platforms',
      korean: '🇰🇷 Korean Platforms',
      messaging: '💬 Messaging'
    };

    let html = '';
    for (const [category, items] of Object.entries(platforms)) {
      html += `<div class="platform-category" style="margin-bottom: 15px;">
        <h4 style="font-size: 13px; color: var(--text-muted); margin-bottom: 8px;">${categoryNames[category] || category}</h4>
        <div class="checkbox-group">`;

      for (const p of items) {
        const phoneIcon = p.phone ? ' 📱' : '';
        const oauthIcon = p.googleOAuth ? ' 🔗' : '';
        html += `<label class="checkbox"><input type="checkbox" value="${p.id}"> ${p.name}${phoneIcon}${oauthIcon}</label>`;
      }

      html += '</div></div>';
    }

    container.innerHTML = html;

    // Re-attach change listener
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', updateRegisterButton);
    });
  } catch (error) {
    console.error('Failed to load platforms:', error);
  }
}

async function setupGmail() {
  const btn = document.getElementById('btnSetupGmail');
  btn.disabled = true;
  btn.textContent = 'Opening browser...';

  try {
    await window.api.register.setupGmail();
    await loadGmailStatus();
    showToast('Gmail connected successfully', 'success');
  } catch (error) {
    showToast('Failed to connect Gmail: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    await loadGmailStatus();
  }
}

function updateRegisterButton() {
  const checkboxes = document.querySelectorAll('#registerPlatforms input:checked');
  const btn = document.getElementById('btnAutoRegister');
  btn.disabled = checkboxes.length === 0;
  btn.textContent = checkboxes.length > 0
    ? `Auto-Login/Register ${checkboxes.length} Platform(s)`
    : 'Auto-Login/Register Selected';
}

function selectAllPlatforms() {
  const checkboxes = document.querySelectorAll('#registerPlatforms input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = true);
  updateRegisterButton();
}

function deselectAllPlatforms() {
  const checkboxes = document.querySelectorAll('#registerPlatforms input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  updateRegisterButton();
}

async function autoRegister() {
  const checkboxes = document.querySelectorAll('#registerPlatforms input:checked');
  const platforms = Array.from(checkboxes).map(cb => cb.value);

  if (platforms.length === 0) {
    showToast('Please select at least one platform', 'error');
    return;
  }

  // Check Gmail status first
  const status = await window.api.register.gmailStatus();
  if (!status.connected) {
    showToast('Please connect Gmail first', 'error');
    return;
  }

  const btn = document.getElementById('btnAutoRegister');
  const progress = document.getElementById('registerProgress');
  btn.disabled = true;
  progress.style.display = 'block';
  progress.innerHTML = '<p>Starting registration...</p>';

  try {
    for (const platform of platforms) {
      progress.innerHTML += `<p>📝 Registering ${platform}...</p>`;

      const result = await window.api.register.start(platform);

      if (result.success) {
        progress.innerHTML += `<p style="color: var(--success);">✓ ${platform}: @${result.username}</p>`;
      } else if (result.needsManualVerification) {
        progress.innerHTML += `<p style="color: var(--warning);">⚠ ${platform}: ${result.verificationReason}</p>`;
      } else {
        progress.innerHTML += `<p style="color: var(--danger);">✗ ${platform}: ${result.error}</p>`;
      }
    }

    progress.innerHTML += '<p><strong>Registration complete!</strong></p>';
    await loadAccounts();
    showToast('Registration process completed', 'success');
  } catch (error) {
    showToast('Registration failed: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    updateRegisterButton();
  }
}

// Stats
async function loadStats() {
  try {
    const stats = await window.api.stats.get({ days: 30 });

    document.getElementById('statPosts').textContent = stats.totalPosts || 0;
    document.getElementById('statViews').textContent = formatNumber(stats.totalViews || 0);
    document.getElementById('statEngagements').textContent = formatNumber(stats.totalEngagements || 0);
    document.getElementById('statRate').textContent = ((stats.avgEngagementRate || 0) * 100).toFixed(2) + '%';

    // Platform stats
    const platformStats = document.getElementById('platformStats');
    if (stats.byPlatform && stats.byPlatform.length > 0) {
      platformStats.innerHTML = stats.byPlatform.map(p => `
        <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border);">
          <span>${p.platform}</span>
          <span>${p.posts} posts | ${formatNumber(p.views)} views | ${formatNumber(p.engagements)} engagements</span>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Settings
async function loadSettings() {
  try {
    const config = await window.api.config.get();

    // AI settings
    document.getElementById('aiProvider').value = config.ai?.provider || 'openai';
    updateModelOptions();
    document.getElementById('aiModel').value = config.ai?.model || '';
    document.getElementById('aiApiKey').value = config.ai?.apiKey || '';

    // Browser
    document.getElementById('unzooPath').value = config.browser?.unzooPath || '';

    // Scheduler
    document.getElementById('schedulerMode').value = config.scheduler?.mode || 'weighted';
    document.getElementById('schedulerInterval').value = config.scheduler?.intervalMinutes || 60;
    document.getElementById('schedulerMaxPosts').value = config.scheduler?.maxDailyPosts || 50;

    // Check browser status detail
    const status = await window.api.browser.status();
    const badge = document.querySelector('#browserStatusDetail .status-badge');
    if (status) {
      badge.textContent = 'Connected';
      badge.className = 'status-badge online';
    } else {
      badge.textContent = 'Not Found';
      badge.className = 'status-badge offline';
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

function updateModelOptions() {
  const provider = document.getElementById('aiProvider').value;
  const modelSelect = document.getElementById('aiModel');
  const apiKeyHelp = document.getElementById('apiKeyHelp');
  const providerInfo = aiProviders[provider];

  if (providerInfo && providerInfo.models) {
    modelSelect.innerHTML = providerInfo.models.map(m =>
      `<option value="${m}">${m}</option>`
    ).join('');
  }

  // Update help text based on provider
  const helpTexts = {
    'openrouter': '从 openrouter.ai/keys 获取（可用 Claude/GPT/Gemini）',
    'anthropic': '从 console.anthropic.com 获取',
    'openai': '从 platform.openai.com 获取',
    'google': '从 aistudio.google.com 获取',
    'deepseek': '从 platform.deepseek.com 获取（价格便宜）',
    'qwen': '从阿里云 DashScope 获取',
    'glm': '从智谱 AI 开放平台获取',
    'kimi': '从 platform.moonshot.cn 获取'
  };

  if (apiKeyHelp) {
    apiKeyHelp.textContent = helpTexts[provider] || '';
  }
}

async function saveAISettings() {
  const provider = document.getElementById('aiProvider').value;
  const model = document.getElementById('aiModel').value;
  const apiKey = document.getElementById('aiApiKey').value;

  try {
    await window.api.ai.configure(provider, model, apiKey);
    document.getElementById('aiSaveStatus').textContent = '✓ Saved';
    setTimeout(() => {
      document.getElementById('aiSaveStatus').textContent = '';
    }, 2000);
  } catch (error) {
    showToast('Failed to save AI settings: ' + error.message, 'error');
  }
}

async function saveSchedulerSettings() {
  const mode = document.getElementById('schedulerMode').value;
  const interval = parseInt(document.getElementById('schedulerInterval').value);
  const maxPosts = parseInt(document.getElementById('schedulerMaxPosts').value);

  try {
    await window.api.config.set('scheduler.mode', mode);
    await window.api.config.set('scheduler.intervalMinutes', interval);
    await window.api.config.set('scheduler.maxDailyPosts', maxPosts);
    showToast('Scheduler settings saved', 'success');
  } catch (error) {
    showToast('Failed to save settings: ' + error.message, 'error');
  }
}

// Browser status
async function checkBrowserStatus() {
  try {
    const available = await window.api.browser.status();
    const indicator = document.getElementById('browserStatus');
    const dot = indicator.querySelector('.status-dot');
    const text = indicator.querySelector('.status-text');

    if (available) {
      dot.classList.add('online');
      text.textContent = 'Unzoo Online';
    } else {
      dot.classList.add('offline');
      text.textContent = 'Unzoo Offline';
    }
  } catch (error) {
    console.error('Failed to check browser status:', error);
  }
}

// Utilities
function getSelectedValues(groupId) {
  const group = document.getElementById(groupId);
  const checked = group.querySelectorAll('input:checked');
  return Array.from(checked).map(input => input.value);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '✗'}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
