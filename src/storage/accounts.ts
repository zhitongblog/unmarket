/**
 * Account storage with encryption
 */
import { getDatabase, generateId, type Account } from './database.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('accounts');

export interface AccountCredentials {
  username?: string;
  password?: string;
  email?: string;
  token?: string;
  cookies?: Record<string, string>;
  apiKey?: string;
  loginMethod?: 'password' | 'google_oauth' | 'api_key';
  extra?: Record<string, unknown>;
}

export interface AccountInfo {
  id: string;
  platform: string;
  username?: string;
  email?: string;
  status: 'active' | 'suspended' | 'expired' | 'needs_verification';
  lastUsed?: Date;
  createdAt: Date;
}

export class AccountManager {
  /**
   * Add a new account
   */
  add(platform: string, credentials: AccountCredentials): AccountInfo {
    const db = getDatabase();
    const id = generateId();
    const encryptedCreds = encrypt(JSON.stringify(credentials));

    const stmt = db.prepare(`
      INSERT INTO accounts (id, platform, username, email, credentials, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `);

    stmt.run(id, platform, credentials.username, credentials.email, encryptedCreds);

    logger.info('Account added', { platform, username: credentials.username });

    return {
      id,
      platform,
      username: credentials.username,
      email: credentials.email,
      status: 'active',
      createdAt: new Date()
    };
  }

  /**
   * Get account by ID
   */
  getById(id: string): AccountInfo | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM accounts WHERE id = ?');
    const row = stmt.get(id) as Account | undefined;

    if (!row) return null;

    return this.rowToInfo(row);
  }

  /**
   * Get account by platform and username
   */
  getByPlatform(platform: string, username?: string): AccountInfo | null {
    const db = getDatabase();

    let stmt;
    let row: Account | undefined;

    if (username) {
      stmt = db.prepare('SELECT * FROM accounts WHERE platform = ? AND username = ?');
      row = stmt.get(platform, username) as Account | undefined;
    } else {
      stmt = db.prepare('SELECT * FROM accounts WHERE platform = ? ORDER BY last_used DESC LIMIT 1');
      row = stmt.get(platform) as Account | undefined;
    }

    if (!row) return null;

    return this.rowToInfo(row);
  }

  /**
   * Get credentials for an account
   */
  getCredentials(id: string): AccountCredentials | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT credentials FROM accounts WHERE id = ?');
    const row = stmt.get(id) as { credentials: string } | undefined;

    if (!row) return null;

    try {
      const decrypted = decrypt(row.credentials);
      return JSON.parse(decrypted) as AccountCredentials;
    } catch (error) {
      logger.error('Failed to decrypt credentials', { id, error });
      return null;
    }
  }

  /**
   * Update account credentials
   */
  updateCredentials(id: string, credentials: Partial<AccountCredentials>): boolean {
    const existing = this.getCredentials(id);
    if (!existing) return false;

    const merged = { ...existing, ...credentials };
    const encrypted = encrypt(JSON.stringify(merged));

    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE accounts
      SET credentials = ?, username = ?, email = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    stmt.run(encrypted, merged.username, merged.email, id);

    logger.info('Account credentials updated', { id });
    return true;
  }

  /**
   * Update account status
   */
  updateStatus(id: string, status: AccountInfo['status']): boolean {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE accounts SET status = ?, updated_at = datetime('now') WHERE id = ?
    `);

    const result = stmt.run(status, id);
    return result.changes > 0;
  }

  /**
   * Mark account as used
   */
  markUsed(id: string): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE accounts SET last_used = datetime('now') WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * List all accounts
   */
  list(platform?: string): AccountInfo[] {
    const db = getDatabase();

    let stmt;
    let rows: Account[];

    if (platform) {
      stmt = db.prepare('SELECT * FROM accounts WHERE platform = ? ORDER BY created_at DESC');
      rows = stmt.all(platform) as Account[];
    } else {
      stmt = db.prepare('SELECT * FROM accounts ORDER BY platform, created_at DESC');
      rows = stmt.all() as Account[];
    }

    return rows.map(row => this.rowToInfo(row));
  }

  /**
   * Delete account
   */
  delete(id: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM accounts WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes > 0) {
      logger.info('Account deleted', { id });
      return true;
    }
    return false;
  }

  /**
   * Get account count by platform
   */
  countByPlatform(): Record<string, number> {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT platform, COUNT(*) as count FROM accounts GROUP BY platform
    `);
    const rows = stmt.all() as Array<{ platform: string; count: number }>;

    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.platform] = row.count;
    }
    return result;
  }

  /**
   * Find accounts needing verification
   */
  findNeedingVerification(): AccountInfo[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM accounts WHERE status = 'needs_verification'
    `);
    const rows = stmt.all() as Account[];

    return rows.map(row => this.rowToInfo(row));
  }

  private rowToInfo(row: Account): AccountInfo {
    return {
      id: row.id,
      platform: row.platform,
      username: row.username,
      email: row.email,
      status: row.status as AccountInfo['status'],
      lastUsed: row.last_used ? new Date(row.last_used) : undefined,
      createdAt: new Date(row.created_at)
    };
  }
}

// Singleton instance
let instance: AccountManager | null = null;

export function getAccountManager(): AccountManager {
  if (!instance) {
    instance = new AccountManager();
  }
  return instance;
}
