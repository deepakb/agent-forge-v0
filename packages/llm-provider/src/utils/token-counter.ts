import { encode } from 'gpt-3-encoder';
import { BaseProviderConfig } from '../config/validation';
import { LLMValidationError } from '../errors/provider-errors';

export class TokenCounter {
  private maxTokens: number = 0;

  constructor() {
    this.maxTokens = 0;
  }

  configure(config: BaseProviderConfig) {
    this.maxTokens = config.maxTokens || 4096;
  }

  async countTokens(text: string): Promise<number> {
    return encode(text).length;
  }

  async validateTokenCount(text: string): Promise<void> {
    const tokenCount = await this.countTokens(text);
    if (tokenCount > this.maxTokens) {
      throw new LLMValidationError('Token count exceeds maximum allowed', {
        tokenCount,
        maxTokens: this.maxTokens,
      });
    }
  }
}
