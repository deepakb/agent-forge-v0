import { ResearchResult, ContentStrategy, CreativeAsset } from './agent-types';

export interface SocialMediaPost {
    topic: string;
    research: ResearchResult;
    contentStrategy: ContentStrategy;
    creativeAsset: CreativeAsset;
    timestamp: string;
}
