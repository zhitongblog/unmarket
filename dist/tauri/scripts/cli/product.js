/**
 * Product CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getProductManager } from '../core/product-manager.js';
import { Crawler } from '../core/crawler.js';
export const productCommand = new Command('product')
    .description('Manage products');
// List all products
productCommand
    .command('list')
    .description('List all products')
    .option('--all', 'Include inactive products')
    .action(async (options) => {
    const spinner = ora('Loading products...').start();
    try {
        const manager = getProductManager();
        const products = manager.list(!options.all);
        spinner.stop();
        if (products.length === 0) {
            console.log(chalk.yellow('No products added yet.'));
            console.log(chalk.gray('Use `unmarket product add <url>` to add a product.'));
            return;
        }
        console.log(chalk.cyan('\nProducts:\n'));
        console.log(chalk.gray('─'.repeat(70)));
        for (const product of products) {
            const status = product.active ? chalk.green('●') : chalk.gray('○');
            console.log(`${status} ${chalk.bold(product.name)}`);
            console.log(chalk.gray(`    ID: ${product.id}`));
            console.log(chalk.gray(`    URL: ${product.url}`));
            console.log(`    Priority: ${product.priority}  Weight: ${product.weight}`);
            console.log('');
        }
        console.log(chalk.gray('─'.repeat(70)));
        console.log(chalk.gray(`Total: ${products.length} products`));
    }
    catch (error) {
        spinner.fail('Failed to list products');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Add a product
productCommand
    .command('add <url>')
    .description('Add a new product by URL')
    .option('--priority <level>', 'Priority level (0-10)', '5')
    .option('--weight <weight>', 'Weight (1-10)', '5')
    .action(async (url, options) => {
    const spinner = ora('Analyzing product...').start();
    try {
        const crawler = new Crawler();
        const analyzed = await crawler.analyze(url);
        spinner.text = 'Saving product...';
        const manager = getProductManager();
        const product = manager.saveAnalyzed(analyzed);
        // Update priority and weight if provided
        if (options.priority) {
            manager.update(product.id, { priority: parseInt(options.priority, 10) });
        }
        if (options.weight) {
            manager.update(product.id, { weight: parseInt(options.weight, 10) });
        }
        spinner.succeed(`Product added: ${product.name}`);
        console.log(chalk.gray(`  ID: ${product.id}`));
        console.log(chalk.gray(`  Type: ${product.type}`));
        console.log(chalk.gray(`  Tagline: ${product.tagline || 'N/A'}`));
    }
    catch (error) {
        spinner.fail('Failed to add product');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Show product details
productCommand
    .command('show <id>')
    .description('Show product details')
    .action(async (id) => {
    try {
        const manager = getProductManager();
        const product = manager.getById(id);
        if (!product) {
            console.log(chalk.yellow(`Product '${id}' not found`));
            return;
        }
        console.log(chalk.cyan(`\n${product.name}\n`));
        console.log(`  ID: ${product.id}`);
        console.log(`  URL: ${product.url}`);
        console.log(`  Tagline: ${product.tagline || 'N/A'}`);
        console.log(`  Type: ${product.type}`);
        console.log(`  Priority: ${product.priority}`);
        console.log(`  Weight: ${product.weight}`);
        console.log(`  Active: ${product.active ? 'Yes' : 'No'}`);
        if (product.features.length > 0) {
            console.log(`\n  Features:`);
            product.features.forEach((f, i) => console.log(`    ${i + 1}. ${f}`));
        }
        console.log(`\n  Recommended Platforms:`);
        console.log(`    ${product.recommendedPlatforms.join(', ')}`);
        console.log(`\n  Recommended Languages:`);
        console.log(`    ${product.recommendedLanguages.join(', ')}`);
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Delete product
productCommand
    .command('delete <id>')
    .description('Delete a product')
    .action(async (id) => {
    const spinner = ora('Deleting product...').start();
    try {
        const manager = getProductManager();
        const deleted = manager.delete(id);
        if (deleted) {
            spinner.succeed(`Product '${id}' deleted`);
        }
        else {
            spinner.fail('Product not found');
        }
    }
    catch (error) {
        spinner.fail('Failed to delete product');
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Activate/deactivate product
productCommand
    .command('activate <id>')
    .description('Activate a product')
    .action(async (id) => {
    try {
        const manager = getProductManager();
        manager.setActive(id, true);
        console.log(chalk.green(`✓ Product activated`));
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
productCommand
    .command('deactivate <id>')
    .description('Deactivate a product')
    .action(async (id) => {
    try {
        const manager = getProductManager();
        manager.setActive(id, false);
        console.log(chalk.green(`✓ Product deactivated`));
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Update product
productCommand
    .command('update <id>')
    .description('Update product settings')
    .option('--priority <level>', 'Priority level (0-10)')
    .option('--weight <weight>', 'Weight (1-10)')
    .action(async (id, options) => {
    try {
        const manager = getProductManager();
        const updates = {};
        if (options.priority !== undefined) {
            updates.priority = parseInt(options.priority, 10);
        }
        if (options.weight !== undefined) {
            updates.weight = parseInt(options.weight, 10);
        }
        manager.update(id, updates);
        console.log(chalk.green(`✓ Product updated`));
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Manual product add (without browser analysis)
productCommand
    .command('create')
    .description('Create a product manually (without browser analysis)')
    .requiredOption('--name <name>', 'Product name')
    .requiredOption('--url <url>', 'Product URL')
    .option('--tagline <tagline>', 'Product tagline')
    .option('--description <description>', 'Product description')
    .option('--type <type>', 'Product type (tool, saas, app, service, library, plugin)', 'tool')
    .option('--features <features>', 'Comma-separated features')
    .option('--platforms <platforms>', 'Comma-separated platforms')
    .option('--languages <languages>', 'Comma-separated languages', 'en')
    .option('--priority <level>', 'Priority level (0-10)', '5')
    .option('--weight <weight>', 'Weight (1-10)', '5')
    .action(async (options) => {
    try {
        const manager = getProductManager();
        const product = manager.add({
            name: options.name,
            url: options.url,
            tagline: options.tagline,
            description: options.description,
            type: options.type,
            features: options.features ? options.features.split(',').map((f) => f.trim()) : [],
            recommendedPlatforms: options.platforms
                ? options.platforms.split(',').map((p) => p.trim())
                : ['twitter', 'reddit', 'hackernews', 'linkedin'],
            recommendedLanguages: options.languages
                ? options.languages.split(',').map((l) => l.trim())
                : ['en'],
            priority: parseInt(options.priority, 10),
            weight: parseInt(options.weight, 10)
        });
        console.log(chalk.green(`✓ Product created: ${product.name}`));
        console.log(chalk.gray(`  ID: ${product.id}`));
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
// Add demo product
productCommand
    .command('demo')
    .description('Add a demo product for testing')
    .action(async () => {
    try {
        const manager = getProductManager();
        const product = manager.add({
            name: 'Unzoo Browser',
            url: 'https://unzoo.com',
            tagline: 'AI-powered browser automation',
            description: 'Unzoo is an AI-powered browser that lets you automate any web task with natural language commands.',
            type: 'tool',
            features: [
                'Natural language automation',
                'AI-powered web scraping',
                'Cross-browser support',
                'API integration',
                'Visual debugging'
            ],
            recommendedPlatforms: ['twitter', 'reddit', 'hackernews', 'producthunt', 'linkedin', 'devto'],
            recommendedLanguages: ['en', 'zh', 'ja'],
            priority: 8,
            weight: 8
        });
        console.log(chalk.green(`✓ Demo product created: ${product.name}`));
        console.log(chalk.gray(`  ID: ${product.id}`));
        console.log(chalk.gray('\nYou can now test with:'));
        console.log(chalk.cyan(`  unmarket publish ${product.id} --dry-run`));
    }
    catch (error) {
        console.error(chalk.red(error.message));
        process.exit(1);
    }
});
//# sourceMappingURL=product.js.map