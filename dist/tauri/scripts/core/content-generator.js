/**
 * Content generator - Creates marketing content for multiple platforms/languages
 */
import { getAIEngine } from './ai-engine.js';
import { createLogger } from '../utils/logger.js';
const logger = createLogger('content-generator');
export class ContentGenerator {
    ai = getAIEngine();
    /**
     * Generate content for all specified platforms and languages
     */
    async generate(product, options) {
        const results = [];
        const { platforms, languages, tone } = options;
        logger.info('Starting content generation', {
            product: product.name,
            platforms: platforms.length,
            languages: languages.length
        });
        for (const platform of platforms) {
            for (const language of languages) {
                try {
                    logger.debug('Generating content', { platform, language });
                    const content = await this.ai.generateContent({
                        product: {
                            name: product.name,
                            tagline: product.tagline || '',
                            description: product.description || '',
                            features: product.features || [],
                            url: product.url
                        },
                        platform,
                        language,
                        tone
                    });
                    results.push({
                        ...content,
                        platform,
                        language,
                        productId: 'id' in product ? product.id || '' : ''
                    });
                    // Rate limiting - small delay between requests
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                catch (error) {
                    logger.error('Failed to generate content', { platform, language, error });
                }
            }
        }
        logger.info('Content generation complete', { count: results.length });
        return results;
    }
    /**
     * Generate content for a single platform/language
     */
    async generateOne(product, platform, language, tone) {
        const content = await this.ai.generateContent({
            product: {
                name: product.name,
                tagline: product.tagline || '',
                description: product.description || '',
                features: product.features || [],
                url: product.url
            },
            platform,
            language,
            tone
        });
        return {
            ...content,
            platform,
            language,
            productId: product.id
        };
    }
    /**
     * Adapt content for a different platform
     */
    async adapt(content, targetPlatform) {
        // Re-generate for the new platform with same language
        const ai = getAIEngine();
        const adapted = await ai.generateContent({
            product: {
                name: content.title || 'Product',
                tagline: '',
                description: content.body,
                features: [],
                url: ''
            },
            platform: targetPlatform,
            language: content.language
        });
        return {
            ...adapted,
            platform: targetPlatform,
            language: content.language,
            productId: content.productId
        };
    }
    /**
     * Translate existing content to another language
     */
    async translate(content, targetLanguage) {
        const ai = getAIEngine();
        const translatedBody = await ai.translate(content.body, targetLanguage);
        const translatedTitle = content.title
            ? await ai.translate(content.title, targetLanguage)
            : undefined;
        return {
            ...content,
            title: translatedTitle,
            body: translatedBody,
            language: targetLanguage
        };
    }
    /**
     * Improve/optimize content
     */
    async optimize(content) {
        const ai = getAIEngine();
        const prompt = `Improve this ${content.platform} post to be more engaging and effective.
Keep the same language (${content.language}) and format.
Make it more compelling while maintaining authenticity.

Original:
${content.body}

Provide the improved version only, no explanations.`;
        const optimized = await ai.complete(prompt);
        return {
            ...content,
            body: optimized
        };
    }
}
//# sourceMappingURL=content-generator.js.map