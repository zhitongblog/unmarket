/**
 * UnMarket Desktop - Preload Script
 * Exposes safe APIs to renderer process
 */
import { contextBridge, ipcRenderer } from 'electron';
// Expose protected methods to renderer
contextBridge.exposeInMainWorld('api', {
    // Products
    products: {
        list: () => ipcRenderer.invoke('products:list'),
        get: (id) => ipcRenderer.invoke('products:get', id),
        create: (data) => ipcRenderer.invoke('products:create', data),
        update: (id, data) => ipcRenderer.invoke('products:update', id, data),
        delete: (id) => ipcRenderer.invoke('products:delete', id),
        analyze: (url) => ipcRenderer.invoke('products:analyze', url)
    },
    // Content
    content: {
        generate: (productId, platforms, languages) => ipcRenderer.invoke('content:generate', productId, platforms, languages),
        preview: (productId, platform, language) => ipcRenderer.invoke('content:preview', productId, platform, language)
    },
    // Publishing
    publish: {
        one: (content) => ipcRenderer.invoke('publish:one', content),
        all: (contents) => ipcRenderer.invoke('publish:all', contents)
    },
    // Config
    config: {
        get: () => ipcRenderer.invoke('config:get'),
        set: (path, value) => ipcRenderer.invoke('config:set', path, value)
    },
    // AI
    ai: {
        providers: () => ipcRenderer.invoke('ai:providers'),
        configure: (provider, model, apiKey) => ipcRenderer.invoke('ai:configure', provider, model, apiKey),
        isConfigured: () => ipcRenderer.invoke('ai:isConfigured')
    },
    // Accounts
    accounts: {
        list: () => ipcRenderer.invoke('accounts:list'),
        add: (platform, credentials) => ipcRenderer.invoke('accounts:add', platform, credentials),
        delete: (id) => ipcRenderer.invoke('accounts:delete', id)
    },
    // Stats
    stats: {
        get: (query) => ipcRenderer.invoke('stats:get', query),
        product: (productId) => ipcRenderer.invoke('stats:product', productId)
    },
    // Browser
    browser: {
        status: () => ipcRenderer.invoke('browser:status')
    },
    // Dialog
    dialog: {
        openFile: () => ipcRenderer.invoke('dialog:openFile')
    },
    // Shell
    shell: {
        openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url)
    },
    // Navigation events
    onNavigate: (callback) => {
        ipcRenderer.on('navigate', (_, page) => callback(page));
    }
});
//# sourceMappingURL=preload.js.map