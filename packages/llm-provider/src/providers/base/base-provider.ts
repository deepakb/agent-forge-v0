import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { Message, LLMResponse, StreamingOptions, ProviderConfig } from '../../types/provider';
import { ILLMProvider } from '../../container/interfaces';
import { LLMProviderError } from '../../errors/provider-errors';

export abstract class BaseLLMProvider implements ILLMProvider {
    protected initialized: boolean = false;
    protected abstract config: ProviderConfig;
    
    constructor(
        protected readonly logger: ILogger,
        protected readonly errorHandler: IErrorHandler
    ) {}

    abstract initialize(config: ProviderConfig): Promise<void>;
    abstract validateConfig(config: ProviderConfig): boolean;
    abstract complete(messages: Message[], options?: StreamingOptions): Promise<LLMResponse>;
    abstract stream(messages: Message[], options?: StreamingOptions): AsyncGenerator<string, void, unknown>;
    abstract getProviderName(): string;

    protected ensureInitialized(): void {
        if (!this.initialized) {
            throw new LLMProviderError('Provider not initialized');
        }
    }

    protected handleError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`${message}: ${errorMessage}`);
        
        if (error instanceof Error) {
            this.errorHandler.handleError(error);
        } else {
            this.errorHandler.handleError(new Error(errorMessage));
        }
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}
