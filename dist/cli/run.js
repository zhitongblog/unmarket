/**
 * Run (scheduler) CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { MultiProductScheduler } from '../core/multi-scheduler.js';
export const runCommand = new Command('run')
    .description('Start the multi-product scheduler')
    .option('--mode <mode>', 'Scheduling mode (round-robin/weighted/priority/smart)', 'weighted')
    .option('--products <list>', 'Comma-separated list of product IDs')
    .option('--duration <time>', 'Run duration (e.g., 24h, 7d)')
    .option('--daemon', 'Run in background')
    .action(async (options) => {
    console.log(chalk.cyan('\n🚀 UnMarket Scheduler\n'));
    try {
        const scheduler = new MultiProductScheduler();
        const products = options.products?.split(',').map((p) => p.trim());
        console.log(`  Mode: ${chalk.bold(options.mode)}`);
        console.log(`  Products: ${products ? products.join(', ') : 'All active'}`);
        console.log(`  Duration: ${options.duration || 'Continuous'}`);
        console.log('');
        if (options.daemon) {
            const spinner = ora('Starting scheduler in background...').start();
            await scheduler.startDaemon(options.mode, { products, duration: options.duration });
            spinner.succeed('Scheduler started in background');
            console.log(chalk.gray('\nUse `unmarket status` to check progress'));
            console.log(chalk.gray('Use `unmarket stop` to stop the scheduler'));
        }
        else {
            console.log(chalk.gray('Press Ctrl+C to stop\n'));
            console.log(chalk.gray('─'.repeat(60)));
            await scheduler.start(options.mode, {
                products,
                duration: options.duration,
                onPublish: (result) => {
                    const icon = result.success ? chalk.green('✓') : chalk.red('✗');
                    const time = new Date().toLocaleTimeString();
                    console.log(`${chalk.gray(time)} ${icon} ${result.product} → ${result.platform}`);
                }
            });
        }
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Status command
export const statusCommand = new Command('status')
    .description('Show scheduler status')
    .action(async () => {
    try {
        const scheduler = new MultiProductScheduler();
        const status = await scheduler.getStatus();
        if (!status.running) {
            console.log(chalk.yellow('Scheduler is not running'));
            return;
        }
        console.log(chalk.cyan('\nScheduler Status:\n'));
        console.log(`  Running: ${chalk.green('Yes')}`);
        console.log(`  Mode: ${status.mode}`);
        console.log(`  Started: ${status.startedAt}`);
        console.log(`  Tasks completed: ${status.tasksCompleted}`);
        console.log(`  Tasks pending: ${status.tasksPending}`);
        console.log(`  Last publish: ${status.lastPublish || 'None'}`);
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Stop command
runCommand.addCommand(new Command('stop')
    .description('Stop the scheduler')
    .action(async () => {
    const spinner = ora('Stopping scheduler...').start();
    try {
        const scheduler = new MultiProductScheduler();
        await scheduler.stop();
        spinner.succeed('Scheduler stopped');
    }
    catch (error) {
        spinner.fail('Failed to stop scheduler');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
}));
//# sourceMappingURL=run.js.map