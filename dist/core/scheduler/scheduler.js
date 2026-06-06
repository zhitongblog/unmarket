/**
 * Scheduler - the 7x24 daemon that drains the task queue.
 *
 * Responsibilities:
 *  - On startup, recover tasks left 'running' by a previous crash.
 *  - Run a worker loop: claim the next runnable task and execute it.
 *  - Honour quiet hours by suppressing outbound posting (publish/engage)
 *    while still allowing nurturing / registration / generation.
 *  - Host recurring cron jobs (e.g. periodically enqueue campaign work).
 *
 * Triggers are unified: "manual" and "event" triggers are just callers
 * enqueueing tasks; the scheduler doesn't care how a task arrived.
 */
import cron from 'node-cron';
import { getConfigManager } from '../../storage/config.js';
import { getDatabase } from '../../storage/database.js';
import { getTaskQueue } from '../task/task-queue.js';
import { getTaskStore } from '../task/task-store.js';
import { getExecutor } from '../executor/executor.js';
import { schedulerLogger as logger } from '../../utils/logger.js';
/** Task types considered "outbound posting" — suppressed in quiet hours. */
const POSTING_TYPES = ['publish', 'engage'];
export class Scheduler {
    running = false;
    stopRequested = false;
    startedAt;
    tasksProcessed = 0;
    lastTaskAt;
    loopPromise;
    queue = getTaskQueue();
    store = getTaskStore();
    executor = getExecutor();
    cronJobs = new Map();
    /** Start the daemon. Resolves once the worker loop has begun. */
    async start(options = {}) {
        if (this.running)
            throw new Error('Scheduler already running');
        const pollIntervalMs = options.pollIntervalMs ?? 5000;
        const respectQuietHours = options.respectQuietHours ?? true;
        // Crash recovery: requeue orphaned running tasks.
        this.store.recoverStaleRunning();
        this.running = true;
        this.stopRequested = false;
        this.startedAt = new Date();
        this.persist('scheduler_running', '1');
        this.persist('scheduler_started_at', this.startedAt.toISOString());
        this.persist('scheduler_heartbeat', this.startedAt.toISOString());
        logger.info('Scheduler started', { pollIntervalMs, respectQuietHours });
        this.loopPromise = this.workerLoop(pollIntervalMs, respectQuietHours);
    }
    /** Request a graceful stop and wait for the loop to finish. */
    async stop() {
        if (!this.running)
            return;
        logger.info('Scheduler stopping...');
        this.stopRequested = true;
        for (const [expr, job] of this.cronJobs) {
            job.stop();
            logger.debug('Cron job stopped', { expr });
        }
        this.cronJobs.clear();
        await this.loopPromise;
        this.running = false;
        this.persist('scheduler_running', '0');
        logger.info('Scheduler stopped', { tasksProcessed: this.tasksProcessed });
    }
    isRunning() {
        return this.running;
    }
    /**
     * Status of the scheduler. Reads persisted heartbeat from the DB so it is
     * meaningful even when called from a different process than the daemon
     * (e.g. `unmarket daemon status` while the daemon runs elsewhere). A daemon
     * is considered live if its heartbeat is newer than 30s.
     */
    getStatus() {
        const running = this.read('scheduler_running') === '1';
        const heartbeat = this.read('scheduler_heartbeat');
        const live = running && !!heartbeat && Date.now() - new Date(heartbeat).getTime() < 30_000;
        const processed = Number(this.read('scheduler_processed') ?? '0');
        return {
            running: live,
            startedAt: this.read('scheduler_started_at') ?? this.startedAt?.toISOString(),
            tasksProcessed: this.running ? this.tasksProcessed : processed,
            lastTaskAt: this.read('scheduler_heartbeat') ?? this.lastTaskAt?.toISOString(),
            cronJobs: this.cronJobs.size,
            queue: this.queue.counts(),
        };
    }
    /**
     * Register a recurring job. The callback typically enqueues tasks
     * (e.g. nightly content generation for active products).
     */
    addCron(expression, fn) {
        if (!cron.validate(expression)) {
            throw new Error(`Invalid cron expression: ${expression}`);
        }
        const job = cron.schedule(expression, () => {
            Promise.resolve(fn()).catch(err => logger.error('Cron job failed', { expression, err: String(err) }));
        });
        this.cronJobs.set(expression, job);
        logger.info('Cron job registered', { expression });
    }
    // ---- internals ------------------------------------------------------------
    async workerLoop(pollIntervalMs, respectQuietHours) {
        while (!this.stopRequested) {
            // Heartbeat every iteration (idle or busy) so cross-process status is fresh.
            this.persist('scheduler_heartbeat', new Date().toISOString());
            const excludeTypes = respectQuietHours && this.inQuietHours() ? POSTING_TYPES : [];
            const task = this.queue.claimNext({ excludeTypes });
            if (!task) {
                await this.sleep(pollIntervalMs);
                continue;
            }
            await this.executor.run(task);
            this.tasksProcessed++;
            this.lastTaskAt = new Date();
            this.persist('scheduler_processed', String(this.tasksProcessed));
            // Small spacing between actions so the browser session isn't hammered.
            await this.sleep(1000);
        }
    }
    /** True if the current hour falls within config quiet hours [start, end). */
    inQuietHours() {
        const { start, end } = getConfigManager().getSchedulerConfig().quietHours;
        const hour = new Date().getHours();
        if (start === end)
            return false;
        if (start < end)
            return hour >= start && hour < end;
        // Wraps midnight, e.g. 22 -> 6.
        return hour >= start || hour < end;
    }
    sleep(ms) {
        return new Promise(resolve => {
            const timer = setTimeout(resolve, ms);
            // Don't keep the process alive solely for the poll timer.
            if (typeof timer.unref === 'function')
                timer.unref();
        });
    }
    /** Write a scheduler state key to session_state (cross-process status). */
    persist(key, value) {
        getDatabase().prepare(`
      INSERT OR REPLACE INTO session_state (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
    `).run(key, value);
    }
    read(key) {
        const row = getDatabase().prepare('SELECT value FROM session_state WHERE key = ?').get(key);
        return row?.value;
    }
}
let instance = null;
export function getScheduler() {
    if (!instance)
        instance = new Scheduler();
    return instance;
}
//# sourceMappingURL=scheduler.js.map