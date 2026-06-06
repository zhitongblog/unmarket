/**
 * Stats CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Analytics } from '../core/analytics.js';

export const statsCommand = new Command('stats')
  .description('View publishing statistics')
  .argument('[product-id]', 'Product ID to show stats for')
  .option('--platform <platform>', 'Filter by platform')
  .option('--days <days>', 'Number of days to show', '7')
  .option('--top <n>', 'Show top N performers')
  .action(async (productId, options) => {
    const spinner = ora('Loading statistics...').start();
    try {
      const analytics = new Analytics();

      const stats = await analytics.getStats({
        productId,
        platform: options.platform,
        days: parseInt(options.days, 10),
        top: options.top ? parseInt(options.top, 10) : undefined
      });

      spinner.stop();

      console.log(chalk.cyan('\n📊 Publishing Statistics\n'));
      console.log(chalk.gray('─'.repeat(60)));

      // Summary
      console.log(chalk.bold('\nSummary:'));
      console.log(`  Total Posts: ${stats.totalPosts}`);
      console.log(`  Total Views: ${stats.totalViews.toLocaleString()}`);
      console.log(`  Total Engagements: ${stats.totalEngagements.toLocaleString()}`);
      console.log(`  Avg Engagement Rate: ${(stats.avgEngagementRate * 100).toFixed(2)}%`);

      // By platform
      if (stats.byPlatform.length > 0) {
        console.log(chalk.bold('\nBy Platform:'));
        console.log(chalk.gray('  Platform'.padEnd(20) + 'Posts'.padEnd(10) + 'Views'.padEnd(12) + 'Engagements'));
        console.log(chalk.gray('  ' + '─'.repeat(50)));

        for (const p of stats.byPlatform) {
          console.log(`  ${p.platform.padEnd(20)}${String(p.posts).padEnd(10)}${p.views.toLocaleString().padEnd(12)}${p.engagements.toLocaleString()}`);
        }
      }

      // Top performers
      if (stats.topPosts.length > 0) {
        console.log(chalk.bold('\nTop Performers:'));
        for (let i = 0; i < stats.topPosts.length; i++) {
          const post = stats.topPosts[i];
          console.log(`  ${i + 1}. ${post.platform} - ${post.title?.substring(0, 40) || 'Untitled'}...`);
          console.log(chalk.gray(`     Views: ${post.views.toLocaleString()}  Engagements: ${post.engagements.toLocaleString()}`));
        }
      }

      // Trend
      if (stats.trend.length > 0) {
        console.log(chalk.bold('\nDaily Trend:'));
        for (const day of stats.trend.slice(-7)) {
          const bar = '█'.repeat(Math.min(Math.round(day.posts * 2), 20));
          console.log(`  ${day.date.padEnd(12)} ${chalk.green(bar)} ${day.posts}`);
        }
      }

      console.log(chalk.gray('\n─'.repeat(60)));
    } catch (error) {
      spinner.fail('Failed to load statistics');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });
