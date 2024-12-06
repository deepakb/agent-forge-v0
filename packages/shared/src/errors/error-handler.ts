import { injectable, inject } from 'inversify';
import { ILogger, IErrorHandler } from '../container/interfaces';
import { SHARED_TYPES } from '../container/types';
import { AgentForgeError } from './custom-errors';
import { formatErrorForLogging, formatErrorForClient } from './error-formatter';

export interface ErrorHandlerConfig {
  maxRetries?: number;
  retryDelay?: number;
  shouldNotifyExternal?: boolean;
}

@injectable()
export class ErrorHandler implements IErrorHandler {
  private config: Required<ErrorHandlerConfig>;

  constructor(
    @inject(SHARED_TYPES.Logger) private logger: ILogger,
    config: ErrorHandlerConfig = {}
  ) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      shouldNotifyExternal: config.shouldNotifyExternal ?? false,
    };
  }

  public handleError(error: Error | string): void {
    const errorObj = error instanceof Error ? error : new Error(error);
    
    if (errorObj instanceof AgentForgeError) {
      this.handleAgentForgeError(errorObj);
    } else {
      this.handleGenericError(errorObj);
    }

    if (this.config.shouldNotifyExternal) {
      this.notifyExternalMonitoring(errorObj);
    }
  }

  private handleAgentForgeError(error: AgentForgeError): void {
    const metadata = {
      code: error.code,
      isOperational: error.isOperational,
      isRetryable: error.isRetryable,
      context: error.context,
    };

    this.logger.error(error.message, error, metadata);
  }

  private handleGenericError(error: Error): void {
    this.logger.error(error.message, error);
  }

  public async wrap<T>(fn: () => Promise<T>, retryCount = 3): Promise<T> {
    try {
      return await this.withRetry(fn, retryCount);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.handleError(err);
      throw err;
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    currentRetry: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (currentRetry < maxRetries && this.isRetryableError(err)) {
        const delay = Math.min(1000 * Math.pow(2, currentRetry), 10000); // Exponential backoff with max 10s
        await new Promise(resolve => setTimeout(resolve, delay));
        
        this.logger.warn(`Retrying operation (${currentRetry + 1}/${maxRetries})`, {
          error: err.message,
          retryCount: currentRetry + 1,
          maxRetries,
        });
        
        return this.withRetry(operation, maxRetries, currentRetry + 1);
      }
      
      throw err;
    }
  }

  public isOperationalError(error: Error): boolean {
    if (error instanceof AgentForgeError) {
      return error.isOperational;
    }
    return false;
  }

  public isRetryableError(error: Error): boolean {
    if (error instanceof AgentForgeError) {
      return error.isRetryable;
    }
    return false;
  }

  public getErrorCode(error: Error): string | undefined {
    if (error instanceof AgentForgeError) {
      return error.code;
    }
    return undefined;
  }

  public getErrorContext(error: Error): Record<string, unknown> | undefined {
    if (error instanceof AgentForgeError) {
      return error.context;
    }
    return undefined;
  }

  private async notifyExternalMonitoring(error: Error, context?: Record<string, unknown>): Promise<void> {
    // This is a placeholder for external error monitoring integration
    // In a real implementation, this would send the error to a service like Sentry, DataDog, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: context || {},
      timestamp: new Date().toISOString(),
    };

    // Log that we're sending to external monitoring
    this.logger.info('Sending error to external monitoring', errorData);
  }
}
