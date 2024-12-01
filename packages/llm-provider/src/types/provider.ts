import { z } from 'zod';
import { BaseProviderConfig } from '../config/validation';

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
  initialize(config: BaseProviderConfig): Promise<void>;
  complete(prompt: string, options?: Partial<BaseProviderConfig>): Promise<LLMResponse>;
  stream(prompt: string, options?: Partial<BaseProviderConfig>): AsyncGenerator<string, void, unknown>;
  embedText(text: string): Promise<number[]>;
}

export const LLMResponseSchema = z.object({
  text: z.string(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});
