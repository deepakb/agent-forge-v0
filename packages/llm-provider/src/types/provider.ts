export interface LLMConfig {
  apiKey: string;
  modelName?: string;
  organizationId?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

export interface LLMProvider {
  initialize(config: LLMConfig): void;
  complete(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse>;
  stream(prompt: string, options?: Partial<LLMConfig>): AsyncGenerator<string, void, unknown>;
  embedText(text: string): Promise<number[]>;
}
