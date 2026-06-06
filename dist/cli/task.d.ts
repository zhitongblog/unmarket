/**
 * Task CLI - inspect and control the task engine.
 *
 *   unmarket task list [--status <s>] [--type <t>]
 *   unmarket task show <id>
 *   unmarket task unblock <id>     # resume a task that needed a human
 *   unmarket task cancel <id>
 *   unmarket task register <platform>
 *   unmarket task nurture <accountId> <platform> [--duration 120]
 *   unmarket task publish <platform> <productId> [--require-approval]
 */
import { Command } from 'commander';
export declare const taskCommand: Command;
//# sourceMappingURL=task.d.ts.map