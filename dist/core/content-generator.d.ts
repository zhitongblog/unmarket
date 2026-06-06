/**
 * Content generator - Creates marketing content for multiple platforms/languages
 */
import { type GeneratedContent } from './ai-engine.js';
import type { ProductInfo } from './product-manager.js';
export interface ContentItem extends GeneratedContent {
    platform: string;
    language: string;
    productId: string;
}
export interface GenerateOptions {
    platforms: string[];
    languages: string[];
    tone?: 'professional' | 'casual' | 'technical' | 'marketing';
}
export declare class ContentGenerator {
    private ai;
    /**
     * Generate content for all specified platforms and languages
     */
    generate(product: ProductInfo | {
        name: string;
        tagline: string;
        description: string;
        features?: string[];
        url: string;
        id?: string;
    }, options: GenerateOptions): Promise<ContentItem[]>;
    /**
     * Generate content for a single platform/language
     */
    generateOne(product: ProductInfo, platform: string, language: string, tone?: 'professional' | 'casual' | 'technical' | 'marketing'): Promise<ContentItem>;
    /**
     * Adapt content for a different platform
     */
    adapt(content: ContentItem, targetPlatform: string): Promise<ContentItem>;
    /**
     * Translate existing content to another language
     */
    translate(content: ContentItem, targetLanguage: string): Promise<ContentItem>;
    /**
     * Improve/optimize content
     */
    optimize(content: ContentItem): Promise<ContentItem>;
}
//# sourceMappingURL=content-generator.d.ts.map