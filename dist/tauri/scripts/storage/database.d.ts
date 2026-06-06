/**
 * SQLite database manager
 */
import Database from 'better-sqlite3';
/**
 * Initialize database connection
 */
export declare function initDatabase(): Database.Database;
/**
 * Get database instance
 */
export declare function getDatabase(): Database.Database;
/**
 * Close database connection
 */
export declare function closeDatabase(): void;
/**
 * Generate UUID
 */
export declare function generateId(): string;
export interface Product {
    id: string;
    name: string;
    url: string;
    tagline?: string;
    description?: string;
    type: string;
    logo_url?: string;
    screenshots?: string[];
    features?: string[];
    recommended_platforms?: string[];
    recommended_languages?: string[];
    weight: number;
    priority: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}
export interface Account {
    id: string;
    platform: string;
    username?: string;
    email?: string;
    credentials: string;
    status: string;
    last_used?: string;
    created_at: string;
    updated_at: string;
}
export interface Post {
    id: string;
    product_id: string;
    platform: string;
    language: string;
    title?: string;
    body: string;
    url?: string;
    status: string;
    views: number;
    engagements: number;
    published_at?: string;
    created_at: string;
}
export interface QueueTask {
    id: string;
    product_id: string;
    platform: string;
    language: string;
    content?: string;
    status: string;
    scheduled_at: string;
    started_at?: string;
    completed_at?: string;
    error?: string;
    created_at: string;
}
//# sourceMappingURL=database.d.ts.map