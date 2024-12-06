import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';

export class DocumentProcessor extends BaseAgent {
  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      switch (task.config.type) {
        case 'EXTRACT_CONTENT':
          return await this.extractContent(task);
        default:
          throw new Error(`Unsupported task type: ${task.config.type}`);
      }
    } catch (error) {
      Logger.error('Document processing failed', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async extractContent(task: Task): Promise<TaskResult> {
    const { documentId } = task.config.data;

    // Simulate document content extraction
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      data: {
        content: `This is the extracted content from document ${documentId}. 
                 It contains important information about Agent Forge and its capabilities.
                 The framework provides excellent support for building autonomous agents.`
      }
    };
  }

  protected async setupMessageHandlers(): Promise<void> {
    // No message handlers needed for this example
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('Document processor initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Document processor started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Document processor stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Document processor paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Document processor resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Document processor terminated', { agentId: this.id });
  }
}
