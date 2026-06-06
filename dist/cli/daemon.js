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
import chalk from 'chalk';
import { getScheduler } from '../core/scheduler/scheduler.js';
export const daemonCommand = new Command('daemon').description('Run the 7x24 task scheduler');
daemonCommand
    .command('start')
    .description('Start the scheduler in the foreground')
    .option('--poll <seconds>', 'Idle poll interval in seconds', '5')
    .option('--no-quiet-hours', 'Ignore configured quiet hours (post any time)')
    .action(async (options) => {
    const scheduler = getScheduler();
    console.log(chalk.cyan('\n🤖 UnMarket scheduler starting...\n'));
    await scheduler.start({
        pollIntervalMs: Number(options.poll) * 1000,
        respectQuietHours: options.quietHours !== false,
    });
    console.log(chalk.green('✓ Scheduler running. Press Ctrl+C to stop.\n'));
    const shutdown = async () => {
        console.log(chalk.yellow('\nStopping scheduler (finishing current task)...'));
        await scheduler.stop();
        console.log(chalk.green('✓ Stopped.'));
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    // Keep the process alive while the scheduler loop runs.
    await new Promise(() => { });
});
daemonCommand
    .command('status')
    .description('Show scheduler status and queue counts')
    .action(() => {
    const status = getScheduler().getStatus();
    console.log(chalk.cyan('\nScheduler status:\n'));
    console.log(`  Running:        ${status.running ? chalk.green('yes') : chalk.gray('no')}`);
    if (status.startedAt)
        console.log(`  Started:        ${status.startedAt}`);
    console.log(`  Tasks processed:${String(status.tasksProcessed).padStart(4)}`);
    if (status.lastTaskAt)
        console.log(`  Last task:      ${status.lastTaskAt}`);
    console.log(`  Cron jobs:      ${status.cronJobs}`);
    console.log(chalk.gray('\n  Queue:'));
    for (const [k, v] of Object.entries(status.queue)) {
        console.log(`    ${k.padEnd(10)} ${v}`);
    }
    console.log();
});
//# sourceMappingURL=daemon.js.map