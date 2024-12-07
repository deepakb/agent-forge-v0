import { injectable, inject } from 'inversify';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { ResearchAgent } from '../agents/research-agent';
import { ContentStrategyAgent } from '../agents/content-strategy-agent';
import { CreativeAssetAgent } from '../agents/creative-asset-agent';
import { SocialMediaPost } from '../types/workflow-types';

@injectable()
export class WorkflowManager {
    constructor(
        @inject('Logger') private logger: ILogger,
        @inject('ErrorHandler') private errorHandler: IErrorHandler,
        @inject(ResearchAgent) private researchAgent: ResearchAgent,
        @inject(ContentStrategyAgent) private contentStrategyAgent: ContentStrategyAgent,
        @inject(CreativeAssetAgent) private creativeAssetAgent: CreativeAssetAgent
    ) {}

    async generateSocialMediaPost(
        topic: string,
        brandConfig: {
            colors: string[];
            logo?: string;
            styleGuide: Record<string, any>;
        }
    ): Promise<SocialMediaPost> {
        try {
            this.logger.info('Starting social media post generation workflow');

            // Step 1: Research the topic
            this.logger.info(`Researching topic: ${topic}`);
            const research = await this.researchAgent.execute(topic);

            // Step 2: Generate content strategy
            this.logger.info('Generating content strategy');
            const contentStrategy = await this.contentStrategyAgent.execute(research);

            // Step 3: Generate creative assets
            this.logger.info('Generating creative assets');
            const creativeAsset = await this.creativeAssetAgent.execute(contentStrategy, brandConfig);

            // Combine everything into a social media post
            const post: SocialMediaPost = {
                topic,
                research,
                contentStrategy,
                creativeAsset,
                timestamp: new Date().toISOString()
            };

            this.logger.info('Social media post generation completed successfully');
            return post;
        } catch (error) {
            this.errorHandler.handleError(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }
}
