import { injectable, inject } from 'inversify';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { ILLMProvider } from '@agent-forge/llm-provider';
import { tavily } from '@tavily/core';
import { BaseAgent } from './base-agent';
import { ResearchResult, ResearchResultSchema } from '../types/agent-types';
import { Message } from '@agent-forge/llm-provider';
import { AxiosError } from 'axios';

const MAX_RETRIES = 3;
const BACKOFF_DELAY = 2000; // 2 seconds base delay

interface TavilyErrorResponse {
    status?: number;
    message?: string;
}

@injectable()
export class ResearchAgent extends BaseAgent {
    private tavilyClient: ReturnType<typeof tavily>;

    constructor(
        @inject('Logger') logger: ILogger,
        @inject('ErrorHandler') errorHandler: IErrorHandler,
        @inject('LLMProvider') llmProvider: ILLMProvider,
        @inject('TavilyApiKey') tavilyApiKey: string
    ) {
        super(logger, errorHandler, llmProvider);
        this.tavilyClient = tavily({ apiKey: tavilyApiKey });
    }

    async execute(topic: string): Promise<ResearchResult> {
        try {
            // Get raw research data from Tavily with retries
            const searchResult = await this.searchWithRetry(topic);

            // Use LLM to analyze and structure the research data
            const analysis = await this.analyzeResearchData(topic, searchResult);
            
            return this.validateResult<ResearchResult>(
                ResearchResultSchema,
                analysis,
                'Research Analysis'
            );
        } catch (error) {
            return this.handleError(error, 'Research Agent Execution');
        }
    }

    private async searchWithRetry(topic: string, retryCount = 0): Promise<any> {
        try {
            this.logger.info(`Attempting Tavily search (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`, {
                topic,
                attempt: retryCount + 1
            });

            const searchResult = await this.tavilyClient.search(topic, {
                searchDepth: "advanced",
                includeDomains: ['linkedin.com', 'twitter.com', 'medium.com', 'techcrunch.com'],
                maxResults: 5
            });

            return searchResult;
        } catch (error) {
            const axiosError = error as AxiosError<TavilyErrorResponse>;
            const isTimeoutError = 
                axiosError.response?.status === 504 || // Gateway timeout
                axiosError.code === 'ECONNABORTED' ||  // Connection timeout
                axiosError.message?.toLowerCase().includes('timeout');

            if (isTimeoutError && retryCount < MAX_RETRIES) {
                this.logger.warn(`Tavily search timed out, retrying...`, {
                    attempt: retryCount + 1,
                    maxRetries: MAX_RETRIES,
                    error: axiosError.message
                });
                
                // Exponential backoff before retry
                const delay = BACKOFF_DELAY * Math.pow(2, retryCount);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.searchWithRetry(topic, retryCount + 1);
            }

            throw error;
        }
    }

    private async analyzeResearchData(topic: string, searchResult: any): Promise<ResearchResult> {
        const prompt: Message[] = [
            {
                role: 'system',
                content: `You are a research analyst specializing in social media content. Analyze the provided research data and return a JSON object with the following structure:

{
    "topic": "string",
    "analysis": {
        "keyPoints": ["string"],
        "targetAudience": ["string"],
        "trendingAspects": ["string"],
        "statistics": ["string"]
    },
    "sources": ["string"]
}

Important:
1. Return ONLY valid JSON, no markdown or other formatting
2. Each array should contain 3-5 items
3. Make the content engaging and shareable on social media
4. Extract actual statistics from the research when available
5. Include source URLs in the sources array`
            },
            {
                role: 'user',
                content: `Topic: ${topic}\n\nResearch Data: ${JSON.stringify(searchResult)}`
            }
        ];

        const response = await this.llmProvider.complete(prompt);
        
        try {
            return JSON.parse(response.content) as ResearchResult;
        } catch (error) {
            this.logger.error(
                'Failed to parse LLM response',
                error instanceof Error ? error : new Error('Unknown error'),
                { llmResponse: response.content }
            );
            return this.handleError(error, 'Research Data Analysis');
        }
    }
}
