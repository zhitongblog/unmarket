/**
 * Multi-product scheduler
 * Supports: round-robin, weighted, priority, smart scheduling
 */
import { getProductManager, type ProductInfo } from './product-manager.js';
import { getConfigManager } from '../storage/config.js';
import { ContentGenerator } from './content-generator.js';
import { Publisher } from './publisher.js';
import { Queue } from './queue.js';
import { schedulerLogger as logger } from '../utils/logger.js';

export type ScheduleMode = 'round-robin' | 'weighted' | 'priority' | 'smart';

export interface SchedulerOptions {
  products?: string[];
  duration?: string;
  onPublish?: (result: { product: string; platform: string; success: boolean }) => void;
}

export interface SchedulerStatus {
  running: boolean;
  mode?: ScheduleMode;
  startedAt?: string;
  tasksCompleted: number;
  tasksPending: number;
  lastPublish?: string;
}

export class MultiProductScheduler {
  private running = false;
  private mode: ScheduleMode = 'weighted';
  private startedAt?: Date;
  private tasksCompleted = 0;
  private lastPublish?: Date;
  private stopRequested = false;

  private productManager = getProductManager();
  private contentGenerator = new ContentGenerator();
  private publisher = new Publisher();
  private queue = new Queue();

  /**
   * Start the scheduler
   */
  async start(mode: ScheduleMode, options: SchedulerOptions = {}): Promise<void> {
    if (this.running) {
      throw new Error('Scheduler is already running');
    }

    this.mode = mode;
    this.running = true;
    this.startedAt = new Date();
    this.stopRequested = false;

    const config = getConfigManager().getSchedulerConfig();
    const intervalMs = config.intervalMinutes * 60 * 1000;

    logger.info('Scheduler started', { mode, interval: config.intervalMinutes });

    // Get products to schedule
    let products = this.productManager.getForScheduling();
    if (options.products) {
      products = products.filter(p => options.products!.includes(p.id));
    }

    if (products.length === 0) {
      throw new Error('No products available for scheduling');
    }

    // Parse duration
    const durationMs = options.duration ? this.parseDuration(options.duration) : null;
    const endTime = durationMs ? Date.now() + durationMs : null;

    // Main scheduling loop
    let productIndex = 0;

    while (!this.stopRequested) {
      // Check duration limit
      if (endTime && Date.now() >= endTime) {
        logger.info('Duration limit reached, stopping scheduler');
        break;
      }

      // Check quiet hours
      if (this.isQuietHours()) {
        await this.sleep(60000); // Check every minute during quiet hours
        continue;
      }

      // Select next product based on mode
      const product = this.selectProduct(products, productIndex);
      productIndex = (productIndex + 1) % products.length;

      // Select platform and language
      const platform = this.selectPlatform(product);
      const language = this.selectLanguage(product);

      try {
        // Generate content
        const content = await this.contentGenerator.generateOne(product, platform, language);

        // Publish
        const result = await this.publisher.publishOne(content);

        this.tasksCompleted++;
        this.lastPublish = new Date();

        if (options.onPublish) {
          options.onPublish({
            product: product.name,
            platform,
            success: result.success
          });
        }

        logger.info('Published', {
          product: product.name,
          platform,
          language,
          success: result.success
        });
      } catch (error) {
        logger.error('Publish failed', { product: product.name, platform, error });
      }

      // Wait for next interval
      await this.sleep(intervalMs);
    }

    this.running = false;
    logger.info('Scheduler stopped');
  }

  /**
   * Start in daemon mode
   */
  async startDaemon(mode: ScheduleMode, options: SchedulerOptions = {}): Promise<void> {
    // Save state for daemon
    this.saveState('running', 'true');
    this.saveState('mode', mode);
    this.saveState('startedAt', new Date().toISOString());

    // Start in background
    this.start(mode, options).catch(error => {
      logger.error('Daemon error', { error });
      this.saveState('running', 'false');
    });
  }

  /**
   * Stop the scheduler
   */
  async stop(): Promise<void> {
    this.stopRequested = true;
    this.saveState('running', 'false');
    logger.info('Stop requested');
  }

  /**
   * Get scheduler status
   */
  async getStatus(): Promise<SchedulerStatus> {
    const runningState = this.loadState('running');

    return {
      running: runningState === 'true' || this.running,
      mode: (this.loadState('mode') as ScheduleMode) || this.mode,
      startedAt: this.loadState('startedAt') || this.startedAt?.toISOString(),
      tasksCompleted: this.tasksCompleted,
      tasksPending: this.queue.getStats().pending,
      lastPublish: this.lastPublish?.toISOString()
    };
  }

  /**
   * Select product based on mode
   */
  private selectProduct(products: ProductInfo[], currentIndex: number): ProductInfo {
    switch (this.mode) {
      case 'round-robin':
        return products[currentIndex];

      case 'weighted':
        return this.selectWeighted(products);

      case 'priority':
        return this.selectByPriority(products);

      case 'smart':
        return this.selectSmart(products);

      default:
        return products[currentIndex];
    }
  }

  /**
   * Select product by weight
   */
  private selectWeighted(products: ProductInfo[]): ProductInfo {
    const totalWeight = products.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;

    for (const product of products) {
      random -= product.weight;
      if (random <= 0) {
        return product;
      }
    }

    return products[0];
  }

  /**
   * Select by priority
   */
  private selectByPriority(products: ProductInfo[]): ProductInfo {
    const sorted = [...products].sort((a, b) => b.priority - a.priority);
    return sorted[0];
  }

  /**
   * Smart selection based on performance
   */
  private selectSmart(products: ProductInfo[]): ProductInfo {
    // TODO: Implement smart selection based on analytics
    // For now, fall back to weighted
    return this.selectWeighted(products);
  }

  /**
   * Select platform for product
   */
  private selectPlatform(product: ProductInfo): string {
    const platforms = product.recommendedPlatforms;
    if (platforms.length === 0) {
      return 'twitter';
    }
    return platforms[Math.floor(Math.random() * platforms.length)];
  }

  /**
   * Select language for product
   */
  private selectLanguage(product: ProductInfo): string {
    const languages = product.recommendedLanguages;
    if (languages.length === 0) {
      return 'en';
    }
    return languages[Math.floor(Math.random() * languages.length)];
  }

  /**
   * Check if in quiet hours
   */
  private isQuietHours(): boolean {
    const config = getConfigManager().getSchedulerConfig();
    const hour = new Date().getHours();
    const { start, end } = config.quietHours;

    if (start < end) {
      return hour >= start && hour < end;
    } else {
      // Spans midnight
      return hour >= start || hour < end;
    }
  }

  /**
   * Parse duration string (e.g., "24h", "7d")
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([hmd])$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error(`Invalid duration unit: ${unit}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private saveState(key: string, value: string): void {
    const { getDatabase } = require('../storage/database.js');
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO session_state (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
    stmt.run(`scheduler_${key}`, value);
  }

  private loadState(key: string): string | null {
    const { getDatabase } = require('../storage/database.js');
    const db = getDatabase();
    const stmt = db.prepare('SELECT value FROM session_state WHERE key = ?');
    const row = stmt.get(`scheduler_${key}`) as { value: string } | undefined;
    return row?.value || null;
  }
}
