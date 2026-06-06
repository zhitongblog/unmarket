/**
 * Logging system using pino
 */
import pino from 'pino';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const LOG_DIR = join(homedir(), '.unmarket', 'logs');

// Ensure log directory exists
if (!existsSync(LOG_DIR)) {
  mkdirSync(LOG_DIR, { recursive: true });
}

const logFile = join(LOG_DIR, `unmarket-${new Date().toISOString().split('T')[0]}.log`);

// Determine log level from env or args
const isDebug = process.argv.includes('--debug') || process.env.DEBUG === '1';
const consoleLevel = process.env.LOG_LEVEL || (isDebug ? 'debug' : 'warn');

// Create base pino logger
const pinoLogger = pino({
  level: 'debug', // Allow all levels, filter per transport
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'HH:MM:ss'
        },
        level: consoleLevel
      },
      {
        target: 'pino/file',
        options: { destination: logFile },
        level: 'debug'
      }
    ]
  }
});

// Wrapper logger with convenient API
export interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
}

function createLoggerWrapper(baseLogger: pino.Logger): Logger {
  return {
    debug(message: string, data?: Record<string, unknown>) {
      if (data) {
        baseLogger.debug(data, message);
      } else {
        baseLogger.debug(message);
      }
    },
    info(message: string, data?: Record<string, unknown>) {
      if (data) {
        baseLogger.info(data, message);
      } else {
        baseLogger.info(message);
      }
    },
    warn(message: string, data?: Record<string, unknown>) {
      if (data) {
        baseLogger.warn(data, message);
      } else {
        baseLogger.warn(message);
      }
    },
    error(message: string, data?: Record<string, unknown>) {
      if (data) {
        baseLogger.error(data, message);
      } else {
        baseLogger.error(message);
      }
    }
  };
}

// Create wrapped logger
export const logger = createLoggerWrapper(pinoLogger);

// Child loggers for different modules
export const createLogger = (module: string): Logger => {
  return createLoggerWrapper(pinoLogger.child({ module }));
};

// Specific module loggers
export const cliLogger = createLogger('cli');
export const crawlerLogger = createLogger('crawler');
export const publisherLogger = createLogger('publisher');
export const schedulerLogger = createLogger('scheduler');
export const browserLogger = createLogger('browser');
export const aiLogger = createLogger('ai');
export const dbLogger = createLogger('database');
