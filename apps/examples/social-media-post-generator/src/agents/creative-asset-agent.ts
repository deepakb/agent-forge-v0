import { injectable, inject } from 'inversify';
import { ILogger, IErrorHandler } from '@agent-forge/shared';
import { ILLMProvider, Message } from '@agent-forge/llm-provider';
import { fal } from '@fal-ai/client';
import { BaseAgent } from './base-agent';
import { 
    ContentStrategy, 
    CreativeAsset,
    CreativeAssetSchema 
} from '../types/agent-types';

// Custom error interface for video generation errors
interface VideoGenerationError extends Error {
    context?: {
        data?: any;
        prompt?: string;
    };
}

@injectable()
export class CreativeAssetAgent extends BaseAgent {
    constructor(
        @inject('Logger') logger: ILogger,
        @inject('ErrorHandler') errorHandler: IErrorHandler,
        @inject('LLMProvider') llmProvider: ILLMProvider,
        @inject('FalApiKey') falApiKey: string
    ) {
        super(logger, errorHandler, llmProvider);
        process.env.FAL_KEY = falApiKey;
    }

    async execute(
        content: ContentStrategy,
        brandConfig: {
            colors: string[];
            logo?: string;
            styleGuide: Record<string, any>;
        }
    ): Promise<CreativeAsset> {
        try {
            let asset: CreativeAsset;

            if (content.recommendedFormat === 'image') {
                asset = await this.generateImage(content, brandConfig);
            } else {
                asset = await this.generateVideo(content, brandConfig);
            }

            return this.validateResult<CreativeAsset>(
                CreativeAssetSchema,
                asset,
                'Creative Asset Generation'
            );
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            this.logger.error('Creative Asset Agent Execution failed', err);
            return this.handleError(error, 'Creative Asset Agent Execution');
        }
    }

    private async generateImage(
        content: ContentStrategy,
        brandConfig: { colors: string[]; logo?: string; styleGuide: Record<string, any> }
    ): Promise<CreativeAsset> {
        try {
            const prompt = await this.generateCreativePrompt(content, 'image');
            
            const result = await fal.subscribe('fal-ai/flux/dev', {
                input: {
                    prompt,
                    image_size: "square_hd",
                    num_images: 1
                },
                logs: true,
            });

            return {
                type: 'image',
                url: result.data.images[0].url,
                metadata: {
                    size: 'square_hd',
                    format: 'jpg',
                },
                brandingDetails: {
                    colorScheme: brandConfig.colors,
                    logoPlacement: brandConfig.logo ? 'bottom-right' : undefined,
                    styleGuideCompliance: true
                }
            };
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            this.logger.error('Image generation failed', err);
            return this.handleError(error, 'Image Generation');
        }
    }

    private async generateVideo(
        content: ContentStrategy,
        brandConfig: { colors: string[]; logo?: string; styleGuide: Record<string, any> }
    ): Promise<CreativeAsset> {
        try {
            const prompt = await this.generateCreativePrompt(content, 'video');
            
            this.logger.info('Generating video with prompt', { prompt });
            
            const result = await fal.subscribe('fal-ai/haiper-video-v2', {
                input: {
                    prompt,
                    duration: "4" as const,
                    prompt_enhancer: true,
                    seed: Math.floor(Math.random() * 1000000)
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        this.logger.info('Video generation progress', {
                            logs: update.logs.map(log => log.message)
                        });
                    }
                }
            });

            this.logger.debug('Video generation result', { 
                data: JSON.stringify(result.data) 
            });

            const videoUrl = result.data?.video?.url;

            if (!videoUrl) {
                const error = new Error('No video URL found in the response') as VideoGenerationError;
                error.context = {
                    data: result.data,
                    prompt
                };
                throw error;
            }

            this.logger.info('Successfully generated video', { videoUrl });

            return {
                type: 'video',
                url: videoUrl,
                metadata: {
                    size: '1920x1080',
                    format: 'mp4',
                    duration: 4
                },
                brandingDetails: {
                    colorScheme: brandConfig.colors,
                    logoPlacement: brandConfig.logo ? 'bottom-right' : undefined,
                    styleGuideCompliance: true
                }
            };
        } catch (error) {
            const videoError = error as VideoGenerationError;
            
            // Create a proper Error object for logging
            const logError = new Error(videoError.message || 'Video generation failed');
            
            // Add metadata as properties that won't affect type checking
            Object.assign(logError, {
                metadata: {
                    context: videoError.context,
                    stack: videoError.stack
                }
            });
            
            this.logger.error('Video generation failed', logError);
            return this.handleError(error, 'Video Generation');
        }
    }

    private async generateCreativePrompt(
        content: ContentStrategy,
        type: 'image' | 'video'
    ): Promise<string> {
        const prompt: Message[] = [
            {
                role: 'system',
                content: `You are a creative director specializing in ${type} content for social media. 
                         Create a detailed prompt that will generate engaging ${type} content that 
                         matches the message and tone of the provided content strategy.`
            },
            {
                role: 'user',
                content: `Content Strategy: ${JSON.stringify(content, null, 2)}
                         
                         Generate a detailed creative prompt that:
                         1. Captures the main message
                         2. Matches the tone for the target platforms
                         3. Includes specific visual elements and style directions
                         4. Ensures brand consistency`
            }
        ];

        const response = await this.llmProvider.complete(prompt);
        return response.content;
    }
}
