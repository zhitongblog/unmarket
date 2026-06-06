/**
 * Product management - CRUD operations for products
 */
import { getDatabase, generateId } from '../storage/database.js';
import { createLogger } from '../utils/logger.js';
const logger = createLogger('product');
export class ProductManager {
    /**
     * Add a new product
     */
    add(input) {
        const db = getDatabase();
        const id = generateId();
        const stmt = db.prepare(`
      INSERT INTO products (
        id, name, url, tagline, description, type,
        logo_url, screenshots, features,
        recommended_platforms, recommended_languages,
        weight, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, input.name, input.url, input.tagline || null, input.description || null, input.type || 'tool', input.logoUrl || null, JSON.stringify(input.screenshots || []), JSON.stringify(input.features || []), JSON.stringify(input.recommendedPlatforms || []), JSON.stringify(input.recommendedLanguages || ['en']), input.weight || 1, input.priority || 0);
        logger.info('Product added', { id, name: input.name });
        return this.getById(id);
    }
    /**
     * Save analyzed product (from crawler)
     */
    saveAnalyzed(analyzed) {
        // Check if product with same URL exists
        const existing = this.getByUrl(analyzed.url);
        if (existing) {
            // Update existing
            this.update(existing.id, {
                name: analyzed.name,
                tagline: analyzed.tagline,
                description: analyzed.description,
                type: analyzed.type,
                logoUrl: analyzed.logoUrl,
                screenshots: analyzed.screenshots,
                features: analyzed.features,
                recommendedPlatforms: analyzed.recommendedPlatforms,
                recommendedLanguages: analyzed.recommendedLanguages
            });
            return this.getById(existing.id);
        }
        return this.add(analyzed);
    }
    /**
     * Get product by ID
     */
    getById(id) {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
        const row = stmt.get(id);
        if (!row)
            return null;
        return this.rowToInfo(row);
    }
    /**
     * Get product by URL
     */
    getByUrl(url) {
        const db = getDatabase();
        const stmt = db.prepare('SELECT * FROM products WHERE url = ?');
        const row = stmt.get(url);
        if (!row)
            return null;
        return this.rowToInfo(row);
    }
    /**
     * Update product
     */
    update(id, updates) {
        const db = getDatabase();
        const fields = [];
        const values = [];
        if (updates.name !== undefined) {
            fields.push('name = ?');
            values.push(updates.name);
        }
        if (updates.tagline !== undefined) {
            fields.push('tagline = ?');
            values.push(updates.tagline);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.type !== undefined) {
            fields.push('type = ?');
            values.push(updates.type);
        }
        if (updates.logoUrl !== undefined) {
            fields.push('logo_url = ?');
            values.push(updates.logoUrl);
        }
        if (updates.screenshots !== undefined) {
            fields.push('screenshots = ?');
            values.push(JSON.stringify(updates.screenshots));
        }
        if (updates.features !== undefined) {
            fields.push('features = ?');
            values.push(JSON.stringify(updates.features));
        }
        if (updates.recommendedPlatforms !== undefined) {
            fields.push('recommended_platforms = ?');
            values.push(JSON.stringify(updates.recommendedPlatforms));
        }
        if (updates.recommendedLanguages !== undefined) {
            fields.push('recommended_languages = ?');
            values.push(JSON.stringify(updates.recommendedLanguages));
        }
        if (updates.weight !== undefined) {
            fields.push('weight = ?');
            values.push(updates.weight);
        }
        if (updates.priority !== undefined) {
            fields.push('priority = ?');
            values.push(updates.priority);
        }
        if (fields.length === 0)
            return false;
        fields.push("updated_at = datetime('now')");
        values.push(id);
        const stmt = db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
        const result = stmt.run(...values);
        if (result.changes > 0) {
            logger.info('Product updated', { id });
            return true;
        }
        return false;
    }
    /**
     * Set product active status
     */
    setActive(id, active) {
        const db = getDatabase();
        const stmt = db.prepare(`
      UPDATE products SET active = ?, updated_at = datetime('now') WHERE id = ?
    `);
        const result = stmt.run(active ? 1 : 0, id);
        return result.changes > 0;
    }
    /**
     * Delete product
     */
    delete(id) {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        const result = stmt.run(id);
        if (result.changes > 0) {
            logger.info('Product deleted', { id });
            return true;
        }
        return false;
    }
    /**
     * List all products
     */
    list(activeOnly = true) {
        const db = getDatabase();
        const sql = activeOnly
            ? 'SELECT * FROM products WHERE active = 1 ORDER BY priority DESC, weight DESC'
            : 'SELECT * FROM products ORDER BY priority DESC, weight DESC';
        const stmt = db.prepare(sql);
        const rows = stmt.all();
        return rows.map(row => this.rowToInfo(row));
    }
    /**
     * Get products for scheduling
     */
    getForScheduling() {
        return this.list(true);
    }
    /**
     * Get product count
     */
    count(activeOnly = true) {
        const db = getDatabase();
        const sql = activeOnly
            ? 'SELECT COUNT(*) as count FROM products WHERE active = 1'
            : 'SELECT COUNT(*) as count FROM products';
        const stmt = db.prepare(sql);
        const row = stmt.get();
        return row.count;
    }
    rowToInfo(row) {
        return {
            id: row.id,
            name: row.name,
            url: row.url,
            tagline: row.tagline,
            description: row.description,
            type: row.type,
            logoUrl: row.logo_url,
            screenshots: row.screenshots ? JSON.parse(row.screenshots) : [],
            features: row.features ? JSON.parse(row.features) : [],
            recommendedPlatforms: row.recommended_platforms
                ? JSON.parse(row.recommended_platforms)
                : [],
            recommendedLanguages: row.recommended_languages
                ? JSON.parse(row.recommended_languages)
                : ['en'],
            weight: row.weight,
            priority: row.priority,
            active: Boolean(row.active),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
// Singleton
let instance = null;
export function getProductManager() {
    if (!instance) {
        instance = new ProductManager();
    }
    return instance;
}
//# sourceMappingURL=product-manager.js.map