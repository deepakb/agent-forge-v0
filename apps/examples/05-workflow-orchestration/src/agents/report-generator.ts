import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';

export class ReportGenerator extends BaseAgent {
  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const { sentiment, topics, keyPhrases } = task.config.data;
      
      // Generate summary report
      const summary = this.generateSummary(sentiment, topics, keyPhrases);
      
      return {
        success: true,
        data: { summary }
      };
    } catch (error) {
      Logger.error('Report generation failed', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateSummary(sentiment: string, topics: string[], keyPhrases: string[]): string {
    return `
Document Analysis Summary:
------------------------
Sentiment: ${sentiment}
Main Topics: ${topics.join(', ')}
Key Phrases: ${keyPhrases.join(', ')}

Overall Assessment:
This document discusses ${topics[0]} with a ${sentiment.toLowerCase()} tone.
Key concepts include ${keyPhrases.slice(0, 2).join(' and ')}.
    `.trim();
  }

  protected async setupMessageHandlers(): Promise<void> {
    // No message handlers needed for this example
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('Report generator initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Report generator started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Report generator stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Report generator paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Report generator resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Report generator terminated', { agentId: this.id });
  }
}
