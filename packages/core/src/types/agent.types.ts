import { Task, TaskResult } from './task';

export interface AgentConfig {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  maxConcurrentTasks: number;
  retryAttempts: number;
}

export interface AgentMetadata {
  startTime: Date;
  lastHeartbeat: Date;
  currentTasks: string[];
  completedTasks: number;
  failedTasks: number;
  status: AgentStatus;
}

export type AgentStatus = 'INITIALIZING' | 'IDLE' | 'BUSY' | 'PAUSED' | 'ERROR' | 'TERMINATED';

export type MessageHandler = (message: any) => Promise<void>;

export type { Task, TaskResult };
