import { BaseAgent, Task, TaskResult, StateStore } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';

/**
 * An agent that demonstrates state persistence and recovery
 */
export class StatefulAgent extends BaseAgent {
  private stateStore: StateStore;
  private taskHistory: Map<string, TaskResult> = new Map();

  constructor(config: any, stateStore: StateStore) {
    super(config);
    this.stateStore = stateStore;
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      // Update task state to in progress
      await this.stateStore.updateTaskState(task.config.id, {
        ...task,
        metadata: {
          ...task.metadata,
          status: 'IN_PROGRESS',
          startedAt: new Date()
        }
      });

      // Simulate task processing
      const result = await this.processTask(task);

      // Store task result
      this.taskHistory.set(task.config.id, result);

      // Update task state to completed
      await this.stateStore.updateTaskState(task.config.id, {
        ...task,
        metadata: {
          ...task.metadata,
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      return result;
    } catch (error) {
      Logger.error('Task execution failed', { error, taskId: task.config.id });

      // Update task state to failed
      await this.stateStore.updateTaskState(task.config.id, {
        ...task,
        metadata: {
          ...task.metadata,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async processTask(task: Task): Promise<TaskResult> {
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        processedAt: new Date(),
        taskType: task.config.type,
        result: `Processed task ${task.config.id}`
      }
    };
  }

  protected async onInitialize(): Promise<void> {
    // Recover state from previous run if exists
    const state = await this.stateStore.getAgentState(this.id);
    if (state) {
      Logger.info('Recovered agent state', { agentId: this.id, state });
      // Restore agent configuration
      this.config = state.config;
    }

    // Subscribe to state events
    this.stateStore.on('AGENT_STATE_CHANGED', async (event) => {
      if (event.entityId === this.id) {
        Logger.info('Agent state changed', { event });
      }
    });

    Logger.info('Stateful agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    // Update agent state
    await this.stateStore.updateAgentState(this.id, {
      config: this.config,
      metadata: {
        ...this.metadata,
        status: 'IDLE'
      }
    });

    Logger.info('Stateful agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    // Update agent state
    await this.stateStore.updateAgentState(this.id, {
      config: this.config,
      metadata: {
        ...this.metadata,
        status: 'TERMINATED'
      }
    });

    Logger.info('Stateful agent stopped', { agentId: this.id });
  }

  public async getTaskHistory(taskId: string): Promise<TaskResult | undefined> {
    return this.taskHistory.get(taskId);
  }

  protected async setupMessageHandlers(): Promise<void> {
    // No message handlers needed for this example
  }

  protected async onPause(): Promise<void> {
    await this.stateStore.updateAgentState(this.id, {
      config: this.config,
      metadata: {
        ...this.metadata,
        status: 'PAUSED'
      }
    });
  }

  protected async onResume(): Promise<void> {
    await this.stateStore.updateAgentState(this.id, {
      config: this.config,
      metadata: {
        ...this.metadata,
        status: 'IDLE'
      }
    });
  }

  protected async onTerminate(): Promise<void> {
    await this.stateStore.updateAgentState(this.id, {
      config: this.config,
      metadata: {
        ...this.metadata,
        status: 'TERMINATED'
      }
    });
  }
}
