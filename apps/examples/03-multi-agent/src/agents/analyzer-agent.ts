import { BaseAgent, Task, TaskResult, Message, MessageHandler } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';

/**
 * Agent responsible for analyzing preprocessed text
 */
export class AnalyzerAgent extends BaseAgent {
  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const { text } = task.config.data;
      
      // Perform text analysis
      const analysis = this.analyzeText(text);
      
      // Send analysis results to the reporter agent
      await this.sendToReporter(analysis, task.config.id);

      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      Logger.error('Analyzer failed', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private analyzeText(text: string): any {
    // Simple text analysis
    const words = text.split(/\s+/);
    const analysis = {
      wordCount: words.length,
      uniqueWords: new Set(words).size,
      averageWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
      mostCommonWords: this.findMostCommonWords(words, 5)
    };

    return analysis;
  }

  private findMostCommonWords(words: string[], limit: number): Array<[string, number]> {
    const frequency: Map<string, number> = new Map();
    words.forEach(word => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  private async sendToReporter(analysis: any, correlationId: string): Promise<void> {
    const message: Message = {
      id: `analysis-${correlationId}`,
      type: 'TEXT_ANALYZED',
      sender: this.id,
      recipient: 'reporter-agent',
      timestamp: new Date(),
      payload: { analysis },
      correlationId
    };

    await this.messageBroker.publish(message);
  }

  protected async setupMessageHandlers(): Promise<void> {
    const handler: MessageHandler = {
      type: 'TEXT_PROCESSED',
      handler: async (message: Message) => {
        const task: Task = {
          config: {
            id: message.correlationId || message.id,
            type: 'analyze',
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
    Logger.info('Analyzer agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Analyzer agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Analyzer agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Analyzer agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Analyzer agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Analyzer agent terminated', { agentId: this.id });
  }
}
