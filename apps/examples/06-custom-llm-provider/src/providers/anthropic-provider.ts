import { LLMRequest, LLMResponse, StreamingCallback } from '@agent-forge/llm-provider';
import { Logger } from '@agent-forge/shared';
import { BaseLLMProvider } from './base-provider';
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicProvider extends BaseLLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(config: {
    apiKey: string;
    model?: string;
    requestsPerMinute?: number;
    maxRetries?: number;
    retryDelay?: number;
  }) {
    super({
      requestsPerMinute: config.requestsPerMinute || 60,
      maxRetries: config.maxRetries,
      retryDelay: config.retryDelay,
    });

    this.client = new Anthropic({ apiKey: config.apiKey });
    this.model = config.model || 'claude-2';
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    return this.withRetry(async () => {
      return this.withRateLimit(async () => {
        try {
          const message = await this.client.messages.create({
            model: this.model,
            system: request.systemPrompt,
            messages: [
              { role: 'user', content: request.prompt }
            ],
            temperature: request.temperature || 0.7,
            max_tokens: request.maxTokens,
          });

          return {
            text: message.content[0].text,
            usage: {
              promptTokens: 0, // Anthropic doesn't provide token usage
              completionTokens: 0,
              totalTokens: 0,
            }
          };
        } catch (error) {
          Logger.error('Anthropic completion failed', { error });
          throw error;
        }
      });
    });
  }

  async completeStream(
    request: LLMRequest,
    callback: StreamingCallback
  ): Promise<void> {
    await this.withRetry(async () => {
      return this.withRateLimit(async () => {
        try {
          const stream = await this.client.messages.create({
            model: this.model,
            system: request.systemPrompt,
            messages: [
              { role: 'user', content: request.prompt }
            ],
            temperature: request.temperature || 0.7,
            max_tokens: request.maxTokens,
            stream: true,
          });

          for await (const chunk of stream) {
            const content = chunk.delta?.text || '';
            if (content) {
              await callback(content);
            }
          }
        } catch (error) {
          Logger.error('Anthropic streaming failed', { error });
          throw error;
        }
      });
    });
  }
}
