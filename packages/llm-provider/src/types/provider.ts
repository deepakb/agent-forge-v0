export interface LLMConfig {
  apiKey: string;
  organizationId?: string;
  modelName?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, unknown>;
}

export interface LLMProvider {
  initialize(config: LLMConfig): Promise<void>;
  complete(prompt: string, options?: Partial<LLMConfig>): Promise<LLMResponse>;
  stream(prompt: string, options?: Partial<LLMConfig>): AsyncGenerator<string, void, unknown>;
  embedText(text: string): Promise<number[]>;
}
