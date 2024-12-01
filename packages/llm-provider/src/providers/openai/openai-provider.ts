import OpenAI from 'openai';
import { Logger } from '@agent-forge/shared';
import { BaseLLMProvider, LLMResponse } from '../base/base-provider';
import { OpenAIConfig } from '../../config/validation';
import { DEFAULT_OPENAI_CONFIG } from '../../config/defaults';
import { LLMAuthenticationError, LLMProviderError, LLMValidationError } from '../../errors/provider-errors';

export class OpenAIProvider extends BaseLLMProvider {
  private client!: OpenAI;

  async initialize(config: OpenAIConfig): Promise<void> {
    try {
      await super.initialize(config);

      this.client = new OpenAI({
        apiKey: config.apiKey,
        organization: config.organizationId,
      });

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('auth') || error.message.includes('key')) {
          throw new LLMAuthenticationError('Authentication failed with OpenAI API', { originalError: error });
        }
        throw new LLMProviderError('Failed to initialize OpenAI client', { originalError: error });
      }
      throw error;
    }
  }

  async complete(prompt: string, options?: Partial<OpenAIConfig>): Promise<LLMResponse> {
    await this.tokenCounter.validateTokenCount(prompt);

    return this.logOperation('completion', async () => {
      await this.rateLimiter.acquire();
      try {
        const config = this.mergeConfig(options);
        const response = await this.withRetry(
          () =>
            this.client.chat.completions.create({
              model: config.modelName,
              messages: [{ role: 'user', content: prompt }],
              temperature: config.temperature,
              max_tokens: config.maxTokens,
            }),
          { operation: 'completion' }
        );

        const content = response.choices[0]?.message?.content || '';
        return {
          text: content,
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
          metadata: {
            model: response.model,
            provider: 'openai',
            stopReason: response.choices[0]?.finish_reason || null,
          },
        };
      } finally {
        this.rateLimiter.release();
      }
    });
  }

  async *stream(
    prompt: string,
    options?: Partial<OpenAIConfig>
  ): AsyncGenerator<string, void, unknown> {
    await this.tokenCounter.validateTokenCount(prompt);

    await this.rateLimiter.acquire();
    try {
      const config = this.mergeConfig(options);
      const stream = await this.withRetry(
        () =>
          this.client.chat.completions.create({
            model: config.modelName,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: true,
          }),
        { operation: 'stream' }
      );

      let totalTokens = 0;
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
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
    } finally {
      this.rateLimiter.release();
    }
  }

  async embedText(text: string): Promise<number[]> {
    return this.logOperation('embedding', async () => {
      await this.rateLimiter.acquire();
      try {
        const response = await this.withRetry(
          () =>
            this.client.embeddings.create({
              model: 'text-embedding-ada-002',
              input: text,
            }),
          { operation: 'embedding' }
        );

        return response.data[0].embedding;
      } finally {
        this.rateLimiter.release();
      }
    });
  }

  protected mergeConfig(options?: Partial<OpenAIConfig>): OpenAIConfig {
    return {
      ...DEFAULT_OPENAI_CONFIG,
      ...this.config,
      ...options,
    } as OpenAIConfig;
  }
}
