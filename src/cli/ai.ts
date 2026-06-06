/**
 * AI CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getAIEngine, AI_PROVIDERS } from '../core/ai-engine.js';

export const aiCommand = new Command('ai')
  .description('AI model configuration');

// Configure AI
aiCommand
  .command('config')
  .description('Configure AI model')
  .option('--provider <provider>', 'AI provider (anthropic, openai, google, qwen, doubao, deepseek, glm, kimi)')
  .option('--model <model>', 'Model name')
  .option('--api-key <key>', 'API key')
  .option('--base-url <url>', 'Custom base URL')
  .action(async (options) => {
    const ai = getAIEngine();

    if (options.provider || options.model || options.apiKey) {
      ai.configure(
        options.provider || 'openai',
        options.model || 'gpt-4.1',
        options.apiKey,
        options.baseUrl
      );
      console.log(chalk.green('✓ AI configuration updated'));
    } else {
      // Show available providers
      console.log(chalk.cyan('\nAvailable AI Providers:\n'));
      for (const [key, provider] of Object.entries(AI_PROVIDERS)) {
        console.log(`  ${chalk.bold(key)}: ${provider.name}`);
        console.log(`    Models: ${provider.models.join(', ')}`);
        console.log('');
      }
      console.log(chalk.gray('Use --provider, --model, and --api-key to configure'));
    }
  });

// Test AI
aiCommand
  .command('test')
  .description('Test AI connection')
  .action(async () => {
    const spinner = ora('Testing AI connection...').start();
    try {
      const ai = getAIEngine();

      if (!ai.isConfigured()) {
        spinner.fail('AI not configured');
        console.log(chalk.yellow('Run: unmarket ai config --provider <provider> --api-key <key>'));
        return;
      }

      spinner.succeed('AI connection successful');
    } catch (error) {
      spinner.fail('AI test failed');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

// List models
aiCommand
  .command('models')
  .description('List available AI models')
  .action(() => {
    console.log(chalk.cyan('\nAvailable AI Models:\n'));

    for (const [key, provider] of Object.entries(AI_PROVIDERS)) {
      console.log(chalk.bold(`${provider.name} (${key}):`));
      for (const model of provider.models) {
        console.log(`  - ${model}`);
      }
      console.log('');
    }
  });
