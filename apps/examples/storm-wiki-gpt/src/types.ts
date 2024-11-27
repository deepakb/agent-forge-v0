import { z } from 'zod';
import { Task as BaseTask } from '@agent-forge/core';

export interface Task extends BaseTask {
  id: string;
  type: string;
  data: unknown;
}

export enum AgentType {
  QUERY = 'QUERY',
  FETCH = 'FETCH',
  SYNTHESIS = 'SYNTHESIS',
}

export enum MessageType {
  QUERY = 'QUERY',
  SEARCH_RESULTS = 'SEARCH_RESULTS',
  SYNTHESIS_COMPLETE = 'SYNTHESIS_COMPLETE',
}

export const QuerySchema = z.object({
  query: z.string(),
  maxResults: z.number().optional(),
});

export type Query = z.infer<typeof QuerySchema>;

export const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  score: z.number(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SynthesisResultSchema = z.object({
  query: z.string(),
  summary: z.string(),
  sources: z.array(z.string()),
});

export type SynthesisResult = z.infer<typeof SynthesisResultSchema>;

export interface TavilySearchOptions {
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced';
  includeUrls?: string[];
  excludeUrls?: string[];
  includeDomainsOnly?: string[];
  excludeDomainsOnly?: string[];
}

export interface QueryMessageData {
  query: string;
  maxResults?: number;
}

export interface SearchResultsMessageData {
  query: string;
  results: SearchResult[];
}

export interface SynthesisCompleteMessageData extends SynthesisResult {}

export const AgentMessageSchema = z.object({
  type: z.enum([MessageType.QUERY, MessageType.SEARCH_RESULTS, MessageType.SYNTHESIS_COMPLETE]),
  data: z.union([QuerySchema, SearchResultSchema, SynthesisResultSchema]),
  source: z.enum([AgentType.QUERY, AgentType.FETCH, AgentType.SYNTHESIS]),
  target: z.enum([AgentType.QUERY, AgentType.FETCH, AgentType.SYNTHESIS]).optional(),
});

export type AgentMessage = z.infer<typeof AgentMessageSchema>;
