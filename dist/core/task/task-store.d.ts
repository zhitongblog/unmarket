import type { Task, TaskStatus, TaskType, CreateTaskInput, BlockReason } from './types.js';
export declare class TaskStore {
    /** Create and persist a new task (status = pending). */
    create(input: CreateTaskInput): Task;
    getById(id: string): Task | null;
    /**
     * Claim the next runnable task: highest priority, then oldest, among
     * pending tasks whose scheduled_at has arrived. Atomically flips it to
     * 'running' so concurrent workers never grab the same task.
     *
     * `excludeTypes` lets the scheduler suppress certain work (e.g. outbound
     * publish/engage during quiet hours) without touching other task types.
     */
    claimNext(opts?: {
        excludeTypes?: TaskType[];
    }): Task | null;
    /** Mark a task finished successfully, storing its result. */
    markSuccess(id: string, result?: Record<string, unknown>): void;
    /**
     * Mark a task failed. If retries remain, it is re-queued as pending with
     * an exponential-backoff scheduled_at; otherwise it stays failed.
     * Returns true if the task was re-queued for retry.
     */
    markFailed(id: string, error: string): boolean;
    /** Block a task pending human intervention (CAPTCHA, phone, review...). */
    markBlocked(id: string, reason: BlockReason, detail?: string): void;
    /** Resume a blocked task — put it back to pending so a worker picks it up. */
    unblock(id: string): boolean;
    cancel(id: string): boolean;
    /** List tasks, optionally filtered by status and/or type. */
    list(filter?: {
        status?: TaskStatus;
        type?: TaskType;
        limit?: number;
    }): Task[];
    getBlocked(): Task[];
    /** Count tasks grouped by status. */
    countByStatus(): Record<string, number>;
    /**
     * Recover orphaned 'running' tasks left over from a crash by resetting
     * them to 'pending'. Called once on scheduler startup.
     */
    recoverStaleRunning(): number;
    /** Delete finished tasks older than N days. Returns rows removed. */
    pruneCompleted(olderThanDays?: number): number;
    private rowToTask;
}
export declare function getTaskStore(): TaskStore;
//# sourceMappingURL=task-store.d.ts.map