import { z } from 'zod';

export enum MessageType {
  TOPIC = 'TOPIC',
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

export const AgentMessageSchema = z.object({
  type: z.nativeEnum(MessageType),
  source: z.string(),
  target: z.string(),
  data: z.any(),
});

export const BaseAgentConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  agentType: z.string(),
  capabilities: z.array(z.string()).optional(),
  maxConcurrentTasks: z.number().optional(),
  retryAttempts: z.number().optional(),
  openaiApiKey: z.string(),
  tavilyApiKey: z.string(),
  logLevel: z.string().optional(),
  maxRetries: z.number().optional(),
  timeout: z.number().optional(),
});

export const QueryAgentConfigSchema = BaseAgentConfigSchema.extend({
  fetchAgentId: z.string(),
});

export const FetchAgentConfigSchema = BaseAgentConfigSchema.extend({
  synthesisAgentId: z.string(),
});

export const SynthesisAgentConfigSchema = BaseAgentConfigSchema;

// Task Types
export interface Task {
  id: string;
  agentId: string;
  message: AgentMessage;
}

export interface TaskResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: AgentMessage;
}

export interface TaskConfig {
  id: string;
  type: string;
  priority: string;
  retryAttempts: number;
  dependencies: string[];
  requiredCapabilities: string[];
}

export interface TaskMetadata {
  status: string;
  createdAt: Date;
  attempts: number;
  progress: number;
}

// Agent Types
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type AgentMessage = z.infer<typeof AgentMessageSchema>;
export type BaseAgentConfig = z.infer<typeof BaseAgentConfigSchema>;
export type QueryAgentConfig = z.infer<typeof QueryAgentConfigSchema>;
export type FetchAgentConfig = z.infer<typeof FetchAgentConfigSchema>;
export type SynthesisAgentConfig = z.infer<typeof SynthesisAgentConfigSchema>;
