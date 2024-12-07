import { injectable, inject } from 'inversify';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { ILLMProvider, Message } from '@agent-forge/llm-provider';
import { BaseAgent } from './base-agent';
import { 
    ResearchResult, 
    ContentStrategy, 
    ContentStrategySchema 
} from '../types/agent-types';

@injectable()
export class ContentStrategyAgent extends BaseAgent {
    constructor(
        @inject('Logger') logger: ILogger,
        @inject('ErrorHandler') errorHandler: IErrorHandler,
        @inject('LLMProvider') llmProvider: ILLMProvider
    ) {
        super(logger, errorHandler, llmProvider);
    }

    async execute(research: ResearchResult): Promise<ContentStrategy> {
        try {
            const strategy = await this.generateContentStrategy(research);
            
            return this.validateResult<ContentStrategy>(
                ContentStrategySchema,
                strategy,
                'Content Strategy Generation'
            );
        } catch (error) {
            return this.handleError(error, 'Content Strategy Agent Execution');
        }
    }

    private async generateContentStrategy(research: ResearchResult): Promise<ContentStrategy> {
        const prompt: Message[] = [
            {
                role: 'system',
                content: `You are a social media content strategist. Analyze the research data and return a JSON object with the following structure:

{
    "headline": "string",
    "description": "string",
    "hashtags": ["string"],
    "recommendedFormat": "image" | "video",
    "platformSpecifics": {
        "linkedin": {
            "tone": "string",
            "characterLimit": number,
            "formattedContent": "string"
        },
        "twitter": {
            "tone": "string",
            "characterLimit": number,
            "formattedContent": "string"
        },
        "instagram": {
            "tone": "string",
            "characterLimit": number,
            "formattedContent": "string"
        }
    }
}

Important:
1. Return ONLY valid JSON, no markdown or other formatting
2. Use 3-5 relevant hashtags
3. Keep platform content within character limits:
   - LinkedIn: 3000 chars
   - Twitter: 280 chars
   - Instagram: 2200 chars
4. Adapt tone for each platform:
   - LinkedIn: Professional, industry-focused
   - Twitter: Concise, engaging
   - Instagram: Visual, creative
5. Ensure formattedContent includes hashtags and is ready to post`
            },
            {
                role: 'user',
                content: `Research Data: ${JSON.stringify(research, null, 2)}`
            }
        ];

        const response = await this.llmProvider.complete(prompt);
        
        try {
            const parsedResponse = JSON.parse(response.content) as ContentStrategy;
            this.validatePlatformLimits(parsedResponse);
            return parsedResponse;
        } catch (error) {
            this.logger.error(
                'Failed to parse content strategy',
                error instanceof Error ? error : new Error('Unknown error'),
                { llmResponse: response.content }
            );
            return this.handleError(error, 'Content Strategy Generation');
        }
    }

    private validatePlatformLimits(strategy: ContentStrategy): void {
        const platforms: Array<keyof typeof strategy.platformSpecifics> = ['linkedin', 'twitter', 'instagram'];
        
        platforms.forEach(platform => {
            const specs = this.getPlatformSpecifics(platform);
            const content = strategy.platformSpecifics[platform].formattedContent;
            
            if (content.length > specs.maxLength) {
                this.logger.warn(`${platform} content exceeds character limit`, {
                    platform,
                    contentLength: content.length,
                    maxLength: specs.maxLength
                });
            }
        });
    }

    private getPlatformSpecifics(platform: 'linkedin' | 'twitter' | 'instagram'): {
        maxLength: number;
        tone: string;
        hashtagLimit: number;
    } {
        const specs = {
            linkedin: {
                maxLength: 3000,
                tone: 'professional',
                hashtagLimit: 5
            },
            twitter: {
                maxLength: 280,
                tone: 'casual',
                hashtagLimit: 3
            },
            instagram: {
                maxLength: 2200,
                tone: 'visual',
                hashtagLimit: 30
            }
        };

        return specs[platform];
    }
}
