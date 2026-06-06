/**
 * Unzoo Browser CLI client wrapper
 * Provides programmatic access to Unzoo browser automation
 */
import { execSync } from 'child_process';
import { getConfigManager } from '../storage/config.js';
import { browserLogger as logger } from '../utils/logger.js';

export interface UnzooResult {
  success: boolean;
  output?: string;
  error?: string;
  data?: unknown;
}

export interface NavigateOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  timeout?: number;
}

export interface ClickOptions {
  button?: 'left' | 'right' | 'middle';
  clickCount?: number;
  delay?: number;
}

export interface TypeOptions {
  delay?: number;
  clear?: boolean;
}

export interface ScreenshotOptions {
  path?: string;
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
}

export interface WaitOptions {
  timeout?: number;
  state?: 'attached' | 'detached' | 'visible' | 'hidden';
}

export class UnzooClient {
  private unzooPath: string;
  private timeout: number;

  constructor() {
    const config = getConfigManager().getBrowserConfig();
    this.unzooPath = config.unzooPath;
    this.timeout = config.timeout;
  }

  /**
   * Execute Unzoo CLI command
   */
  private async execute(command: string, args: string[] = []): Promise<UnzooResult> {
    return new Promise((resolve) => {
      const fullArgs = [command, ...args, '--raw'];
      logger.debug('Executing Unzoo command', { command, args });

      try {
        const result = execSync(`"${this.unzooPath}" ${fullArgs.join(' ')}`, {
          timeout: this.timeout,
          encoding: 'utf-8',
          windowsHide: true
        });

        // Parse JSON response from Unzoo CLI
        try {
          const json = JSON.parse(result.trim());
          if (json.success) {
            resolve({
              success: true,
              output: json.data?.result ?? json.data ?? json,
              data: json.data
            });
          } else {
            resolve({
              success: false,
              error: json.error || 'Unknown error'
            });
          }
        } catch {
          // If not JSON, return raw output
          resolve({
            success: true,
            output: result.trim()
          });
        }
      } catch (error) {
        const err = error as { message?: string; stderr?: string; stdout?: string };
        logger.error('Unzoo command failed', { command, error: err.message });

        // Try to parse error response
        try {
          const errJson = JSON.parse(err.stdout || '');
          resolve({
            success: false,
            error: errJson.error || err.message
          });
        } catch {
          resolve({
            success: false,
            error: err.stderr || err.message
          });
        }
      }
    });
  }

  /**
   * Check if Unzoo is available
   */
  async isAvailable(): Promise<boolean> {
    const result = await this.execute('status');
    return result.success;
  }

  /**
   * Navigate to URL
   */
  async navigate(url: string, options: NavigateOptions = {}): Promise<UnzooResult> {
    const args = ['--url', url];
    if (options.timeout) args.push('--timeout', String(options.timeout));

    return this.execute('navigate', args);
  }

  /**
   * Click on element
   */
  async click(selector: string, options: ClickOptions = {}): Promise<UnzooResult> {
    const args = ['--selector', selector];
    if (options.button) args.push('--button', options.button);

    return this.execute('click', args);
  }

  /**
   * Type text into element
   */
  async type(selector: string, text: string, options: TypeOptions = {}): Promise<UnzooResult> {
    const args = ['--selector', selector, '--text', text];
    if (options.delay) args.push('--delay', String(options.delay));

    return this.execute('type', args);
  }

  /**
   * Find element and return info
   */
  async find(selector: string): Promise<UnzooResult> {
    return this.execute('find', ['--query', selector]);
  }

  /**
   * Wait for element
   */
  async waitFor(selector: string, options: WaitOptions = {}): Promise<UnzooResult> {
    const args = ['--selector', selector];
    if (options.timeout) args.push('--timeout', String(options.timeout));

    return this.execute('wait', args);
  }

  /**
   * Take screenshot
   */
  async screenshot(options: ScreenshotOptions = {}): Promise<UnzooResult> {
    const args: string[] = [];
    if (options.path) args.push('--output', options.path);
    if (options.fullPage) args.push('--full-page');

    return this.execute('screenshot', args);
  }

  /**
   * Get page content/HTML
   */
  async getContent(): Promise<UnzooResult> {
    return this.execute('get-text', []);
  }

  /**
   * Get page text
   */
  async getText(selector?: string): Promise<UnzooResult> {
    const args = selector ? ['--selector', selector] : [];
    return this.execute('get-text', args);
  }

  /**
   * Execute JavaScript in page
   */
  async evaluate(script: string): Promise<UnzooResult> {
    return this.execute('eval-js', ['--expression', script]);
  }

  /**
   * Select option in dropdown
   */
  async select(selector: string, value: string): Promise<UnzooResult> {
    // Use type to fill value or use AI act command
    return this.execute('act', ['--instruction', `Select "${value}" in the dropdown at "${selector}"`]);
  }

  /**
   * Upload file
   */
  async upload(selector: string, filePath: string): Promise<UnzooResult> {
    return this.execute('act', ['--instruction', `Upload file "${filePath}" to input at "${selector}"`]);
  }

  /**
   * Press key
   */
  async press(key: string): Promise<UnzooResult> {
    return this.execute('act', ['--instruction', `Press the ${key} key`]);
  }

  /**
   * Scroll page or element
   */
  async scroll(direction: 'up' | 'down' | 'left' | 'right', amount?: number): Promise<UnzooResult> {
    const pixels = amount || 500;
    return this.execute('act', ['--instruction', `Scroll ${direction} ${pixels} pixels`]);
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string | null> {
    const result = await this.execute('eval-js', ['--script', 'window.location.href']);
    return result.success ? result.output || null : null;
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string | null> {
    const result = await this.execute('eval-js', ['--script', 'document.title']);
    return result.success ? result.output || null : null;
  }

  /**
   * Check if element exists
   */
  async exists(selector: string): Promise<boolean> {
    const result = await this.find(selector);
    return result.success;
  }

  /**
   * Get element attribute
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    const result = await this.execute('attribute', [selector, attribute]);
    return result.success ? result.output || null : null;
  }

  /**
   * Get all cookies
   */
  async getCookies(): Promise<UnzooResult> {
    return this.execute('cookie', ['list']);
  }

  /**
   * Set cookie
   */
  async setCookie(name: string, value: string, domain?: string): Promise<UnzooResult> {
    const args = ['set', '--name', name, '--value', value];
    if (domain) args.push('--domain', domain);
    return this.execute('cookie', args);
  }

  /**
   * Clear cookies
   */
  async clearCookies(): Promise<UnzooResult> {
    return this.execute('cookie', ['clear']);
  }

  /**
   * Go back in history
   */
  async goBack(): Promise<UnzooResult> {
    return this.execute('navigate_back', []);
  }

  /**
   * Go forward in history
   */
  async goForward(): Promise<UnzooResult> {
    return this.execute('navigate_forward', []);
  }

  /**
   * Reload page
   */
  async reload(): Promise<UnzooResult> {
    return this.execute('reload', []);
  }

  /**
   * Close browser/page
   */
  async close(): Promise<UnzooResult> {
    return this.execute('tab', ['close']);
  }

  /**
   * Open browser for manual interaction
   */
  async openInteractive(url?: string): Promise<UnzooResult> {
    if (url) {
      return this.navigate(url);
    }
    return { success: true };
  }

  /**
   * Wait for user to complete action (for CAPTCHA, verification, etc.)
   */
  async waitForUser(message: string, timeout?: number): Promise<UnzooResult> {
    // Use brain for interactive waiting
    const instruction = `Wait for user action: ${message}`;
    const args = [instruction];
    if (timeout) args.push('--timeout', String(timeout));
    return this.execute('brain', args);
  }

  /**
   * Fill form fields
   */
  async fillForm(fields: Record<string, string>): Promise<UnzooResult> {
    for (const [selector, value] of Object.entries(fields)) {
      const result = await this.type(selector, value, { clear: true });
      if (!result.success) return result;
    }
    return { success: true };
  }

  /**
   * Login to a platform
   */
  async login(
    usernameSelector: string,
    passwordSelector: string,
    submitSelector: string,
    username: string,
    password: string
  ): Promise<UnzooResult> {
    // Type username
    let result = await this.type(usernameSelector, username, { clear: true });
    if (!result.success) return result;

    // Type password
    result = await this.type(passwordSelector, password, { clear: true });
    if (!result.success) return result;

    // Click submit
    result = await this.click(submitSelector);
    if (!result.success) return result;

    // Wait for navigation
    await new Promise(resolve => setTimeout(resolve, 2000));

    return { success: true };
  }
}

// Singleton instance
let instance: UnzooClient | null = null;

export function getUnzooClient(): UnzooClient {
  if (!instance) {
    instance = new UnzooClient();
  }
  return instance;
}
