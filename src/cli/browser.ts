/**
 * Browser CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getUnzooClient } from '../browser/unzoo-client.js';

export const browserCommand = new Command('browser')
  .description('Browser control (via Unzoo)');

// Check browser status
browserCommand
  .command('status')
  .description('Check Unzoo browser status')
  .action(async () => {
    const spinner = ora('Checking Unzoo browser...').start();
    try {
      const client = getUnzooClient();
      const available = await client.isAvailable();

      if (available) {
        spinner.succeed('Unzoo browser is available');
      } else {
        spinner.fail('Unzoo browser not found');
        console.log(chalk.yellow('\nPlease install Unzoo browser from: https://unzoo.ai'));
      }
    } catch (error) {
      spinner.fail('Failed to check browser status');
      console.error(chalk.red((error as Error).message));
    }
  });

// Open browser
browserCommand
  .command('open [url]')
  .description('Open URL in Unzoo browser')
  .action(async (url) => {
    const spinner = ora('Opening browser...').start();
    try {
      const client = getUnzooClient();
      await client.openInteractive(url);
      spinner.succeed('Browser opened');
    } catch (error) {
      spinner.fail('Failed to open browser');
      console.error(chalk.red((error as Error).message));
    }
  });

// Navigate
browserCommand
  .command('navigate <url>')
  .description('Navigate to URL')
  .action(async (url) => {
    const spinner = ora(`Navigating to ${url}...`).start();
    try {
      const client = getUnzooClient();
      await client.navigate(url);
      spinner.succeed('Navigation complete');
    } catch (error) {
      spinner.fail('Navigation failed');
      console.error(chalk.red((error as Error).message));
    }
  });

// Screenshot
browserCommand
  .command('screenshot [path]')
  .description('Take a screenshot')
  .option('--full-page', 'Capture full page')
  .action(async (path, options) => {
    const spinner = ora('Taking screenshot...').start();
    try {
      const client = getUnzooClient();
      const result = await client.screenshot({
        path,
        fullPage: options.fullPage
      });

      if (result.success) {
        spinner.succeed(`Screenshot saved: ${path || 'clipboard'}`);
      } else {
        spinner.fail('Screenshot failed');
      }
    } catch (error) {
      spinner.fail('Failed to take screenshot');
      console.error(chalk.red((error as Error).message));
    }
  });

// Close browser
browserCommand
  .command('close')
  .description('Close browser')
  .action(async () => {
    const spinner = ora('Closing browser...').start();
    try {
      const client = getUnzooClient();
      await client.close();
      spinner.succeed('Browser closed');
    } catch (error) {
      spinner.fail('Failed to close browser');
      console.error(chalk.red((error as Error).message));
    }
  });
