import { type AccountCredentials } from '../storage/accounts.js';
import type { ContentItem } from './content-generator.js';
export interface PublishResult {
    success: boolean;
    postId?: string;
    url?: string;
    error?: string;
}
export interface PlatformPublisher {
    name: string;
    type: 'api' | 'browser';
    publish(content: ContentItem, credentials: AccountCredentials): Promise<PublishResult>;
}
export declare class Publisher {
    private unzoo;
    private accounts;
    /**
     * Publish content to a platform
     */
    publishOne(content: ContentItem): Promise<PublishResult>;
    /**
     * Publish to multiple platforms
     */
    publishAll(contents: ContentItem[]): Promise<Map<string, PublishResult>>;
    /**
     * Publish to specific platform
     */
    private publishToPlatform;
    /**
     * Publish via platform API
     */
    private publishViaAPI;
    /**
     * Publish via browser automation
     */
    private publishViaBrowser;
    private publishToDevTo;
    private publishToHashnode;
    private publishToMedium;
    private publishToGitHub;
    private publishToDiscord;
    private publishToTelegram;
    private publishToMastodon;
    /**
     * Save post to database
     */
    private savePost;
}
//# sourceMappingURL=publisher.d.ts.map