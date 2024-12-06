import { injectable, inject } from 'inversify';
import Anthropic from '@anthropic-ai/sdk';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { LLM_PROVIDER_TYPES } from '../../container/types';
import { ILLMProvider, IAnthropicConfig } from '../../container/interfaces';
import { Message, LLMResponse, StreamingOptions, ProviderConfig } from '../../types/provider';
import { BaseLLMProvider } from '../base/base-provider';
import { LLMConfigurationError } from '../../errors/provider-errors';

type AnthropicRole = 'user' | 'assistant';

@injectable()
export class AnthropicProvider extends BaseLLMProvider implements ILLMProvider {
    private client: Anthropic | null = null;
    protected config!: IAnthropicConfig;

    constructor(
        @inject(LLM_PROVIDER_TYPES.Logger) logger: ILogger,
        @inject(LLM_PROVIDER_TYPES.ErrorHandler) errorHandler: IErrorHandler
    ) {
        super(logger, errorHandler);
    }

    async initialize(config: ProviderConfig): Promise<void> {
        if (!this.validateConfig(config)) {
            throw new LLMConfigurationError('Invalid Anthropic configuration');
        }

        const anthropicConfig = config as IAnthropicConfig;
        this.client = new Anthropic({
            apiKey: anthropicConfig.anthropicApiKey
        });
        this.config = anthropicConfig;
        this.initialized = true;
    }

    validateConfig(config: ProviderConfig): boolean {
        if (!config || config.provider !== 'anthropic') return false;
        const anthropicConfig = config as IAnthropicConfig;
        return !!anthropicConfig.anthropicApiKey;
    }

    private convertToAnthropicMessages(messages: Message[]): { role: AnthropicRole; content: string }[] {
        return messages
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant' as AnthropicRole,
                content: msg.content
            }));
    }

    private getSystemPrompt(messages: Message[]): string | undefined {
        const systemMessage = messages.find(msg => msg.role === 'system');
        return systemMessage?.content;
    }

    async complete(messages: Message[], options?: StreamingOptions): Promise<LLMResponse> {
        this.ensureInitialized();
        
        try {
            const systemPrompt = this.getSystemPrompt(messages);
            const anthropicMessages = this.convertToAnthropicMessages(messages);

            const response = await this.client!.messages.create({
                model: this.config.modelName,
                messages: anthropicMessages,
                system: systemPrompt,
                max_tokens: options?.maxTokens ?? 1024,
                temperature: options?.temperature,
                top_p: options?.topP,
                stop_sequences: options?.stopSequences
            });

            return {
                content: response.content[0].text,
                model: response.model,
                usage: {
                    promptTokens: response.usage?.input_tokens,
                    completionTokens: response.usage?.output_tokens,
                    totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
                },
                metadata: {
                    model: response.model,
                    provider: 'anthropic',
                    stopReason: response.stop_reason || null
                }
            };
        } catch (error) {
            this.handleError('Error completing messages with Anthropic', error);
            throw error;
        }
    }

    async *stream(messages: Message[], options?: StreamingOptions): AsyncGenerator<string, void, unknown> {
        this.ensureInitialized();

        try {
            const systemPrompt = this.getSystemPrompt(messages);
            const anthropicMessages = this.convertToAnthropicMessages(messages);

            const stream = await this.client!.messages.create({
                model: this.config.modelName,
                messages: anthropicMessages,
                system: systemPrompt,
                max_tokens: options?.maxTokens ?? 1024,
                temperature: options?.temperature,
                top_p: options?.topP,
                stop_sequences: options?.stopSequences,
                stream: true
            });

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
                    yield chunk.delta.text;
                }
            }
        } catch (error) {
            this.handleError('Error streaming messages with Anthropic', error);
            throw error;
        }
    }

    getProviderName(): string {
        return 'anthropic';
    }
}
