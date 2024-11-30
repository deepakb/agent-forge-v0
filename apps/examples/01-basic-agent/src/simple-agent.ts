import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';

/**
 * A simple agent that processes text transformation tasks
 */
export class SimpleAgent extends BaseAgent {
  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const { operation, text } = task.config.data;
      let result: string;

      switch (operation) {
        case 'uppercase':
          result = text.toUpperCase();
          break;
        case 'lowercase':
          result = text.toLowerCase();
          break;
        case 'reverse':
          result = text.split('').reverse().join('');
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        success: true,
        data: { result }
      };
    } catch (error) {
      Logger.error('Failed to execute task', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('Simple agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Simple agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Simple agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Simple agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Simple agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Simple agent terminated', { agentId: this.id });
  }

  protected async setupMessageHandlers(): Promise<void> {
    // No message handlers needed for this simple example
  }
}
