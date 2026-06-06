/**
 * Queue management for scheduled publishing
 */
import { getDatabase, generateId } from '../storage/database.js';
import { createLogger } from '../utils/logger.js';
const logger = createLogger('queue');
export class Queue {
    paused = false;
    /**
     * Add task to queue
     */
    add(input) {
        const db = getDatabase();
        const id = generateId();
        const scheduledAt = input.scheduledAt || new Date();
        const stmt = db.prepare(`
      INSERT INTO queue (id, product_id, platform, language, content, status, scheduled_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `);
        stmt.run(id, input.productId, input.platform, input.language || 'en', input.content || null, scheduledAt.toISOString());
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
    list(includeCompleted = false) {
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
        const rows = stmt.all();
        return rows.map(row => ({
            id: row.id,
            product: row.product_name || row.product_id,
            platform: row.platform,
            language: row.language,
            status: row.status,
            scheduledAt: new Date(row.scheduled_at),
            error: row.error
        }));
    }
    /**
     * Get next pending task
     */
    getNext() {
        if (this.paused)
            return null;
        const db = getDatabase();
        const stmt = db.prepare(`
      SELECT * FROM queue
      WHERE status = 'pending' AND scheduled_at <= datetime('now')
      ORDER BY scheduled_at ASC
      LIMIT 1
    `);
        return stmt.get() || null;
    }
    /**
     * Mark task as running
     */
    markRunning(id) {
        const db = getDatabase();
        const stmt = db.prepare(`
      UPDATE queue SET status = 'running', started_at = datetime('now') WHERE id = ?
    `);
        stmt.run(id);
    }
    /**
     * Mark task as completed
     */
    markCompleted(id) {
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
    markFailed(id, error) {
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
    remove(id) {
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
    clear() {
        const db = getDatabase();
        const stmt = db.prepare("DELETE FROM queue WHERE status = 'pending'");
        const result = stmt.run();
        logger.info('Queue cleared', { count: result.changes });
        return result.changes;
    }
    /**
     * Pause queue processing
     */
    pause() {
        this.paused = true;
        this.saveState('paused', 'true');
        logger.info('Queue paused');
    }
    /**
     * Resume queue processing
     */
    resume() {
        this.paused = false;
        this.saveState('paused', 'false');
        logger.info('Queue resumed');
    }
    /**
     * Check if queue is paused
     */
    isPaused() {
        const state = this.loadState('paused');
        return state === 'true';
    }
    /**
     * Get queue statistics
     */
    getStats() {
        const db = getDatabase();
        const stmt = db.prepare(`
      SELECT status, COUNT(*) as count FROM queue GROUP BY status
    `);
        const rows = stmt.all();
        const stats = { pending: 0, running: 0, completed: 0, failed: 0 };
        for (const row of rows) {
            if (row.status in stats) {
                stats[row.status] = row.count;
            }
        }
        return stats;
    }
    /**
     * Retry failed tasks
     */
    retryFailed() {
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
    cleanOld(daysOld = 30) {
        const db = getDatabase();
        const stmt = db.prepare(`
      DELETE FROM queue
      WHERE status IN ('completed', 'failed')
      AND completed_at < datetime('now', '-' || ? || ' days')
    `);
        const result = stmt.run(daysOld);
        return result.changes;
    }
    saveState(key, value) {
        const db = getDatabase();
        const stmt = db.prepare(`
      INSERT OR REPLACE INTO session_state (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
        stmt.run(key, value);
    }
    loadState(key) {
        const db = getDatabase();
        const stmt = db.prepare('SELECT value FROM session_state WHERE key = ?');
        const row = stmt.get(key);
        return row?.value || null;
    }
}
//# sourceMappingURL=queue.js.map