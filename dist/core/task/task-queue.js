/**
 * TaskQueue - the business-facing API for enqueueing and inspecting work.
 *
 * The actual priority ordering, delay (scheduled_at), retry backoff, and
 * atomic claiming all live in TaskStore (DB-backed, crash-safe). TaskQueue
 * sits on top to give callers typed helpers so they never hand-build payloads,
 * and so each task type has one canonical shape.
 */
import { getTaskStore } from './task-store.js';
export class TaskQueue {
    store = getTaskStore();
    // ---- Typed enqueue helpers ----------------------------------------------
    enqueueRegister(platform, payload = {}, opts = {}) {
        return this.store.create({
            type: 'register',
            platform,
            payload: payload,
            ...this.resolveOpts(opts),
        });
    }
    enqueueNurture(accountId, platform, payload, opts = {}) {
        return this.store.create({
            type: 'nurture',
            platform,
            accountId,
            payload: payload,
            ...this.resolveOpts(opts),
        });
    }
    enqueueGenerate(productId, payload, opts = {}) {
        return this.store.create({
            type: 'generate',
            productId,
            payload: payload,
            ...this.resolveOpts(opts),
        });
    }
    enqueuePublish(platform, productId, payload, opts = {}) {
        return this.store.create({
            type: 'publish',
            platform,
            productId,
            payload: payload,
            ...this.resolveOpts(opts),
        });
    }
    enqueueEngage(platform, accountId, payload, opts = {}) {
        return this.store.create({
            type: 'engage',
            platform,
            accountId,
            payload: payload,
            ...this.resolveOpts(opts),
        });
    }
    // ---- Consumption / inspection -------------------------------------------
    /** Atomically claim the next runnable task (flips it to 'running'). */
    claimNext(opts = {}) {
        return this.store.claimNext(opts);
    }
    pending() {
        return this.store.list({ status: 'pending' });
    }
    running() {
        return this.store.list({ status: 'running' });
    }
    blocked() {
        return this.store.getBlocked();
    }
    byType(type) {
        return this.store.list({ type });
    }
    counts() {
        return this.store.countByStatus();
    }
    cancel(id) {
        return this.store.cancel(id);
    }
    unblock(id) {
        return this.store.unblock(id);
    }
    resolveOpts(opts) {
        let scheduledAt = opts.scheduledAt;
        if (!scheduledAt && opts.delaySeconds) {
            scheduledAt = new Date(Date.now() + opts.delaySeconds * 1000);
        }
        return {
            priority: opts.priority,
            maxRetries: opts.maxRetries,
            scheduledAt,
        };
    }
}
let instance = null;
export function getTaskQueue() {
    if (!instance)
        instance = new TaskQueue();
    return instance;
}
//# sourceMappingURL=task-queue.js.map