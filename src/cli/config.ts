/**
 * Config CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfigManager } from '../storage/config.js';
import { join } from 'path';
import { homedir } from 'os';

export const configCommand = new Command('config')
  .description('Configuration management');

// Init config
configCommand
  .command('init')
  .description('Initialize configuration')
  .option('--force', 'Force re-initialization')
  .action(async (options) => {
    const spinner = ora('Initializing configuration...').start();
    try {
      const config = getConfigManager();

      if (config.isInitialized() && !options.force) {
        spinner.info('Configuration already initialized');
        console.log(chalk.gray(`Config file: ${join(homedir(), '.unmarket', 'config.yaml')}`));
        return;
      }

      config.reset();
      config.markInitialized();
      spinner.succeed('Configuration initialized');
      console.log(chalk.gray(`Config file: ${join(homedir(), '.unmarket', 'config.yaml')}`));
    } catch (error) {
      spinner.fail('Failed to initialize configuration');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// Show config
configCommand
  .command('show')
  .description('Show current configuration')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const config = getConfigManager();
      const all = config.getAll();

      if (options.json) {
        console.log(JSON.stringify(all, null, 2));
      } else {
        console.log(chalk.cyan('\nCurrent Configuration:\n'));

        // AI Config
        console.log(chalk.bold('AI:'));
        console.log(`  Provider: ${all.ai.provider}`);
        console.log(`  Model: ${all.ai.model}`);
        console.log(`  API Key: ${all.ai.apiKey ? '****' + all.ai.apiKey.slice(-4) : 'Not set'}`);

        // Browser Config
        console.log(chalk.bold('\nBrowser:'));
        console.log(`  Unzoo Path: ${all.browser.unzooPath}`);
        console.log(`  Headless: ${all.browser.headless}`);
        console.log(`  Timeout: ${all.browser.timeout}ms`);

        // Scheduler Config
        console.log(chalk.bold('\nScheduler:'));
        console.log(`  Mode: ${all.scheduler.mode}`);
        console.log(`  Interval: ${all.scheduler.intervalMinutes} minutes`);
        console.log(`  Max Daily Posts: ${all.scheduler.maxDailyPosts}`);
        console.log(`  Quiet Hours: ${all.scheduler.quietHours.start}:00 - ${all.scheduler.quietHours.end}:00`);

        // Languages & Platforms
        console.log(chalk.bold('\nLanguages:'));
        console.log(`  ${all.languages.join(', ')}`);

        console.log(chalk.bold('\nDefault Platforms:'));
        console.log(`  ${all.defaultPlatforms.join(', ')}`);

        console.log(chalk.gray(`\nConfig file: ${join(homedir(), '.unmarket', 'config.yaml')}`));
      }
    } catch (error) {
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// Set config
configCommand
  .command('set <key> <value>')
  .description('Set configuration value')
  .action(async (key, value) => {
    try {
      const config = getConfigManager();

      // Parse value
      let parsedValue: unknown = value;
      if (value === 'true') parsedValue = true;
      else if (value === 'false') parsedValue = false;
      else if (!isNaN(Number(value))) parsedValue = Number(value);

      config.set(key, parsedValue);
      console.log(chalk.green(`✓ Set ${key} = ${value}`));
    } catch (error) {
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// Get config
configCommand
  .command('get <key>')
  .description('Get configuration value')
  .action(async (key) => {
    try {
      const config = getConfigManager();
      const value = config.get(key);

      if (value === undefined) {
        console.log(chalk.yellow(`Key '${key}' not found`));
      } else {
        console.log(typeof value === 'object' ? JSON.stringify(value, null, 2) : value);
      }
    } catch (error) {
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// Reset config
configCommand
  .command('reset')
  .description('Reset configuration to defaults')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    if (!options.force) {
      console.log(chalk.yellow('This will reset all configuration to defaults.'));
      console.log(chalk.gray('Use --force to skip this confirmation.'));
      return;
    }

    const spinner = ora('Resetting configuration...').start();
    try {
      const config = getConfigManager();
      config.reset();
      spinner.succeed('Configuration reset to defaults');
    } catch (error) {
      spinner.fail('Failed to reset configuration');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });
