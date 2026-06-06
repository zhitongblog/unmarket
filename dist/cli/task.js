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
import chalk from 'chalk';
import { getTaskQueue } from '../core/task/task-queue.js';
import { getTaskStore } from '../core/task/task-store.js';
export const taskCommand = new Command('task').description('Inspect and control the task engine');
const STATUS_ICON = {
    pending: chalk.gray('○'),
    running: chalk.blue('●'),
    success: chalk.green('✓'),
    failed: chalk.red('✗'),
    blocked: chalk.yellow('⚠'),
    cancelled: chalk.gray('–'),
};
taskCommand
    .command('list')
    .alias('ls')
    .description('List tasks')
    .option('--status <status>', 'Filter by status (pending/running/success/failed/blocked/cancelled)')
    .option('--type <type>', 'Filter by type (register/nurture/generate/publish/engage)')
    .action((options) => {
    const store = getTaskStore();
    const tasks = store.list({
        status: options.status,
        type: options.type,
    });
    if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks'));
        return;
    }
    console.log(chalk.cyan('\nTasks:\n'));
    console.log(chalk.gray('─'.repeat(78)));
    for (const t of tasks) {
        const icon = STATUS_ICON[t.status] ?? '?';
        const id = t.id.substring(0, 8);
        const line = `${icon} ${chalk.gray(id)} ` +
            `${t.type.padEnd(9)} ${(t.platform ?? '—').padEnd(12)} ` +
            `P${t.priority} ${t.status.padEnd(9)}`;
        const extra = t.blockedReason ? chalk.yellow(` [${t.blockedReason}]`) : t.error ? chalk.red(` ${t.error.slice(0, 30)}`) : '';
        console.log(line + extra);
    }
    console.log(chalk.gray('─'.repeat(78)));
    const counts = store.countByStatus();
    console.log(chalk.gray(Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join('  ')));
});
taskCommand
    .command('show <id>')
    .description('Show task details')
    .action((id) => {
    const task = getTaskStore().getById(id);
    if (!task) {
        console.error(chalk.red(`Task not found: ${id}`));
        process.exit(1);
    }
    console.log(chalk.cyan('\nTask details:\n'));
    console.log(JSON.stringify(task, null, 2));
});
taskCommand
    .command('unblock <id>')
    .description('Resume a blocked task (after completing the manual step)')
    .action((id) => {
    const ok = getTaskQueue().unblock(id);
    if (ok)
        console.log(chalk.green(`✓ Task ${id} resumed`));
    else {
        console.error(chalk.red(`Could not unblock ${id} (not found or not blocked)`));
        process.exit(1);
    }
});
taskCommand
    .command('cancel <id>')
    .description('Cancel a pending or blocked task')
    .action((id) => {
    const ok = getTaskQueue().cancel(id);
    if (ok)
        console.log(chalk.green(`✓ Task ${id} cancelled`));
    else {
        console.error(chalk.red(`Could not cancel ${id}`));
        process.exit(1);
    }
});
// ---- Enqueue helpers --------------------------------------------------------
taskCommand
    .command('register <platform>')
    .description('Enqueue an account registration task')
    .option('--no-oauth', 'Skip Google OAuth, use traditional signup')
    .option('-p, --priority <n>', 'Priority 1-10', '7')
    .action((platform, options) => {
    const task = getTaskQueue().enqueueRegister(platform, { useOAuth: options.oauth !== false }, { priority: Number(options.priority) });
    console.log(chalk.green(`✓ Register task queued: ${task.id} (${platform})`));
});
taskCommand
    .command('nurture <accountId> <platform>')
    .description('Enqueue an account-warming task')
    .option('-d, --duration <seconds>', 'Session length in seconds', '120')
    .option('-a, --actions <list>', 'Comma list: browse,like,follow,comment', 'browse,like')
    .option('-p, --priority <n>', 'Priority 1-10', '4')
    .action((accountId, platform, options) => {
    const actions = String(options.actions)
        .split(',')
        .map((a) => a.trim());
    const task = getTaskQueue().enqueueNurture(accountId, platform, { actions, durationSeconds: Number(options.duration) }, { priority: Number(options.priority) });
    console.log(chalk.green(`✓ Nurture task queued: ${task.id}`));
});
taskCommand
    .command('publish <platform> <productId>')
    .description('Enqueue a publish task (generates content via the platform pipeline)')
    .option('--title <title>', 'Post title')
    .option('--body <body>', 'Post body')
    .option('--language <lang>', 'Language code', 'en')
    .option('--require-approval', 'Half-auto: hold for human approval before posting')
    .option('-p, --priority <n>', 'Priority 1-10', '5')
    .action((platform, productId, options) => {
    const task = getTaskQueue().enqueuePublish(platform, productId, {
        title: options.title,
        body: options.body,
        language: options.language,
        requireApproval: !!options.requireApproval,
    }, { priority: Number(options.priority) });
    console.log(chalk.green(`✓ Publish task queued: ${task.id}`));
    if (options.requireApproval) {
        console.log(chalk.yellow('  (half-auto: will block for approval — unblock to post)'));
    }
});
taskCommand
    .command('generate <productId>')
    .description('Enqueue a content-generation task (fans out to publish tasks)')
    .option('--platforms <list>', 'Comma list of platforms', 'twitter')
    .option('--languages <list>', 'Comma list of languages', 'en')
    .option('-p, --priority <n>', 'Priority 1-10', '6')
    .action((productId, options) => {
    const task = getTaskQueue().enqueueGenerate(productId, {
        platforms: String(options.platforms).split(',').map((s) => s.trim()),
        languages: String(options.languages).split(',').map((s) => s.trim()),
    }, { priority: Number(options.priority) });
    console.log(chalk.green(`✓ Generate task queued: ${task.id}`));
});
//# sourceMappingURL=task.js.map