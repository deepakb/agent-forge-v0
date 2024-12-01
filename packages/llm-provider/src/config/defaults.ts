import { OpenAIConfig, AnthropicConfig } from './validation';

export const DEFAULT_OPENAI_CONFIG: Partial<OpenAIConfig> = {
  provider: 'openai',
  modelName: 'gpt-3.5-turbo',
  maxTokens: 2048,
  temperature: 0.7,
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
  },
  timeout: 30000, // 30 seconds
};

export const DEFAULT_ANTHROPIC_CONFIG: Partial<AnthropicConfig> = {
  provider: 'anthropic',
  modelName: 'claude-2',
  maxTokens: 4096,
  temperature: 0.7,
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
  },
  timeout: 30000, // 30 seconds
};

export const DEFAULT_CONFIGS = {
  openai: DEFAULT_OPENAI_CONFIG,
  anthropic: DEFAULT_ANTHROPIC_CONFIG,
} as const;
