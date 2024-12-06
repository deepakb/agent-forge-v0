import { BaseAgent, Task, TaskResult, Message, MessageHandler } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';

/**
 * Agent responsible for generating reports from analysis results
 */
export class ReporterAgent extends BaseAgent {
  private reports: Map<string, any> = new Map();

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const { analysis } = task.config.data;
      
      // Generate report from analysis
      const report = this.generateReport(analysis);
      
      // Store report for retrieval
      this.reports.set(task.config.id, report);

      // Emit report completion event
      this.events.emit('reportComplete', {
        taskId: task.config.id,
        report
      });

      return {
        success: true,
        data: { report }
      };
    } catch (error) {
      Logger.error('Reporter failed', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private generateReport(analysis: any): any {
    // Generate a formatted report
    return {
      summary: {
        totalWords: analysis.wordCount,
        uniqueWords: analysis.uniqueWords,
        vocabularyDiversity: (analysis.uniqueWords / analysis.wordCount * 100).toFixed(2) + '%',
        averageWordLength: analysis.averageWordLength.toFixed(2)
      },
      commonWords: analysis.mostCommonWords.map(([word, count]: [string, number]) => ({
        word,
        count,
        percentage: ((count / analysis.wordCount) * 100).toFixed(2) + '%'
      })),
      timestamp: new Date().toISOString()
    };
  }

  public getReport(taskId: string): any | undefined {
    return this.reports.get(taskId);
  }

  protected async setupMessageHandlers(): Promise<void> {
    const handler: MessageHandler = {
      type: 'TEXT_ANALYZED',
      handler: async (message: Message) => {
        const task: Task = {
          config: {
            id: message.correlationId || message.id,
            type: 'report',
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
    Logger.info('Reporter agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Reporter agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Reporter agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Reporter agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Reporter agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Reporter agent terminated', { agentId: this.id });
  }
}
