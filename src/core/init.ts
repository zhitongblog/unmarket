/**
 * Application initialization
 */
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { getConfigManager } from '../storage/config.js';
import { initDatabase } from '../storage/database.js';
import { getUnzooClient } from '../browser/unzoo-client.js';
import { getAIEngine } from './ai-engine.js';
import { cliLogger as logger } from '../utils/logger.js';

export interface InitStatus {
  configReady: boolean;
  databaseReady: boolean;
  unzooAvailable: boolean;
  aiConfigured: boolean;
  errors: string[];
  warnings: string[];
}

export async function initialize(): Promise<InitStatus> {
  return initializeApp();
}

export async function initializeApp(): Promise<InitStatus> {
  const status: InitStatus = {
    configReady: false,
    databaseReady: false,
    unzooAvailable: false,
    aiConfigured: false,
    errors: [],
    warnings: []
  };

  // Create data directory
  const dataDir = join(homedir(), '.unmarket');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
    logger.info('Created data directory', { path: dataDir });
  }

  // Initialize config
  try {
    const config = getConfigManager();
    status.configReady = true;

    if (!config.isInitialized()) {
      config.markInitialized();
      logger.info('Configuration initialized');
    }
  } catch (error) {
    status.errors.push(`Config error: ${(error as Error).message}`);
  }

  // Initialize database
  try {
    initDatabase();
    status.databaseReady = true;
  } catch (error) {
    status.errors.push(`Database error: ${(error as Error).message}`);
  }

  // Check Unzoo availability
  try {
    const unzoo = getUnzooClient();
    status.unzooAvailable = await unzoo.isAvailable();

    if (!status.unzooAvailable) {
      status.warnings.push('Unzoo browser not found. Browser automation will not work.');
    }
  } catch (error) {
    status.warnings.push('Could not check Unzoo availability');
  }

  // Check AI configuration
  try {
    const ai = getAIEngine();
    status.aiConfigured = ai.isConfigured();

    if (!status.aiConfigured) {
      status.warnings.push('AI not configured. Run: unmarket ai config');
    }
  } catch (error) {
    status.warnings.push('Could not check AI configuration');
  }

  return status;
}

/**
 * Check if already initialized
 */
export function isInitialized(): boolean {
  const configFile = join(homedir(), '.unmarket', 'config.yaml');
  return existsSync(configFile);
}

/**
 * Reset all data
 */
export async function reset(): Promise<void> {
  const { closeDatabase } = await import('../storage/database.js');
  closeDatabase();

  const dataDir = join(homedir(), '.unmarket');

  // Remove all files in data directory
  const fs = await import('fs');
  const files = fs.readdirSync(dataDir);

  for (const file of files) {
    const filePath = join(dataDir, file);
    fs.unlinkSync(filePath);
  }

  logger.info('All data reset');
}

/**
 * Show system status
 */
export async function getSystemStatus(): Promise<{
  version: string;
  dataDir: string;
  products: number;
  accounts: number;
  posts: number;
  queuePending: number;
}> {
  const config = getConfigManager();
  const { getDatabase } = await import('../storage/database.js');
  const db = getDatabase();

  // Count products
  const productsCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }).count;

  // Count accounts
  const accountsCount = (db.prepare('SELECT COUNT(*) as count FROM accounts').get() as { count: number }).count;

  // Count posts
  const postsCount = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number }).count;

  // Count pending queue
  const queueCount = (db.prepare("SELECT COUNT(*) as count FROM queue WHERE status = 'pending'").get() as { count: number }).count;

  return {
    version: config.get('version') as string,
    dataDir: config.get('dataDir') as string,
    products: productsCount,
    accounts: accountsCount,
    posts: postsCount,
    queuePending: queueCount
  };
}
