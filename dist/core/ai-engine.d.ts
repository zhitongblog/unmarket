export interface AIProvider {
    name: string;
    models: string[];
    baseUrl: string;
    requiresApiKey: boolean;
}
export declare const AI_PROVIDERS: Record<string, AIProvider>;
export interface ProductAnalysis {
    name?: string;
    tagline?: string;
    description?: string;
    type?: 'tool' | 'saas' | 'app' | 'service' | 'library' | 'plugin' | 'other';
    features?: string[];
    pricing?: {
        model: 'free' | 'freemium' | 'paid' | 'subscription';
        plans?: string[];
    };
    techStack?: string[];
    targetAudience?: string[];
    competitors?: string[];
}
export interface ContentRequest {
    product: {
        name: string;
        tagline: string;
        description: string;
        features: string[];
        url: string;
    };
    platform: string;
    language: string;
    tone?: 'professional' | 'casual' | 'technical' | 'marketing';
}
export interface GeneratedContent {
    title?: string;
    body: string;
    hashtags?: string[];
    callToAction?: string;
}
export declare class AIEngine {
    private provider;
    private model;
    private apiKey?;
    private baseUrl?;
    constructor();
    /**
     * Configure AI provider
     */
    configure(provider: string, model: string, apiKey?: string, baseUrl?: string): void;
    /**
     * Get available providers
     */
    getProviders(): AIProvider[];
    /**
     * Check if configured
     */
    isConfigured(): boolean;
    /**
     * Analyze product from page content
     */
    analyzeProduct(input: {
        url: string;
        title: string;
        htmlContent: string;
        textContent: string;
    }): Promise<ProductAnalysis>;
    /**
     * Generate content for a platform
     */
    generateContent(request: ContentRequest): Promise<GeneratedContent>;
    /**
     * Translate content to target language
     */
    translate(content: string, targetLanguage: string): Promise<string>;
    /**
     * Complete prompt using configured AI provider
     */
    private complete;
    private completeAnthropic;
    private completeOpenAI;
    private completeGemini;
    private completeOpenAICompatible;
    /**
     * Complete using OpenRouter (supports multiple models with one API key)
     */
    private completeOpenRouter;
    private getPlatformPrompt;
    private getLanguageName;
}
export declare function getAIEngine(): AIEngine;
//# sourceMappingURL=ai-engine.d.ts.map