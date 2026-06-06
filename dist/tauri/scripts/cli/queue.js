/**
 * Queue CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Queue } from '../core/queue.js';
export const queueCommand = new Command('queue')
    .description('Manage publish queue');
// List queue
queueCommand
    .command('list')
    .alias('ls')
    .description('List queued tasks')
    .option('--all', 'Show all tasks including completed')
    .action(async (options) => {
    try {
        const queue = new Queue();
        const tasks = await queue.list(options.all);
        if (tasks.length === 0) {
            console.log(chalk.yellow('Queue is empty'));
            return;
        }
        console.log(chalk.cyan('\nPublish Queue:\n'));
        console.log(chalk.gray('─'.repeat(70)));
        for (const task of tasks) {
            const statusIcon = task.status === 'completed' ? chalk.green('✓') :
                task.status === 'running' ? chalk.blue('●') :
                    task.status === 'failed' ? chalk.red('✗') :
                        chalk.gray('○');
            const time = new Date(task.scheduledAt).toLocaleString();
            console.log(`${statusIcon} ${task.id.substring(0, 8).padEnd(10)} ${task.product.padEnd(15)} → ${task.platform.padEnd(15)} ${chalk.gray(time)}`);
        }
        console.log(chalk.gray('─'.repeat(70)));
        console.log(chalk.gray(`Total: ${tasks.length} tasks`));
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Add to queue
queueCommand
    .command('add <product-id>')
    .description('Add a task to the queue')
    .option('--platform <platform>', 'Target platform')
    .option('--time <time>', 'Scheduled time (ISO 8601)')
    .action(async (productId, options) => {
    const spinner = ora('Adding to queue...').start();
    try {
        const queue = new Queue();
        const task = await queue.add({
            productId,
            platform: options.platform,
            scheduledAt: options.time ? new Date(options.time) : new Date()
        });
        spinner.succeed(`Task added: ${task.id}`);
    }
    catch (error) {
        spinner.fail('Failed to add task');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Remove from queue
queueCommand
    .command('remove <task-id>')
    .description('Remove a task from the queue')
    .action(async (taskId) => {
    const spinner = ora('Removing from queue...').start();
    try {
        const queue = new Queue();
        await queue.remove(taskId);
        spinner.succeed('Task removed');
    }
    catch (error) {
        spinner.fail('Failed to remove task');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Pause queue
queueCommand
    .command('pause')
    .description('Pause queue processing')
    .action(async () => {
    const spinner = ora('Pausing queue...').start();
    try {
        const queue = new Queue();
        await queue.pause();
        spinner.succeed('Queue paused');
    }
    catch (error) {
        spinner.fail('Failed to pause queue');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Resume queue
queueCommand
    .command('resume')
    .description('Resume queue processing')
    .action(async () => {
    const spinner = ora('Resuming queue...').start();
    try {
        const queue = new Queue();
        await queue.resume();
        spinner.succeed('Queue resumed');
    }
    catch (error) {
        spinner.fail('Failed to resume queue');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Clear queue
queueCommand
    .command('clear')
    .description('Clear all pending tasks')
    .option('--force', 'Skip confirmation')
    .action(async (options) => {
    if (!options.force) {
        console.log(chalk.yellow('This will remove all pending tasks.'));
        console.log(chalk.gray('Use --force to skip this confirmation.'));
        return;
    }
    const spinner = ora('Clearing queue...').start();
    try {
        const queue = new Queue();
        const count = await queue.clear();
        spinner.succeed(`Cleared ${count} tasks`);
    }
    catch (error) {
        spinner.fail('Failed to clear queue');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
//# sourceMappingURL=queue.js.map