/**
 * Configuration manager - YAML-based configuration
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { parse, stringify } from 'yaml';

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
  quietHours: { start: number; end: number };
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

const CONFIG_DIR = join(homedir(), '.unmarket');
const CONFIG_FILE = join(CONFIG_DIR, 'config.yaml');

const DEFAULT_CONFIG: UnmarketConfig = {
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
  private config: UnmarketConfig;

  constructor() {
    this.config = this.load();
  }

  /**
   * Load configuration from file
   */
  private load(): UnmarketConfig {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }

    if (!existsSync(CONFIG_FILE)) {
      return { ...DEFAULT_CONFIG };
    }

    try {
      const content = readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = parse(content) as Partial<UnmarketConfig>;
      return { ...DEFAULT_CONFIG, ...parsed };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  /**
   * Save configuration to file
   */
  save(): void {
    const content = stringify(this.config, { indent: 2 });
    writeFileSync(CONFIG_FILE, content, 'utf-8');
  }

  /**
   * Get entire configuration
   */
  getAll(): UnmarketConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value by path
   */
  get<T = unknown>(path: string): T | undefined {
    const parts = path.split('.');
    let current: unknown = this.config;

    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }

    return current as T;
  }

  /**
   * Set a configuration value by path
   */
  set(path: string, value: unknown): void {
    const parts = path.split('.');
    let current: Record<string, unknown> = this.config as unknown as Record<string, unknown>;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
    this.save();
  }

  /**
   * Reset configuration to defaults
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.save();
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.config.initialized;
  }

  /**
   * Mark as initialized
   */
  markInitialized(): void {
    this.config.initialized = true;
    this.save();
  }

  /**
   * Get AI configuration
   */
  getAIConfig(): AIConfig {
    return { ...this.config.ai };
  }

  /**
   * Set AI configuration
   */
  setAIConfig(config: Partial<AIConfig>): void {
    this.config.ai = { ...this.config.ai, ...config };
    this.save();
  }

  /**
   * Get browser configuration
   */
  getBrowserConfig(): BrowserConfig {
    return { ...this.config.browser };
  }

  /**
   * Get scheduler configuration
   */
  getSchedulerConfig(): SchedulerConfig {
    return { ...this.config.scheduler };
  }

  /**
   * Get supported languages
   */
  getLanguages(): string[] {
    return [...this.config.languages];
  }

  /**
   * Get default platforms
   */
  getDefaultPlatforms(): string[] {
    return [...this.config.defaultPlatforms];
  }
}

// Singleton instance
let instance: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!instance) {
    instance = new ConfigManager();
  }
  return instance;
}
