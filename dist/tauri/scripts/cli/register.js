/**
 * Register CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { AccountRegistrar } from '../core/account-registrar.js';
const SUPPORTED_PLATFORMS = [
    'twitter', 'reddit', 'linkedin', 'devto', 'hackernews', 'producthunt'
];
export const registerCommand = new Command('register')
    .description('Auto-register accounts on platforms')
    .argument('[platform]', 'Platform to register (or use --all)')
    .option('--all', 'Register on all supported platforms')
    .option('--platforms <list>', 'Comma-separated list of platforms')
    .action(async (platform, options) => {
    try {
        const registrar = new AccountRegistrar();
        // Check Gmail is set up
        const gmailStatus = await registrar.getGmailStatus();
        if (!gmailStatus.connected) {
            console.log(chalk.yellow('Gmail not set up. Please run:'));
            console.log(chalk.cyan('  unmarket gmail login'));
            process.exit(1);
        }
        let platforms;
        if (options.all) {
            platforms = SUPPORTED_PLATFORMS;
        }
        else if (options.platforms) {
            platforms = options.platforms.split(',').map((p) => p.trim());
        }
        else if (platform) {
            platforms = [platform];
        }
        else {
            console.log(chalk.cyan('\nSupported platforms for auto-registration:\n'));
            for (const p of SUPPORTED_PLATFORMS) {
                console.log(`  - ${p}`);
            }
            console.log(chalk.gray('\nUsage: unmarket register <platform>'));
            console.log(chalk.gray('       unmarket register --all'));
            return;
        }
        console.log(chalk.cyan(`\nRegistering on ${platforms.length} platform(s)...\n`));
        for (const p of platforms) {
            const spinner = ora(`Registering ${p}...`).start();
            try {
                const result = await registrar.register(p);
                if (result.success) {
                    spinner.succeed(`${p}: @${result.username}`);
                }
                else if (result.needsManualVerification) {
                    spinner.warn(`${p}: Manual verification required`);
                    console.log(chalk.yellow(`    Reason: ${result.verificationReason}`));
                    console.log(chalk.gray(`    Please complete in Unzoo browser, then press Enter...`));
                    // Wait for user
                    await new Promise(resolve => {
                        process.stdin.once('data', () => resolve());
                    });
                }
                else {
                    spinner.fail(`${p}: ${result.error}`);
                }
            }
            catch (error) {
                spinner.fail(`${p}: ${error.message}`);
            }
        }
        console.log(chalk.cyan('\nRegistration complete.'));
        console.log(chalk.gray('Use `unmarket account list` to see all accounts.'));
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
//# sourceMappingURL=register.js.map