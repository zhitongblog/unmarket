/**
 * Executor - runs tasks claimed from the queue.
 *
 * It owns the dispatch table (task type -> handler), builds the platform
 * context (browser + account), maps platform results back into TaskResults,
 * persists the outcome, and raises a notification whenever a task ends up
 * blocked waiting for a human.
 *
 * Concurrency note: browser automation through Unzoo is effectively a single
 * shared session, so the default concurrency is 1. The cap exists so non-
 * browser work (generate) could be parallelised later without rework.
 */
import { getDatabase, generateId } from '../../storage/database.js';
import { getAccountManager } from '../../storage/accounts.js';
import { getUnzooClient } from '../../browser/unzoo-client.js';
import { getProductManager } from '../product-manager.js';
import { ContentGenerator } from '../content-generator.js';
import { getTaskStore } from '../task/task-store.js';
import { getTaskQueue } from '../task/task-queue.js';
import { getNotifier } from '../notifier/notifier.js';
import { getPlatformRegistry } from '../../platforms/platform.js';
import '../../platforms/index.js'; // ensure all platform adapters are registered
import { createLogger } from '../../utils/logger.js';
const logger = createLogger('executor');
export class Executor {
    store = getTaskStore();
    queue = getTaskQueue();
    notifier = getNotifier();
    accounts = getAccountManager();
    registry = getPlatformRegistry();
    /**
     * Execute a single task end to end: run it, then persist the outcome
     * (success / retry-or-fail / blocked) and notify on block.
     */
    async run(task) {
        logger.info('Executing task', { id: task.id, type: task.type, platform: task.platform });
        let result;
        try {
            result = await this.dispatch(task);
        }
        catch (err) {
            result = { success: false, error: err.message };
        }
        await this.persist(task, result);
        return result;
    }
    async dispatch(task) {
        switch (task.type) {
            case 'register':
                return this.runRegister(task);
            case 'nurture':
                return this.runNurture(task);
            case 'generate':
                return this.runGenerate(task);
            case 'publish':
                return this.runPublish(task);
            case 'engage':
                return this.runEngage(task);
            default:
                return { success: false, error: `Unknown task type: ${task.type}` };
        }
    }
    /** Write the result to the store; re-queue/ fail/ block as appropriate. */
    async persist(task, result) {
        if (result.success) {
            this.store.markSuccess(task.id, result.data);
            return;
        }
        if (result.blockedReason) {
            this.store.markBlocked(task.id, result.blockedReason, result.error);
            const blocked = this.store.getById(task.id);
            if (blocked)
                await this.notifier.notifyBlocked(blocked);
            return;
        }
        // retryable defaults to true; explicit false means fail immediately.
        if (result.retryable === false) {
            // Force terminal failure by exhausting retries semantics:
            this.store.markFailed(task.id, result.error ?? 'failed (non-retryable)');
            // markFailed may still re-queue if retries remain; guard for non-retryable:
            const after = this.store.getById(task.id);
            if (after && after.status === 'pending') {
                this.store.cancel(task.id);
            }
            return;
        }
        const requeued = this.store.markFailed(task.id, result.error ?? 'failed');
        if (!requeued) {
            await this.notifier.notify('任务失败', `任务 ${task.type} (${task.platform ?? '—'}) 已达最大重试次数：${result.error ?? ''}`, 'error');
        }
    }
    // ---- Task handlers --------------------------------------------------------
    async runRegister(task) {
        const platform = this.requirePlatform(task);
        if (!platform)
            return this.unsupportedPlatform(task);
        const ctx = { unzoo: getUnzooClient() };
        const useOAuth = task.payload.useOAuth ?? true;
        const res = await platform.register(ctx, { useOAuth });
        if (res.success) {
            // Persist the freshly created account.
            this.accounts.add(platform.name, {
                username: res.username,
                email: res.email,
                password: 'BROWSER_SESSION',
                loginMethod: res.loginMethod ?? 'password',
            });
            return { success: true, data: { username: res.username, email: res.email } };
        }
        return { success: false, blockedReason: res.blocked, error: res.error };
    }
    async runNurture(task) {
        const platform = this.requirePlatform(task);
        if (!platform)
            return this.unsupportedPlatform(task);
        const acct = this.resolveAccount(task);
        if (!acct)
            return { success: false, error: 'No account for nurture', retryable: false };
        const ctx = { unzoo: getUnzooClient(), account: acct.info, credentials: acct.creds };
        const payload = task.payload;
        const res = await platform.nurture(ctx, payload);
        if (res.success) {
            this.logNurture(acct.info, platform.name, payload, res);
            return { success: true, data: { actionsPerformed: res.actionsPerformed, durationSeconds: res.durationSeconds } };
        }
        return { success: false, blockedReason: res.blocked, error: res.error };
    }
    async runGenerate(task) {
        if (!task.productId)
            return { success: false, error: 'generate task missing productId', retryable: false };
        const product = getProductManager().getById(task.productId);
        if (!product)
            return { success: false, error: 'Product not found', retryable: false };
        const payload = task.payload;
        const generator = new ContentGenerator();
        const items = await generator.generate(product, {
            platforms: payload.platforms,
            languages: payload.languages,
        });
        // Chain: each generated item becomes a publish task.
        for (const item of items) {
            this.queue.enqueuePublish(item.platform, task.productId, {
                title: item.title,
                body: item.body,
                language: item.language,
                hashtags: item.hashtags,
            }, { priority: task.priority });
        }
        return { success: true, data: { generated: items.length } };
    }
    async runPublish(task) {
        const platform = this.requirePlatform(task);
        if (!platform)
            return this.unsupportedPlatform(task);
        const payload = task.payload;
        // Half-auto: hold for human approval before posting.
        if (payload.requireApproval && !task.payload.approved) {
            return { success: false, blockedReason: 'manual_review', error: 'Awaiting content approval' };
        }
        const acct = this.resolveAccount(task);
        if (!acct)
            return { success: false, error: 'No account for publish', retryable: false };
        const content = {
            title: payload.title,
            body: payload.body ?? '',
            language: payload.language,
            hashtags: payload.hashtags,
        };
        const ctx = { unzoo: getUnzooClient(), account: acct.info, credentials: acct.creds };
        const res = await platform.publish(ctx, content);
        if (res.success) {
            this.accounts.markUsed(acct.info.id);
            this.savePost(task, content, res.url);
            return { success: true, data: { url: res.url, postId: res.postId } };
        }
        return { success: false, blockedReason: res.blocked, error: res.error };
    }
    async runEngage(task) {
        const platform = this.requirePlatform(task);
        if (!platform)
            return this.unsupportedPlatform(task);
        const acct = this.resolveAccount(task);
        if (!acct)
            return { success: false, error: 'No account for engage', retryable: false };
        const ctx = { unzoo: getUnzooClient(), account: acct.info, credentials: acct.creds };
        const res = await platform.engage(ctx, task.payload);
        if (res.success)
            return { success: true, data: { url: res.url } };
        return { success: false, blockedReason: res.blocked, error: res.error };
    }
    // ---- Helpers --------------------------------------------------------------
    /** Resolve the platform adapter for a task, or null if unsupported. */
    requirePlatform(task) {
        if (!task.platform)
            return null;
        return this.registry.get(task.platform);
    }
    /** Standard error result for a missing/unsupported platform. */
    unsupportedPlatform(task) {
        return { success: false, error: `Unsupported platform: ${task.platform ?? '(none)'}`, retryable: false };
    }
    /** Resolve the account + decrypted credentials for a task. */
    resolveAccount(task) {
        let info = null;
        if (task.accountId) {
            info = this.accounts.getById(task.accountId);
        }
        else if (task.platform) {
            info = this.accounts.getByPlatform(task.platform);
        }
        if (!info)
            return null;
        const creds = this.accounts.getCredentials(info.id);
        if (!creds)
            return null;
        return { info, creds };
    }
    logNurture(account, platform, payload, res) {
        const db = getDatabase();
        db.prepare(`
      INSERT INTO nurture_logs (id, account_id, platform, action, detail, duration_seconds, success)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(generateId(), account.id, platform, payload.actions.join(','), JSON.stringify({ actionsPerformed: res.actionsPerformed }), res.durationSeconds);
    }
    savePost(task, content, url) {
        if (!task.productId)
            return;
        const db = getDatabase();
        db.prepare(`
      INSERT INTO posts (id, product_id, platform, language, title, body, url, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'))
    `).run(generateId(), task.productId, task.platform, content.language ?? 'en', content.title ?? null, content.body, url ?? null);
    }
}
let instance = null;
export function getExecutor() {
    if (!instance)
        instance = new Executor();
    return instance;
}
//# sourceMappingURL=executor.js.map