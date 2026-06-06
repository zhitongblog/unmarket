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

-- Tasks table (unified task engine: register/nurture/generate/publish/engage)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                 -- register | nurture | generate | publish | engage
  status TEXT DEFAULT 'pending',      -- pending | running | success | failed | blocked | cancelled
  priority INTEGER DEFAULT 5,         -- 1 (low) .. 10 (high)
  platform TEXT,
  account_id TEXT,
  product_id TEXT,
  payload TEXT,                       -- JSON task parameters
  result TEXT,                        -- JSON task result
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_at TEXT,                  -- earliest time to run (NULL = ASAP)
  started_at TEXT,
  completed_at TEXT,
  error TEXT,
  blocked_reason TEXT,                -- why human intervention is needed
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Nurture log table (account warming history)
CREATE TABLE IF NOT EXISTS nurture_logs (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  action TEXT NOT NULL,               -- browse | like | follow | comment | profile
  detail TEXT,                        -- JSON action detail
  duration_seconds INTEGER DEFAULT 0,
  success INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_product ON posts(product_id);
CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_scheduled ON queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_analytics_post ON analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
CREATE INDEX IF NOT EXISTS idx_tasks_scheduled ON tasks(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_nurture_account ON nurture_logs(account_id);
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