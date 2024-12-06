import { BaseAgent, Task, TaskResult, Message, MessageHandler } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';

/**
 * Agent responsible for preprocessing text data
 */
export class PreprocessorAgent extends BaseAgent {
  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const { text } = task.config.data;
      
      // Perform text preprocessing
      const processedText = this.preprocessText(text);
      
      // Send the processed text to the analyzer agent
      await this.sendToAnalyzer(processedText, task.config.id);

      return {
        success: true,
        data: { processedText }
      };
    } catch (error) {
      Logger.error('Preprocessor failed', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private preprocessText(text: string): string {
    // Simple preprocessing steps
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  private async sendToAnalyzer(text: string, correlationId: string): Promise<void> {
    const message: Message = {
      id: `prep-${correlationId}`,
      type: 'TEXT_PROCESSED',
      sender: this.id,
      recipient: 'analyzer-agent',
      timestamp: new Date(),
      payload: { text },
      correlationId
    };

    await this.messageBroker.publish(message);
  }

  protected async setupMessageHandlers(): Promise<void> {
    const handler: MessageHandler = {
      type: 'TEXT_SUBMIT',
      handler: async (message: Message) => {
        const task: Task = {
          config: {
            id: message.correlationId || message.id,
            type: 'preprocess',
            priority: 'MEDIUM',
            data: message.payload
          },
          metadata: {
            status: 'PENDING',
            createdAt: new Date()
          }
        };

        await this.handleTask(task);
      }
    };

    await this.messageBroker.subscribe(handler);
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('Preprocessor agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Preprocessor agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Preprocessor agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Preprocessor agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Preprocessor agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Preprocessor agent terminated', { agentId: this.id });
  }
}
