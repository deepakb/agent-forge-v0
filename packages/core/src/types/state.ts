import { z } from 'zod';
import { AgentState } from './agent';
import { Task } from './task';
import { Workflow } from './workflow';

export const StateEventTypeSchema = z.enum([
  'AGENT_STATE_CHANGED',
  'TASK_STATE_CHANGED',
  'WORKFLOW_STATE_CHANGED',
  'STATE_SYNC_REQUESTED',
  'STATE_SYNC_COMPLETED',
]);

export type StateEventType = z.infer<typeof StateEventTypeSchema>;

export const StateEventSchema = z.object({
  type: StateEventTypeSchema,
  timestamp: z.date(),
  entityId: z.string(),
  entityType: z.enum(['AGENT', 'TASK', 'WORKFLOW']),
  previousState: z.unknown().optional(),
  currentState: z.unknown(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type StateEvent = z.infer<typeof StateEventSchema>;

export interface StateStore {
  // Agent State Operations
  getAgentState(agentId: string): Promise<AgentState | null>;
  updateAgentState(agentId: string, state: Partial<AgentState>): Promise<void>;
  deleteAgentState(agentId: string): Promise<void>;
  listAgents(): Promise<string[]>;

  // Task State Operations
  getTaskState(taskId: string): Promise<Task | null>;
  updateTaskState(taskId: string, state: Partial<Task>): Promise<void>;
  deleteTaskState(taskId: string): Promise<void>;
  listTasks(filter?: Record<string, unknown>): Promise<string[]>;

  // Workflow State Operations
  getWorkflowState(workflowId: string): Promise<Workflow | null>;
  updateWorkflowState(workflowId: string, state: Partial<Workflow>): Promise<void>;
  deleteWorkflowState(workflowId: string): Promise<void>;
  listWorkflows(filter?: Record<string, unknown>): Promise<string[]>;

  // Transaction Support
  beginTransaction(): Promise<void>;
  commitTransaction(): Promise<void>;
  rollbackTransaction(): Promise<void>;
}

export interface StateEventEmitter {
  emit(event: StateEvent): Promise<void>;
  on(type: StateEventType, handler: (event: StateEvent) => Promise<void>): void;
  off(type: StateEventType, handler: (event: StateEvent) => Promise<void>): void;
}

export interface StateSynchronizer {
  requestSync(entityType: 'AGENT' | 'TASK' | 'WORKFLOW', entityId: string): Promise<void>;
  syncState(event: StateEvent): Promise<void>;
  getLastSyncTimestamp(entityType: 'AGENT' | 'TASK' | 'WORKFLOW', entityId: string): Promise<Date>;
}

export interface StateVersioning {
  createVersion(
    entityType: 'AGENT' | 'TASK' | 'WORKFLOW',
    entityId: string,
    state: unknown
  ): Promise<string>;
  getVersion(versionId: string): Promise<unknown>;
  listVersions(entityType: 'AGENT' | 'TASK' | 'WORKFLOW', entityId: string): Promise<string[]>;
  revertToVersion(versionId: string): Promise<void>;
}
