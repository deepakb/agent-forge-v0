import { Logger } from '@agent-forge/shared';
import { LLMRateLimitError } from '../errors/provider-errors';
import { BaseProviderConfig } from '../config/validation';

export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private maxTokens: number;
  private tokensPerMinute: number;
  private maxConcurrent: number;
  private maxWaitTimeMs: number;
  private currentRequests: number;

  constructor() {
    this.tokens = 0;
    this.lastRefill = Date.now();
    this.maxTokens = 0;
    this.tokensPerMinute = 0;
    this.maxConcurrent = 0;
    this.maxWaitTimeMs = 0;
    this.currentRequests = 0;
  }

  configure(config: BaseProviderConfig) {
    this.maxTokens = config.maxTokens || 90000;
    this.tokensPerMinute = config.tokensPerMinute || 90000;
    this.maxConcurrent = config.maxConcurrent || 5;
    this.maxWaitTimeMs = config.timeout || 30000;
    this.tokens = this.maxTokens;
  }

  async acquire(): Promise<void> {
    if (this.currentRequests >= this.maxConcurrent) {
      throw new LLMRateLimitError('Too many concurrent requests', {
        current: this.currentRequests,
        max: this.maxConcurrent,
      });
    }

    const now = Date.now();
    const timeSinceLastRefill = now - this.lastRefill;
    const tokensToAdd = Math.floor((timeSinceLastRefill / 60000) * this.tokensPerMinute);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }

    if (this.tokens <= 0) {
      const waitTime = Math.ceil((60000 * (1 - this.tokens / this.tokensPerMinute)));
      if (waitTime > this.maxWaitTimeMs) {
        throw new LLMRateLimitError('Rate limit exceeded', {
          waitTime,
          maxWaitTime: this.maxWaitTimeMs,
        });
      }
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.acquire();
    }

    this.tokens--;
    this.currentRequests++;
  }

  release(): void {
    this.currentRequests = Math.max(0, this.currentRequests - 1);
  }
}
