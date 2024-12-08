import { z } from 'zod';

export type Role = 'system' | 'user' | 'assistant';

export interface Message {
    role: Role;
    content: string;
}

export interface StreamingOptions {
    enabled?: boolean;
    onToken?: (token: string) => void;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
}

export interface BaseProviderConfig {
    provider: 'openai' | 'anthropic' | 'fal-ai';
    modelName: string;
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    timeout?: number;
    retryCount?: number;
    retryDelay?: number;
}

export type ProviderConfig = BaseProviderConfig;

export interface LLMResponse {
    content: string;
    model?: string;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
    finishReason?: string;
    metadata: {
        model: string;
        provider: string;
        stopReason: string | null;
    };
}

export type ProviderType = 'openai' | 'anthropic' | 'fal-ai';

export const SUPPORTED_PROVIDERS: ProviderType[] = ['openai', 'anthropic', 'fal-ai'];

export interface LLMProvider {
  initialize(config: ProviderConfig): Promise<void>;
  complete(prompt: string | Message[], options?: Partial<ProviderConfig>): Promise<LLMResponse>;
  stream(prompt: string | Message[], options?: Partial<ProviderConfig> & StreamingOptions): AsyncGenerator<string, void, unknown>;
  embedText(text: string): Promise<number[]>;
}

export const LLMResponseSchema = z.object({
  content: z.string(),
  model: z.string().optional(),
  usage: z.object({
    promptTokens: z.number().optional(),
    completionTokens: z.number().optional(),
    totalTokens: z.number().optional(),
  }).optional(),
  finishReason: z.string().optional(),
  metadata: z.object({
    model: z.string(),
    provider: z.string(),
    stopReason: z.string().nullable(),
  }),
});
