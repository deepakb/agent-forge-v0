import { Logger } from '@agent-forge/shared';
import { BaseProviderConfig } from '../../config/validation';
import { LLMProviderError, LLMRateLimitError, LLMTimeoutError } from '../../errors/provider-errors';
import { RateLimiter } from '../../utils/rate-limiting';
import { TokenCounter } from '../../utils/token-counter';

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: {
    model?: string;
    provider?: string;
    stopReason?: string | null;
    stopSequence?: string | null;
    [key: string]: any;
  };
}

interface RetryOptions {
  operation: string;
  maxRetries?: number;
  retryDelay?: number;
}

export abstract class BaseLLMProvider {
  protected config!: BaseProviderConfig;
  protected rateLimiter: RateLimiter;
  protected tokenCounter: TokenCounter;
  private readonly loggerContext = { logger: 'LLMProvider' };

  constructor() {
    this.rateLimiter = new RateLimiter();
    this.tokenCounter = new TokenCounter();
  }

  async initialize(config: BaseProviderConfig): Promise<void> {
    this.config = config;
    this.rateLimiter.configure(config);
    this.tokenCounter.configure(config);
  }

  abstract complete(prompt: string, options?: Partial<BaseProviderConfig>): Promise<LLMResponse>;
  abstract stream(prompt: string, options?: Partial<BaseProviderConfig>): AsyncGenerator<string, void, unknown>;
  abstract embedText(text: string): Promise<number[]>;

  protected async logOperation<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      await Logger.info(`${operation} completed successfully`, {
        ...this.loggerContext,
        duration: Date.now() - startTime,
      });
      return result;
    } catch (error) {
      await Logger.error(`${operation} failed`, {
        ...this.loggerContext,
        error,
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  protected async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions
  ): Promise<T> {
    const { operation, maxRetries = 3, retryDelay = 1000 } = options;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (this.shouldRetry(lastError) && attempt < maxRetries) {
          await Logger.warn(`${operation} failed, retrying (${attempt}/${maxRetries})`, {
            ...this.loggerContext,
            error: lastError,
          });
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          continue;
        }

        throw this.mapError(lastError);
      }
    }

    throw lastError;
  }

  private shouldRetry(error: Error): boolean {
    const retryableErrors = [
      'timeout',
      'rate limit',
      'too many requests',
      '429',
      '500',
      '502',
      '503',
      '504',
    ];

    const errorString = error.message.toLowerCase();
    return retryableErrors.some(e => errorString.includes(e));
  }

  private mapError(error: Error): Error {
    const errorString = error.message.toLowerCase();
    
    if (errorString.includes('rate limit') || errorString.includes('429')) {
      return new LLMRateLimitError('Rate limit exceeded', { cause: error });
    }
    
    if (errorString.includes('timeout')) {
      return new LLMTimeoutError('Request timed out', { cause: error });
    }

    return new LLMProviderError('Operation failed', { cause: error });
  }

  protected mergeConfig(options?: Partial<BaseProviderConfig>): BaseProviderConfig {
    return {
      ...this.config,
      ...options,
    };
  }
}
