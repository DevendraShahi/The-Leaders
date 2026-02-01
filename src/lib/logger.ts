/**
 * Logging utility for production-safe logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    private log(level: LogLevel, message: string, context?: LogContext) {
        if (this.isDevelopment) {
            const timestamp = new Date().toISOString();
            const contextStr = context ? `\n${JSON.stringify(context, null, 2)}` : '';

            switch (level) {
                case 'error':
                    console.error(`[${timestamp}] ERROR: ${message}${contextStr}`);
                    break;
                case 'warn':
                    console.warn(`[${timestamp}] WARN: ${message}${contextStr}`);
                    break;
                case 'info':
                    console.info(`[${timestamp}] INFO: ${message}${contextStr}`);
                    break;
                case 'debug':
                    console.debug(`[${timestamp}] DEBUG: ${message}${contextStr}`);
                    break;
            }
        }
        // In production, you could send to a logging service like Sentry, LogRocket, etc.
        // Example: if (level === 'error') { sentryCapture(message, context); }
    }

    error(message: string, context?: LogContext) {
        this.log('error', message, context);
    }

    warn(message: string, context?: LogContext) {
        this.log('warn', message, context);
    }

    info(message: string, context?: LogContext) {
        this.log('info', message, context);
    }

    debug(message: string, context?: LogContext) {
        this.log('debug', message, context);
    }
}

export const logger = new Logger();
