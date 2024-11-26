import { LLMConfig, LLMResponse } from '../../types/provider';

export abstract class BaseLLMProvider {
  protected config!: LLMConfig;

  constructor() {
    this.config = {
      apiKey: '',
      modelName: 'gpt-3.5-turbo',
      maxTokens: 2048,
      temperature: 0.7,
    };
  }

  initialize(config: LLMConfig): void {
    this.config = config;
  }

  abstract complete(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse>;
  abstract stream(
    prompt: string,
    options?: Partial<LLMConfig>
  ): AsyncGenerator<string, void, unknown>;
  abstract embedText(text: string): Promise<number[]>;

  protected mergeConfig(options?: Partial<LLMConfig>): LLMConfig {
    return {
      ...this.config,
      ...options,
    };
  }
}
