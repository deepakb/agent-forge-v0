import { injectable, inject } from 'inversify';
import OpenAI from 'openai';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { LLM_PROVIDER_TYPES } from '../../container/types';
import { ILLMProvider, IOpenAIConfig } from '../../container/interfaces';
import { Message, LLMResponse, StreamingOptions, ProviderConfig } from '../../types/provider';
import { BaseLLMProvider } from '../base/base-provider';
import { LLMConfigurationError } from '../../errors/provider-errors';

@injectable()
export class OpenAIProvider extends BaseLLMProvider implements ILLMProvider {
    private client: OpenAI | null = null;
    protected config!: IOpenAIConfig;

    constructor(
        @inject(LLM_PROVIDER_TYPES.Logger) logger: ILogger,
        @inject(LLM_PROVIDER_TYPES.ErrorHandler) errorHandler: IErrorHandler
    ) {
        super(logger, errorHandler);
    }

    async initialize(config: ProviderConfig): Promise<void> {
        if (!this.validateConfig(config)) {
            throw new LLMConfigurationError('Invalid OpenAI configuration');
        }

        const openaiConfig = config as IOpenAIConfig;
        this.client = new OpenAI({
            apiKey: openaiConfig.openaiApiKey,
            organization: openaiConfig.organizationId
        });
        this.config = openaiConfig;
        this.initialized = true;
    }

    validateConfig(config: ProviderConfig): boolean {
        if (!config || config.provider !== 'openai') return false;
        const openaiConfig = config as IOpenAIConfig;
        return !!openaiConfig.openaiApiKey;
    }

    async complete(messages: Message[], options?: StreamingOptions): Promise<LLMResponse> {
        this.ensureInitialized();
        
        try {
            const response = await this.client!.chat.completions.create({
                model: this.config.modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                max_tokens: options?.maxTokens,
                temperature: options?.temperature,
                top_p: options?.topP,
                frequency_penalty: options?.frequencyPenalty,
                presence_penalty: options?.presencePenalty,
                stop: options?.stopSequences
            });

            return {
                content: response.choices[0].message.content || '',
                model: response.model,
                finishReason: response.choices[0].finish_reason,
                usage: {
                    promptTokens: response.usage?.prompt_tokens,
                    completionTokens: response.usage?.completion_tokens,
                    totalTokens: response.usage?.total_tokens
                },
                metadata: {
                    model: response.model,
                    provider: 'openai',
                    stopReason: response.choices[0].finish_reason || null
                }
            };
        } catch (error) {
            this.handleError('Error completing messages with OpenAI', error);
            throw error;
        }
    }

    async *stream(messages: Message[], options?: StreamingOptions): AsyncGenerator<string, void, unknown> {
        this.ensureInitialized();

        try {
            const stream = await this.client!.chat.completions.create({
                model: this.config.modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                max_tokens: options?.maxTokens,
                temperature: options?.temperature,
                top_p: options?.topP,
                frequency_penalty: options?.frequencyPenalty,
                presence_penalty: options?.presencePenalty,
                stop: options?.stopSequences,
                stream: true
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        } catch (error) {
            this.handleError('Error streaming messages with OpenAI', error);
            throw error;
        }
    }

    getProviderName(): string {
        return 'openai';
    }
}
