// Initialize container
import 'reflect-metadata';

// IoC exports
export { container } from './container/container';
export { LLM_PROVIDER_TYPES } from './container/types';
export * from './container/interfaces';

// Provider implementations
export { AnthropicProvider } from './providers/anthropic/anthropic-provider';
export { OpenAIProvider } from './providers/openai/openai-provider';
export { FalAIProvider } from './providers/fal-ai/fal-ai-provider';
export { LLMProviderFactory } from './providers/provider-factory';

// Types and configurations
export type {
    Message,
    StreamingOptions,
    ProviderConfig,
    LLMResponse,
    ProviderType
} from './types/provider';
export { SUPPORTED_PROVIDERS } from './types/provider';

// Fal.ai types
export type {
    FalAIConfig,
    FalAIResponse,
    FalAIStreamOptions,
    FalAIQueueStatus,
    FalAIStorageResponse,
    FalAIError
} from './types/fal-ai';

// Errors
export * from './errors/provider-errors';
