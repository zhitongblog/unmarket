/**
 * TaskStore - persistence layer for tasks (SQLite).
 *
 * Tasks survive restarts so the 7x24 scheduler can resume after a crash
 * or reboot. All queue/scheduler/executor logic reads and writes through here.
 */
import { getDatabase, generateId } from '../../storage/database.js';
import { createLogger } from '../../utils/logger.js';
const logger = createLogger('task-store');
export class TaskStore {
    /** Create and persist a new task (status = pending). */
    create(input) {
        const db = getDatabase();
        const id = generateId();
        const stmt = db.prepare(`
      INSERT INTO tasks (
        id, type, status, priority, platform, account_id, product_id,
        payload, retry_count, max_retries, scheduled_at
      ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, 0, ?, ?)
    `);
        stmt.run(id, input.type, input.priority ?? 5, input.platform ?? null, input.accountId ?? null, input.productId ?? null, JSON.stringify(input.payload ?? {}), input.maxRetries ?? 3, input.scheduledAt ? input.scheduledAt.toISOString() : null);
        logger.info('Task created', { id, type: input.type, platform: input.platform });
        return this.getById(id);
    }
    getById(id) {
        const db = getDatabase();
        const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
        return row ? this.rowToTask(row) : null;
    }
    /**
     * Claim the next runnable task: highest priority, then oldest, among
     * pending tasks whose scheduled_at has arrived. Atomically flips it to
     * 'running' so concurrent workers never grab the same task.
     *
     * `excludeTypes` lets the scheduler suppress certain work (e.g. outbound
     * publish/engage during quiet hours) without touching other task types.
     */
    claimNext(opts = {}) {
        const db = getDatabase();
        const exclude = opts.excludeTypes ?? [];
        const excludeClause = exclude.length
            ? `AND type NOT IN (${exclude.map(() => '?').join(',')})`
            : '';
        const claim = db.transaction(() => {
            const row = db.prepare(`
        SELECT * FROM tasks
        WHERE status = 'pending'
          AND (scheduled_at IS NULL OR scheduled_at <= datetime('now'))
          ${excludeClause}
        ORDER BY priority DESC, created_at ASC
        LIMIT 1
      `).get(...exclude);
            if (!row)
                return null;
            db.prepare(`
        UPDATE tasks
        SET status = 'running', started_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).run(row.id);
            return this.getById(row.id);
        });
        return claim();
    }
    /** Mark a task finished successfully, storing its result. */
    markSuccess(id, result) {
        const db = getDatabase();
        db.prepare(`
      UPDATE tasks
      SET status = 'success', result = ?, completed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(JSON.stringify(result ?? {}), id);
        logger.info('Task success', { id });
    }
    /**
     * Mark a task failed. If retries remain, it is re-queued as pending with
     * an exponential-backoff scheduled_at; otherwise it stays failed.
     * Returns true if the task was re-queued for retry.
     */
    markFailed(id, error) {
        const db = getDatabase();
        const task = this.getById(id);
        if (!task)
            return false;
        if (task.retryCount < task.maxRetries) {
            const nextRetry = task.retryCount + 1;
            const backoffMs = Math.min(2 ** nextRetry * 60_000, 60 * 60_000); // cap 1h
            const nextAt = new Date(Date.now() + backoffMs);
            db.prepare(`
        UPDATE tasks
        SET status = 'pending', retry_count = ?, error = ?,
            scheduled_at = ?, started_at = NULL, updated_at = datetime('now')
        WHERE id = ?
      `).run(nextRetry, error, nextAt.toISOString(), id);
            logger.warn('Task failed, will retry', { id, retry: nextRetry, nextAt: nextAt.toISOString() });
            return true;
        }
        db.prepare(`
      UPDATE tasks
      SET status = 'failed', error = ?, completed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(error, id);
        logger.error('Task failed permanently', { id, error });
        return false;
    }
    /** Block a task pending human intervention (CAPTCHA, phone, review...). */
    markBlocked(id, reason, detail) {
        const db = getDatabase();
        db.prepare(`
      UPDATE tasks
      SET status = 'blocked', blocked_reason = ?, error = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(reason, detail ?? null, id);
        logger.warn('Task blocked, needs human', { id, reason });
    }
    /** Resume a blocked task — put it back to pending so a worker picks it up. */
    unblock(id) {
        const db = getDatabase();
        const res = db.prepare(`
      UPDATE tasks
      SET status = 'pending', blocked_reason = NULL, started_at = NULL, updated_at = datetime('now')
      WHERE id = ? AND status = 'blocked'
    `).run(id);
        if (res.changes > 0)
            logger.info('Task unblocked', { id });
        return res.changes > 0;
    }
    cancel(id) {
        const db = getDatabase();
        const res = db.prepare(`
      UPDATE tasks
      SET status = 'cancelled', updated_at = datetime('now')
      WHERE id = ? AND status IN ('pending', 'blocked')
    `).run(id);
        return res.changes > 0;
    }
    /** List tasks, optionally filtered by status and/or type. */
    list(filter = {}) {
        const db = getDatabase();
        const where = [];
        const params = [];
        if (filter.status) {
            where.push('status = ?');
            params.push(filter.status);
        }
        if (filter.type) {
            where.push('type = ?');
            params.push(filter.type);
        }
        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const limit = filter.limit ?? 100;
        const rows = db.prepare(`
      SELECT * FROM tasks ${whereClause}
      ORDER BY priority DESC, created_at DESC
      LIMIT ?
    `).all(...params, limit);
        return rows.map(r => this.rowToTask(r));
    }
    getBlocked() {
        return this.list({ status: 'blocked' });
    }
    /** Count tasks grouped by status. */
    countByStatus() {
        const db = getDatabase();
        const rows = db.prepare(`SELECT status, COUNT(*) as count FROM tasks GROUP BY status`).all();
        const out = {};
        for (const r of rows)
            out[r.status] = r.count;
        return out;
    }
    /**
     * Recover orphaned 'running' tasks left over from a crash by resetting
     * them to 'pending'. Called once on scheduler startup.
     */
    recoverStaleRunning() {
        const db = getDatabase();
        const res = db.prepare(`
      UPDATE tasks
      SET status = 'pending', started_at = NULL, updated_at = datetime('now')
      WHERE status = 'running'
    `).run();
        if (res.changes > 0)
            logger.warn('Recovered stale running tasks', { count: res.changes });
        return res.changes;
    }
    /** Delete finished tasks older than N days. Returns rows removed. */
    pruneCompleted(olderThanDays = 30) {
        const db = getDatabase();
        const res = db.prepare(`
      DELETE FROM tasks
      WHERE status IN ('success', 'cancelled')
        AND completed_at < datetime('now', ?)
    `).run(`-${olderThanDays} days`);
        return res.changes;
    }
    rowToTask(row) {
        return {
            id: row.id,
            type: row.type,
            status: row.status,
            priority: row.priority,
            platform: row.platform ?? undefined,
            accountId: row.account_id ?? undefined,
            productId: row.product_id ?? undefined,
            payload: row.payload ? JSON.parse(row.payload) : {},
            result: row.result ? JSON.parse(row.result) : undefined,
            retryCount: row.retry_count,
            maxRetries: row.max_retries,
            scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : undefined,
            startedAt: row.started_at ? new Date(row.started_at) : undefined,
            completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
            error: row.error ?? undefined,
            blockedReason: row.blocked_reason ?? undefined,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }
}
let instance = null;
export function getTaskStore() {
    if (!instance)
        instance = new TaskStore();
    return instance;
}
//# sourceMappingURL=task-store.js.map