/**
 * Configuration manager - YAML-based configuration
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { parse, stringify } from 'yaml';
const CONFIG_DIR = join(homedir(), '.unmarket');
const CONFIG_FILE = join(CONFIG_DIR, 'config.yaml');
const DEFAULT_CONFIG = {
    version: '0.1.0',
    initialized: false,
    dataDir: CONFIG_DIR,
    ai: {
        provider: 'openai',
        model: 'gpt-4.1',
        apiKey: undefined,
        baseUrl: undefined
    },
    browser: {
        unzooPath: process.platform === 'win32'
            ? 'C:\\Program Files\\Unzoo Browser\\services\\unzoo-cli.exe'
            : '/usr/local/bin/unzoo',
        headless: false,
        timeout: 30000
    },
    scheduler: {
        mode: 'weighted',
        intervalMinutes: 60,
        maxDailyPosts: 50,
        quietHours: { start: 0, end: 6 }
    },
    languages: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'ru', 'ar'],
    defaultPlatforms: ['twitter', 'reddit', 'hackernews', 'producthunt', 'linkedin']
};
export class ConfigManager {
    config;
    constructor() {
        this.config = this.load();
    }
    /**
     * Load configuration from file
     */
    load() {
        if (!existsSync(CONFIG_DIR)) {
            mkdirSync(CONFIG_DIR, { recursive: true });
        }
        if (!existsSync(CONFIG_FILE)) {
            return { ...DEFAULT_CONFIG };
        }
        try {
            const content = readFileSync(CONFIG_FILE, 'utf-8');
            const parsed = parse(content);
            return { ...DEFAULT_CONFIG, ...parsed };
        }
        catch {
            return { ...DEFAULT_CONFIG };
        }
    }
    /**
     * Save configuration to file
     */
    save() {
        const content = stringify(this.config, { indent: 2 });
        writeFileSync(CONFIG_FILE, content, 'utf-8');
    }
    /**
     * Get entire configuration
     */
    getAll() {
        return { ...this.config };
    }
    /**
     * Get a specific configuration value by path
     */
    get(path) {
        const parts = path.split('.');
        let current = this.config;
        for (const part of parts) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }
            current = current[part];
        }
        return current;
    }
    /**
     * Set a configuration value by path
     */
    set(path, value) {
        const parts = path.split('.');
        let current = this.config;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current) || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
        this.save();
    }
    /**
     * Reset configuration to defaults
     */
    reset() {
        this.config = { ...DEFAULT_CONFIG };
        this.save();
    }
    /**
     * Check if initialized
     */
    isInitialized() {
        return this.config.initialized;
    }
    /**
     * Mark as initialized
     */
    markInitialized() {
        this.config.initialized = true;
        this.save();
    }
    /**
     * Get AI configuration
     */
    getAIConfig() {
        return { ...this.config.ai };
    }
    /**
     * Set AI configuration
     */
    setAIConfig(config) {
        this.config.ai = { ...this.config.ai, ...config };
        this.save();
    }
    /**
     * Get browser configuration
     */
    getBrowserConfig() {
        return { ...this.config.browser };
    }
    /**
     * Get scheduler configuration
     */
    getSchedulerConfig() {
        return { ...this.config.scheduler };
    }
    /**
     * Get supported languages
     */
    getLanguages() {
        return [...this.config.languages];
    }
    /**
     * Get default platforms
     */
    getDefaultPlatforms() {
        return [...this.config.defaultPlatforms];
    }
}
// Singleton instance
let instance = null;
export function getConfigManager() {
    if (!instance) {
        instance = new ConfigManager();
    }
    return instance;
}
//# sourceMappingURL=config.js.map