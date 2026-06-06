/**
 * Account CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getAccountManager } from '../storage/accounts.js';
export const accountCommand = new Command('account')
    .description('Manage platform accounts');
// List all accounts
accountCommand
    .command('list')
    .description('List all registered accounts')
    .option('--platform <platform>', 'Filter by platform')
    .action(async (options) => {
    const spinner = ora('Loading accounts...').start();
    try {
        const manager = getAccountManager();
        const accounts = manager.list(options.platform);
        spinner.stop();
        if (accounts.length === 0) {
            console.log(chalk.yellow('No accounts registered yet.'));
            console.log(chalk.gray('Use `unmarket register <platform>` to register accounts.'));
            return;
        }
        console.log(chalk.cyan('\nRegistered Accounts:\n'));
        console.log(chalk.gray('─'.repeat(60)));
        for (const account of accounts) {
            const statusIcon = account.status === 'active' ? chalk.green('●') : chalk.red('○');
            console.log(`${statusIcon} ${chalk.bold(account.platform.padEnd(20))} @${account.username || account.email || 'N/A'}`);
            console.log(chalk.gray(`    Status: ${account.status}  Created: ${account.createdAt.toLocaleDateString()}`));
        }
        console.log(chalk.gray('─'.repeat(60)));
        console.log(chalk.gray(`Total: ${accounts.length} accounts`));
    }
    catch (error) {
        spinner.fail('Failed to list accounts');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Show account details
accountCommand
    .command('show <platform>')
    .description('Show account details for a platform')
    .action(async (platform) => {
    try {
        const manager = getAccountManager();
        const account = manager.getByPlatform(platform);
        if (!account) {
            console.log(chalk.yellow(`No account found for ${platform}`));
            return;
        }
        console.log(chalk.cyan(`\n${platform} Account:\n`));
        console.log(`  ID: ${account.id}`);
        console.log(`  Username: ${chalk.bold(account.username || 'N/A')}`);
        console.log(`  Email: ${account.email || 'N/A'}`);
        console.log(`  Status: ${account.status === 'active' ? chalk.green('Active') : chalk.red(account.status)}`);
        console.log(`  Created: ${account.createdAt.toLocaleString()}`);
        console.log(`  Last Used: ${account.lastUsed?.toLocaleString() || 'Never'}`);
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Delete account
accountCommand
    .command('delete <platform>')
    .description('Delete an account')
    .action(async (platform) => {
    const spinner = ora('Deleting account...').start();
    try {
        const manager = getAccountManager();
        const account = manager.getByPlatform(platform);
        if (!account) {
            spinner.fail(`No account found for ${platform}`);
            return;
        }
        const deleted = manager.delete(account.id);
        if (deleted) {
            spinner.succeed(`Account for ${platform} deleted`);
        }
        else {
            spinner.fail('Failed to delete account');
        }
    }
    catch (error) {
        spinner.fail('Failed to delete account');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Show accounts needing verification
accountCommand
    .command('verify')
    .description('Show accounts needing verification')
    .action(async () => {
    try {
        const manager = getAccountManager();
        const accounts = manager.findNeedingVerification();
        if (accounts.length === 0) {
            console.log(chalk.green('✓ All accounts are verified'));
            return;
        }
        console.log(chalk.yellow('\nAccounts Needing Verification:\n'));
        for (const account of accounts) {
            console.log(`  - ${account.platform} (@${account.username || account.email})`);
        }
        console.log(chalk.gray('\nUse `unmarket register verify <platform>` to complete verification'));
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Count accounts
accountCommand
    .command('count')
    .description('Show account count by platform')
    .action(async () => {
    try {
        const manager = getAccountManager();
        const counts = manager.countByPlatform();
        console.log(chalk.cyan('\nAccount Count by Platform:\n'));
        for (const [platform, count] of Object.entries(counts)) {
            console.log(`  ${platform.padEnd(20)} ${count}`);
        }
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
//# sourceMappingURL=account.js.map