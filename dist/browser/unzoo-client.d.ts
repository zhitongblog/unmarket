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
export declare class UnzooClient {
    private unzooPath;
    private timeout;
    constructor();
    /**
     * Execute Unzoo CLI command
     */
    private execute;
    /**
     * Check if Unzoo is available
     */
    isAvailable(): Promise<boolean>;
    /**
     * Navigate to URL
     */
    navigate(url: string, options?: NavigateOptions): Promise<UnzooResult>;
    /**
     * Click on element
     */
    click(selector: string, options?: ClickOptions): Promise<UnzooResult>;
    /**
     * Type text into element
     */
    type(selector: string, text: string, options?: TypeOptions): Promise<UnzooResult>;
    /**
     * Find element and return info
     */
    find(selector: string): Promise<UnzooResult>;
    /**
     * Wait for element
     */
    waitFor(selector: string, options?: WaitOptions): Promise<UnzooResult>;
    /**
     * Take screenshot
     */
    screenshot(options?: ScreenshotOptions): Promise<UnzooResult>;
    /**
     * Get page content/HTML
     */
    getContent(): Promise<UnzooResult>;
    /**
     * Get page text
     */
    getText(selector?: string): Promise<UnzooResult>;
    /**
     * Execute JavaScript in page
     */
    evaluate(script: string): Promise<UnzooResult>;
    /**
     * Select option in dropdown
     */
    select(selector: string, value: string): Promise<UnzooResult>;
    /**
     * Upload file
     */
    upload(selector: string, filePath: string): Promise<UnzooResult>;
    /**
     * Press key
     */
    press(key: string): Promise<UnzooResult>;
    /**
     * Scroll page or element
     */
    scroll(direction: 'up' | 'down' | 'left' | 'right', amount?: number): Promise<UnzooResult>;
    /**
     * Get current URL
     */
    getCurrentUrl(): Promise<string | null>;
    /**
     * Get page title
     */
    getTitle(): Promise<string | null>;
    /**
     * Check if element exists
     */
    exists(selector: string): Promise<boolean>;
    /**
     * Get element attribute
     */
    getAttribute(selector: string, attribute: string): Promise<string | null>;
    /**
     * Get all cookies
     */
    getCookies(): Promise<UnzooResult>;
    /**
     * Set cookie
     */
    setCookie(name: string, value: string, domain?: string): Promise<UnzooResult>;
    /**
     * Clear cookies
     */
    clearCookies(): Promise<UnzooResult>;
    /**
     * Go back in history
     */
    goBack(): Promise<UnzooResult>;
    /**
     * Go forward in history
     */
    goForward(): Promise<UnzooResult>;
    /**
     * Reload page
     */
    reload(): Promise<UnzooResult>;
    /**
     * Close browser/page
     */
    close(): Promise<UnzooResult>;
    /**
     * Open browser for manual interaction
     */
    openInteractive(url?: string): Promise<UnzooResult>;
    /**
     * Wait for user to complete action (for CAPTCHA, verification, etc.)
     */
    waitForUser(message: string, timeout?: number): Promise<UnzooResult>;
    /**
     * Fill form fields
     */
    fillForm(fields: Record<string, string>): Promise<UnzooResult>;
    /**
     * Login to a platform
     */
    login(usernameSelector: string, passwordSelector: string, submitSelector: string, username: string, password: string): Promise<UnzooResult>;
}
export declare function getUnzooClient(): UnzooClient;
//# sourceMappingURL=unzoo-client.d.ts.map