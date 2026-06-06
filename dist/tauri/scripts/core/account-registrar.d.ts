export interface GmailStatus {
    connected: boolean;
    email?: string;
    connectedAt?: string;
}
export interface RegistrationResult {
    success: boolean;
    platform: string;
    username?: string;
    email?: string;
    needsManualVerification: boolean;
    verificationReason?: string;
    error?: string;
}
export interface PlatformRegistrationConfig {
    name: string;
    registerUrl: string;
    loginUrl?: string;
    googleOAuth?: {
        supported: boolean;
        buttonSelector?: string;
    };
    selectors: {
        emailField: string;
        usernameField?: string;
        passwordField: string;
        confirmPasswordField?: string;
        submitButton: string;
        successIndicator?: string;
    };
    requirements?: {
        usernameRequired?: boolean;
        phoneRequired?: boolean;
        captchaExpected?: boolean;
    };
}
export declare class AccountRegistrar {
    private unzoo;
    private accounts;
    /**
     * Setup Gmail for receiving verification emails
     */
    setupGmail(): Promise<void>;
    /**
     * Get Gmail status
     */
    getGmailStatus(): Promise<GmailStatus>;
    /**
     * Disconnect Gmail
     */
    disconnectGmail(): Promise<void>;
    /**
     * Login or register account on a platform
     * Priority: Google OAuth > Traditional Login > Registration
     */
    register(platform: string): Promise<RegistrationResult>;
    /**
     * Try to login using Google OAuth
     */
    private tryGoogleOAuth;
    /**
     * Register on multiple platforms
     */
    registerAll(platforms: string[]): Promise<RegistrationResult[]>;
    /**
     * Generate random username
     */
    private generateUsername;
    /**
     * Generate secure password
     */
    private generatePassword;
    /**
     * Check if email verification is needed
     */
    private checkForEmailVerification;
    /**
     * Get verification code from Gmail
     */
    private getVerificationCodeFromGmail;
    /**
     * Enter verification code
     */
    private enterVerificationCode;
    private saveGmailState;
    private loadGmailState;
    private clearGmailState;
}
//# sourceMappingURL=account-registrar.d.ts.map