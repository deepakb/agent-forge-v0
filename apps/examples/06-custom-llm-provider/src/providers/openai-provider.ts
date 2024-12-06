import { LLMRequest, LLMResponse, StreamingCallback } from '@agent-forge/llm-provider';
import { Logger } from '@agent-forge/shared';
import { BaseLLMProvider } from './base-provider';
import OpenAI from 'openai';

export class OpenAIProvider extends BaseLLMProvider {
  private client: OpenAI;
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

    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || 'gpt-4';
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    return this.withRetry(async () => {
      return this.withRateLimit(async () => {
        try {
          const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              { role: 'system', content: request.systemPrompt || '' },
              { role: 'user', content: request.prompt }
            ],
            temperature: request.temperature || 0.7,
            max_tokens: request.maxTokens,
          });

          return {
            text: completion.choices[0]?.message?.content || '',
            usage: {
              promptTokens: completion.usage?.prompt_tokens || 0,
              completionTokens: completion.usage?.completion_tokens || 0,
              totalTokens: completion.usage?.total_tokens || 0,
            }
          };
        } catch (error) {
          Logger.error('OpenAI completion failed', { error });
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
          const stream = await this.client.chat.completions.create({
            model: this.model,
            messages: [
              { role: 'system', content: request.systemPrompt || '' },
              { role: 'user', content: request.prompt }
            ],
            temperature: request.temperature || 0.7,
            max_tokens: request.maxTokens,
            stream: true,
          });

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              await callback(content);
            }
          }
        } catch (error) {
          Logger.error('OpenAI streaming failed', { error });
          throw error;
        }
      });
    });
  }
}
