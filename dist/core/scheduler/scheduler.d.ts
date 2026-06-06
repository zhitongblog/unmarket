export interface SchedulerStatus {
    running: boolean;
    startedAt?: string;
    tasksProcessed: number;
    lastTaskAt?: string;
    cronJobs: number;
    queue: Record<string, number>;
}
export interface SchedulerOptions {
    /** How often to poll for work when idle (ms). Default 5000. */
    pollIntervalMs?: number;
    /** Respect config quiet hours for posting tasks. Default true. */
    respectQuietHours?: boolean;
}
export declare class Scheduler {
    private running;
    private stopRequested;
    private startedAt?;
    private tasksProcessed;
    private lastTaskAt?;
    private loopPromise?;
    private queue;
    private store;
    private executor;
    private cronJobs;
    /** Start the daemon. Resolves once the worker loop has begun. */
    start(options?: SchedulerOptions): Promise<void>;
    /** Request a graceful stop and wait for the loop to finish. */
    stop(): Promise<void>;
    isRunning(): boolean;
    /**
     * Status of the scheduler. Reads persisted heartbeat from the DB so it is
     * meaningful even when called from a different process than the daemon
     * (e.g. `unmarket daemon status` while the daemon runs elsewhere). A daemon
     * is considered live if its heartbeat is newer than 30s.
     */
    getStatus(): SchedulerStatus;
    /**
     * Register a recurring job. The callback typically enqueues tasks
     * (e.g. nightly content generation for active products).
     */
    addCron(expression: string, fn: () => void | Promise<void>): void;
    private workerLoop;
    /** True if the current hour falls within config quiet hours [start, end). */
    private inQuietHours;
    private sleep;
    /** Write a scheduler state key to session_state (cross-process status). */
    private persist;
    private read;
}
export declare function getScheduler(): Scheduler;
//# sourceMappingURL=scheduler.d.ts.map