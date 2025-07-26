export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  userId?: string;
  userEmail?: string;
  action?: string;
  sessionId?: string;
  lessonId?: string;
  bookingId?: string;
  availabilityId?: string;
  targetUserId?: string;
  requireAdmin?: boolean;
  paymentIntent?: string;
  errorCode?: string;
  timestamp: string;
  environment: string;
  userAgent?: string;
  ip?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: Error;
  data?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private isTest = process.env.NODE_ENV === 'test';

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const contextStr = Object.entries(entry.context)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join(' | ');

    let logMessage = `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;

    if (contextStr) {
      logMessage += ` | Context: ${contextStr}`;
    }

    if (entry.error) {
      logMessage += ` | Error: ${entry.error.message}`;
      if (entry.error.stack && this.isDevelopment) {
        logMessage += ` | Stack: ${entry.error.stack}`;
      }
    }

    if (entry.data && Object.keys(entry.data).length > 0) {
      logMessage += ` | Data: ${JSON.stringify(entry.data)}`;
    }

    return logMessage;
  }

  private log(
    level: LogLevel,
    message: string,
    context: Partial<LogContext> = {},
    error?: Error,
    data?: Record<string, unknown>
  ) {
    const fullContext: LogContext = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      ...context
    };

    const entry: LogEntry = {
      level,
      message,
      context: fullContext,
      error,
      data
    };

    const formattedMessage = this.formatLogEntry(entry);

    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        if (this.isDevelopment || this.isTest) {
          console.debug(formattedMessage);
        }
        break;
    }

    // In production, you might want to send logs to an external service
    if (this.isProduction && level === 'error' && !this.isTest) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(_entry: LogEntry) {
    // TODO: Implement external logging service (e.g., Sentry, LogRocket, etc.)
    // This is a placeholder for production error reporting
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Example: Sentry.captureException(entry.error, { extra: entry });
    }
  }

  // Action failure logging
  actionFailure(
    action: string,
    error: Error,
    context: Partial<LogContext> = {},
    data?: Record<string, unknown>
  ) {
    this.log(
      'error',
      `Action failed: ${action}`,
      {
        action,
        errorCode: 'ACTION_FAILURE',
        ...context
      },
      error,
      data
    );
  }

  // Data fetch failure logging
  dataFetchFailure(
    operation: string,
    error: Error,
    context: Partial<LogContext> = {},
    data?: Record<string, unknown>
  ) {
    this.log(
      'error',
      `Data fetch failed: ${operation}`,
      {
        action: operation,
        errorCode: 'DATA_FETCH_FAILURE',
        ...context
      },
      error,
      data
    );
  }

  // Authentication failure logging
  authFailure(
    operation: string,
    error: Error,
    context: Partial<LogContext> = {},
    data?: Record<string, unknown>
  ) {
    this.log(
      'error',
      `Authentication failed: ${operation}`,
      {
        action: operation,
        errorCode: 'AUTH_FAILURE',
        ...context
      },
      error,
      data
    );
  }

  // Payment failure logging
  paymentFailure(
    operation: string,
    error: Error,
    context: Partial<LogContext> = {},
    data?: Record<string, unknown>
  ) {
    this.log(
      'error',
      `Payment failed: ${operation}`,
      {
        action: operation,
        errorCode: 'PAYMENT_FAILURE',
        ...context
      },
      error,
      data
    );
  }

  // General error logging
  error(
    message: string,
    error?: Error,
    context: Partial<LogContext> = {},
    data?: Record<string, unknown>
  ) {
    this.log('error', message, context, error, data);
  }

  // Warning logging
  warn(message: string, context: Partial<LogContext> = {}, data?: Record<string, unknown>) {
    this.log('warn', message, context, undefined, data);
  }

  // Info logging
  info(message: string, context: Partial<LogContext> = {}, data?: Record<string, unknown>) {
    this.log('info', message, context, undefined, data);
  }

  // Debug logging
  debug(message: string, context: Partial<LogContext> = {}, data?: Record<string, unknown>) {
    this.log('debug', message, context, undefined, data);
  }
}

export const logger = new Logger();
