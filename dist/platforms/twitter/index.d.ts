/**
 * Twitter / X platform adapter.
 *
 * Browser-driven via Unzoo. Registration on Twitter almost always hits
 * phone verification or a CAPTCHA, so register() blocks for human help
 * rather than failing — the task parks until a person finishes it.
 */
import { BasePlatform, type PlatformContext, type PlatformRegion, type RegisterResult, type LoginResult, type NurtureResult, type PublishContent, type PublishResult, type EngageResult } from '../platform.js';
import type { NurturePayload, EngagePayload } from '../../core/task/task-queue.js';
export declare class TwitterPlatform extends BasePlatform {
    readonly name = "twitter";
    readonly displayName = "Twitter/X";
    readonly region: PlatformRegion;
    readonly registrationLikelyBlocks = true;
    checkLoginStatus(ctx: PlatformContext): Promise<boolean>;
    login(ctx: PlatformContext): Promise<LoginResult>;
    register(ctx: PlatformContext, opts: {
        useOAuth?: boolean;
    }): Promise<RegisterResult>;
    publish(ctx: PlatformContext, content: PublishContent): Promise<PublishResult>;
    nurture(ctx: PlatformContext, payload: NurturePayload): Promise<NurtureResult>;
    engage(ctx: PlatformContext, payload: EngagePayload): Promise<EngageResult>;
    /** Build tweet text, appending hashtags within the 280-char budget. */
    private composeText;
    /** Read the @handle from the side-nav account switcher, if present. */
    private readHandle;
}
export declare const twitterPlatform: TwitterPlatform;
//# sourceMappingURL=index.d.ts.map