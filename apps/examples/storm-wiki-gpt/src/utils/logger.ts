import { Logger } from '@agent-forge/shared';

export interface LogContext {
  agentId?: string;
  agentType?: string;
  operation?: string;
  component?: string;
  messageType?: string;
  duration?: number;
  status?: 'success' | 'error' | 'warning' | 'info';
  query?: string;
  nodeEnv?: string;
  missingVars?: string[];
  resultCount?: number;
  articleLength?: number;
  sourceCount?: number;
  summaryLength?: number;
  error?: any;
  [key: string]: any; // Allow additional properties
}

export class LoggerService {
  private static instance: LoggerService;
  
  private constructor() {
    Logger.initialize();
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private formatMessage(message: string, context: LogContext): string {
    return `[${context.component || 'System'}] ${message}`;
  }

  private formatContext(context: LogContext): Record<string, any> {
    const timestamp = new Date().toISOString();
    return {
      ...context,
      timestamp,
    };
  }

  public info(message: string, context: LogContext): void {
    Logger.info(
      this.formatMessage(message, context),
      this.formatContext(context)
    );
  }

  public error(message: string, context: LogContext & { error?: any }): void {
    const errorDetails = context.error instanceof Error ? {
      name: context.error.name,
      message: context.error.message,
      stack: context.error.stack,
    } : context.error;

    Logger.error(
      this.formatMessage(message, context),
      this.formatContext({
        ...context,
        error: errorDetails,
        status: 'error',
      })
    );
  }

  public warn(message: string, context: LogContext): void {
    Logger.warn(
      this.formatMessage(message, context),
      this.formatContext({ ...context, status: 'warning' })
    );
  }

  public debug(message: string, context: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      Logger.debug(
        this.formatMessage(message, context),
        this.formatContext(context)
      );
    }
  }

  public trace(operation: string, context: LogContext, durationMs?: number): void {
    Logger.info(
      this.formatMessage(`Operation completed: ${operation}`, context),
      this.formatContext({
        ...context,
        operation,
        duration: durationMs,
      })
    );
  }
}
