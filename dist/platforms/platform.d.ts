/**
 * Platform adapter contract.
 *
 * Every supported site (Twitter, Reddit, LinkedIn, ...) implements this
 * interface. The executor talks only to Platform — it never knows the
 * specifics of any one site. Adding a new platform = one new file that
 * implements Platform and registers itself, with zero changes elsewhere.
 */
import type { UnzooClient } from '../browser/unzoo-client.js';
import type { AccountInfo, AccountCredentials } from '../storage/accounts.js';
import type { BlockReason } from '../core/task/types.js';
import type { NurturePayload, EngagePayload } from '../core/task/task-queue.js';
export type PlatformRegion = 'global' | 'china' | 'japan' | 'korea' | 'other';
/** Everything a platform action needs: the browser plus the active account. */
export interface PlatformContext {
    unzoo: UnzooClient;
    account?: AccountInfo;
    credentials?: AccountCredentials;
}
/** Content to publish. Mirrors the generator's output shape. */
export interface PublishContent {
    title?: string;
    body: string;
    language?: string;
    hashtags?: string[];
    mediaPaths?: string[];
}
/**
 * Common result envelope. `blocked` signals that a human must step in —
 * the task is parked, not failed.
 */
interface BaseResult {
    success: boolean;
    blocked?: BlockReason;
    error?: string;
}
export interface RegisterResult extends BaseResult {
    username?: string;
    email?: string;
    loginMethod?: AccountCredentials['loginMethod'];
}
export interface LoginResult extends BaseResult {
    loggedIn?: boolean;
}
export interface NurtureResult extends BaseResult {
    actionsPerformed: number;
    durationSeconds: number;
}
export interface PublishResult extends BaseResult {
    url?: string;
    postId?: string;
}
export interface EngageResult extends BaseResult {
    url?: string;
}
export interface Platform {
    readonly name: string;
    readonly displayName: string;
    readonly region: PlatformRegion;
    /** Whether registration is expected to need human help (phone/CAPTCHA). */
    readonly registrationLikelyBlocks: boolean;
    register(ctx: PlatformContext, opts: {
        useOAuth?: boolean;
    }): Promise<RegisterResult>;
    login(ctx: PlatformContext): Promise<LoginResult>;
    checkLoginStatus(ctx: PlatformContext): Promise<boolean>;
    nurture(ctx: PlatformContext, payload: NurturePayload): Promise<NurtureResult>;
    publish(ctx: PlatformContext, content: PublishContent): Promise<PublishResult>;
    engage(ctx: PlatformContext, payload: EngagePayload): Promise<EngageResult>;
}
/**
 * Shared helpers for platform implementations: human-like pacing so we don't
 * fire actions at robotic, detectable intervals.
 */
export declare abstract class BasePlatform implements Platform {
    abstract readonly name: string;
    abstract readonly displayName: string;
    abstract readonly region: PlatformRegion;
    readonly registrationLikelyBlocks: boolean;
    abstract register(ctx: PlatformContext, opts: {
        useOAuth?: boolean;
    }): Promise<RegisterResult>;
    abstract login(ctx: PlatformContext): Promise<LoginResult>;
    abstract checkLoginStatus(ctx: PlatformContext): Promise<boolean>;
    abstract nurture(ctx: PlatformContext, payload: NurturePayload): Promise<NurtureResult>;
    abstract publish(ctx: PlatformContext, content: PublishContent): Promise<PublishResult>;
    abstract engage(ctx: PlatformContext, payload: EngagePayload): Promise<EngageResult>;
    /** Sleep a random duration in [minMs, maxMs] to mimic a human. */
    protected humanDelay(minMs?: number, maxMs?: number): Promise<void>;
    /** Pick a random element from a list. */
    protected pick<T>(items: T[]): T;
}
/**
 * Registry of all known platforms. Adapters register themselves on import;
 * the executor resolves them by name.
 */
declare class PlatformRegistry {
    private platforms;
    register(platform: Platform): void;
    get(name: string): Platform | null;
    has(name: string): boolean;
    list(): Platform[];
    listByRegion(region: PlatformRegion): Platform[];
}
export declare function getPlatformRegistry(): PlatformRegistry;
export {};
//# sourceMappingURL=platform.d.ts.map