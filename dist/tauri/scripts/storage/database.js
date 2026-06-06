/**
 * SQLite database manager
 */
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { dbLogger } from '../utils/logger.js';
const DB_DIR = join(homedir(), '.unmarket');
const DB_FILE = join(DB_DIR, 'unmarket.db');
// Database schema
const SCHEMA = `
-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  tagline TEXT,
  description TEXT,
  type TEXT DEFAULT 'tool',
  logo_url TEXT,
  screenshots TEXT, -- JSON array
  features TEXT, -- JSON array
  recommended_platforms TEXT, -- JSON array
  recommended_languages TEXT, -- JSON array
  weight INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  username TEXT,
  email TEXT,
  credentials TEXT NOT NULL, -- Encrypted JSON
  status TEXT DEFAULT 'active',
  last_used TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(platform, username)
);

-- Published posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  language TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  url TEXT,
  status TEXT DEFAULT 'pending',
  views INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Queue table
CREATE TABLE IF NOT EXISTS queue (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  content TEXT, -- JSON with generated content
  status TEXT DEFAULT 'pending',
  scheduled_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  error TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  date TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagements INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Platform configs table
CREATE TABLE IF NOT EXISTS platform_configs (
  platform TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  region TEXT NOT NULL,
  type TEXT NOT NULL, -- api, browser, hybrid
  api_base_url TEXT,
  rate_limit INTEGER DEFAULT 100,
  features TEXT, -- JSON array
  config TEXT, -- JSON object
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Session state table (for scheduler)
CREATE TABLE IF NOT EXISTS session_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_product ON posts(product_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_scheduled ON queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_analytics_post ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);
`;
let db = null;
/**
 * Initialize database connection
 */
export function initDatabase() {
    if (db)
        return db;
    if (!existsSync(DB_DIR)) {
        mkdirSync(DB_DIR, { recursive: true });
    }
    db = new Database(DB_FILE);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    // Run schema
    db.exec(SCHEMA);
    dbLogger.info('Database initialized', { path: DB_FILE });
    return db;
}
/**
 * Get database instance
 */
export function getDatabase() {
    if (!db) {
        return initDatabase();
    }
    return db;
}
/**
 * Close database connection
 */
export function closeDatabase() {
    if (db) {
        db.close();
        db = null;
        dbLogger.info('Database closed');
    }
}
/**
 * Generate UUID
 */
export function generateId() {
    return crypto.randomUUID();
}
//# sourceMappingURL=database.js.map