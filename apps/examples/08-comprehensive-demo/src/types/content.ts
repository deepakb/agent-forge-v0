export interface Content {
  id: string;
  title: string;
  body: string;
  type: ContentType;
  status: ContentStatus;
  metadata: ContentMetadata;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type ContentType = 
  | 'ARTICLE'
  | 'BLOG_POST'
  | 'SOCIAL_POST'
  | 'NEWSLETTER'
  | 'DOCUMENTATION';

export type ContentStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'FAILED';

export interface ContentMetadata {
  language: string;
  targetAudience: string;
  topics: string[];
  keywords: string[];
  readingTime: number;
  complexity: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED';
  seoScore?: number;
  qualityScore?: number;
  engagement?: ContentEngagement;
}

export interface ContentEngagement {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  averageTimeOnPage: number;
}

export interface ContentAnalysis {
  id: string;
  contentId: string;
  scores: {
    grammar: number;
    clarity: number;
    engagement: number;
    seo: number;
    overall: number;
  };
  suggestions: ContentSuggestion[];
  timestamp: Date;
}

export interface ContentSuggestion {
  type: 'GRAMMAR' | 'CLARITY' | 'STYLE' | 'SEO';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  context: {
    selection: string;
    suggestion: string;
  };
}

export interface ContentRequest {
  type: ContentType;
  title?: string;
  topics: string[];
  targetAudience: string;
  tone: 'FORMAL' | 'CASUAL' | 'TECHNICAL' | 'CONVERSATIONAL';
  length: 'SHORT' | 'MEDIUM' | 'LONG';
  keywords?: string[];
  deadline?: Date;
}

export interface PublishingTarget {
  platform: 'WEBSITE' | 'BLOG' | 'SOCIAL_MEDIA' | 'EMAIL' | 'DOCUMENTATION';
  url?: string;
  schedule?: Date;
  audience?: string[];
  formatting?: {
    template?: string;
    style?: string;
  };
}
