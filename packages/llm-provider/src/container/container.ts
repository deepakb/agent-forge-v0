import { Container } from 'inversify';
import { ILogger, IErrorHandler, Logger, ErrorHandler } from '@agent-forge/shared';
import { LLM_PROVIDER_TYPES } from './types';
import { ILLMProvider, ILLMProviderFactory } from './interfaces';
import { AnthropicProvider } from '../providers/anthropic/anthropic-provider';
import { OpenAIProvider } from '../providers/openai/openai-provider';
import { LLMProviderFactory } from '../providers/provider-factory';

const container = new Container();

// Core services
container.bind<ILogger>(LLM_PROVIDER_TYPES.Logger).to(Logger);
container.bind<IErrorHandler>(LLM_PROVIDER_TYPES.ErrorHandler).to(ErrorHandler);

// LLM Providers
container.bind<ILLMProvider>(LLM_PROVIDER_TYPES.AnthropicProvider).to(AnthropicProvider);
container.bind<ILLMProvider>(LLM_PROVIDER_TYPES.OpenAIProvider).to(OpenAIProvider);

// Provider Factory
container.bind<ILLMProviderFactory>(LLM_PROVIDER_TYPES.LLMProviderFactory).to(LLMProviderFactory);

export { container };
