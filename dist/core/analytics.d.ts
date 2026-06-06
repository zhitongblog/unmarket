export interface StatsQuery {
    productId?: string;
    platform?: string;
    days?: number;
    top?: number;
}
export interface Stats {
    totalPosts: number;
    totalViews: number;
    totalEngagements: number;
    avgEngagementRate: number;
    byPlatform: Array<{
        platform: string;
        posts: number;
        views: number;
        engagements: number;
    }>;
    topPosts: Array<{
        id: string;
        platform: string;
        title?: string;
        views: number;
        engagements: number;
    }>;
    trend: Array<{
        date: string;
        posts: number;
        views: number;
        engagements: number;
    }>;
}
export declare class Analytics {
    /**
     * Get statistics
     */
    getStats(query?: StatsQuery): Promise<Stats>;
    /**
     * Update post metrics
     */
    updateMetrics(postId: string, views: number, engagements: number): Promise<void>;
    /**
     * Get product performance
     */
    getProductPerformance(productId: string): Promise<{
        totalPosts: number;
        totalViews: number;
        totalEngagements: number;
        bestPlatform: string;
        bestLanguage: string;
    }>;
    /**
     * Get platform comparison
     */
    comparePlatforms(days?: number): Promise<Array<{
        platform: string;
        posts: number;
        avgViews: number;
        avgEngagements: number;
        engagementRate: number;
    }>>;
    /**
     * Export analytics data
     */
    exportData(format?: 'json' | 'csv'): Promise<string>;
}
//# sourceMappingURL=analytics.d.ts.map