/**
 * Queue management for scheduled publishing
 */
import { type QueueTask } from '../storage/database.js';
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
export declare class Queue {
    private paused;
    /**
     * Add task to queue
     */
    add(input: QueueAddInput): QueueTaskInfo;
    /**
     * List queue tasks
     */
    list(includeCompleted?: boolean): QueueTaskInfo[];
    /**
     * Get next pending task
     */
    getNext(): QueueTask | null;
    /**
     * Mark task as running
     */
    markRunning(id: string): void;
    /**
     * Mark task as completed
     */
    markCompleted(id: string): void;
    /**
     * Mark task as failed
     */
    markFailed(id: string, error: string): void;
    /**
     * Remove task from queue
     */
    remove(id: string): boolean;
    /**
     * Clear all pending tasks
     */
    clear(): number;
    /**
     * Pause queue processing
     */
    pause(): void;
    /**
     * Resume queue processing
     */
    resume(): void;
    /**
     * Check if queue is paused
     */
    isPaused(): boolean;
    /**
     * Get queue statistics
     */
    getStats(): {
        pending: number;
        running: number;
        completed: number;
        failed: number;
    };
    /**
     * Retry failed tasks
     */
    retryFailed(): number;
    /**
     * Clean old completed tasks
     */
    cleanOld(daysOld?: number): number;
    private saveState;
    private loadState;
}
//# sourceMappingURL=queue.d.ts.map