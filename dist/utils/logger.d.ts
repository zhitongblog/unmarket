export interface Logger {
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, data?: Record<string, unknown>): void;
}
export declare const logger: Logger;
export declare const createLogger: (module: string) => Logger;
export declare const cliLogger: Logger;
export declare const crawlerLogger: Logger;
export declare const publisherLogger: Logger;
export declare const schedulerLogger: Logger;
export declare const browserLogger: Logger;
export declare const aiLogger: Logger;
export declare const dbLogger: Logger;
//# sourceMappingURL=logger.d.ts.map