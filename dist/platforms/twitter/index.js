/**
 * Twitter / X platform adapter.
 *
 * Browser-driven via Unzoo. Registration on Twitter almost always hits
 * phone verification or a CAPTCHA, so register() blocks for human help
 * rather than failing — the task parks until a person finishes it.
 */
import { BasePlatform, getPlatformRegistry, } from '../platform.js';
import { createLogger } from '../../utils/logger.js';
const logger = createLogger('platform:twitter');
const URLS = {
    home: 'https://x.com/home',
    login: 'https://x.com/i/flow/login',
    signup: 'https://x.com/i/flow/signup',
    compose: 'https://x.com/compose/post',
    explore: 'https://x.com/explore',
};
const SEL = {
    // login
    usernameInput: 'input[autocomplete="username"]',
    passwordInput: 'input[autocomplete="current-password"], input[name="password"]',
    // compose
    tweetBox: 'div[data-testid="tweetTextarea_0"]',
    tweetButton: 'button[data-testid="tweetButton"], button[data-testid="tweetButtonInline"]',
    // feed interaction
    tweet: 'article[data-testid="tweet"]',
    likeButton: 'button[data-testid="like"]',
    replyButton: 'button[data-testid="reply"]',
    // login-state markers
    primaryColumn: 'div[data-testid="primaryColumn"]',
    sideNavAccount: 'div[data-testid="SideNav_AccountSwitcher_Button"]',
};
export class TwitterPlatform extends BasePlatform {
    name = 'twitter';
    displayName = 'Twitter/X';
    region = 'global';
    registrationLikelyBlocks = true;
    async checkLoginStatus(ctx) {
        await ctx.unzoo.navigate(URLS.home);
        await this.humanDelay(1500, 3000);
        // Logged-in users see the account switcher in the side nav.
        return ctx.unzoo.exists(SEL.sideNavAccount);
    }
    async login(ctx) {
        if (!ctx.credentials) {
            return { success: false, error: 'No credentials provided' };
        }
        // Already logged in? (Unzoo persists the profile session.)
        if (await this.checkLoginStatus(ctx)) {
            logger.info('Already logged in');
            return { success: true, loggedIn: true };
        }
        const { username, email, password } = ctx.credentials;
        const identifier = username || email;
        if (!identifier || !password) {
            return { success: false, error: 'Missing username/password' };
        }
        await ctx.unzoo.navigate(URLS.login);
        await this.humanDelay(2000, 3500);
        // Step 1: identifier
        await ctx.unzoo.type(SEL.usernameInput, identifier, { clear: true });
        await this.humanDelay();
        await ctx.unzoo.press('Enter');
        await this.humanDelay(2000, 3000);
        // Step 2: password (Twitter may insert an extra "unusual activity" step)
        const hasPassword = await ctx.unzoo.exists(SEL.passwordInput);
        if (!hasPassword) {
            logger.warn('Password field not found — likely an extra verification step');
            return { success: false, blocked: 'manual_review', error: 'Unexpected login step' };
        }
        await ctx.unzoo.type(SEL.passwordInput, password, { clear: true });
        await this.humanDelay();
        await ctx.unzoo.press('Enter');
        await this.humanDelay(3000, 5000);
        if (await this.checkLoginStatus(ctx)) {
            return { success: true, loggedIn: true };
        }
        return { success: false, blocked: 'login_required', error: 'Login did not complete' };
    }
    async register(ctx, opts) {
        logger.info('Starting Twitter registration', { useOAuth: opts.useOAuth });
        await ctx.unzoo.navigate(URLS.signup);
        await this.humanDelay(2500, 4000);
        // Twitter's signup flow is multi-step and gated by phone + CAPTCHA.
        // We open the page and hand off to a human, then verify the result.
        await ctx.unzoo.waitForUser('Please complete Twitter signup (name, email/phone, CAPTCHA). ' +
            'The system will detect when you reach the home feed.', 180_000);
        if (await this.checkLoginStatus(ctx)) {
            const handle = await this.readHandle(ctx);
            logger.info('Twitter registration completed', { handle });
            return { success: true, username: handle, loginMethod: 'password' };
        }
        return {
            success: false,
            blocked: 'phone_verification',
            error: 'Registration not completed within the manual window',
        };
    }
    async publish(ctx, content) {
        if (!(await this.checkLoginStatus(ctx))) {
            const login = await this.login(ctx);
            if (!login.success)
                return { success: false, blocked: login.blocked, error: 'Not logged in' };
        }
        await ctx.unzoo.navigate(URLS.compose);
        await this.humanDelay(1500, 3000);
        const text = this.composeText(content);
        const boxReady = await ctx.unzoo.waitFor(SEL.tweetBox, { timeout: 10_000 });
        if (!boxReady.success) {
            return { success: false, error: 'Compose box not found' };
        }
        await ctx.unzoo.type(SEL.tweetBox, text);
        await this.humanDelay(1000, 2000);
        const posted = await ctx.unzoo.click(SEL.tweetButton);
        if (!posted.success) {
            return { success: false, error: 'Failed to click post button' };
        }
        await this.humanDelay(2500, 4000);
        const url = await ctx.unzoo.getCurrentUrl();
        logger.info('Tweet published', { url });
        return { success: true, url: url ?? undefined };
    }
    async nurture(ctx, payload) {
        const deadline = Date.now() + payload.durationSeconds * 1000;
        let actionsPerformed = 0;
        if (!(await this.checkLoginStatus(ctx))) {
            return { success: false, actionsPerformed: 0, durationSeconds: 0, blocked: 'login_required' };
        }
        await ctx.unzoo.navigate(URLS.home);
        await this.humanDelay(2000, 3500);
        while (Date.now() < deadline) {
            const action = this.pick(payload.actions);
            switch (action) {
                case 'browse': {
                    // Scroll the feed and dwell, like a real reader.
                    await ctx.unzoo.scroll('down', 400 + Math.floor(Math.random() * 600));
                    await this.humanDelay(2000, 6000);
                    actionsPerformed++;
                    break;
                }
                case 'like': {
                    // Like the first visible like-button we can find.
                    if (await ctx.unzoo.exists(SEL.likeButton)) {
                        await ctx.unzoo.click(SEL.likeButton);
                        actionsPerformed++;
                        await this.humanDelay(1500, 4000);
                    }
                    await ctx.unzoo.scroll('down', 500);
                    break;
                }
                case 'follow':
                case 'comment':
                case 'profile':
                default: {
                    // Heavier actions are spaced out; for warming we mostly browse+like.
                    await ctx.unzoo.scroll('down', 500);
                    await this.humanDelay(2000, 5000);
                    actionsPerformed++;
                    break;
                }
            }
        }
        const durationSeconds = Math.round(payload.durationSeconds);
        logger.info('Nurture session complete', { actionsPerformed, durationSeconds });
        return { success: true, actionsPerformed, durationSeconds };
    }
    async engage(ctx, payload) {
        if (!(await this.checkLoginStatus(ctx))) {
            return { success: false, blocked: 'login_required', error: 'Not logged in' };
        }
        await ctx.unzoo.navigate(payload.target);
        await this.humanDelay(2000, 3500);
        switch (payload.action) {
            case 'like': {
                if (await ctx.unzoo.exists(SEL.likeButton)) {
                    await ctx.unzoo.click(SEL.likeButton);
                    return { success: true, url: payload.target };
                }
                return { success: false, error: 'Like button not found' };
            }
            case 'reply':
            case 'comment': {
                if (!payload.text)
                    return { success: false, error: 'No reply text provided' };
                await ctx.unzoo.click(SEL.replyButton);
                await this.humanDelay(1000, 2000);
                await ctx.unzoo.type(SEL.tweetBox, payload.text);
                await this.humanDelay();
                await ctx.unzoo.click(SEL.tweetButton);
                await this.humanDelay(2000, 3500);
                return { success: true, url: payload.target };
            }
            case 'follow':
            default:
                return { success: false, error: `Engage action not implemented: ${payload.action}` };
        }
    }
    // ---- helpers --------------------------------------------------------------
    /** Build tweet text, appending hashtags within the 280-char budget. */
    composeText(content) {
        let text = content.title ? `${content.title}\n\n${content.body}` : content.body;
        if (content.hashtags?.length) {
            const tags = content.hashtags.map(h => (h.startsWith('#') ? h : `#${h}`)).join(' ');
            if (text.length + tags.length + 2 <= 280) {
                text = `${text}\n\n${tags}`;
            }
        }
        return text.slice(0, 280);
    }
    /** Read the @handle from the side-nav account switcher, if present. */
    async readHandle(ctx) {
        const res = await ctx.unzoo.evaluate(`document.querySelector('${SEL.sideNavAccount}')?.textContent || ''`);
        const match = String(res.output || '').match(/@([A-Za-z0-9_]+)/);
        return match?.[1];
    }
}
// Self-register on import.
getPlatformRegistry().register(new TwitterPlatform());
export const twitterPlatform = new TwitterPlatform();
//# sourceMappingURL=index.js.map