/**
 * Gmail CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AccountRegistrar } from '../core/account-registrar.js';
export const gmailCommand = new Command('gmail')
    .description('Gmail account management (for registration)');
// Login to Gmail
gmailCommand
    .command('login')
    .description('Login to Gmail in Unzoo browser')
    .action(async () => {
    const spinner = ora('Opening Gmail login...').start();
    try {
        const registrar = new AccountRegistrar();
        spinner.text = 'Please login to Gmail in Unzoo browser...';
        spinner.stopAndPersist({ symbol: '👉' });
        await registrar.setupGmail();
        console.log(chalk.green('\n✓ Gmail connected successfully'));
    }
    catch (error) {
        spinner.fail('Failed to setup Gmail');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Check Gmail status
gmailCommand
    .command('status')
    .description('Check Gmail login status')
    .action(async () => {
    try {
        const registrar = new AccountRegistrar();
        const status = await registrar.getGmailStatus();
        if (status.connected) {
            console.log(chalk.green('✓ Gmail connected'));
            console.log(chalk.gray(`  Email: ${status.email}`));
            console.log(chalk.gray(`  Connected: ${status.connectedAt}`));
        }
        else {
            console.log(chalk.yellow('○ Gmail not connected'));
            console.log(chalk.gray('  Run `unmarket gmail login` to connect'));
        }
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Logout from Gmail
gmailCommand
    .command('logout')
    .description('Disconnect Gmail')
    .action(async () => {
    const spinner = ora('Disconnecting Gmail...').start();
    try {
        const registrar = new AccountRegistrar();
        await registrar.disconnectGmail();
        spinner.succeed('Gmail disconnected');
    }
    catch (error) {
        spinner.fail('Failed to disconnect Gmail');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
//# sourceMappingURL=gmail.js.map