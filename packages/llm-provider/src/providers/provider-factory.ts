import { injectable, inject } from 'inversify';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { LLM_PROVIDER_TYPES } from '../container/types';
import { ILLMProvider, ILLMProviderFactory } from '../container/interfaces';
import { ProviderConfig, SUPPORTED_PROVIDERS } from '../types/provider';
import { LLMConfigurationError } from '../errors/provider-errors';

@injectable()
export class LLMProviderFactory implements ILLMProviderFactory {
    private providers: Map<string, ILLMProvider> = new Map();

    constructor(
        @inject(LLM_PROVIDER_TYPES.Logger) private logger: ILogger,
        @inject(LLM_PROVIDER_TYPES.ErrorHandler) private errorHandler: IErrorHandler,
        @inject(LLM_PROVIDER_TYPES.AnthropicProvider) private anthropicProvider: ILLMProvider,
        @inject(LLM_PROVIDER_TYPES.OpenAIProvider) private openaiProvider: ILLMProvider
    ) {
        this.providers.set('anthropic', anthropicProvider);
        this.providers.set('openai', openaiProvider);
    }

    async createProvider(providerName: string, config: ProviderConfig): Promise<ILLMProvider> {
        if (!SUPPORTED_PROVIDERS.includes(providerName as any)) {
            throw new LLMConfigurationError(`Unsupported provider: ${providerName}`);
        }

        const provider = this.providers.get(providerName);
        if (!provider) {
            throw new LLMConfigurationError(`Provider not found: ${providerName}`);
        }

        await provider.initialize(config);
        return provider;
    }

    getProvider(providerName: string): ILLMProvider | undefined {
        return this.providers.get(providerName);
    }

    listProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}
