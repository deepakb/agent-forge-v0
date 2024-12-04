import { Message, LLMResponse, StreamingOptions, ProviderConfig } from '../types/provider';

export interface ILLMProvider {
    initialize(config: ProviderConfig): Promise<void>;
    validateConfig(config: ProviderConfig): boolean;
    complete(messages: Message[], options?: StreamingOptions): Promise<LLMResponse>;
    stream(messages: Message[], options?: StreamingOptions): AsyncGenerator<string, void, unknown>;
    isInitialized(): boolean;
    getProviderName(): string;
}

export interface ILLMProviderFactory {
    createProvider(providerName: string, config: ProviderConfig): Promise<ILLMProvider>;
    getProvider(providerName: string): ILLMProvider | undefined;
    listProviders(): string[];
}

export interface IAnthropicConfig extends ProviderConfig {
    provider: 'anthropic';
    anthropicApiKey: string;
}

export interface IOpenAIConfig extends ProviderConfig {
    provider: 'openai';
    openaiApiKey: string;
    organizationId?: string;
}
