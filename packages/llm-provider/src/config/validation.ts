import { z } from 'zod';

export const ProviderType = z.enum(['openai', 'anthropic']);
export type ProviderType = z.infer<typeof ProviderType>;

export const RetryConfigSchema = z.object({
  maxRetries: z.number().optional(),
  initialDelayMs: z.number().optional(),
  maxDelayMs: z.number().optional(),
});

export const BaseProviderConfigSchema = z.object({
  provider: ProviderType,
  apiKey: z.string().min(1, 'API key is required'),
  modelName: z.string(),
  maxTokens: z.number().positive(),
  temperature: z.number().min(0).max(2),
  organizationId: z.string().optional(),
  timeout: z.number().positive().optional(),
  tokensPerMinute: z.number().optional(),
  maxConcurrent: z.number().optional(),
  retryConfig: RetryConfigSchema.optional(),
});

export const OpenAIConfigSchema = BaseProviderConfigSchema.extend({
  provider: z.literal('openai'),
});

export const AnthropicConfigSchema = BaseProviderConfigSchema.extend({
  provider: z.literal('anthropic'),
});

export const ProviderConfigSchema = z.discriminatedUnion('provider', [
  OpenAIConfigSchema,
  AnthropicConfigSchema,
]);

export type RetryConfig = z.infer<typeof RetryConfigSchema>;
export type BaseProviderConfig = z.infer<typeof BaseProviderConfigSchema>;
export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;
export type AnthropicConfig = z.infer<typeof AnthropicConfigSchema>;
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;
