import { z } from 'zod';
import { Task, TaskConfig, TaskMetadata, TaskResult } from '@agent-forge/core';

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

// Re-export core package types
export { Task, TaskConfig, TaskMetadata, TaskResult };

// Agent Types
export interface SearchResult {
  url: string;
  title: string;
  content: string;
  score: number;
}

export interface AgentMessage {
  type: MessageType;
  source: string;
  target: string;
  data: any;
}

export interface SecurityConfig {
  encryption?: {
    messages?: boolean;
    state?: boolean;
  };
  audit?: {
    enabled?: boolean;
    level?: 'basic' | 'detailed';
  };
}

export interface AgentConfig {
  agentType?: string;
  openaiApiKey: string;
  tavilyApiKey: string;
  logLevel?: string;
  encryptionKey?: string;
  securityConfig?: SecurityConfig;
  synthesisAgentId?: string;
  fetchAgentId?: string;
  queryAgentId?: string;
  type: string;
  id: string;
  name: string;
  capabilities: string[];
  maxConcurrentTasks: number;
  retryAttempts: number;
}

export interface QueryAgentConfig extends AgentConfig {
  fetchAgentId: string;
}

export interface FetchAgentConfig extends AgentConfig {
  synthesisAgentId: string;
}

export interface SynthesisAgentConfig extends AgentConfig {}
