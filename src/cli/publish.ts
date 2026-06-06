/**
 * Publish CLI commands
 */
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { Publisher } from '../core/publisher.js';
import { ContentGenerator } from '../core/content-generator.js';
import { getProductManager } from '../core/product-manager.js';
import { getAIEngine } from '../core/ai-engine.js';

// Generate preview without publishing
export const previewCommand = new Command('preview')
  .description('Preview generated content without publishing')
  .argument('<product-id>', 'Product ID to preview')
  .option('-p, --target-platforms <platforms>', 'Comma-separated list of platforms', 'twitter')
  .option('-l, --target-languages <languages>', 'Comma-separated list of languages', 'en')
  .option('--demo', 'Use demo content (no AI needed)')
  .action(async (productId, options) => {
    const spinner = ora('Generating content preview...').start();
    try {
      const productManager = getProductManager();
      const product = productManager.getById(productId);

      if (!product) {
        spinner.fail(`Product '${productId}' not found`);
        process.exit(1);
      }

      const platformsStr = options.targetPlatforms || 'twitter';
      const languagesStr = options.targetLanguages || 'en';
      const platforms = platformsStr.split(',').map((p: string) => p.trim()).filter(Boolean);
      const languages = languagesStr.split(',').map((l: string) => l.trim()).filter(Boolean);

      spinner.stop();
      console.log(chalk.cyan(`\n═══ Content Preview for: ${product.name} ═══\n`));
      console.log(chalk.gray(`Platforms: ${platforms.join(', ')} | Languages: ${languages.join(', ')}\n`));

      for (const platform of platforms) {
        for (const language of languages) {
          console.log(chalk.gray('─'.repeat(60)));
          console.log(chalk.bold(`${platform} (${language}):\n`));

          if (options.demo) {
            // Generate demo content without AI
            const demoContent = generateDemoContent(product, platform, language);
            console.log(chalk.white(demoContent.body));
            if (demoContent.hashtags && demoContent.hashtags.length > 0) {
              console.log(chalk.blue(`\n${demoContent.hashtags.map(h => `#${h}`).join(' ')}`));
            }
          } else {
            // Use AI to generate content
            const ai = getAIEngine();
            if (!ai.isConfigured()) {
              console.log(chalk.yellow('  [AI not configured - showing demo content]'));
              const demoContent = generateDemoContent(product, platform, language);
              console.log(chalk.white(demoContent.body));
            } else {
              spinner.start(`Generating ${platform} content...`);
              const generator = new ContentGenerator();
              const contents = await generator.generate(product, {
                platforms: [platform],
                languages: [language]
              });
              spinner.stop();

              if (contents.length > 0) {
                const content = contents[0];
                if (content.title) {
                  console.log(chalk.bold(content.title));
                  console.log('');
                }
                console.log(chalk.white(content.body));
                if (content.hashtags && content.hashtags.length > 0) {
                  console.log(chalk.blue(`\n${content.hashtags.map(h => `#${h}`).join(' ')}`));
                }
              }
            }
          }
          console.log('');
        }
      }
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.gray('\nTo publish, run:'));
      console.log(chalk.cyan(`  unmarket publish ${productId} --platforms ${platformsStr}`));
    } catch (error) {
      spinner.fail('Failed to generate preview');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });

function generateDemoContent(
  product: { name: string; tagline?: string; description?: string; url: string; features: string[] },
  platform: string,
  language: string
): { body: string; hashtags?: string[] } {
  // Demo content generator for testing without AI
  const templates: Record<string, { body: string; hashtags: string[] }> = {
    twitter: {
      body: language === 'zh'
        ? `🚀 ${product.name} - ${product.tagline || '强大的工具'}\n\n${product.features?.slice(0, 2).join(' | ') || '功能强大'}\n\n了解更多 👉 ${product.url}`
        : `🚀 ${product.name} - ${product.tagline || 'A powerful tool'}\n\n${product.features?.slice(0, 2).join(' | ') || 'Powerful features'}\n\nCheck it out 👉 ${product.url}`,
      hashtags: ['tech', 'productivity', 'tools', 'innovation']
    },
    linkedin: {
      body: language === 'zh'
        ? `我很高兴向大家介绍 ${product.name}！\n\n${product.description || product.tagline || '一款强大的工具'}\n\n主要功能：\n${product.features?.slice(0, 3).map(f => `• ${f}`).join('\n') || '• 功能丰富'}\n\n了解更多：${product.url}`
        : `I'm excited to share ${product.name} with you!\n\n${product.description || product.tagline || 'A powerful tool'}\n\nKey features:\n${product.features?.slice(0, 3).map(f => `• ${f}`).join('\n') || '• Feature-rich'}\n\nLearn more: ${product.url}`,
      hashtags: ['innovation', 'technology', 'productivity', 'business']
    },
    reddit: {
      body: language === 'zh'
        ? `${product.name} - ${product.tagline || '值得一试'}\n\n${product.description || '一个很有用的工具。'}\n\n有人用过吗？欢迎分享体验！\n\n链接：${product.url}`
        : `${product.name} - ${product.tagline || 'Worth checking out'}\n\n${product.description || 'A useful tool.'}\n\nHas anyone used this? Share your experience!\n\nLink: ${product.url}`,
      hashtags: []
    },
    hackernews: {
      body: `${product.name}${product.tagline ? ` - ${product.tagline}` : ''}\n\n${product.url}`,
      hashtags: []
    }
  };

  return templates[platform] || templates.twitter;
}

export const publishCommand = new Command('publish')
  .description('Publish content to platforms')
  .argument('<product-id>', 'Product ID to publish')
  .option('-p, --target-platforms <platforms>', 'Comma-separated list of platforms')
  .option('-l, --target-languages <languages>', 'Comma-separated list of languages')
  .option('-n, --simulate', 'Simulate without actually posting')
  .action(async (productId, options) => {
    const spinner = ora('Preparing to publish...').start();
    try {
      // Get product
      const productManager = getProductManager();
      const product = productManager.getById(productId);

      if (!product) {
        spinner.fail(`Product '${productId}' not found`);
        process.exit(1);
      }

      // Parse platforms and languages
      const platforms = options.targetPlatforms
        ? options.targetPlatforms.split(',').map((p: string) => p.trim())
        : product.recommendedPlatforms;

      const languages = options.targetLanguages
        ? options.targetLanguages.split(',').map((l: string) => l.trim())
        : product.recommendedLanguages;

      spinner.text = 'Generating content...';

      // Generate content
      const generator = new ContentGenerator();
      let contents: Array<{
        body: string;
        title?: string;
        hashtags?: string[];
        platform: string;
        language: string;
        productId: string;
      }>;


      // Check if AI is configured
      const ai = getAIEngine();
      if (!ai.isConfigured() && options.simulate) {
        // Use demo content for dry-run when AI is not configured
        spinner.stop();
        console.log(chalk.yellow('\n[AI not configured - using demo content for dry-run]'));
        contents = [];
        for (const platform of platforms) {
          for (const language of languages) {
            const demoContent = generateDemoContent(product, platform, language);
            contents.push({
              ...demoContent,
              platform,
              language,
              productId: product.id
            });
          }
        }
      } else {
        contents = await generator.generate(product, { platforms, languages });
      }

      spinner.text = 'Publishing...';
      spinner.stop();

      console.log(chalk.cyan('\nPublishing to platforms...\n'));
      console.log(chalk.gray('─'.repeat(60)));

      const publisher = new Publisher();
      let successCount = 0;
      let failCount = 0;

      for (const content of contents) {
        const platformSpinner = ora(`${content.platform} (${content.language})...`).start();

        if (options.simulate) {
          // Simulate
          await new Promise(resolve => setTimeout(resolve, 500));
          platformSpinner.succeed(`${content.platform} (${content.language}) [DRY RUN]`);
          successCount++;
        } else {
          const result = await publisher.publishOne(content);

          if (result.success) {
            platformSpinner.succeed(`${content.platform} (${content.language}) ${chalk.gray(result.url || '')}`);
            successCount++;
          } else {
            platformSpinner.fail(`${content.platform} (${content.language}) - ${result.error}`);
            failCount++;
          }
        }
      }

      console.log(chalk.gray('─'.repeat(60)));
      console.log(`${chalk.green(`✓ ${successCount} succeeded`)}  ${failCount > 0 ? chalk.red(`✗ ${failCount} failed`) : ''}`);

      if (options.simulate) {
        console.log(chalk.yellow('\n[Dry run - no actual posts were made]'));
      }
    } catch (error) {
      spinner.fail('Failed to publish');
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  });
