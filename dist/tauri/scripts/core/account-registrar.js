/**
 * Account registrar - Auto-register accounts on platforms
 * Uses Gmail for verification emails
 */
import { getUnzooClient } from '../browser/unzoo-client.js';
import { getAccountManager } from '../storage/accounts.js';
import { getDatabase } from '../storage/database.js';
import { createLogger } from '../utils/logger.js';
const logger = createLogger('registrar');
const PLATFORM_CONFIGS = {
    // === International Social ===
    twitter: {
        name: 'Twitter/X',
        loginUrl: 'https://twitter.com/i/flow/login',
        registerUrl: 'https://twitter.com/i/flow/signup',
        googleOAuth: { supported: true, buttonSelector: '[data-testid="google_sign_in_container"] button, button[aria-label*="Google"]' },
        selectors: {
            emailField: 'input[autocomplete="email"]',
            passwordField: 'input[type="password"]',
            submitButton: 'button[role="button"]'
        },
        requirements: { phoneRequired: true, captchaExpected: true }
    },
    linkedin: {
        name: 'LinkedIn',
        loginUrl: 'https://www.linkedin.com/login',
        registerUrl: 'https://www.linkedin.com/signup',
        googleOAuth: { supported: true, buttonSelector: 'button[data-tracking-control-name*="google"], .google-button' },
        selectors: {
            emailField: '#email-address',
            passwordField: '#password',
            submitButton: 'button[type="submit"]'
        },
        requirements: { phoneRequired: true }
    },
    facebook: {
        name: 'Facebook',
        loginUrl: 'https://www.facebook.com/login',
        registerUrl: 'https://www.facebook.com/r.php',
        selectors: {
            emailField: 'input[name="reg_email__"]',
            passwordField: 'input[name="reg_passwd__"]',
            submitButton: 'button[name="websubmit"]'
        },
        requirements: { phoneRequired: true, captchaExpected: true }
    },
    instagram: {
        name: 'Instagram',
        loginUrl: 'https://www.instagram.com/accounts/login/',
        registerUrl: 'https://www.instagram.com/accounts/emailsignup/',
        selectors: {
            emailField: 'input[name="emailOrPhone"]',
            usernameField: 'input[name="username"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        },
        requirements: { captchaExpected: true }
    },
    reddit: {
        name: 'Reddit',
        loginUrl: 'https://www.reddit.com/login',
        registerUrl: 'https://www.reddit.com/register',
        googleOAuth: { supported: true, buttonSelector: 'button[data-provider="google"], .google-button, button:has-text("Google")' },
        selectors: {
            emailField: '#regEmail',
            usernameField: '#regUsername',
            passwordField: '#regPassword',
            submitButton: 'button[type="submit"]'
        }
    },
    mastodon: {
        name: 'Mastodon',
        loginUrl: 'https://mastodon.social/auth/sign_in',
        registerUrl: 'https://mastodon.social/auth/sign_up',
        selectors: {
            emailField: '#user_email',
            usernameField: '#user_account_attributes_username',
            passwordField: '#user_password',
            confirmPasswordField: '#user_password_confirmation',
            submitButton: 'button[type="submit"]'
        }
    },
    // === Developer Platforms ===
    devto: {
        name: 'DEV.to',
        loginUrl: 'https://dev.to/enter',
        registerUrl: 'https://dev.to/enter?state=new-user',
        googleOAuth: { supported: true, buttonSelector: 'a[href*="oauth/google"], button:has-text("Continue with Google")' },
        selectors: {
            emailField: '#user_email',
            usernameField: '#user_username',
            passwordField: '#user_password',
            confirmPasswordField: '#user_password_confirmation',
            submitButton: 'input[type="submit"]'
        }
    },
    hackernews: {
        name: 'Hacker News',
        loginUrl: 'https://news.ycombinator.com/login',
        registerUrl: 'https://news.ycombinator.com/login?goto=news',
        selectors: {
            emailField: '',
            usernameField: 'input[name="acct"]',
            passwordField: 'input[name="pw"]',
            submitButton: 'input[type="submit"]'
        },
        requirements: { usernameRequired: true }
    },
    producthunt: {
        name: 'Product Hunt',
        loginUrl: 'https://www.producthunt.com/login',
        registerUrl: 'https://www.producthunt.com/join',
        googleOAuth: { supported: true, buttonSelector: 'button[data-test="login-with-google"], a[href*="auth/google"]' },
        selectors: {
            emailField: 'input[type="email"]',
            passwordField: 'input[type="password"]',
            submitButton: 'button[type="submit"]'
        }
    },
    github: {
        name: 'GitHub',
        loginUrl: 'https://github.com/login',
        registerUrl: 'https://github.com/signup',
        selectors: {
            emailField: '#email',
            usernameField: '#login',
            passwordField: '#password',
            submitButton: 'button[type="submit"]'
        },
        requirements: { captchaExpected: true }
    },
    hashnode: {
        name: 'Hashnode',
        loginUrl: 'https://hashnode.com/login',
        registerUrl: 'https://hashnode.com/onboard',
        googleOAuth: { supported: true, buttonSelector: 'button[data-testid="google-login"], a[href*="auth/google"]' },
        selectors: {
            emailField: 'input[type="email"]',
            passwordField: 'input[type="password"]',
            submitButton: 'button[type="submit"]'
        }
    },
    medium: {
        name: 'Medium',
        loginUrl: 'https://medium.com/m/signin',
        registerUrl: 'https://medium.com/m/signin?operation=register',
        googleOAuth: { supported: true, buttonSelector: 'button[data-testid="googleButton"], a[href*="auth/google"]' },
        selectors: {
            emailField: 'input[type="email"]',
            passwordField: '',
            submitButton: 'button[type="submit"]'
        }
    },
    indiehackers: {
        name: 'Indie Hackers',
        loginUrl: 'https://www.indiehackers.com/sign-in',
        registerUrl: 'https://www.indiehackers.com/sign-up',
        googleOAuth: { supported: true, buttonSelector: 'button.google-button, a[href*="auth/google"]' },
        selectors: {
            emailField: 'input[type="email"]',
            usernameField: 'input[name="username"]',
            passwordField: 'input[type="password"]',
            submitButton: 'button[type="submit"]'
        }
    },
    // === Chinese Platforms ===
    weibo: {
        name: '微博',
        loginUrl: 'https://weibo.com/login.php',
        registerUrl: 'https://weibo.com/signup/signup.php',
        selectors: {
            emailField: 'input[name="email"]',
            passwordField: 'input[name="password"]',
            submitButton: 'a.W_btn_a'
        },
        requirements: { phoneRequired: true, captchaExpected: true }
    },
    zhihu: {
        name: '知乎',
        loginUrl: 'https://www.zhihu.com/signin',
        registerUrl: 'https://www.zhihu.com/signup',
        selectors: {
            emailField: 'input[name="username"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        },
        requirements: { phoneRequired: true }
    },
    juejin: {
        name: '掘金',
        loginUrl: 'https://juejin.cn/login',
        registerUrl: 'https://juejin.cn/login',
        googleOAuth: { supported: true, buttonSelector: '.oauth-btn.oauth-google, [data-type="google"]' },
        selectors: {
            emailField: 'input[name="loginPhoneOrEmail"]',
            passwordField: 'input[name="loginPassword"]',
            submitButton: 'button.btn'
        }
    },
    v2ex: {
        name: 'V2EX',
        loginUrl: 'https://www.v2ex.com/signin',
        registerUrl: 'https://www.v2ex.com/signup',
        googleOAuth: { supported: true, buttonSelector: 'a[href*="auth/google"], .google-signin' },
        selectors: {
            emailField: 'input[name="email"]',
            usernameField: 'input[name="username"]',
            passwordField: 'input[name="password"]',
            confirmPasswordField: 'input[name="password2"]',
            submitButton: 'input[type="submit"]'
        },
        requirements: { captchaExpected: true }
    },
    csdn: {
        name: 'CSDN',
        loginUrl: 'https://passport.csdn.net/login',
        registerUrl: 'https://passport.csdn.net/register',
        selectors: {
            emailField: 'input[name="email"]',
            usernameField: 'input[name="username"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        },
        requirements: { phoneRequired: true }
    },
    oschina: {
        name: '开源中国',
        loginUrl: 'https://www.oschina.net/home/login',
        registerUrl: 'https://www.oschina.net/home/reg',
        selectors: {
            emailField: 'input[name="email"]',
            usernameField: 'input[name="name"]',
            passwordField: 'input[name="pwd"]',
            submitButton: 'button[type="submit"]'
        }
    },
    segmentfault: {
        name: 'SegmentFault',
        loginUrl: 'https://segmentfault.com/user/login',
        registerUrl: 'https://segmentfault.com/user/register',
        googleOAuth: { supported: true, buttonSelector: 'a[href*="oauth/google"], .oauth-google' },
        selectors: {
            emailField: 'input[name="mail"]',
            usernameField: 'input[name="name"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        }
    },
    xiaohongshu: {
        name: '小红书',
        loginUrl: 'https://www.xiaohongshu.com/login',
        registerUrl: 'https://www.xiaohongshu.com/login',
        selectors: {
            emailField: 'input[name="phone"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        },
        requirements: { phoneRequired: true }
    },
    douyin: {
        name: '抖音',
        loginUrl: 'https://www.douyin.com/',
        registerUrl: 'https://www.douyin.com/',
        selectors: {
            emailField: 'input[name="mobile"]',
            passwordField: '',
            submitButton: 'button[type="submit"]'
        },
        requirements: { phoneRequired: true }
    },
    bilibili: {
        name: 'Bilibili',
        loginUrl: 'https://passport.bilibili.com/login',
        registerUrl: 'https://passport.bilibili.com/register/phone.html',
        selectors: {
            emailField: 'input[name="tel"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        },
        requirements: { phoneRequired: true }
    },
    // === Japanese Platforms ===
    qiita: {
        name: 'Qiita',
        loginUrl: 'https://qiita.com/login',
        registerUrl: 'https://qiita.com/signup',
        googleOAuth: { supported: true, buttonSelector: 'a[href*="auth/google"], .google-login' },
        selectors: {
            emailField: 'input[name="identity"]',
            usernameField: 'input[name="url_name"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        }
    },
    zenn: {
        name: 'Zenn',
        loginUrl: 'https://zenn.dev/enter',
        registerUrl: 'https://zenn.dev/enter',
        googleOAuth: { supported: true, buttonSelector: 'button[data-provider="google"], a[href*="auth/google"]' },
        selectors: {
            emailField: 'input[type="email"]',
            passwordField: 'input[type="password"]',
            submitButton: 'button[type="submit"]'
        }
    },
    note: {
        name: 'note (JP)',
        loginUrl: 'https://note.com/login',
        registerUrl: 'https://note.com/signup',
        selectors: {
            emailField: 'input[name="email"]',
            usernameField: 'input[name="urlname"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        }
    },
    // === Korean Platforms ===
    velog: {
        name: 'Velog',
        loginUrl: 'https://velog.io/',
        registerUrl: 'https://velog.io/register',
        googleOAuth: { supported: true, buttonSelector: 'button[data-testid="google-login"], a[href*="auth/google"]' },
        selectors: {
            emailField: 'input[name="email"]',
            usernameField: 'input[name="username"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        }
    },
    // === Other International ===
    discord: {
        name: 'Discord',
        loginUrl: 'https://discord.com/login',
        registerUrl: 'https://discord.com/register',
        selectors: {
            emailField: 'input[name="email"]',
            usernameField: 'input[name="username"]',
            passwordField: 'input[name="password"]',
            submitButton: 'button[type="submit"]'
        },
        requirements: { captchaExpected: true }
    },
    telegram: {
        name: 'Telegram',
        loginUrl: 'https://web.telegram.org/',
        registerUrl: 'https://web.telegram.org/',
        selectors: {
            emailField: 'input[type="tel"]',
            passwordField: '',
            submitButton: 'button[type="submit"]'
        },
        requirements: { phoneRequired: true }
    },
    slack: {
        name: 'Slack',
        loginUrl: 'https://slack.com/signin',
        registerUrl: 'https://slack.com/get-started',
        googleOAuth: { supported: true, buttonSelector: 'a[href*="google"], .google-button' },
        selectors: {
            emailField: 'input[type="email"]',
            passwordField: '',
            submitButton: 'button[type="submit"]'
        }
    }
};
export class AccountRegistrar {
    unzoo = getUnzooClient();
    accounts = getAccountManager();
    /**
     * Setup Gmail for receiving verification emails
     */
    async setupGmail() {
        logger.info('Setting up Gmail login');
        // Navigate to Gmail
        const navResult = await this.unzoo.navigate('https://mail.google.com');
        if (!navResult.success) {
            throw new Error('Failed to open Gmail');
        }
        // Gmail is a SPA, need to wait for full page load with retries
        const maxRetries = 5;
        for (let i = 0; i < maxRetries; i++) {
            // Wait for page to load (increasing wait time each retry)
            await new Promise(resolve => setTimeout(resolve, 2000 + i * 1000));
            // Get email from page title (format: "Inbox (123) - user@gmail.com - Gmail")
            const titleResult = await this.unzoo.evaluate('document.title');
            logger.debug('Gmail title check', { attempt: i + 1, output: titleResult.output });
            if (titleResult.success && titleResult.output) {
                const title = String(titleResult.output);
                const emailMatch = title.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                if (emailMatch) {
                    this.saveGmailState(emailMatch[0]);
                    logger.info('Gmail connected', { email: emailMatch[0] });
                    return;
                }
            }
        }
        throw new Error('Could not verify Gmail login. Please login to Gmail in Unzoo browser and wait for inbox to load.');
    }
    /**
     * Get Gmail status
     */
    async getGmailStatus() {
        const state = this.loadGmailState();
        return {
            connected: !!state.email,
            email: state.email,
            connectedAt: state.connectedAt
        };
    }
    /**
     * Disconnect Gmail
     */
    async disconnectGmail() {
        this.clearGmailState();
        logger.info('Gmail disconnected');
    }
    /**
     * Login or register account on a platform
     * Priority: Google OAuth > Traditional Login > Registration
     */
    async register(platform) {
        const config = PLATFORM_CONFIGS[platform.toLowerCase()];
        if (!config) {
            return {
                success: false,
                platform,
                needsManualVerification: false,
                error: `Platform not supported: ${platform}`
            };
        }
        logger.info('Starting login/registration', { platform, hasGoogleOAuth: !!config.googleOAuth?.supported });
        // Check if Gmail is connected
        const gmailStatus = await this.getGmailStatus();
        if (!gmailStatus.connected) {
            return {
                success: false,
                platform,
                needsManualVerification: true,
                verificationReason: 'Gmail not connected. Run: unmarket gmail login'
            };
        }
        try {
            // === Strategy 1: Try Google OAuth if supported (fastest) ===
            if (config.googleOAuth?.supported) {
                logger.info('Trying Google OAuth login', { platform });
                const oauthResult = await this.tryGoogleOAuth(config);
                if (oauthResult.success) {
                    // Save account with OAuth info
                    this.accounts.add(platform, {
                        username: gmailStatus.email.split('@')[0],
                        email: gmailStatus.email,
                        password: 'GOOGLE_OAUTH',
                        loginMethod: 'google_oauth'
                    });
                    return {
                        success: true,
                        platform,
                        email: gmailStatus.email,
                        username: gmailStatus.email.split('@')[0],
                        needsManualVerification: false
                    };
                }
                logger.info('Google OAuth failed, falling back to traditional method', { platform });
            }
            // === Strategy 2: Traditional registration ===
            await this.unzoo.navigate(config.registerUrl);
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Generate credentials
            const username = this.generateUsername();
            const password = this.generatePassword();
            const email = gmailStatus.email;
            // Fill email field
            if (config.selectors.emailField) {
                await this.unzoo.type(config.selectors.emailField, email, { clear: true });
            }
            // Fill username if required
            if (config.selectors.usernameField) {
                await this.unzoo.type(config.selectors.usernameField, username, { clear: true });
            }
            // Fill password
            if (config.selectors.passwordField) {
                await this.unzoo.type(config.selectors.passwordField, password, { clear: true });
            }
            // Fill confirm password if exists
            if (config.selectors.confirmPasswordField) {
                await this.unzoo.type(config.selectors.confirmPasswordField, password, { clear: true });
            }
            // Check for CAPTCHA or phone requirement
            if (config.requirements?.captchaExpected || config.requirements?.phoneRequired) {
                logger.info('Manual verification required', { platform });
                await this.unzoo.waitForUser(`Please complete the verification for ${config.name} (CAPTCHA/phone)`, 120000);
            }
            else {
                await this.unzoo.click(config.selectors.submitButton);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            // Check for email verification
            const needsEmailVerification = await this.checkForEmailVerification();
            if (needsEmailVerification) {
                const verificationCode = await this.getVerificationCodeFromGmail();
                if (verificationCode) {
                    await this.enterVerificationCode(verificationCode);
                }
                else {
                    return {
                        success: false,
                        platform,
                        needsManualVerification: true,
                        verificationReason: 'Could not find verification email. Please check Gmail manually.'
                    };
                }
            }
            // Save account
            this.accounts.add(platform, {
                username,
                email,
                password
            });
            logger.info('Registration successful', { platform, username });
            return {
                success: true,
                platform,
                username,
                email,
                needsManualVerification: false
            };
        }
        catch (error) {
            logger.error('Login/Registration failed', { platform, error });
            return {
                success: false,
                platform,
                needsManualVerification: true,
                verificationReason: 'An error occurred',
                error: error.message
            };
        }
    }
    /**
     * Try to login using Google OAuth
     */
    async tryGoogleOAuth(config) {
        try {
            // Navigate to login page (not register - for OAuth)
            const loginUrl = config.loginUrl || config.registerUrl;
            await this.unzoo.navigate(loginUrl);
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Look for Google OAuth button
            const selectors = [
                config.googleOAuth?.buttonSelector,
                'button[data-provider="google"]',
                'a[href*="oauth/google"]',
                'a[href*="auth/google"]',
                'button:has-text("Google")',
                'a:has-text("Continue with Google")',
                'button:has-text("Sign in with Google")',
                '[data-testid="google-login"]',
                '.google-button',
                '.google-signin',
                'button[aria-label*="Google"]'
            ].filter(Boolean);
            for (const selector of selectors) {
                if (!selector)
                    continue;
                const exists = await this.unzoo.exists(selector);
                if (exists) {
                    logger.info('Found Google OAuth button', { selector });
                    await this.unzoo.click(selector);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    // Google OAuth popup/redirect - wait for completion
                    // Check if we're on Google's domain or back on the platform
                    const maxWait = 30000;
                    const startTime = Date.now();
                    while (Date.now() - startTime < maxWait) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        // Check if login was successful (user is logged in)
                        const pageText = await this.unzoo.getText();
                        const text = (pageText.output || '').toLowerCase();
                        // Success indicators
                        if (text.includes('dashboard') ||
                            text.includes('profile') ||
                            text.includes('settings') ||
                            text.includes('logout') ||
                            text.includes('sign out') ||
                            text.includes('my account')) {
                            logger.info('Google OAuth login successful');
                            return { success: true };
                        }
                        // Check for Google account selection page
                        if (text.includes('choose an account') || text.includes('选择帐号')) {
                            // Click on the first account (connected Gmail)
                            const gmailStatus = await this.getGmailStatus();
                            if (gmailStatus.email) {
                                // Try to click the account
                                await this.unzoo.click(`[data-email="${gmailStatus.email}"], div:has-text("${gmailStatus.email}")`);
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            }
                        }
                    }
                    // If we got here, OAuth might have worked but couldn't verify
                    return { success: false };
                }
            }
            logger.debug('No Google OAuth button found');
            return { success: false };
        }
        catch (error) {
            logger.error('Google OAuth attempt failed', { error });
            return { success: false };
        }
    }
    /**
     * Register on multiple platforms
     */
    async registerAll(platforms) {
        const results = [];
        for (const platform of platforms) {
            const result = await this.register(platform);
            results.push(result);
            // Delay between registrations
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        return results;
    }
    /**
     * Generate random username
     */
    generateUsername() {
        const adjectives = ['swift', 'bright', 'cool', 'quick', 'smart', 'bold', 'calm', 'free'];
        const nouns = ['dev', 'coder', 'maker', 'builder', 'tech', 'ninja', 'guru', 'pro'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 9999);
        return `${adj}${noun}${num}`;
    }
    /**
     * Generate secure password
     */
    generatePassword() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        let password = '';
        for (let i = 0; i < 16; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
    /**
     * Check if email verification is needed
     */
    async checkForEmailVerification() {
        // Look for common verification indicators
        const indicators = [
            'verify your email',
            'confirmation email',
            'check your inbox',
            'verification code',
            'sent you an email'
        ];
        const pageText = await this.unzoo.getText();
        const text = (pageText.output || '').toLowerCase();
        return indicators.some(ind => text.includes(ind));
    }
    /**
     * Get verification code from Gmail
     */
    async getVerificationCodeFromGmail() {
        // Open Gmail
        await this.unzoo.navigate('https://mail.google.com');
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Look for recent verification email
        const emailContent = await this.unzoo.getText();
        // Try to find verification code (typically 6 digits)
        const codeMatch = emailContent.output?.match(/\b\d{6}\b/);
        return codeMatch?.[0] || null;
    }
    /**
     * Enter verification code
     */
    async enterVerificationCode(code) {
        // Common code input selectors
        const selectors = [
            'input[name="code"]',
            'input[type="tel"]',
            'input[placeholder*="code"]',
            'input[aria-label*="verification"]'
        ];
        for (const selector of selectors) {
            const exists = await this.unzoo.exists(selector);
            if (exists) {
                await this.unzoo.type(selector, code, { clear: true });
                await this.unzoo.press('Enter');
                return;
            }
        }
    }
    saveGmailState(email) {
        const db = getDatabase();
        const stmt = db.prepare(`
      INSERT OR REPLACE INTO session_state (key, value, updated_at)
      VALUES ('gmail_email', ?, datetime('now'))
    `);
        stmt.run(email);
    }
    loadGmailState() {
        const db = getDatabase();
        const stmt = db.prepare('SELECT value, updated_at FROM session_state WHERE key = ?');
        const row = stmt.get('gmail_email');
        if (row) {
            return { email: row.value, connectedAt: row.updated_at };
        }
        return {};
    }
    clearGmailState() {
        const db = getDatabase();
        const stmt = db.prepare('DELETE FROM session_state WHERE key = ?');
        stmt.run('gmail_email');
    }
}
//# sourceMappingURL=account-registrar.js.map