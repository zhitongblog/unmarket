/**
 * Daemon CLI - run the 7x24 scheduler that drains the task queue.
 *
 *   unmarket daemon start [--no-quiet-hours] [--poll 5]
 *   unmarket daemon status
 *
 * `start` runs in the foreground (Ctrl+C to stop gracefully). Run it under
 * a process manager (pm2, nssm, systemd) for true 7x24 operation.
 */
import { Command } from 'commander';
export declare const daemonCommand: Command;
//# sourceMappingURL=daemon.d.ts.map