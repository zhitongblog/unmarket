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
export declare class Crawler {
    private unzoo;
    /**
     * Analyze a product from its URL
     */
    analyze(url: string): Promise<AnalyzedProduct>;
    /**
     * Find product logo
     */
    private findLogo;
    /**
     * Find product screenshots
     */
    private findScreenshots;
    /**
     * Extract product name from URL
     */
    private extractNameFromUrl;
    /**
     * Recommend platforms based on analysis
     */
    private recommendPlatforms;
    /**
     * Recommend languages based on analysis
     */
    private recommendLanguages;
}
//# sourceMappingURL=crawler.d.ts.map