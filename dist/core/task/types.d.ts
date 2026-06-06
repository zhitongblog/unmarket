/**
 * Task system types
 *
 * A Task is the unit of work in UnMarket. Everything the system does —
 * registering an account, warming it up, generating content, publishing,
 * engaging — is represented as a Task. Tasks are persisted, scheduled,
 * executed, retried, and (when something needs a human) blocked.
 */
export type TaskType = 'register' | 'nurture' | 'generate' | 'publish' | 'engage';
export type TaskStatus = 'pending' | 'running' | 'success' | 'failed' | 'blocked' | 'cancelled';
/** Reasons a task may be blocked and need a human. */
export type BlockReason = 'captcha' | 'phone_verification' | 'manual_review' | 'account_banned' | 'login_required' | 'unknown';
export interface Task {
    id: string;
    type: TaskType;
    status: TaskStatus;
    /** 1 (lowest) .. 10 (highest). Higher runs first. */
    priority: number;
    platform?: string;
    accountId?: string;
    productId?: string;
    /** Task-specific parameters. */
    payload: Record<string, unknown>;
    /** Task-specific result, set after execution. */
    result?: Record<string, unknown>;
    retryCount: number;
    maxRetries: number;
    /** Earliest time the task may run. undefined = run as soon as possible. */
    scheduledAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
    error?: string;
    blockedReason?: BlockReason;
    createdAt: Date;
    updatedAt: Date;
}
/** Fields required to create a new task. Everything else is defaulted. */
export interface CreateTaskInput {
    type: TaskType;
    priority?: number;
    platform?: string;
    accountId?: string;
    productId?: string;
    payload?: Record<string, unknown>;
    maxRetries?: number;
    scheduledAt?: Date;
}
/** Result returned by a task executor. */
export interface TaskResult {
    success: boolean;
    /** Arbitrary result data persisted to the task. */
    data?: Record<string, unknown>;
    error?: string;
    /** If set, the task is blocked rather than failed — a human must act. */
    blockedReason?: BlockReason;
    /** Override default retry behaviour for this outcome. */
    retryable?: boolean;
}
/** Raw database row shape for the tasks table. */
export interface TaskRow {
    id: string;
    type: string;
    status: string;
    priority: number;
    platform: string | null;
    account_id: string | null;
    product_id: string | null;
    payload: string | null;
    result: string | null;
    retry_count: number;
    max_retries: number;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    error: string | null;
    blocked_reason: string | null;
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=types.d.ts.map