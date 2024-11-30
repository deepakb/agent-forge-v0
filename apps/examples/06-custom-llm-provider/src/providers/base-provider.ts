import { LLMProvider, LLMResponse, LLMRequest, StreamingCallback } from '@agent-forge/llm-provider';
import { Logger } from '@agent-forge/shared';

export abstract class BaseLLMProvider implements LLMProvider {
  protected rateLimiter: RateLimiter;
  protected maxRetries: number;
  protected retryDelay: number;

  constructor(config: {
    requestsPerMinute: number;
    maxRetries?: number;
    retryDelay?: number;
  }) {
    this.rateLimiter = new RateLimiter(config.requestsPerMinute);
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
  }

  abstract complete(request: LLMRequest): Promise<LLMResponse>;
  abstract completeStream(request: LLMRequest, callback: StreamingCallback): Promise<void>;

  protected async withRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    await this.rateLimiter.waitForToken();
    return fn();
  }

  protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        Logger.warn('LLM request failed, retrying', { 
          error, 
          attempt, 
          maxRetries: this.maxRetries 
        });
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.retryDelay * attempt)
          );
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }
}

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly requestsPerMinute: number;

  constructor(requestsPerMinute: number) {
    this.requestsPerMinute = requestsPerMinute;
    this.tokens = requestsPerMinute;
    this.lastRefill = Date.now();
  }

  private refillTokens(): void {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(
      (timePassed * this.requestsPerMinute) / (60 * 1000)
    );

    if (tokensToAdd > 0) {
      this.tokens = Math.min(
        this.requestsPerMinute,
        this.tokens + tokensToAdd
      );
      this.lastRefill = now;
    }
  }

  async waitForToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens > 0) {
      this.tokens--;
      return;
    }

    const waitTime = Math.ceil(
      (60 * 1000) / this.requestsPerMinute
    );

    await new Promise(resolve => setTimeout(resolve, waitTime));
    return this.waitForToken();
  }
}
