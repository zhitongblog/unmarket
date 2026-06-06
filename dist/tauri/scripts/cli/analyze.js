/**
 * Analyze CLI command
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Crawler } from '../core/crawler.js';
export const analyzeCommand = new Command('analyze')
    .description('Analyze a product URL')
    .argument('<url>', 'Product URL to analyze')
    .option('--save', 'Save as a new product')
    .action(async (url, options) => {
    const spinner = ora('Analyzing product...').start();
    try {
        const crawler = new Crawler();
        const product = await crawler.analyze(url);
        spinner.stop();
        console.log(chalk.cyan('\n═══════════════════════════════════════════════════════════'));
        console.log(chalk.bold(`  ${product.name}`));
        console.log(chalk.cyan('═══════════════════════════════════════════════════════════\n'));
        console.log(`  ${chalk.gray('Tagline:')} ${product.tagline}`);
        console.log(`  ${chalk.gray('Type:')} ${product.type}`);
        console.log(`  ${chalk.gray('URL:')} ${product.url}`);
        console.log(`\n  ${chalk.gray('Description:')}`);
        console.log(`  ${product.description}`);
        if (product.features.length > 0) {
            console.log(`\n  ${chalk.gray('Core Features:')}`);
            product.features.forEach((f, i) => {
                console.log(`    ${i + 1}. ${f}`);
            });
        }
        if (product.targetAudience && product.targetAudience.length > 0) {
            console.log(`\n  ${chalk.gray('Target Users:')}`);
            product.targetAudience.forEach((u, i) => {
                console.log(`    ${i + 1}. ${u}`);
            });
        }
        if (product.pricing) {
            console.log(`\n  ${chalk.gray('Pricing:')} ${product.pricing.model}`);
            if (product.pricing.plans) {
                console.log(`    Plans: ${product.pricing.plans.join(', ')}`);
            }
        }
        console.log(`\n  ${chalk.gray('Recommended Platforms:')}`);
        console.log(`    ${product.recommendedPlatforms.join(', ')}`);
        console.log(`\n  ${chalk.gray('Recommended Languages:')}`);
        console.log(`    ${product.recommendedLanguages.join(', ')}`);
        if (product.screenshots.length > 0) {
            console.log(`\n  ${chalk.gray('Screenshots:')} ${product.screenshots.length} captured`);
        }
        console.log(chalk.cyan('\n═══════════════════════════════════════════════════════════\n'));
        if (options.save) {
            const { getProductManager } = await import('../core/product-manager.js');
            const manager = getProductManager();
            const saved = manager.saveAnalyzed(product);
            console.log(chalk.green(`✓ Product saved with ID: ${saved.id}`));
        }
        else {
            console.log(chalk.gray('Use --save to save this product, or run:'));
            console.log(chalk.gray(`  unmarket product add ${url}`));
        }
    }
    catch (error) {
        spinner.fail('Failed to analyze product');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
//# sourceMappingURL=analyze.js.map