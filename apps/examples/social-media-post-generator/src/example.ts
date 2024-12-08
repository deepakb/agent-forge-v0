import 'reflect-metadata';
import { config } from 'dotenv';
import { Container } from 'inversify';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { 
    LLMProviderFactory, 
    ILLMProvider, 
    IOpenAIConfig,
    OpenAIProvider,
    FalAIProvider
} from '@agent-forge/llm-provider';
import { ResearchAgent } from './agents/research-agent';
import { ContentStrategyAgent } from './agents/content-strategy-agent';
import { CreativeAssetAgent } from './agents/creative-asset-agent';
import { WorkflowManager } from './workflow/workflow-manager';

// Load environment variables
config();

function loadEnvVariables() {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    const falApiKey = process.env.FAL_API_KEY;

    if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
    }

    if (!tavilyApiKey) {
        throw new Error('TAVILY_API_KEY environment variable is required');
    }

    if (!falApiKey) {
        throw new Error('FAL_API_KEY environment variable is required');
    }

    return {
        OPENAI_API_KEY: openaiApiKey,
        TAVILY_API_KEY: tavilyApiKey,
        FAL_API_KEY: falApiKey
    };
}

class SimpleLogger implements ILogger {
    initialize(config?: any): void {}
    setConfig(config: any): void {}
    log(level: string, message: string, meta?: Record<string, any>): void {
        console.log(`[${level}] ${message}`, meta || '');
    }
    info(message: string, meta?: Record<string, any>): void {
        this.log('info', message, meta);
    }
    error(message: string, error?: Error | string, meta?: Record<string, any>): void {
        console.error(`[error] ${message}`, error, meta || '');
    }
    warn(message: string, meta?: Record<string, any>): void {
        this.log('warn', message, meta);
    }
    debug(message: string, meta?: Record<string, any>): void {
        this.log('debug', message, meta);
    }
    async logWorkflowStart(workflowId: string, context?: Record<string, any>): Promise<void> {
        this.info(`Starting workflow: ${workflowId}`, context);
    }
    async logWorkflowEnd(workflowId: string, success: boolean, context?: Record<string, any>): Promise<void> {
        this.info(`Workflow ${workflowId} ${success ? 'completed successfully' : 'failed'}`, context);
    }
    async logOperationStart(operationId: string, context?: Record<string, any>): Promise<void> {
        this.info(`Starting operation: ${operationId}`, context);
    }
    async logOperationEnd(operationId: string, success: boolean, context?: Record<string, any>): Promise<void> {
        this.info(`Operation ${operationId} ${success ? 'completed successfully' : 'failed'}`, context);
    }
    async logAPIRequest(method: string, endpoint: string, statusCode: number, duration: number, context?: Record<string, any>): Promise<void> {
        this.info(`API ${method} ${endpoint} - Status: ${statusCode} - Duration: ${duration}ms`, context);
    }
    async logAgentAction(agentId: string, operation: string, context?: Record<string, any>): Promise<void> {
        this.info(`Agent ${agentId} performing ${operation}`, context);
    }
    async logAgentError(agentId: string, error: Error | string, context?: Record<string, any>): Promise<void> {
        this.error(`Agent ${agentId} error`, error, context);
    }
}

class SimpleErrorHandler implements IErrorHandler {
    handleError(error: Error | string): void {
        console.error('Error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(error);
    }
    async wrap<T>(fn: () => Promise<T>, retryCount?: number): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error as Error);
            throw error;
        }
    }
    isOperationalError(error: Error): boolean {
        return false;
    }
    isRetryableError(error: Error): boolean {
        return false;
    }
    getErrorCode(error: Error): string | undefined {
        return 'UNKNOWN_ERROR';
    }
    getErrorContext(error: Error): Record<string, unknown> | undefined {
        return {};
    }
}

async function main() {
    // Load environment variables
    const envVars = loadEnvVariables();

    // Set up dependency injection container
    const container = new Container();

    // Create logger and error handler
    const logger = new SimpleLogger();
    const errorHandler = new SimpleErrorHandler();

    // Bind core services
    container.bind<ILogger>('Logger').toConstantValue(logger);
    container.bind<IErrorHandler>('ErrorHandler').toConstantValue(errorHandler);

    // Create providers
    const openaiProvider = new OpenAIProvider(logger, errorHandler);
    const falaiProvider = new FalAIProvider(logger, errorHandler);

    // Initialize LLM provider factory with OpenAI and Fal.ai providers
    const llmProviderFactory = new LLMProviderFactory(
        logger,
        errorHandler,
        null as any, // Anthropic provider not used
        openaiProvider,
        falaiProvider
    );

    const providerConfig: IOpenAIConfig = {
        provider: 'openai',
        modelName: 'gpt-4-turbo-preview',
        maxTokens: 2048,
        temperature: 0.7,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        openaiApiKey: envVars.OPENAI_API_KEY
    };

    const llmProvider = await llmProviderFactory.createProvider('openai', providerConfig);
    
    container.bind<ILLMProvider>('LLMProvider').toConstantValue(llmProvider);

    // Bind API keys
    container.bind('OpenAIApiKey').toConstantValue(envVars.OPENAI_API_KEY);
    container.bind('TavilyApiKey').toConstantValue(envVars.TAVILY_API_KEY);
    container.bind('FalApiKey').toConstantValue(envVars.FAL_API_KEY);

    // Bind agents
    container.bind(ResearchAgent).toSelf();
    container.bind(ContentStrategyAgent).toSelf();
    container.bind(CreativeAssetAgent).toSelf();
    container.bind(WorkflowManager).toSelf();

    // Initialize workflow manager
    const workflowManager = container.get<WorkflowManager>(WorkflowManager);

    // Example brand configuration
    const brandConfig = {
        colors: ['#1DA1F2', '#14171A', '#657786'],
        logo: 'https://example.com/logo.png',
        styleGuide: {
            fontFamily: 'Helvetica Neue',
            tone: 'professional',
            imageStyle: 'modern and clean'
        }
    };

    try {
        // Generate a social media post
        const post = await workflowManager.generateSocialMediaPost(
            'The Future of Artificial Intelligence in Enterprise',
            brandConfig
        );

        // Log the result
        console.log('Generated Social Media Post:');
        console.log(JSON.stringify(post, null, 2));
    } catch (error) {
        console.error('Error generating social media post:', error);
    }
}

// Run the example
main().catch(console.error);
