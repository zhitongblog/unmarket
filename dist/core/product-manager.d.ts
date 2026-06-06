export interface ProductInput {
    name: string;
    url: string;
    tagline?: string;
    description?: string;
    type?: string;
    logoUrl?: string;
    screenshots?: string[];
    features?: string[];
    recommendedPlatforms?: string[];
    recommendedLanguages?: string[];
    weight?: number;
    priority?: number;
}
export interface ProductInfo {
    id: string;
    name: string;
    url: string;
    tagline?: string;
    description?: string;
    type: string;
    logoUrl?: string;
    screenshots: string[];
    features: string[];
    recommendedPlatforms: string[];
    recommendedLanguages: string[];
    weight: number;
    priority: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProductManager {
    /**
     * Add a new product
     */
    add(input: ProductInput): ProductInfo;
    /**
     * Save analyzed product (from crawler)
     */
    saveAnalyzed(analyzed: {
        name: string;
        url: string;
        tagline: string;
        description: string;
        type: string;
        logoUrl?: string;
        screenshots?: string[];
        features?: string[];
        recommendedPlatforms: string[];
        recommendedLanguages: string[];
    }): ProductInfo;
    /**
     * Get product by ID
     */
    getById(id: string): ProductInfo | null;
    /**
     * Get product by URL
     */
    getByUrl(url: string): ProductInfo | null;
    /**
     * Update product
     */
    update(id: string, updates: Partial<ProductInput>): boolean;
    /**
     * Set product active status
     */
    setActive(id: string, active: boolean): boolean;
    /**
     * Delete product
     */
    delete(id: string): boolean;
    /**
     * List all products
     */
    list(activeOnly?: boolean): ProductInfo[];
    /**
     * Get products for scheduling
     */
    getForScheduling(): ProductInfo[];
    /**
     * Get product count
     */
    count(activeOnly?: boolean): number;
    private rowToInfo;
}
export declare function getProductManager(): ProductManager;
//# sourceMappingURL=product-manager.d.ts.map