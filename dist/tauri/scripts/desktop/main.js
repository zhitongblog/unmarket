/**
 * UnMarket Desktop - Electron Main Process
 */
import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron';
import { join } from 'path';
import { fileURLToPath } from 'url';
// Import core modules
import { getProductManager } from '../core/product-manager.js';
import { getAIEngine, AI_PROVIDERS } from '../core/ai-engine.js';
import { getConfigManager } from '../storage/config.js';
import { getAccountManager } from '../storage/accounts.js';
import { ContentGenerator } from '../core/content-generator.js';
import { Publisher } from '../core/publisher.js';
import { Analytics } from '../core/analytics.js';
import { Crawler } from '../core/crawler.js';
import { AccountRegistrar } from '../core/account-registrar.js';
import { initDatabase } from '../storage/database.js';
import { getUnzooClient } from '../browser/unzoo-client.js';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
let mainWindow = null;
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'UnMarket',
        backgroundColor: '#1a1a2e',
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });
    // Load the UI
    mainWindow.loadFile(join(__dirname, 'renderer', 'index.html'));
    // Open DevTools
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// Create application menu
function createMenu() {
    const template = [
        {
            label: 'UnMarket',
            submenu: [
                { label: 'About UnMarket', role: 'about' },
                { type: 'separator' },
                { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => mainWindow?.webContents.send('navigate', 'settings') },
                { type: 'separator' },
                { label: 'Quit', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: () => shell.openExternal('https://github.com/unzooai/unmarket')
                },
                {
                    label: 'Report Issue',
                    click: () => shell.openExternal('https://github.com/unzooai/unmarket/issues')
                }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}
// Initialize app
app.whenReady().then(() => {
    // Initialize database
    initDatabase();
    createWindow();
    createMenu();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// ============== IPC Handlers ==============
// Products
ipcMain.handle('products:list', async () => {
    const manager = getProductManager();
    return manager.list(false);
});
ipcMain.handle('products:get', async (_, id) => {
    const manager = getProductManager();
    return manager.getById(id);
});
ipcMain.handle('products:create', async (_, data) => {
    try {
        console.log('Creating product:', data);
        const manager = getProductManager();
        const result = manager.add(data);
        console.log('Product created:', result);
        return result;
    }
    catch (error) {
        console.error('Failed to create product:', error);
        throw error;
    }
});
ipcMain.handle('products:update', async (_, id, data) => {
    const manager = getProductManager();
    return manager.update(id, data);
});
ipcMain.handle('products:delete', async (_, id) => {
    const manager = getProductManager();
    return manager.delete(id);
});
ipcMain.handle('products:analyze', async (_, url) => {
    const crawler = new Crawler();
    return crawler.analyze(url);
});
// Content Generation
ipcMain.handle('content:generate', async (_, productId, platforms, languages) => {
    const manager = getProductManager();
    const product = manager.getById(productId);
    if (!product)
        throw new Error('Product not found');
    const generator = new ContentGenerator();
    return generator.generate(product, { platforms, languages });
});
ipcMain.handle('content:preview', async (_, productId, platform, language) => {
    const manager = getProductManager();
    const product = manager.getById(productId);
    if (!product)
        throw new Error('Product not found');
    const generator = new ContentGenerator();
    return generator.generateOne(product, platform, language);
});
// Publishing
ipcMain.handle('publish:one', async (_, content) => {
    const publisher = new Publisher();
    return publisher.publishOne(content);
});
ipcMain.handle('publish:all', async (_, contents) => {
    const publisher = new Publisher();
    return publisher.publishAll(contents);
});
// Config
ipcMain.handle('config:get', async () => {
    const config = getConfigManager();
    return config.getAll();
});
ipcMain.handle('config:set', async (_, path, value) => {
    const config = getConfigManager();
    config.set(path, value);
    return true;
});
// AI
ipcMain.handle('ai:providers', async () => {
    return AI_PROVIDERS;
});
ipcMain.handle('ai:configure', async (_, provider, model, apiKey) => {
    const ai = getAIEngine();
    ai.configure(provider, model, apiKey);
    return true;
});
ipcMain.handle('ai:isConfigured', async () => {
    const ai = getAIEngine();
    return ai.isConfigured();
});
// Accounts
ipcMain.handle('accounts:list', async () => {
    const manager = getAccountManager();
    return manager.list();
});
ipcMain.handle('accounts:add', async (_, platform, credentials) => {
    const manager = getAccountManager();
    return manager.add(platform, credentials);
});
ipcMain.handle('accounts:delete', async (_, id) => {
    const manager = getAccountManager();
    return manager.delete(id);
});
// Registration
ipcMain.handle('register:gmailStatus', async () => {
    const registrar = new AccountRegistrar();
    return registrar.getGmailStatus();
});
ipcMain.handle('register:setupGmail', async () => {
    const registrar = new AccountRegistrar();
    return registrar.setupGmail();
});
ipcMain.handle('register:platforms', async () => {
    return {
        international: [
            { id: 'twitter', name: 'Twitter/X', phone: true, googleOAuth: true },
            { id: 'linkedin', name: 'LinkedIn', phone: true, googleOAuth: true },
            { id: 'facebook', name: 'Facebook', phone: true },
            { id: 'instagram', name: 'Instagram' },
            { id: 'reddit', name: 'Reddit', googleOAuth: true },
            { id: 'mastodon', name: 'Mastodon' }
        ],
        developer: [
            { id: 'github', name: 'GitHub' },
            { id: 'devto', name: 'DEV.to', googleOAuth: true },
            { id: 'hackernews', name: 'Hacker News' },
            { id: 'producthunt', name: 'Product Hunt', googleOAuth: true },
            { id: 'hashnode', name: 'Hashnode', googleOAuth: true },
            { id: 'medium', name: 'Medium', googleOAuth: true },
            { id: 'indiehackers', name: 'Indie Hackers', googleOAuth: true }
        ],
        chinese: [
            { id: 'weibo', name: '微博', phone: true },
            { id: 'zhihu', name: '知乎', phone: true },
            { id: 'juejin', name: '掘金', googleOAuth: true },
            { id: 'v2ex', name: 'V2EX', googleOAuth: true },
            { id: 'csdn', name: 'CSDN', phone: true },
            { id: 'oschina', name: '开源中国' },
            { id: 'segmentfault', name: 'SegmentFault', googleOAuth: true },
            { id: 'xiaohongshu', name: '小红书', phone: true },
            { id: 'bilibili', name: 'Bilibili', phone: true }
        ],
        japanese: [
            { id: 'qiita', name: 'Qiita', googleOAuth: true },
            { id: 'zenn', name: 'Zenn', googleOAuth: true },
            { id: 'note', name: 'note' }
        ],
        korean: [
            { id: 'velog', name: 'Velog', googleOAuth: true }
        ],
        messaging: [
            { id: 'discord', name: 'Discord' },
            { id: 'telegram', name: 'Telegram', phone: true },
            { id: 'slack', name: 'Slack', googleOAuth: true }
        ]
    };
});
ipcMain.handle('register:start', async (_, platform) => {
    const registrar = new AccountRegistrar();
    return registrar.register(platform);
});
ipcMain.handle('register:all', async (_, platforms) => {
    const registrar = new AccountRegistrar();
    return registrar.registerAll(platforms);
});
// Analytics
ipcMain.handle('stats:get', async (_, query) => {
    const analytics = new Analytics();
    return analytics.getStats(query);
});
ipcMain.handle('stats:product', async (_, productId) => {
    const analytics = new Analytics();
    return analytics.getProductPerformance(productId);
});
// Browser
ipcMain.handle('browser:status', async () => {
    const client = getUnzooClient();
    return client.isAvailable();
});
// Dialog
ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    return result.filePaths[0];
});
// Shell
ipcMain.handle('shell:openExternal', async (_, url) => {
    await shell.openExternal(url);
});
//# sourceMappingURL=main.js.map