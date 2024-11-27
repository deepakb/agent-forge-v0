import { z } from 'zod';
import { Task, TaskResult, TaskConfig, TaskMetadata } from '@agent-forge/core';

export enum MessageType {
  TOPIC = 'TOPIC',
  QUERY = 'QUERY',
  SEARCH_QUERIES = 'SEARCH_QUERIES',
  SEARCH_RESULTS = 'SEARCH_RESULTS',
  ARTICLE = 'ARTICLE',
}

// Zod Schemas for Runtime Type Validation
export const SearchResultSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  content: z.string(),
  score: z.number(),
});

export const QuerySchema = z.object({
  query: z.string(),
  maxResults: z.number().optional(),
  minScore: z.number().optional(),
});

export const SynthesisResultSchema = z.object({
  content: z.string(),
  sources: z.array(z.string()),
});

export const AgentConfigSchema = z.object({
  agentType: z.string(),
  id: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
  maxConcurrentTasks: z.number().optional(),
  retryAttempts: z.number().optional(),
  openaiApiKey: z.string().optional(),
  tavilyApiKey: z.string().optional(),
  logLevel: z.string().optional(),
  maxRetries: z.number().optional(),
  timeout: z.number().optional(),
});

export const AgentMessageSchema = z.object({
  type: z.nativeEnum(MessageType),
  source: z.string(),
  target: z.string(),
  data: z.unknown(),
});

// Type definitions from schemas
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type Query = z.infer<typeof QuerySchema>;
export type SynthesisResult = z.infer<typeof SynthesisResultSchema>;
export type AgentConfig = z.infer<typeof AgentConfigSchema>;
export type AgentMessage = z.infer<typeof AgentMessageSchema>;

// Re-export core types
export { Task, TaskResult, TaskConfig, TaskMetadata };
