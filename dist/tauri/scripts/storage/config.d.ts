export interface AIConfig {
    provider: string;
    model: string;
    apiKey?: string;
    baseUrl?: string;
}
export interface BrowserConfig {
    unzooPath: string;
    headless: boolean;
    timeout: number;
}
export interface SchedulerConfig {
    mode: 'round-robin' | 'weighted' | 'priority' | 'smart';
    intervalMinutes: number;
    maxDailyPosts: number;
    quietHours: {
        start: number;
        end: number;
    };
}
export interface UnmarketConfig {
    version: string;
    initialized: boolean;
    dataDir: string;
    ai: AIConfig;
    browser: BrowserConfig;
    scheduler: SchedulerConfig;
    languages: string[];
    defaultPlatforms: string[];
}
export declare class ConfigManager {
    private config;
    constructor();
    /**
     * Load configuration from file
     */
    private load;
    /**
     * Save configuration to file
     */
    save(): void;
    /**
     * Get entire configuration
     */
    getAll(): UnmarketConfig;
    /**
     * Get a specific configuration value by path
     */
    get<T = unknown>(path: string): T | undefined;
    /**
     * Set a configuration value by path
     */
    set(path: string, value: unknown): void;
    /**
     * Reset configuration to defaults
     */
    reset(): void;
    /**
     * Check if initialized
     */
    isInitialized(): boolean;
    /**
     * Mark as initialized
     */
    markInitialized(): void;
    /**
     * Get AI configuration
     */
    getAIConfig(): AIConfig;
    /**
     * Set AI configuration
     */
    setAIConfig(config: Partial<AIConfig>): void;
    /**
     * Get browser configuration
     */
    getBrowserConfig(): BrowserConfig;
    /**
     * Get scheduler configuration
     */
    getSchedulerConfig(): SchedulerConfig;
    /**
     * Get supported languages
     */
    getLanguages(): string[];
    /**
     * Get default platforms
     */
    getDefaultPlatforms(): string[];
}
export declare function getConfigManager(): ConfigManager;
//# sourceMappingURL=config.d.ts.map