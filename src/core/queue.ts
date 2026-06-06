/**
 * Queue management for scheduled publishing
 */
import { getDatabase, generateId, type QueueTask } from '../storage/database.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('queue');

export interface QueueAddInput {
  productId: string;
  platform: string;
  language?: string;
  content?: string;
  scheduledAt?: Date;
}

export interface QueueTaskInfo {
  id: string;
  product: string;
  platform: string;
  language: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scheduledAt: Date;
  error?: string;
}

export class Queue {
  private paused = false;

  /**
   * Add task to queue
   */
  add(input: QueueAddInput): QueueTaskInfo {
    const db = getDatabase();
    const id = generateId();

    const scheduledAt = input.scheduledAt || new Date();

    const stmt = db.prepare(`
      INSERT INTO queue (id, product_id, platform, language, content, status, scheduled_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `);

    stmt.run(
      id,
      input.productId,
      input.platform,
      input.language || 'en',
      input.content || null,
      scheduledAt.toISOString()
    );

    logger.info('Task added to queue', { id, platform: input.platform });

    return {
      id,
      product: input.productId,
      platform: input.platform,
      language: input.language || 'en',
      status: 'pending',
      scheduledAt
    };
  }

  /**
   * List queue tasks
   */
  list(includeCompleted = false): QueueTaskInfo[] {
    const db = getDatabase();

    const sql = includeCompleted
      ? `SELECT q.*, p.name as product_name FROM queue q
         LEFT JOIN products p ON q.product_id = p.id
         ORDER BY scheduled_at DESC`
      : `SELECT q.*, p.name as product_name FROM queue q
         LEFT JOIN products p ON q.product_id = p.id
         WHERE q.status IN ('pending', 'running')
         ORDER BY scheduled_at ASC`;

    const stmt = db.prepare(sql);
    const rows = stmt.all() as Array<QueueTask & { product_name: string }>;

    return rows.map(row => ({
      id: row.id,
      product: row.product_name || row.product_id,
      platform: row.platform,
      language: row.language,
      status: row.status as QueueTaskInfo['status'],
      scheduledAt: new Date(row.scheduled_at),
      error: row.error
    }));
  }

  /**
   * Get next pending task
   */
  getNext(): QueueTask | null {
    if (this.paused) return null;

    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM queue
      WHERE status = 'pending' AND scheduled_at <= datetime('now')
      ORDER BY scheduled_at ASC
      LIMIT 1
    `);

    return (stmt.get() as QueueTask) || null;
  }

  /**
   * Mark task as running
   */
  markRunning(id: string): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE queue SET status = 'running', started_at = datetime('now') WHERE id = ?
    `);
    stmt.run(id);
  }

  /**
   * Mark task as completed
   */
  markCompleted(id: string): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE queue SET status = 'completed', completed_at = datetime('now') WHERE id = ?
    `);
    stmt.run(id);
    logger.info('Task completed', { id });
  }

  /**
   * Mark task as failed
   */
  markFailed(id: string, error: string): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE queue SET status = 'failed', completed_at = datetime('now'), error = ? WHERE id = ?
    `);
    stmt.run(error, id);
    logger.error('Task failed', { id, error });
  }

  /**
   * Remove task from queue
   */
  remove(id: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM queue WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes > 0) {
      logger.info('Task removed from queue', { id });
      return true;
    }
    return false;
  }

  /**
   * Clear all pending tasks
   */
  clear(): number {
    const db = getDatabase();
    const stmt = db.prepare("DELETE FROM queue WHERE status = 'pending'");
    const result = stmt.run();
    logger.info('Queue cleared', { count: result.changes });
    return result.changes;
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.paused = true;
    this.saveState('paused', 'true');
    logger.info('Queue paused');
  }

  /**
   * Resume queue processing
   */
  resume(): void {
    this.paused = false;
    this.saveState('paused', 'false');
    logger.info('Queue resumed');
  }

  /**
   * Check if queue is paused
   */
  isPaused(): boolean {
    const state = this.loadState('paused');
    return state === 'true';
  }

  /**
   * Get queue statistics
   */
  getStats(): { pending: number; running: number; completed: number; failed: number } {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT status, COUNT(*) as count FROM queue GROUP BY status
    `);
    const rows = stmt.all() as Array<{ status: string; count: number }>;

    const stats = { pending: 0, running: 0, completed: 0, failed: 0 };
    for (const row of rows) {
      if (row.status in stats) {
        stats[row.status as keyof typeof stats] = row.count;
      }
    }

    return stats;
  }

  /**
   * Retry failed tasks
   */
  retryFailed(): number {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE queue SET status = 'pending', error = NULL, started_at = NULL, completed_at = NULL
      WHERE status = 'failed'
    `);
    const result = stmt.run();
    logger.info('Retrying failed tasks', { count: result.changes });
    return result.changes;
  }

  /**
   * Clean old completed tasks
   */
  cleanOld(daysOld = 30): number {
    const db = getDatabase();
    const stmt = db.prepare(`
      DELETE FROM queue
      WHERE status IN ('completed', 'failed')
      AND completed_at < datetime('now', '-' || ? || ' days')
    `);
    const result = stmt.run(daysOld);
    return result.changes;
  }

  private saveState(key: string, value: string): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO session_state (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
    stmt.run(key, value);
  }

  private loadState(key: string): string | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT value FROM session_state WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    return row?.value || null;
  }
}
