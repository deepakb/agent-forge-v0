import Anthropic from '@anthropic-ai/sdk';
import { Logger } from '@agent-forge/shared';
import { BaseLLMProvider, LLMResponse } from '../base/base-provider';
import { AnthropicConfig } from '../../config/validation';
import { DEFAULT_ANTHROPIC_CONFIG } from '../../config/defaults';
import { LLMAuthenticationError, LLMProviderError, LLMValidationError } from '../../errors/provider-errors';

export class AnthropicProvider extends BaseLLMProvider {
  private client!: Anthropic;

  async initialize(config: AnthropicConfig): Promise<void> {
    try {
      await super.initialize(config);

      this.client = new Anthropic({
        apiKey: config.apiKey,
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('auth') || error.message.includes('key')) {
          throw new LLMAuthenticationError('Authentication failed with Anthropic API', { originalError: error });
        }
        throw new LLMProviderError('Failed to initialize Anthropic client', { originalError: error });
      }
      throw error;
    }
  }

  async complete(prompt: string, options?: Partial<AnthropicConfig>): Promise<LLMResponse> {
    await this.tokenCounter.validateTokenCount(prompt);

    return this.logOperation('completion', async () => {
      await this.rateLimiter.acquire();
      try {
        const config = this.mergeConfig(options);
        const response = await this.withRetry(
          () =>
            this.client.messages.create({
              model: config.modelName,
              max_tokens: config.maxTokens,
              temperature: config.temperature,
              messages: [{ role: 'user', content: prompt }],
            }),
          { operation: 'completion' }
        );

        const content = response.content[0]?.text || '';
        return {
          text: content,
          usage: {
            promptTokens: 0, // Anthropic doesn't provide token counts yet
            completionTokens: 0,
            totalTokens: 0,
          },
          metadata: {
            model: response.model,
            provider: 'anthropic',
            stopReason: response.stop_reason || null,
            stopSequence: response.stop_sequence || null,
          },
        };
      } finally {
        this.rateLimiter.release();
      }
    });
  }

  async *stream(
    prompt: string,
    options?: Partial<AnthropicConfig>
  ): AsyncGenerator<string, void, unknown> {
    await this.tokenCounter.validateTokenCount(prompt);

    await this.rateLimiter.acquire();
    try {
      const config = this.mergeConfig(options);
      const stream = await this.withRetry(
        () =>
          this.client.messages.create({
            model: config.modelName,
            max_tokens: config.maxTokens,
            temperature: config.temperature,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
          }),
        { operation: 'stream' }
      );

      let totalTokens = 0;
      for await (const chunk of stream) {
        if ('content' in chunk && Array.isArray(chunk.content) && chunk.content.length > 0) {
          const content = chunk.content[0]?.text || '';
          if (content) {
            totalTokens += await this.tokenCounter.countTokens(content);
            if (totalTokens > config.maxTokens) {
              throw new LLMValidationError('Stream exceeded maximum token limit', {
                totalTokens,
                maxTokens: config.maxTokens,
              });
            }
            yield content;
          }
        }
      }
    } finally {
      this.rateLimiter.release();
    }
  }

  // Note: Anthropic doesn't currently support embeddings through their API
  async embedText(text: string): Promise<number[]> {
    throw new LLMProviderError('Embeddings are not supported by Anthropic provider');
  }

  protected mergeConfig(options?: Partial<AnthropicConfig>): AnthropicConfig {
    return {
      ...DEFAULT_ANTHROPIC_CONFIG,
      ...this.config,
      ...options,
    } as AnthropicConfig;
  }
}
