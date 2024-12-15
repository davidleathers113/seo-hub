import winston from 'winston';
import type { DailyRotateFileTransportOptions } from 'winston-daily-rotate-file';
import * as Transport from 'winston-transport';
// Need to use require for winston-daily-rotate-file as it doesn't support ES modules
const DailyRotateFile = require('winston-daily-rotate-file');
import path from 'path';

interface LoggerOptions {
    level?: string;
    prefix?: string;
    filename?: string;
}

interface Logger {
    info(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}

class WinstonLogger implements Logger {
    private logger: winston.Logger;
    private prefix: string;

    constructor(options: LoggerOptions = {}) {
        this.prefix = options.prefix || '';
        const env = process.env.NODE_ENV || 'development';
        const defaultLevel = env === 'production' ? 'info' : 'debug';
        
        // Common format for all transports
        const commonFormat = winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }), // Include stack traces
            winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
                const prefix = this.prefix ? `[${this.prefix}] ` : '';
                const stackInfo = stack ? `\n${stack}` : '';
                const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
                return `[${timestamp}] [${level.toUpperCase()}] ${prefix}${message}${stackInfo}${metaStr}`;
            })
        );

        const transports: Transport[] = [
            // Console transport with colors
            new winston.transports.Console({
                level: process.env.LOG_LEVEL || defaultLevel,
                format: winston.format.combine(
                    winston.format.colorize({ all: true }),
                    commonFormat
                )
            })
        ];

        // Add file transports in production
        if (env === 'production') {
            const logsDir = path.join(process.cwd(), 'logs');
            
            // Rotating file transport for all logs
            const fileTransportOptions: DailyRotateFileTransportOptions = {
                filename: path.join(logsDir, 'application-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d',
                format: winston.format.combine(
                    winston.format.json(),
                    commonFormat
                )
            };

            // Separate rotating file transport for errors
            const errorTransportOptions: DailyRotateFileTransportOptions = {
                filename: path.join(logsDir, 'error-%DATE%.log'),
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '14d',
                level: 'error',
                format: winston.format.combine(
                    winston.format.json(),
                    commonFormat
                )
            };

            transports.push(
                new DailyRotateFile(fileTransportOptions),
                new DailyRotateFile(errorTransportOptions)
            );
        }

        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || defaultLevel,
            transports,
            // Avoid exiting on uncaught errors
            exitOnError: false
        });
    }

    private formatArgs(args: any[]): object {
        if (args.length === 0) return {};
        
        // Handle Error objects specially
        if (args.length === 1 && args[0] instanceof Error) {
            const error = args[0];
            return {
                error: {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                    ...(error as any) // Include any custom properties
                }
            };
        }
        
        // Handle single object argument
        if (args.length === 1 && typeof args[0] === 'object') {
            return args[0];
        }

        // Handle multiple arguments
        return { details: args };
    }

    info(message: string, ...args: any[]): void {
        this.logger.info(message, this.formatArgs(args));
    }

    error(message: string, ...args: any[]): void {
        this.logger.error(message, this.formatArgs(args));
    }

    warn(message: string, ...args: any[]): void {
        this.logger.warn(message, this.formatArgs(args));
    }

    debug(message: string, ...args: any[]): void {
        this.logger.debug(message, this.formatArgs(args));
    }
}

// Singleton instance for the default logger
let defaultLogger: Logger | null = null;

export function logger(prefix?: string): Logger {
    if (!prefix && defaultLogger) {
        return defaultLogger;
    }

    const newLogger = new WinstonLogger({
        prefix,
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
    });

    if (!prefix) {
        defaultLogger = newLogger;
    }

    return newLogger;
}

// Export a default logger instance
export const log = logger();

// Export types for consumers
export type { Logger, LoggerOptions };
