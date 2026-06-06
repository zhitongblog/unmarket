/**
 * Web crawler for product analysis
 * Uses Unzoo browser to crawl product websites
 */
import { getUnzooClient } from '../browser/unzoo-client.js';
import { getAIEngine } from './ai-engine.js';
import { crawlerLogger as logger } from '../utils/logger.js';

export interface AnalyzedProduct {
  name: string;
  url: string;
  tagline: string;
  description: string;
  type: 'tool' | 'saas' | 'app' | 'service' | 'library' | 'plugin' | 'other';
  logoUrl?: string;
  screenshots: string[];
  features: string[];
  pricing?: {
    model: 'free' | 'freemium' | 'paid' | 'subscription';
    plans?: string[];
  };
  techStack?: string[];
  targetAudience?: string[];
  competitors?: string[];
  recommendedPlatforms: string[];
  recommendedLanguages: string[];
}

export class Crawler {
  private unzoo = getUnzooClient();

  /**
   * Analyze a product from its URL
   */
  async analyze(url: string): Promise<AnalyzedProduct> {
    logger.info('Starting product analysis', { url });

    // Navigate to URL
    const navResult = await this.unzoo.navigate(url, { waitUntil: 'networkidle' });
    if (!navResult.success) {
      throw new Error(`Failed to navigate to ${url}: ${navResult.error}`);
    }

    // Get page content
    const contentResult = await this.unzoo.getContent();
    if (!contentResult.success) {
      throw new Error('Failed to get page content');
    }

    const pageContent = contentResult.output || '';

    // Get page title
    const title = await this.unzoo.getTitle() || '';

    // Extract text content
    const textResult = await this.unzoo.getText();
    const textContent = textResult.output || '';

    // Try to find logo
    const logoUrl = await this.findLogo();

    // Try to find screenshots
    const screenshots = await this.findScreenshots();

    // Use AI to analyze the product
    const ai = getAIEngine();
    const analysis = await ai.analyzeProduct({
      url,
      title,
      htmlContent: pageContent.substring(0, 50000), // Limit content size
      textContent: textContent.substring(0, 20000)
    });

    const result: AnalyzedProduct = {
      name: analysis.name || title || this.extractNameFromUrl(url),
      url,
      tagline: analysis.tagline || '',
      description: analysis.description || '',
      type: analysis.type || 'tool',
      logoUrl,
      screenshots,
      features: analysis.features || [],
      pricing: analysis.pricing,
      techStack: analysis.techStack,
      targetAudience: analysis.targetAudience,
      competitors: analysis.competitors,
      recommendedPlatforms: this.recommendPlatforms(analysis),
      recommendedLanguages: this.recommendLanguages(analysis)
    };

    logger.info('Product analysis complete', { name: result.name, type: result.type });

    return result;
  }

  /**
   * Find product logo
   */
  private async findLogo(): Promise<string | undefined> {
    // Common logo selectors
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'meta[property="og:image"]',
      'img[alt*="logo" i]',
      'img[class*="logo" i]',
      'header img:first-of-type',
      '.logo img',
      '#logo img'
    ];

    for (const selector of selectors) {
      const result = await this.unzoo.find(selector);
      if (result.success && result.output) {
        // Try to extract src or href
        const attr = selector.includes('link') || selector.includes('meta')
          ? await this.unzoo.getAttribute(selector, selector.includes('meta') ? 'content' : 'href')
          : await this.unzoo.getAttribute(selector, 'src');

        if (attr) return attr;
      }
    }

    return undefined;
  }

  /**
   * Find product screenshots
   */
  private async findScreenshots(): Promise<string[]> {
    const screenshots: string[] = [];

    // Common screenshot selectors
    const selectors = [
      'meta[property="og:image"]',
      'img[alt*="screenshot" i]',
      'img[class*="screenshot" i]',
      '.screenshots img',
      '.gallery img',
      '.hero img',
      'section img'
    ];

    for (const selector of selectors) {
      const attr = selector.includes('meta')
        ? await this.unzoo.getAttribute(selector, 'content')
        : await this.unzoo.getAttribute(selector, 'src');

      if (attr && !screenshots.includes(attr)) {
        screenshots.push(attr);
      }

      if (screenshots.length >= 5) break;
    }

    return screenshots;
  }

  /**
   * Extract product name from URL
   */
  private extractNameFromUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      // Remove common prefixes/suffixes
      return hostname
        .replace(/^www\./, '')
        .replace(/\.(com|io|co|app|dev|ai|org|net)$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    } catch {
      return 'Unknown Product';
    }
  }

  /**
   * Recommend platforms based on analysis
   */
  private recommendPlatforms(analysis: {
    type?: string;
    targetAudience?: string[];
    techStack?: string[];
  }): string[] {
    const platforms: string[] = [];

    // Always include major platforms
    platforms.push('twitter', 'linkedin', 'reddit');

    // Tech products
    if (analysis.type === 'tool' || analysis.type === 'library' || analysis.type === 'plugin') {
      platforms.push('hackernews', 'producthunt', 'github', 'devto');
    }

    // Developer-focused
    if (analysis.techStack && analysis.techStack.length > 0) {
      platforms.push('stackoverflow', 'devto', 'hashnode');
    }

    // B2B products
    if (analysis.targetAudience?.some(a => a.toLowerCase().includes('business') || a.toLowerCase().includes('enterprise'))) {
      platforms.push('linkedin', 'indiehackers');
    }

    // Consumer products
    if (analysis.type === 'app' || analysis.type === 'saas') {
      platforms.push('producthunt', 'betalist', 'alternativeto');
    }

    // Add regional platforms
    platforms.push('v2ex', 'juejin'); // China
    platforms.push('qiita', 'zenn'); // Japan
    platforms.push('habr'); // Russia

    return [...new Set(platforms)];
  }

  /**
   * Recommend languages based on analysis
   */
  private recommendLanguages(analysis: {
    targetAudience?: string[];
    description?: string;
  }): string[] {
    const languages = ['en']; // English is always included

    // Check for regional targeting
    const description = (analysis.description || '').toLowerCase();
    const audiences = (analysis.targetAudience || []).map(a => a.toLowerCase());

    // Chinese market
    if (audiences.some(a => a.includes('china') || a.includes('chinese')) ||
        description.includes('china') || description.includes('chinese')) {
      languages.push('zh');
    }

    // Japanese market
    if (audiences.some(a => a.includes('japan')) || description.includes('japan')) {
      languages.push('ja');
    }

    // Default to major languages for global products
    if (languages.length === 1) {
      languages.push('zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt', 'ru');
    }

    return languages;
  }
}
