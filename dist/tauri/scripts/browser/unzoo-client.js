/**
 * Unzoo Browser CLI client wrapper
 * Provides programmatic access to Unzoo browser automation
 */
import { execSync } from 'child_process';
import { getConfigManager } from '../storage/config.js';
import { browserLogger as logger } from '../utils/logger.js';
export class UnzooClient {
    unzooPath;
    timeout;
    constructor() {
        const config = getConfigManager().getBrowserConfig();
        this.unzooPath = config.unzooPath;
        this.timeout = config.timeout;
    }
    /**
     * Execute Unzoo CLI command
     */
    async execute(command, args = []) {
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
                    }
                    else {
                        resolve({
                            success: false,
                            error: json.error || 'Unknown error'
                        });
                    }
                }
                catch {
                    // If not JSON, return raw output
                    resolve({
                        success: true,
                        output: result.trim()
                    });
                }
            }
            catch (error) {
                const err = error;
                logger.error('Unzoo command failed', { command, error: err.message });
                // Try to parse error response
                try {
                    const errJson = JSON.parse(err.stdout || '');
                    resolve({
                        success: false,
                        error: errJson.error || err.message
                    });
                }
                catch {
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
    async isAvailable() {
        const result = await this.execute('status');
        return result.success;
    }
    /**
     * Navigate to URL
     */
    async navigate(url, options = {}) {
        const args = ['--url', url];
        if (options.timeout)
            args.push('--timeout', String(options.timeout));
        return this.execute('navigate', args);
    }
    /**
     * Click on element
     */
    async click(selector, options = {}) {
        const args = ['--selector', selector];
        if (options.button)
            args.push('--button', options.button);
        return this.execute('click', args);
    }
    /**
     * Type text into element
     */
    async type(selector, text, options = {}) {
        const args = ['--selector', selector, '--text', text];
        if (options.delay)
            args.push('--delay', String(options.delay));
        return this.execute('type', args);
    }
    /**
     * Find element and return info
     */
    async find(selector) {
        return this.execute('find', ['--query', selector]);
    }
    /**
     * Wait for element
     */
    async waitFor(selector, options = {}) {
        const args = ['--selector', selector];
        if (options.timeout)
            args.push('--timeout', String(options.timeout));
        return this.execute('wait', args);
    }
    /**
     * Take screenshot
     */
    async screenshot(options = {}) {
        const args = [];
        if (options.path)
            args.push('--output', options.path);
        if (options.fullPage)
            args.push('--full-page');
        return this.execute('screenshot', args);
    }
    /**
     * Get page content/HTML
     */
    async getContent() {
        return this.execute('get-text', []);
    }
    /**
     * Get page text
     */
    async getText(selector) {
        const args = selector ? ['--selector', selector] : [];
        return this.execute('get-text', args);
    }
    /**
     * Execute JavaScript in page
     */
    async evaluate(script) {
        return this.execute('eval-js', ['--expression', script]);
    }
    /**
     * Select option in dropdown
     */
    async select(selector, value) {
        // Use type to fill value or use AI act command
        return this.execute('act', ['--instruction', `Select "${value}" in the dropdown at "${selector}"`]);
    }
    /**
     * Upload file
     */
    async upload(selector, filePath) {
        return this.execute('act', ['--instruction', `Upload file "${filePath}" to input at "${selector}"`]);
    }
    /**
     * Press key
     */
    async press(key) {
        return this.execute('act', ['--instruction', `Press the ${key} key`]);
    }
    /**
     * Scroll page or element
     */
    async scroll(direction, amount) {
        const pixels = amount || 500;
        return this.execute('act', ['--instruction', `Scroll ${direction} ${pixels} pixels`]);
    }
    /**
     * Get current URL
     */
    async getCurrentUrl() {
        const result = await this.execute('eval-js', ['--script', 'window.location.href']);
        return result.success ? result.output || null : null;
    }
    /**
     * Get page title
     */
    async getTitle() {
        const result = await this.execute('eval-js', ['--script', 'document.title']);
        return result.success ? result.output || null : null;
    }
    /**
     * Check if element exists
     */
    async exists(selector) {
        const result = await this.find(selector);
        return result.success;
    }
    /**
     * Get element attribute
     */
    async getAttribute(selector, attribute) {
        const result = await this.execute('attribute', [selector, attribute]);
        return result.success ? result.output || null : null;
    }
    /**
     * Get all cookies
     */
    async getCookies() {
        return this.execute('cookie', ['list']);
    }
    /**
     * Set cookie
     */
    async setCookie(name, value, domain) {
        const args = ['set', '--name', name, '--value', value];
        if (domain)
            args.push('--domain', domain);
        return this.execute('cookie', args);
    }
    /**
     * Clear cookies
     */
    async clearCookies() {
        return this.execute('cookie', ['clear']);
    }
    /**
     * Go back in history
     */
    async goBack() {
        return this.execute('navigate_back', []);
    }
    /**
     * Go forward in history
     */
    async goForward() {
        return this.execute('navigate_forward', []);
    }
    /**
     * Reload page
     */
    async reload() {
        return this.execute('reload', []);
    }
    /**
     * Close browser/page
     */
    async close() {
        return this.execute('tab', ['close']);
    }
    /**
     * Open browser for manual interaction
     */
    async openInteractive(url) {
        if (url) {
            return this.navigate(url);
        }
        return { success: true };
    }
    /**
     * Wait for user to complete action (for CAPTCHA, verification, etc.)
     */
    async waitForUser(message, timeout) {
        // Use brain for interactive waiting
        const instruction = `Wait for user action: ${message}`;
        const args = [instruction];
        if (timeout)
            args.push('--timeout', String(timeout));
        return this.execute('brain', args);
    }
    /**
     * Fill form fields
     */
    async fillForm(fields) {
        for (const [selector, value] of Object.entries(fields)) {
            const result = await this.type(selector, value, { clear: true });
            if (!result.success)
                return result;
        }
        return { success: true };
    }
    /**
     * Login to a platform
     */
    async login(usernameSelector, passwordSelector, submitSelector, username, password) {
        // Type username
        let result = await this.type(usernameSelector, username, { clear: true });
        if (!result.success)
            return result;
        // Type password
        result = await this.type(passwordSelector, password, { clear: true });
        if (!result.success)
            return result;
        // Click submit
        result = await this.click(submitSelector);
        if (!result.success)
            return result;
        // Wait for navigation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { success: true };
    }
}
// Singleton instance
let instance = null;
export function getUnzooClient() {
    if (!instance) {
        instance = new UnzooClient();
    }
    return instance;
}
//# sourceMappingURL=unzoo-client.js.map