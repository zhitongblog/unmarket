/**
 * Main command handler (unmarket <url>)
 */
import chalk from 'chalk';
import ora from 'ora';
import { Crawler } from '../core/crawler.js';
import { ContentGenerator } from '../core/content-generator.js';
import { Publisher } from '../core/publisher.js';
import { ProductManager } from '../core/product-manager.js';
export async function handleMainCommand(url, options) {
    console.log(chalk.cyan('\n🚀 UnMarket - Global Marketing Automation\n'));
    // Step 1: Analyze product
    let spinner = ora('Analyzing product...').start();
    const crawler = new Crawler();
    let product;
    try {
        product = await crawler.analyze(url);
        spinner.succeed(`Product analyzed: ${product.name}`);
    }
    catch (error) {
        spinner.fail('Failed to analyze product');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
    // Show product summary
    console.log(chalk.gray('\n┌─────────────────────────────────────────┐'));
    console.log(chalk.gray('│') + ` ${chalk.bold(product.name).padEnd(40)}` + chalk.gray('│'));
    console.log(chalk.gray('│') + ` ${product.tagline.substring(0, 39).padEnd(40)}` + chalk.gray('│'));
    console.log(chalk.gray('│') + ` Type: ${product.type.padEnd(32)}` + chalk.gray('│'));
    console.log(chalk.gray('└─────────────────────────────────────────┘\n'));
    // Step 2: Generate content
    spinner = ora('Generating content...').start();
    const generator = new ContentGenerator();
    let contents;
    try {
        const platforms = options.platforms?.split(',').map(p => p.trim()) || product.recommendedPlatforms;
        const languages = options.languages?.split(',').map(l => l.trim()) || product.recommendedLanguages;
        contents = await generator.generate(product, { platforms, languages });
        spinner.succeed(`Generated ${contents.length} content variations`);
    }
    catch (error) {
        spinner.fail('Failed to generate content');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
    // Show content summary
    console.log(chalk.gray('\nGenerated Content:'));
    const platformGroups = {};
    for (const c of contents) {
        platformGroups[c.platform] = (platformGroups[c.platform] || 0) + 1;
    }
    for (const [platform, count] of Object.entries(platformGroups)) {
        console.log(`  ├── ${platform}: ${count} languages`);
    }
    // Preview mode - stop here
    if (options.preview) {
        console.log(chalk.cyan('\n📋 Preview Mode - Content generated but not published\n'));
        for (const content of contents.slice(0, 5)) {
            console.log(chalk.bold(`\n${content.platform} (${content.language}):`));
            console.log(chalk.gray('─'.repeat(40)));
            console.log(content.title || '');
            console.log(content.body.substring(0, 200) + '...');
        }
        if (contents.length > 5) {
            console.log(chalk.gray(`\n... and ${contents.length - 5} more`));
        }
        console.log(chalk.yellow('\nRun without --preview to publish'));
        return;
    }
    // Step 3: Save product
    spinner = ora('Saving product...').start();
    const productManager = new ProductManager();
    try {
        const saved = await productManager.saveAnalyzed(product);
        spinner.succeed(`Product saved: ${saved.id}`);
    }
    catch (error) {
        spinner.warn('Product already exists, updating...');
    }
    // Step 4: Publish
    console.log(chalk.cyan('\n🚀 Publishing...\n'));
    const publisher = new Publisher();
    let successCount = 0;
    let failCount = 0;
    for (const content of contents) {
        const platformSpinner = ora(`${content.platform} (${content.language})...`).start();
        try {
            if (options.dryRun) {
                // Simulate publishing
                await new Promise(resolve => setTimeout(resolve, 500));
                platformSpinner.succeed(`${content.platform} (${content.language}) - [DRY RUN]`);
            }
            else {
                const result = await publisher.publishOne(content);
                if (result.success) {
                    platformSpinner.succeed(`${content.platform} (${content.language}) ${chalk.gray(result.url || '')}`);
                    successCount++;
                }
                else {
                    platformSpinner.fail(`${content.platform} (${content.language}) - ${result.error}`);
                    failCount++;
                }
            }
        }
        catch (error) {
            platformSpinner.fail(`${content.platform} (${content.language}) - ${error.message}`);
            failCount++;
        }
    }
    // Summary
    console.log(chalk.gray('\n─'.repeat(50)));
    console.log(`\n${chalk.green(`✓ ${successCount} succeeded`)}  ${failCount > 0 ? chalk.red(`✗ ${failCount} failed`) : ''}`);
    if (options.dryRun) {
        console.log(chalk.yellow('\n[Dry run - no actual posts were made]'));
    }
    else {
        console.log(chalk.gray('\nUse `unmarket stats` to track performance'));
    }
}
//# sourceMappingURL=main.js.map