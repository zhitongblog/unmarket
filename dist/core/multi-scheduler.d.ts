export type ScheduleMode = 'round-robin' | 'weighted' | 'priority' | 'smart';
export interface SchedulerOptions {
    products?: string[];
    duration?: string;
    onPublish?: (result: {
        product: string;
        platform: string;
        success: boolean;
    }) => void;
}
export interface SchedulerStatus {
    running: boolean;
    mode?: ScheduleMode;
    startedAt?: string;
    tasksCompleted: number;
    tasksPending: number;
    lastPublish?: string;
}
export declare class MultiProductScheduler {
    private running;
    private mode;
    private startedAt?;
    private tasksCompleted;
    private lastPublish?;
    private stopRequested;
    private productManager;
    private contentGenerator;
    private publisher;
    private queue;
    /**
     * Start the scheduler
     */
    start(mode: ScheduleMode, options?: SchedulerOptions): Promise<void>;
    /**
     * Start in daemon mode
     */
    startDaemon(mode: ScheduleMode, options?: SchedulerOptions): Promise<void>;
    /**
     * Stop the scheduler
     */
    stop(): Promise<void>;
    /**
     * Get scheduler status
     */
    getStatus(): Promise<SchedulerStatus>;
    /**
     * Select product based on mode
     */
    private selectProduct;
    /**
     * Select product by weight
     */
    private selectWeighted;
    /**
     * Select by priority
     */
    private selectByPriority;
    /**
     * Smart selection based on performance
     */
    private selectSmart;
    /**
     * Select platform for product
     */
    private selectPlatform;
    /**
     * Select language for product
     */
    private selectLanguage;
    /**
     * Check if in quiet hours
     */
    private isQuietHours;
    /**
     * Parse duration string (e.g., "24h", "7d")
     */
    private parseDuration;
    private sleep;
    private saveState;
    private loadState;
}
//# sourceMappingURL=multi-scheduler.d.ts.map