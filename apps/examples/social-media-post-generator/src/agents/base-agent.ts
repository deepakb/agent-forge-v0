import { injectable } from 'inversify';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { ILLMProvider } from '@agent-forge/llm-provider';

@injectable()
export abstract class BaseAgent {
    constructor(
        protected readonly logger: ILogger,
        protected readonly errorHandler: IErrorHandler,
        protected readonly llmProvider: ILLMProvider
    ) {}

    protected async handleError(error: unknown, context: string): Promise<never> {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error(`Error in ${context}: ${errorMessage}`);
        
        if (error instanceof Error) {
            this.errorHandler.handleError(error);
        } else {
            this.errorHandler.handleError(new Error(errorMessage));
        }
        
        throw error;
    }

    protected async validateResult<T>(schema: any, data: unknown, context: string): Promise<T> {
        try {
            return schema.parse(data) as T;
        } catch (error) {
            return this.handleError(error, `Validation failed in ${context}`);
        }
    }

    abstract execute(...args: any[]): Promise<any>;
}
