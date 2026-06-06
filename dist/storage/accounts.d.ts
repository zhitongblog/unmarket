export interface AccountCredentials {
    username?: string;
    password?: string;
    email?: string;
    token?: string;
    cookies?: Record<string, string>;
    apiKey?: string;
    loginMethod?: 'password' | 'google_oauth' | 'api_key';
    extra?: Record<string, unknown>;
}
export interface AccountInfo {
    id: string;
    platform: string;
    username?: string;
    email?: string;
    status: 'active' | 'suspended' | 'expired' | 'needs_verification';
    lastUsed?: Date;
    createdAt: Date;
}
export declare class AccountManager {
    /**
     * Add a new account
     */
    add(platform: string, credentials: AccountCredentials): AccountInfo;
    /**
     * Get account by ID
     */
    getById(id: string): AccountInfo | null;
    /**
     * Get account by platform and username
     */
    getByPlatform(platform: string, username?: string): AccountInfo | null;
    /**
     * Get credentials for an account
     */
    getCredentials(id: string): AccountCredentials | null;
    /**
     * Update account credentials
     */
    updateCredentials(id: string, credentials: Partial<AccountCredentials>): boolean;
    /**
     * Update account status
     */
    updateStatus(id: string, status: AccountInfo['status']): boolean;
    /**
     * Mark account as used
     */
    markUsed(id: string): void;
    /**
     * List all accounts
     */
    list(platform?: string): AccountInfo[];
    /**
     * Delete account
     */
    delete(id: string): boolean;
    /**
     * Get account count by platform
     */
    countByPlatform(): Record<string, number>;
    /**
     * Find accounts needing verification
     */
    findNeedingVerification(): AccountInfo[];
    private rowToInfo;
}
export declare function getAccountManager(): AccountManager;
//# sourceMappingURL=accounts.d.ts.map