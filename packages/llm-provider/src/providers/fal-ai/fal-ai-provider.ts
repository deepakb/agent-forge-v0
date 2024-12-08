import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { BaseLLMProvider } from '../base/base-provider';
import { Message, LLMResponse, StreamingOptions, ProviderConfig } from '../../types/provider';
import { FalAIConfig, FalAIResponse, FalAIStreamOptions, FalAIQueueStatus } from '../../types/fal-ai';
import { fal } from '@fal-ai/client';

export class FalAIProvider extends BaseLLMProvider {
    protected config!: FalAIConfig;
    private defaultModelId: string = 'fal-ai/flux/dev';

    constructor(logger: ILogger, errorHandler: IErrorHandler) {
        super(logger, errorHandler);
    }

    async initialize(config: ProviderConfig): Promise<void> {
        try {
            if (!this.validateConfig(config)) {
                throw new Error('Invalid configuration provided');
            }

            this.config = config as FalAIConfig;
            
            // Set the API key for fal.ai client
            process.env.FAL_KEY = this.config.apiKey;
            
            this.initialized = true;
            this.logger.info('FalAI provider initialized successfully');
        } catch (error) {
            this.handleError('Failed to initialize FalAI provider', error);
            throw error;
        }
    }

    validateConfig(config: ProviderConfig): boolean {
        const falConfig = config as FalAIConfig;
        return Boolean(falConfig && falConfig.apiKey);
    }

    async complete(messages: Message[], options?: StreamingOptions): Promise<LLMResponse> {
        this.ensureInitialized();
        
        try {
            const modelId = this.config.modelId || this.defaultModelId;
            const result = await fal.subscribe(modelId, {
                input: this.formatMessages(messages),
                logs: true,
            });

            return {
                content: this.extractContent(result),
                model: modelId,
                metadata: {
                    model: modelId,
                    provider: this.getProviderName(),
                    stopReason: null
                }
            };
        } catch (error) {
            this.handleError('Error in FalAI completion', error);
            throw error;
        }
    }

    async *stream(messages: Message[], options?: StreamingOptions): AsyncGenerator<string, void, unknown> {
        this.ensureInitialized();

        try {
            const modelId = this.config.modelId || this.defaultModelId;
            const stream = await fal.stream(modelId, {
                input: this.formatMessages(messages),
            });

            for await (const event of stream) {
                yield this.extractContent(event);
            }
        } catch (error) {
            this.handleError('Error in FalAI streaming', error);
            throw error;
        }
    }

    getProviderName(): string {
        return 'fal-ai';
    }

    // Helper method to upload files to FalAI storage
    async uploadFile(file: File): Promise<string> {
        try {
            const url = await fal.storage.upload(file);
            return url;
        } catch (error) {
            this.handleError('Error uploading file to FalAI storage', error);
            throw error;
        }
    }

    // Helper method to establish real-time connection
    establishRealtimeConnection(modelId: string, callbacks: {
        onResult?: (result: any) => void;
        onError?: (error: any) => void;
    }) {
        this.ensureInitialized();
        
        return fal.realtime.connect(modelId, {
            onResult: (result: any) => {
                if (callbacks.onResult) {
                    callbacks.onResult(result);
                }
            },
            onError: (error) => {
                if (callbacks.onError) {
                    callbacks.onError(error);
                }
                this.handleError('Error in FalAI realtime connection', error);
            }
        });
    }

    private formatMessages(messages: Message[]): Record<string, any> {
        // Convert our Message format to FalAI's expected input format
        // This will need to be adjusted based on the specific FalAI model being used
        return {
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        };
    }

    private extractContent(result: FalAIResponse): string {
        // Extract the relevant content from the FalAI response
        // This will need to be adjusted based on the specific FalAI model being used
        if (typeof result.data === 'string') {
            return result.data;
        }
        return JSON.stringify(result.data);
    }
}
