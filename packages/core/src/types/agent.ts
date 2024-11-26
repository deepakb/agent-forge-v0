import { z } from 'zod';

export const AgentStatusSchema = z.enum([
  'INITIALIZING',
  'IDLE',
  'BUSY',
  'PAUSED',
  'ERROR',
  'TERMINATED',
]);

export type AgentStatus = z.infer<typeof AgentStatusSchema>;

export const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  capabilities: z.array(z.string()),
  maxConcurrentTasks: z.number().default(1),
  retryAttempts: z.number().default(3),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;

export const AgentMetadataSchema = z.object({
  startTime: z.date(),
  lastHeartbeat: z.date(),
  currentTasks: z.array(z.string()),
  completedTasks: z.number().default(0),
  failedTasks: z.number().default(0),
  status: AgentStatusSchema,
});

export type AgentMetadata = z.infer<typeof AgentMetadataSchema>;

export interface AgentState {
  config: AgentConfig;
  metadata: AgentMetadata;
}

export interface AgentLifecycle {
  initialize(config: AgentConfig): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  terminate(): Promise<void>;
}
