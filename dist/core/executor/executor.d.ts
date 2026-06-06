import '../../platforms/index.js';
import type { Task, TaskResult } from '../task/types.js';
export declare class Executor {
    private store;
    private queue;
    private notifier;
    private accounts;
    private registry;
    /**
     * Execute a single task end to end: run it, then persist the outcome
     * (success / retry-or-fail / blocked) and notify on block.
     */
    run(task: Task): Promise<TaskResult>;
    private dispatch;
    /** Write the result to the store; re-queue/ fail/ block as appropriate. */
    private persist;
    private runRegister;
    private runNurture;
    private runGenerate;
    private runPublish;
    private runEngage;
    /** Resolve the platform adapter for a task, or null if unsupported. */
    private requirePlatform;
    /** Standard error result for a missing/unsupported platform. */
    private unsupportedPlatform;
    /** Resolve the account + decrypted credentials for a task. */
    private resolveAccount;
    private logNurture;
    private savePost;
}
export declare function getExecutor(): Executor;
//# sourceMappingURL=executor.d.ts.map