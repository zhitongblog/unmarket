import type { Task, TaskType } from './types.js';
export interface RegisterPayload {
    /** Whether to try Google OAuth first. */
    useOAuth?: boolean;
}
export interface NurturePayload {
    /** Which warming actions to perform this session. */
    actions: Array<'browse' | 'like' | 'follow' | 'comment' | 'profile'>;
    /** Target session length in seconds. */
    durationSeconds: number;
}
export interface GeneratePayload {
    platforms: string[];
    languages: string[];
}
export interface PublishPayload {
    /** Pre-generated content id, or inline content. */
    contentId?: string;
    title?: string;
    body?: string;
    language?: string;
    hashtags?: string[];
    /** Half-auto mode: require human approval before posting. */
    requireApproval?: boolean;
}
export interface EngagePayload {
    action: 'reply' | 'comment' | 'like' | 'follow';
    /** URL or id of the thing to engage with. */
    target: string;
    text?: string;
}
export interface EnqueueOptions {
    priority?: number;
    /** Delay before the task becomes runnable. */
    delaySeconds?: number;
    scheduledAt?: Date;
    maxRetries?: number;
}
export declare class TaskQueue {
    private store;
    enqueueRegister(platform: string, payload?: RegisterPayload, opts?: EnqueueOptions): Task;
    enqueueNurture(accountId: string, platform: string, payload: NurturePayload, opts?: EnqueueOptions): Task;
    enqueueGenerate(productId: string, payload: GeneratePayload, opts?: EnqueueOptions): Task;
    enqueuePublish(platform: string, productId: string, payload: PublishPayload, opts?: EnqueueOptions): Task;
    enqueueEngage(platform: string, accountId: string, payload: EngagePayload, opts?: EnqueueOptions): Task;
    /** Atomically claim the next runnable task (flips it to 'running'). */
    claimNext(opts?: {
        excludeTypes?: TaskType[];
    }): Task | null;
    pending(): Task[];
    running(): Task[];
    blocked(): Task[];
    byType(type: TaskType): Task[];
    counts(): Record<string, number>;
    cancel(id: string): boolean;
    unblock(id: string): boolean;
    private resolveOpts;
}
export declare function getTaskQueue(): TaskQueue;
//# sourceMappingURL=task-queue.d.ts.map