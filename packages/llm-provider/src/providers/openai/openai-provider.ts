import OpenAI from 'openai';
import { BaseLLMProvider } from '../base/base-provider';
import { LLMConfig, LLMResponse } from '../../types/provider';

export class OpenAIProvider extends BaseLLMProvider {
  private client!: OpenAI;

  async initialize(config: LLMConfig): Promise<void> {
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
    });
  }

  async complete(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse> {
    const config = this.mergeConfig(options);
    const response = await this.client.chat.completions.create({
      model: config.modelName || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      metadata: {
        model: response.model,
        id: response.id,
      },
    };
  }

  async *stream(prompt: string, options?: Partial<LLMConfig>): AsyncGenerator<string, void, unknown> {
    const config = this.mergeConfig(options);
    const stream = await this.client.chat.completions.create({
      model: config.modelName || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
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
}
