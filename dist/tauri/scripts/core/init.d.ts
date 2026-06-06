export interface InitStatus {
    configReady: boolean;
    databaseReady: boolean;
    unzooAvailable: boolean;
    aiConfigured: boolean;
    errors: string[];
    warnings: string[];
}
export declare function initialize(): Promise<InitStatus>;
export declare function initializeApp(): Promise<InitStatus>;
/**
 * Check if already initialized
 */
export declare function isInitialized(): boolean;
/**
 * Reset all data
 */
export declare function reset(): Promise<void>;
/**
 * Show system status
 */
export declare function getSystemStatus(): Promise<{
    version: string;
    dataDir: string;
    products: number;
    accounts: number;
    posts: number;
    queuePending: number;
}>;
//# sourceMappingURL=init.d.ts.map