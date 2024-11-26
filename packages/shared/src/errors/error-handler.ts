import { Logger } from '../logging/logger';
import { AgentForgeError } from './custom-errors';
import { formatErrorForLogging, formatErrorForClient } from './error-formatter';

export interface ErrorHandlerConfig {
  maxRetries?: number;
  retryDelay?: number;
  shouldNotifyExternal?: boolean;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: Required<ErrorHandlerConfig>;

  private constructor(config: ErrorHandlerConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      shouldNotifyExternal: config.shouldNotifyExternal ?? false,
    };
  }

  public static getInstance(config?: ErrorHandlerConfig): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  public async handleError(
    error: Error | AgentForgeError,
    context?: Record<string, unknown>
  ): Promise<void> {
    const formattedError = formatErrorForLogging(error);
    
    // Log the error
    await Logger.error(formattedError, context);

    // Notify external monitoring if configured
    if (this.config.shouldNotifyExternal) {
      await this.notifyExternalMonitoring(error, context);
    }
  }

  public async withRetry<T>(
    operation: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        await Logger.warn(
          `Retry attempt ${attempt}/${this.config.maxRetries} failed`,
          { ...context, error: formatErrorForClient(lastError) }
        );

        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  private async notifyExternalMonitoring(
    error: Error | AgentForgeError,
    context?: Record<string, unknown>
  ): Promise<void> {
    // Implement external monitoring integration (e.g., Sentry, Datadog)
    // This is a placeholder for future implementation
    console.log('External monitoring notification:', {
      error: formatErrorForClient(error),
      context,
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
