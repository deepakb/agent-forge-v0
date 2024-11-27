import type { Redis as RedisClient } from 'ioredis';
import Redis from 'ioredis';
import { EventEmitter } from 'eventemitter3';
import { AgentState, StateEvent, StateEventEmitter, StateStore, Task, Workflow } from '../types';

export interface RedisStateStoreConfig {
  redisUrl?: string;
  namespace?: string;
  ttl?: number; // Time to live in seconds
}

export class RedisStateStore implements StateStore, StateEventEmitter {
  private readonly client: RedisClient;
  private readonly namespace: string;
  private readonly ttl: number;
  private readonly events: EventEmitter;
  private inTransaction: boolean = false;
  private pipeline: ReturnType<RedisClient['pipeline']> | null = null;

  constructor(config: RedisStateStoreConfig = {}) {
    this.namespace = config.namespace || 'agent-forge';
    this.ttl = config.ttl || 24 * 60 * 60; // 24 hours default
    this.events = new EventEmitter();
    this.client = new Redis(config.redisUrl || 'redis://localhost:6379');
  }

  // Agent State Operations
  public async getAgentState(agentId: string): Promise<AgentState | null> {
    const key = this.getKey('agent', agentId);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async updateAgentState(agentId: string, state: Partial<AgentState>): Promise<void> {
    const key = this.getKey('agent', agentId);
    const currentState = await this.getAgentState(agentId);
    const newState = { ...currentState, ...state };

    await this.setWithTransaction(key, JSON.stringify(newState));
    await this.emit({
      type: 'AGENT_STATE_CHANGED',
      timestamp: new Date(),
      entityId: agentId,
      entityType: 'AGENT',
      previousState: currentState,
      currentState: newState,
    });
  }

  public async deleteAgentState(agentId: string): Promise<void> {
    const key = this.getKey('agent', agentId);
    await this.client.del(key);
  }

  public async listAgents(): Promise<string[]> {
    const pattern = this.getKey('agent', '*');
    const keys = await this.client.keys(pattern);
    return keys.map((key: string) => key.split(':').pop()!);
  }

  // Task State Operations
  public async getTaskState(taskId: string): Promise<Task | null> {
    const key = this.getKey('task', taskId);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async updateTaskState(taskId: string, state: Partial<Task>): Promise<void> {
    const key = this.getKey('task', taskId);
    const currentState = await this.getTaskState(taskId);
    const newState = { ...currentState, ...state };

    await this.setWithTransaction(key, JSON.stringify(newState));
    await this.emit({
      type: 'TASK_STATE_CHANGED',
      timestamp: new Date(),
      entityId: taskId,
      entityType: 'TASK',
      previousState: currentState,
      currentState: newState,
    });
  }

  public async deleteTaskState(taskId: string): Promise<void> {
    const key = this.getKey('task', taskId);
    await this.client.del(key);
  }

  public async listTasks(filter?: Record<string, unknown>): Promise<string[]> {
    const pattern = this.getKey('task', '*');
    const keys = await this.client.keys(pattern);

    if (!filter) {
      return keys.map((key: string) => key.split(':').pop()!);
    }

    const tasks: string[] = [];
    for (const key of keys) {
      const task = await this.getTaskState(key.split(':').pop()!);
      if (task && this.matchesFilter(task, filter)) {
        tasks.push(task.config.id);
      }
    }
    return tasks;
  }

  // Workflow State Operations
  public async getWorkflowState(workflowId: string): Promise<Workflow | null> {
    const key = this.getKey('workflow', workflowId);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async updateWorkflowState(workflowId: string, state: Partial<Workflow>): Promise<void> {
    const key = this.getKey('workflow', workflowId);
    const currentState = await this.getWorkflowState(workflowId);
    const newState = { ...currentState, ...state };

    await this.setWithTransaction(key, JSON.stringify(newState));
    await this.emit({
      type: 'WORKFLOW_STATE_CHANGED',
      timestamp: new Date(),
      entityId: workflowId,
      entityType: 'WORKFLOW',
      previousState: currentState,
      currentState: newState,
    });
  }

  public async deleteWorkflowState(workflowId: string): Promise<void> {
    const key = this.getKey('workflow', workflowId);
    await this.client.del(key);
  }

  public async listWorkflows(filter?: Record<string, unknown>): Promise<string[]> {
    const pattern = this.getKey('workflow', '*');
    const keys = await this.client.keys(pattern);

    if (!filter) {
      return keys.map((key: string) => key.split(':').pop()!);
    }

    const workflows: string[] = [];
    for (const key of keys) {
      const workflow = await this.getWorkflowState(key.split(':').pop()!);
      if (workflow && this.matchesFilter(workflow, filter)) {
        workflows.push(workflow.config.id);
      }
    }
    return workflows;
  }

  // Transaction Support
  public async beginTransaction(): Promise<void> {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress');
    }
    this.inTransaction = true;
    this.pipeline = this.client.pipeline();
  }

  public async commitTransaction(): Promise<void> {
    if (!this.inTransaction || !this.pipeline) {
      throw new Error('No transaction in progress');
    }
    await this.pipeline.exec();
    this.inTransaction = false;
    this.pipeline = null;
  }

  public async rollbackTransaction(): Promise<void> {
    if (!this.inTransaction || !this.pipeline) {
      throw new Error('No transaction in progress');
    }
    this.pipeline.discard();
    this.inTransaction = false;
    this.pipeline = null;
  }

  // Event Emitter Implementation
  public async emit(event: StateEvent): Promise<void> {
    this.events.emit(event.type, event);
    this.events.emit('*', event);
  }

  public on(type: '*' | StateEvent['type'], handler: (event: StateEvent) => Promise<void>): void {
    this.events.on(type, handler);
  }

  public off(type: '*' | StateEvent['type'], handler: (event: StateEvent) => Promise<void>): void {
    this.events.off(type, handler);
  }

  // Helper Methods
  private getKey(type: string, id: string): string {
    return `${this.namespace}:${type}:${id}`;
  }

  private async setWithTransaction(key: string, value: string): Promise<void> {
    if (this.inTransaction && this.pipeline) {
      this.pipeline.set(key, value, 'EX', this.ttl);
    } else {
      await this.client.set(key, value, 'EX', this.ttl);
    }
  }

  private matchesFilter(obj: any, filter: Record<string, unknown>): boolean {
    return Object.entries(filter).every(([key, value]) => {
      const parts = key.split('.');
      let current = obj;
      for (const part of parts) {
        if (current === undefined || current === null) return false;
        current = current[part];
      }
      return current === value;
    });
  }

  public async close(): Promise<void> {
    await this.client.quit();
    this.events.removeAllListeners();
  }
}
