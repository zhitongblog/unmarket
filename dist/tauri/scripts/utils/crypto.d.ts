/**
 * Encrypt plaintext
 */
export declare function encrypt(plaintext: string): string;
/**
 * Decrypt ciphertext
 */
export declare function decrypt(ciphertext: string): string;
/**
 * Hash password for comparison (not reversible)
 */
export declare function hashPassword(password: string): string;
/**
 * Verify password against hash
 */
export declare function verifyPassword(password: string, storedHash: string): boolean;
//# sourceMappingURL=crypto.d.ts.map