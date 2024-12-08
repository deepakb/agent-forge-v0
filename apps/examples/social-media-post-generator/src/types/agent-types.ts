import { z } from 'zod';

export const ResearchResultSchema = z.object({
    topic: z.string(),
    analysis: z.object({
        keyPoints: z.array(z.string()),
        targetAudience: z.array(z.string()),
        trendingAspects: z.array(z.string()),
        statistics: z.array(z.string())
    }),
    sources: z.array(z.string())
});

export const ContentStrategySchema = z.object({
    headline: z.string(),
    description: z.string(),
    hashtags: z.array(z.string()),
    recommendedFormat: z.enum(['image', 'video']),
    platformSpecifics: z.object({
        linkedin: z.object({
            tone: z.string(),
            characterLimit: z.number(),
            formattedContent: z.string()
        }),
        twitter: z.object({
            tone: z.string(),
            characterLimit: z.number(),
            formattedContent: z.string()
        }),
        instagram: z.object({
            tone: z.string(),
            characterLimit: z.number(),
            formattedContent: z.string()
        })
    })
});

export const CreativeAssetSchema = z.object({
    type: z.enum(['image', 'video']),
    url: z.string(),
    metadata: z.object({
        size: z.string(),
        format: z.string(),
        duration: z.number().optional()
    }),
    brandingDetails: z.object({
        colorScheme: z.array(z.string()),
        logoPlacement: z.string().optional(),
        styleGuideCompliance: z.boolean()
    })
});

export type ResearchResult = z.infer<typeof ResearchResultSchema>;
export type ContentStrategy = z.infer<typeof ContentStrategySchema>;
export type CreativeAsset = z.infer<typeof CreativeAssetSchema>;
