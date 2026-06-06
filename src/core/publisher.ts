/**
 * Publisher - Publishes content to various platforms
 */
import { getDatabase, generateId } from '../storage/database.js';
import { getAccountManager, type AccountCredentials } from '../storage/accounts.js';
import { getUnzooClient } from '../browser/unzoo-client.js';
import { publisherLogger as logger } from '../utils/logger.js';
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

export class Publisher {
  private unzoo = getUnzooClient();
  private accounts = getAccountManager();

  /**
   * Publish content to a platform
   */
  async publishOne(content: ContentItem): Promise<PublishResult> {
    logger.info('Publishing content', { platform: content.platform, language: content.language });

    // Get account for platform
    const account = this.accounts.getByPlatform(content.platform);
    if (!account) {
      return { success: false, error: 'No account configured for this platform' };
    }

    const credentials = this.accounts.getCredentials(account.id);
    if (!credentials) {
      return { success: false, error: 'Failed to retrieve credentials' };
    }

    try {
      // Get platform-specific publisher
      const result = await this.publishToPlatform(content, credentials);

      if (result.success) {
        // Save to database
        this.savePost(content, result);
        this.accounts.markUsed(account.id);
      }

      return result;
    } catch (error) {
      logger.error('Publish failed', { platform: content.platform, error });
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Publish to multiple platforms
   */
  async publishAll(contents: ContentItem[]): Promise<Map<string, PublishResult>> {
    const results = new Map<string, PublishResult>();

    for (const content of contents) {
      const key = `${content.platform}-${content.language}`;
      results.set(key, await this.publishOne(content));

      // Rate limiting between publishes
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return results;
  }

  /**
   * Publish to specific platform
   */
  private async publishToPlatform(
    content: ContentItem,
    credentials: AccountCredentials
  ): Promise<PublishResult> {
    const platform = content.platform.toLowerCase();

    // API-based platforms (free)
    const apiPlatforms = ['devto', 'hashnode', 'medium', 'github', 'discord', 'telegram', 'slack', 'mastodon'];

    if (apiPlatforms.includes(platform)) {
      return this.publishViaAPI(platform, content, credentials);
    }

    // Browser-based platforms
    return this.publishViaBrowser(platform, content, credentials);
  }

  /**
   * Publish via platform API
   */
  private async publishViaAPI(
    platform: string,
    content: ContentItem,
    credentials: AccountCredentials
  ): Promise<PublishResult> {
    switch (platform) {
      case 'devto':
        return this.publishToDevTo(content, credentials);
      case 'hashnode':
        return this.publishToHashnode(content, credentials);
      case 'medium':
        return this.publishToMedium(content, credentials);
      case 'github':
        return this.publishToGitHub(content, credentials);
      case 'discord':
        return this.publishToDiscord(content, credentials);
      case 'telegram':
        return this.publishToTelegram(content, credentials);
      case 'mastodon':
        return this.publishToMastodon(content, credentials);
      default:
        return { success: false, error: `API publishing not supported for ${platform}` };
    }
  }

  /**
   * Publish via browser automation
   */
  private async publishViaBrowser(
    platform: string,
    content: ContentItem,
    credentials: AccountCredentials
  ): Promise<PublishResult> {
    const platformConfigs: Record<string, {
      loginUrl: string;
      composeUrl: string;
      selectors: {
        username: string;
        password: string;
        submit: string;
        textArea: string;
        postButton: string;
      };
    }> = {
      twitter: {
        loginUrl: 'https://twitter.com/login',
        composeUrl: 'https://twitter.com/compose/tweet',
        selectors: {
          username: 'input[autocomplete="username"]',
          password: 'input[type="password"]',
          submit: 'button[data-testid="LoginForm_Login_Button"]',
          textArea: 'div[data-testid="tweetTextarea_0"]',
          postButton: 'button[data-testid="tweetButton"]'
        }
      },
      linkedin: {
        loginUrl: 'https://www.linkedin.com/login',
        composeUrl: 'https://www.linkedin.com/feed/',
        selectors: {
          username: '#username',
          password: '#password',
          submit: 'button[type="submit"]',
          textArea: '.ql-editor',
          postButton: 'button.share-actions__primary-action'
        }
      },
      facebook: {
        loginUrl: 'https://www.facebook.com/login',
        composeUrl: 'https://www.facebook.com/',
        selectors: {
          username: '#email',
          password: '#pass',
          submit: 'button[name="login"]',
          textArea: 'div[role="textbox"]',
          postButton: 'div[aria-label="Post"]'
        }
      },
      reddit: {
        loginUrl: 'https://www.reddit.com/login',
        composeUrl: 'https://www.reddit.com/submit',
        selectors: {
          username: '#loginUsername',
          password: '#loginPassword',
          submit: 'button[type="submit"]',
          textArea: 'textarea[name="title"]',
          postButton: 'button[type="submit"]'
        }
      },
      weibo: {
        loginUrl: 'https://weibo.com/login.php',
        composeUrl: 'https://weibo.com/',
        selectors: {
          username: '#loginname',
          password: '#password',
          submit: '.W_btn_a',
          textArea: 'textarea.W_input',
          postButton: 'button.W_btn_a'
        }
      }
    };

    const config = platformConfigs[platform];
    if (!config) {
      return { success: false, error: `Browser automation not configured for ${platform}` };
    }

    try {
      // Navigate to login page
      await this.unzoo.navigate(config.loginUrl);

      // Login
      await this.unzoo.login(
        config.selectors.username,
        config.selectors.password,
        config.selectors.submit,
        credentials.username || credentials.email || '',
        credentials.password || ''
      );

      // Wait for login
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Navigate to compose
      await this.unzoo.navigate(config.composeUrl);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Type content
      const fullContent = content.title
        ? `${content.title}\n\n${content.body}`
        : content.body;

      await this.unzoo.type(config.selectors.textArea, fullContent);

      // Add hashtags if supported
      if (content.hashtags && content.hashtags.length > 0) {
        const hashtagText = '\n\n' + content.hashtags.map(h => `#${h}`).join(' ');
        await this.unzoo.type(config.selectors.textArea, hashtagText);
      }

      // Click post button
      await this.unzoo.click(config.selectors.postButton);

      // Wait for post
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get current URL as post URL
      const postUrl = await this.unzoo.getCurrentUrl();

      return {
        success: true,
        url: postUrl || undefined
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // API implementations
  private async publishToDevTo(content: ContentItem, credentials: AccountCredentials): Promise<PublishResult> {
    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': credentials.apiKey!
      },
      body: JSON.stringify({
        article: {
          title: content.title || content.body.substring(0, 50),
          body_markdown: content.body,
          published: true,
          tags: content.hashtags?.slice(0, 4)
        }
      })
    });

    if (!response.ok) {
      return { success: false, error: `Dev.to API error: ${response.status}` };
    }

    const data = await response.json() as { url: string; id: number };
    return { success: true, url: data.url, postId: String(data.id) };
  }

  private async publishToHashnode(content: ContentItem, credentials: AccountCredentials): Promise<PublishResult> {
    const mutation = `
      mutation CreatePublicationStory($input: CreateStoryInput!) {
        createPublicationStory(input: $input) {
          post { slug, title }
        }
      }
    `;

    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': credentials.apiKey!
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            title: content.title || 'Post',
            contentMarkdown: content.body,
            tags: content.hashtags?.map(t => ({ slug: t }))
          }
        }
      })
    });

    if (!response.ok) {
      return { success: false, error: `Hashnode API error: ${response.status}` };
    }

    return { success: true };
  }

  private async publishToMedium(content: ContentItem, credentials: AccountCredentials): Promise<PublishResult> {
    // Get user ID first
    const userResponse = await fetch('https://api.medium.com/v1/me', {
      headers: { 'Authorization': `Bearer ${credentials.apiKey}` }
    });

    if (!userResponse.ok) {
      return { success: false, error: 'Failed to get Medium user' };
    }

    const userData = await userResponse.json() as { data: { id: string } };
    const userId = userData.data.id;

    const response = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`
      },
      body: JSON.stringify({
        title: content.title || 'Post',
        contentFormat: 'markdown',
        content: content.body,
        tags: content.hashtags,
        publishStatus: 'public'
      })
    });

    if (!response.ok) {
      return { success: false, error: `Medium API error: ${response.status}` };
    }

    const data = await response.json() as { data: { url: string; id: string } };
    return { success: true, url: data.data.url, postId: data.data.id };
  }

  private async publishToGitHub(_content: ContentItem, _credentials: AccountCredentials): Promise<PublishResult> {
    // Create a discussion or issue depending on configuration
    return { success: false, error: 'GitHub publishing requires repository configuration' };
  }

  private async publishToDiscord(content: ContentItem, credentials: AccountCredentials): Promise<PublishResult> {
    const webhookUrl = credentials.extra?.webhookUrl as string;
    if (!webhookUrl) {
      return { success: false, error: 'Discord webhook URL not configured' };
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: content.title ? `**${content.title}**\n\n${content.body}` : content.body
      })
    });

    if (!response.ok) {
      return { success: false, error: `Discord webhook error: ${response.status}` };
    }

    return { success: true };
  }

  private async publishToTelegram(content: ContentItem, credentials: AccountCredentials): Promise<PublishResult> {
    const botToken = credentials.apiKey;
    const chatId = credentials.extra?.chatId as string;

    if (!botToken || !chatId) {
      return { success: false, error: 'Telegram bot token or chat ID not configured' };
    }

    const text = content.title ? `*${content.title}*\n\n${content.body}` : content.body;

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      return { success: false, error: `Telegram API error: ${response.status}` };
    }

    return { success: true };
  }

  private async publishToMastodon(content: ContentItem, credentials: AccountCredentials): Promise<PublishResult> {
    const instanceUrl = credentials.extra?.instanceUrl as string || 'https://mastodon.social';
    const accessToken = credentials.apiKey;

    if (!accessToken) {
      return { success: false, error: 'Mastodon access token not configured' };
    }

    const response = await fetch(`${instanceUrl}/api/v1/statuses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        status: content.body
      })
    });

    if (!response.ok) {
      return { success: false, error: `Mastodon API error: ${response.status}` };
    }

    const data = await response.json() as { url: string; id: string };
    return { success: true, url: data.url, postId: data.id };
  }

  /**
   * Save post to database
   */
  private savePost(content: ContentItem, result: PublishResult): void {
    const db = getDatabase();
    const id = generateId();

    const stmt = db.prepare(`
      INSERT INTO posts (id, product_id, platform, language, title, body, url, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'published', datetime('now'))
    `);

    stmt.run(
      id,
      content.productId,
      content.platform,
      content.language,
      content.title || null,
      content.body,
      result.url || null
    );
  }
}
