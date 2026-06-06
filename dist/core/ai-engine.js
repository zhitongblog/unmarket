/**
 * AI Engine - Multi-provider AI model support
 * Supports: Claude, GPT, Gemini, Qwen, Doubao, DeepSeek, GLM, Kimi
 */
import { getConfigManager } from '../storage/config.js';
import { aiLogger as logger } from '../utils/logger.js';
export const AI_PROVIDERS = {
    anthropic: {
        name: 'Anthropic (Claude API)',
        models: ['claude-opus-4-5-20251101', 'claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
        baseUrl: 'https://api.anthropic.com/v1',
        requiresApiKey: true
    },
    openrouter: {
        name: 'OpenRouter (多模型)',
        models: ['anthropic/claude-sonnet-4', 'anthropic/claude-opus-4', 'openai/gpt-4.1', 'google/gemini-3.1-pro'],
        baseUrl: 'https://openrouter.ai/api/v1',
        requiresApiKey: true
    },
    openai: {
        name: 'OpenAI (GPT)',
        models: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o', 'gpt-4o-mini'],
        baseUrl: 'https://api.openai.com/v1',
        requiresApiKey: true
    },
    google: {
        name: 'Google (Gemini)',
        models: ['gemini-3.1-pro-preview', 'gemini-3.1-flash-lite', 'gemini-3.1-flash-live'],
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        requiresApiKey: true
    },
    qwen: {
        name: 'Alibaba (Qwen)',
        models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
        baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
        requiresApiKey: true
    },
    doubao: {
        name: 'ByteDance (Doubao)',
        models: ['doubao-pro', 'doubao-lite'],
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        requiresApiKey: true
    },
    deepseek: {
        name: 'DeepSeek',
        models: ['deepseek-chat', 'deepseek-coder'],
        baseUrl: 'https://api.deepseek.com/v1',
        requiresApiKey: true
    },
    glm: {
        name: 'Zhipu (GLM)',
        models: ['glm-4', 'glm-4-flash'],
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        requiresApiKey: true
    },
    kimi: {
        name: 'Moonshot (Kimi)',
        models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
        baseUrl: 'https://api.moonshot.cn/v1',
        requiresApiKey: true
    }
};
export class AIEngine {
    provider;
    model;
    apiKey;
    baseUrl;
    constructor() {
        const config = getConfigManager().getAIConfig();
        this.provider = config.provider;
        this.model = config.model;
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl;
    }
    /**
     * Configure AI provider
     */
    configure(provider, model, apiKey, baseUrl) {
        this.provider = provider;
        this.model = model;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        getConfigManager().setAIConfig({ provider, model, apiKey, baseUrl });
        logger.info('AI engine configured', { provider, model });
    }
    /**
     * Get available providers
     */
    getProviders() {
        return Object.values(AI_PROVIDERS);
    }
    /**
     * Check if configured
     */
    isConfigured() {
        const providerInfo = AI_PROVIDERS[this.provider];
        if (!providerInfo)
            return false;
        if (providerInfo.requiresApiKey && !this.apiKey)
            return false;
        return true;
    }
    /**
     * Analyze product from page content
     */
    async analyzeProduct(input) {
        const prompt = `Analyze this product website and extract the following information in JSON format:
- name: Product name
- tagline: Short tagline (one sentence)
- description: Product description (2-3 sentences)
- type: One of: tool, saas, app, service, library, plugin, other
- features: Array of key features (max 10)
- pricing: { model: free/freemium/paid/subscription, plans: array of plan names }
- techStack: Array of technologies used (if mentioned)
- targetAudience: Array of target user types
- competitors: Array of mentioned or similar products

URL: ${input.url}
Title: ${input.title}

Page Content:
${input.textContent}

Respond with valid JSON only.`;
        const response = await this.complete(prompt);
        try {
            // Extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                logger.warn('Could not extract JSON from AI response');
                return {};
            }
            return JSON.parse(jsonMatch[0]);
        }
        catch (error) {
            logger.error('Failed to parse AI response', { error });
            return {};
        }
    }
    /**
     * Generate content for a platform
     */
    async generateContent(request) {
        const platformPrompts = this.getPlatformPrompt(request.platform);
        const prompt = `Generate marketing content for ${request.platform} in ${this.getLanguageName(request.language)}.

Product Information:
- Name: ${request.product.name}
- Tagline: ${request.product.tagline}
- Description: ${request.product.description}
- Key Features: ${request.product.features.join(', ')}
- URL: ${request.product.url}

Platform Requirements:
${platformPrompts}

Tone: ${request.tone || 'professional'}

Generate content in JSON format:
{
  "title": "Post title if applicable",
  "body": "Main content",
  "hashtags": ["relevant", "hashtags"],
  "callToAction": "CTA text"
}

Important:
- Write naturally in ${this.getLanguageName(request.language)}
- Follow platform best practices
- Include relevant hashtags for the platform
- Make content engaging and shareable

Respond with valid JSON only.`;
        const response = await this.complete(prompt);
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                return { body: response };
            }
            return JSON.parse(jsonMatch[0]);
        }
        catch {
            return { body: response };
        }
    }
    /**
     * Translate content to target language
     */
    async translate(content, targetLanguage) {
        const prompt = `Translate the following content to ${this.getLanguageName(targetLanguage)}.
Maintain the tone, style, and any formatting.
Do not add explanations, just provide the translation.

Content:
${content}`;
        return this.complete(prompt);
    }
    /**
     * Complete prompt using configured AI provider
     */
    async complete(prompt) {
        if (!this.isConfigured()) {
            throw new Error('AI engine not configured. Run: unmarket ai config');
        }
        logger.debug('AI completion request', { provider: this.provider, model: this.model });
        switch (this.provider) {
            case 'anthropic':
                return this.completeAnthropic(prompt);
            case 'openrouter':
                return this.completeOpenRouter(prompt);
            case 'openai':
                return this.completeOpenAI(prompt);
            case 'google':
                return this.completeGemini(prompt);
            case 'qwen':
            case 'doubao':
            case 'deepseek':
            case 'glm':
            case 'kimi':
                return this.completeOpenAICompatible(prompt);
            default:
                throw new Error(`Unknown provider: ${this.provider}`);
        }
    }
    async completeAnthropic(prompt) {
        const response = await fetch(`${this.baseUrl || AI_PROVIDERS.anthropic.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: 4096,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }
        const data = await response.json();
        return data.content[0]?.text || '';
    }
    async completeOpenAI(prompt) {
        const response = await fetch(`${this.baseUrl || AI_PROVIDERS.openai.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 4096
            })
        });
        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
    async completeGemini(prompt) {
        const url = `${this.baseUrl || AI_PROVIDERS.google.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }
        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    }
    async completeOpenAICompatible(prompt) {
        const providerInfo = AI_PROVIDERS[this.provider];
        const baseUrl = this.baseUrl || providerInfo.baseUrl;
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 4096
            })
        });
        if (!response.ok) {
            throw new Error(`${this.provider} API error: ${response.status}`);
        }
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
    /**
     * Complete using OpenRouter (supports multiple models with one API key)
     */
    async completeOpenRouter(prompt) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': 'https://unmarket.app',
                'X-Title': 'UnMarket'
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 4096
            })
        });
        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }
        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
    getPlatformPrompt(platform) {
        const prompts = {
            twitter: 'Max 280 characters. Use hashtags. Be concise and engaging.',
            linkedin: 'Professional tone. Can be longer. Include insights. Use 3-5 hashtags.',
            reddit: 'Casual tone. Avoid being promotional. Focus on value. Include discussion questions.',
            hackernews: 'Technical focus. No marketing speak. Straightforward description.',
            producthunt: 'Launch announcement style. Highlight key features. Friendly tone.',
            facebook: 'Engaging and shareable. Can include emojis. Ask questions.',
            instagram: 'Visual focus. Use emojis. 5-10 hashtags. Engaging caption.',
            devto: 'Technical blog post style. Include code examples if relevant.',
            medium: 'Article/blog format. Detailed and insightful.',
            weibo: 'Chinese social media. Max 140 characters. Use trending topics.',
            zhihu: 'Chinese Q&A platform. Educational and detailed.',
            v2ex: 'Chinese tech community. Developer-focused.',
            juejin: 'Chinese developer blog. Technical content.',
            qiita: 'Japanese tech blog. Code-focused.',
            zenn: 'Japanese tech platform. Detailed tutorials.'
        };
        return prompts[platform] || 'General social media post format.';
    }
    getLanguageName(code) {
        const names = {
            en: 'English',
            zh: 'Chinese (Simplified)',
            'zh-TW': 'Chinese (Traditional)',
            ja: 'Japanese',
            ko: 'Korean',
            de: 'German',
            fr: 'French',
            es: 'Spanish',
            pt: 'Portuguese',
            ru: 'Russian',
            ar: 'Arabic',
            hi: 'Hindi',
            th: 'Thai',
            vi: 'Vietnamese',
            id: 'Indonesian',
            tr: 'Turkish',
            pl: 'Polish',
            nl: 'Dutch'
        };
        return names[code] || code;
    }
}
// Singleton
let instance = null;
export function getAIEngine() {
    if (!instance) {
        instance = new AIEngine();
    }
    return instance;
}
//# sourceMappingURL=ai-engine.js.map