import OpenAI from 'openai';

import { LLMConfig, LLMResponse } from '../../types/provider';
import { BaseLLMProvider } from '../base/base-provider';

export class OpenAIProvider extends BaseLLMProvider {
  private client!: OpenAI;

  initialize(config: LLMConfig): void {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
    });
  }

  async chat(message: string): Promise<LLMResponse> {
    const response = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: this.config.modelName || 'gpt-3.5-turbo',
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return {
      text: response.choices[0]?.message?.content || '',
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  async complete(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse> {
    const config = this.mergeConfig(options);
    const response = await this.client.completions.create({
      prompt,
      model: config.modelName || 'text-davinci-003',
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    return {
      text: response.choices[0]?.text || '',
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *stream(
    prompt: string,
    options?: Partial<LLMConfig>
  ): AsyncGenerator<string, void, unknown> {
    const config = this.mergeConfig(options);
    const stream = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: config.modelName || 'gpt-3.5-turbo',
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  async embedText(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  }

  protected mergeConfig(options?: Partial<LLMConfig>): LLMConfig {
    return {
      ...this.config,
      ...options,
    };
  }
}
