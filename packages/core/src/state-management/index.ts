/**
 * State Management in Agent Forge
 * 
 * The core package provides interfaces for state management but does not include
 * any specific implementation. This allows consumers to:
 * 
 * 1. Implement their own storage solution
 * 2. Use community-provided implementations
 * 3. Use a simple in-memory implementation for development
 * 
 * Example implementation:
 * ```typescript
 * import { ConfigurableStateStore } from '@agent-forge/core';
 * import { StorageAdapter } from '@agent-forge/storage';
 * 
 * const storageAdapter = new StorageAdapter();
 * const stateStore = new ConfigurableStateStore(storageAdapter);
 * ```
 */
import { EventEmitter } from 'eventemitter3';
import { StorageAdapter } from '../storage';
import { StateStore, StateEvent, StateEventType, StateEventEmitter, StateSynchronizer } from '../types/state';
import { AgentState } from '../types/agent';
import { Task } from '../types/task';
import { Workflow } from '../types/workflow';

export class ConfigurableStateStore implements StateStore, StateEventEmitter {
    private events: EventEmitter;

    constructor(private storage: StorageAdapter) {
        this.events = new EventEmitter();
    }

    // Agent State Operations
    async getAgentState(agentId: string): Promise<AgentState | null> {
        return this.storage.get(`agent:${agentId}`);
    }

    async updateAgentState(agentId: string, state: Partial<AgentState>): Promise<void> {
        const current = await this.getAgentState(agentId) || {};
        const newState = { ...current, ...state };
        await this.storage.set(`agent:${agentId}`, newState);
        await this.emit({
            type: 'AGENT_STATE_CHANGED',
            timestamp: new Date(),
            entityId: agentId,
            entityType: 'AGENT',
            previousState: current,
            currentState: newState,
        });
    }

    async deleteAgentState(agentId: string): Promise<void> {
        await this.storage.delete(`agent:${agentId}`);
    }

    async listAgents(): Promise<string[]> {
        const keys = await this.storage.list('agent:*');
        return keys.map(key => key.replace('agent:', ''));
    }

    // Task State Operations
    async getTaskState(taskId: string): Promise<Task | null> {
        return this.storage.get(`task:${taskId}`);
    }

    async updateTaskState(taskId: string, state: Partial<Task>): Promise<void> {
        const current = await this.getTaskState(taskId) || {};
        const newState = { ...current, ...state };
        await this.storage.set(`task:${taskId}`, newState);
        await this.emit({
            type: 'TASK_STATE_CHANGED',
            timestamp: new Date(),
            entityId: taskId,
            entityType: 'TASK',
            previousState: current,
            currentState: newState,
        });
    }

    async deleteTaskState(taskId: string): Promise<void> {
        await this.storage.delete(`task:${taskId}`);
    }

    async listTasks(filter?: Record<string, unknown>): Promise<string[]> {
        if (this.storage.query && filter) {
            const results = await this.storage.query({ filter });
            return results.map(r => r.key.replace('task:', ''));
        }
        const keys = await this.storage.list('task:*');
        return keys.map(key => key.replace('task:', ''));
    }

    // Workflow State Operations
    async getWorkflowState(workflowId: string): Promise<Workflow | null> {
        return this.storage.get(`workflow:${workflowId}`);
    }

    async updateWorkflowState(workflowId: string, state: Partial<Workflow>): Promise<void> {
        const current = await this.getWorkflowState(workflowId) || {};
        const newState = { ...current, ...state };
        await this.storage.set(`workflow:${workflowId}`, newState);
        await this.emit({
            type: 'WORKFLOW_STATE_CHANGED',
            timestamp: new Date(),
            entityId: workflowId,
            entityType: 'WORKFLOW',
            previousState: current,
            currentState: newState,
        });
    }

    async deleteWorkflowState(workflowId: string): Promise<void> {
        await this.storage.delete(`workflow:${workflowId}`);
    }

    async listWorkflows(filter?: Record<string, unknown>): Promise<string[]> {
        if (this.storage.query && filter) {
            const results = await this.storage.query({ filter });
            return results.map(r => r.key.replace('workflow:', ''));
        }
        const keys = await this.storage.list('workflow:*');
        return keys.map(key => key.replace('workflow:', ''));
    }

    // Transaction Support
    async beginTransaction(): Promise<void> {
        if (this.storage.beginTransaction) {
            await this.storage.beginTransaction();
        }
    }

    async commitTransaction(): Promise<void> {
        if (this.storage.commitTransaction) {
            await this.storage.commitTransaction();
        }
    }

    async rollbackTransaction(): Promise<void> {
        if (this.storage.rollbackTransaction) {
            await this.storage.rollbackTransaction();
        }
    }

    // Event Emitter Implementation
    async emit(event: StateEvent): Promise<void> {
        this.events.emit(event.type, event);
    }

    on(type: StateEventType, handler: (event: StateEvent) => Promise<void>): void {
        this.events.on(type, handler);
    }

    off(type: StateEventType, handler: (event: StateEvent) => Promise<void>): void {
        this.events.off(type, handler);
    }
}

// Export types
export { StateStore, StateEvent, StateEventType, StateEventEmitter, StateSynchronizer };

// Create default store with memory adapter
export { createDefaultStorage } from '../storage';
