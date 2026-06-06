/**
 * Analytics - Track and report publishing statistics
 */
import { getDatabase } from '../storage/database.js';

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

export class Analytics {
  /**
   * Get statistics
   */
  async getStats(query: StatsQuery = {}): Promise<Stats> {
    const db = getDatabase();
    const { productId, platform, days = 7, top = 5 } = query;

    // Build WHERE clause
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (productId) {
      conditions.push('product_id = ?');
      params.push(productId);
    }
    if (platform) {
      conditions.push('platform = ?');
      params.push(platform);
    }

    conditions.push(`published_at >= datetime('now', '-' || ? || ' days')`);
    params.push(days);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get totals
    const totalsStmt = db.prepare(`
      SELECT
        COUNT(*) as total_posts,
        COALESCE(SUM(views), 0) as total_views,
        COALESCE(SUM(engagements), 0) as total_engagements
      FROM posts
      ${whereClause}
    `);
    const totals = totalsStmt.get(...params) as {
      total_posts: number;
      total_views: number;
      total_engagements: number;
    };

    // Get by platform
    const platformStmt = db.prepare(`
      SELECT
        platform,
        COUNT(*) as posts,
        COALESCE(SUM(views), 0) as views,
        COALESCE(SUM(engagements), 0) as engagements
      FROM posts
      ${whereClause}
      GROUP BY platform
      ORDER BY posts DESC
    `);
    const byPlatform = platformStmt.all(...params) as Array<{
      platform: string;
      posts: number;
      views: number;
      engagements: number;
    }>;

    // Get top posts
    const topStmt = db.prepare(`
      SELECT id, platform, title, views, engagements
      FROM posts
      ${whereClause}
      ORDER BY engagements DESC, views DESC
      LIMIT ?
    `);
    const topPosts = topStmt.all(...params, top) as Array<{
      id: string;
      platform: string;
      title?: string;
      views: number;
      engagements: number;
    }>;

    // Get daily trend
    const trendStmt = db.prepare(`
      SELECT
        date(published_at) as date,
        COUNT(*) as posts,
        COALESCE(SUM(views), 0) as views,
        COALESCE(SUM(engagements), 0) as engagements
      FROM posts
      ${whereClause}
      GROUP BY date(published_at)
      ORDER BY date ASC
    `);
    const trend = trendStmt.all(...params) as Array<{
      date: string;
      posts: number;
      views: number;
      engagements: number;
    }>;

    // Calculate engagement rate
    const avgEngagementRate = totals.total_views > 0
      ? totals.total_engagements / totals.total_views
      : 0;

    return {
      totalPosts: totals.total_posts,
      totalViews: totals.total_views,
      totalEngagements: totals.total_engagements,
      avgEngagementRate,
      byPlatform,
      topPosts,
      trend
    };
  }

  /**
   * Update post metrics
   */
  async updateMetrics(postId: string, views: number, engagements: number): Promise<void> {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE posts SET views = ?, engagements = ? WHERE id = ?
    `);
    stmt.run(views, engagements, postId);

    // Also record in analytics table for historical tracking
    const analyticsStmt = db.prepare(`
      INSERT INTO analytics (id, post_id, date, views, engagements)
      VALUES (?, ?, date('now'), ?, ?)
    `);
    analyticsStmt.run(crypto.randomUUID(), postId, views, engagements);
  }

  /**
   * Get product performance
   */
  async getProductPerformance(productId: string): Promise<{
    totalPosts: number;
    totalViews: number;
    totalEngagements: number;
    bestPlatform: string;
    bestLanguage: string;
  }> {
    const db = getDatabase();

    // Get totals
    const totalsStmt = db.prepare(`
      SELECT
        COUNT(*) as total_posts,
        COALESCE(SUM(views), 0) as total_views,
        COALESCE(SUM(engagements), 0) as total_engagements
      FROM posts
      WHERE product_id = ?
    `);
    const totals = totalsStmt.get(productId) as {
      total_posts: number;
      total_views: number;
      total_engagements: number;
    };

    // Best platform
    const platformStmt = db.prepare(`
      SELECT platform, SUM(engagements) as total
      FROM posts WHERE product_id = ?
      GROUP BY platform ORDER BY total DESC LIMIT 1
    `);
    const bestPlatformRow = platformStmt.get(productId) as { platform: string } | undefined;

    // Best language
    const languageStmt = db.prepare(`
      SELECT language, SUM(engagements) as total
      FROM posts WHERE product_id = ?
      GROUP BY language ORDER BY total DESC LIMIT 1
    `);
    const bestLanguageRow = languageStmt.get(productId) as { language: string } | undefined;

    return {
      totalPosts: totals.total_posts,
      totalViews: totals.total_views,
      totalEngagements: totals.total_engagements,
      bestPlatform: bestPlatformRow?.platform || 'N/A',
      bestLanguage: bestLanguageRow?.language || 'en'
    };
  }

  /**
   * Get platform comparison
   */
  async comparePlatforms(days = 30): Promise<Array<{
    platform: string;
    posts: number;
    avgViews: number;
    avgEngagements: number;
    engagementRate: number;
  }>> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT
        platform,
        COUNT(*) as posts,
        AVG(views) as avg_views,
        AVG(engagements) as avg_engagements,
        CASE WHEN SUM(views) > 0 THEN SUM(engagements) * 1.0 / SUM(views) ELSE 0 END as engagement_rate
      FROM posts
      WHERE published_at >= datetime('now', '-' || ? || ' days')
      GROUP BY platform
      ORDER BY engagement_rate DESC
    `);

    return stmt.all(days) as Array<{
      platform: string;
      posts: number;
      avgViews: number;
      avgEngagements: number;
      engagementRate: number;
    }>;
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const db = getDatabase();

    const stmt = db.prepare(`
      SELECT
        p.id, p.product_id, p.platform, p.language,
        p.title, p.views, p.engagements, p.published_at,
        pr.name as product_name
      FROM posts p
      LEFT JOIN products pr ON p.product_id = pr.id
      ORDER BY p.published_at DESC
    `);

    const rows = stmt.all() as Array<Record<string, unknown>>;

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {}).join(',');
      const data = rows.map(r => Object.values(r).join(',')).join('\n');
      return `${headers}\n${data}`;
    }

    return JSON.stringify(rows, null, 2);
  }
}
