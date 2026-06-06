/**
 * Encryption utilities for secure credential storage
 * Uses AES-256-GCM for authenticated encryption
 */
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 32;

const KEY_FILE = join(homedir(), '.unmarket', '.key');

/**
 * Get or create encryption key
 */
function getOrCreateKey(): Buffer {
  const keyDir = join(homedir(), '.unmarket');

  if (!existsSync(keyDir)) {
    mkdirSync(keyDir, { recursive: true });
  }

  if (existsSync(KEY_FILE)) {
    return readFileSync(KEY_FILE);
  }

  // Generate new key
  const salt = randomBytes(SALT_LENGTH);
  const machineId = `${homedir()}-${process.env.USERNAME || 'user'}`;
  const key = scryptSync(machineId, salt, KEY_LENGTH);

  // Store salt + key. Return the same salt+key layout that the read path
  // returns, so callers' `.slice(SALT_LENGTH)` yields the 32-byte key in
  // both cases. (Returning just `key` here broke the very first encrypt
  // on a fresh install: slice(32) of a 32-byte buffer is empty.)
  const keyData = Buffer.concat([salt, key]);
  writeFileSync(KEY_FILE, keyData, { mode: 0o600 });

  return keyData;
}

/**
 * Encrypt plaintext
 */
export function encrypt(plaintext: string): string {
  const key = getOrCreateKey().slice(SALT_LENGTH); // Skip salt, get key
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypt ciphertext
 */
export function decrypt(ciphertext: string): string {
  const key = getOrCreateKey().slice(SALT_LENGTH);

  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid ciphertext format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encrypted = Buffer.from(parts[2], 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(encrypted) + decipher.final('utf8');
}

/**
 * Hash password for comparison (not reversible)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltHex, hashHex] = storedHash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const hash = scryptSync(password, salt, 64);
  return hash.toString('hex') === hashHex;
}
