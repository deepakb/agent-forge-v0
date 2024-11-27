import { AgentConfig, Task, TaskConfig, TaskMetadata } from '../types';
import { BaseWikiAgent } from './base-wiki-agent';
import { AgentMessage, MessageType } from '../types';
import { OpenAIHelper } from '../utils/openai-helper';

export class QueryAgent extends BaseWikiAgent {
  private openai: OpenAIHelper;

  constructor(config: AgentConfig) {
    const baseConfig = {
      id: `query-agent-${Date.now()}`,
      name: 'QueryAgent',
      type: 'WIKI',
      capabilities: ['query'],
      maxConcurrentTasks: 1,
      retryAttempts: 3,
      ...config,
    };
    
    super({
      ...baseConfig,
      agentType: 'QueryAgent',
    });
    
    this.openai = new OpenAIHelper(baseConfig);
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    try {
      const startTime = await this.beforeOperation('handleMessage', {
        messageType: message.type,
        source: message.source,
      });

      const task = message.data as Task;
      
      switch (message.type) {
        case MessageType.QUERY:
          const searchQueries = await this.generateQueries(task.result?.data as string);
          
          const nextTaskConfig: TaskConfig = {
            id: `search-${Date.now()}`,
            type: MessageType.SEARCH_QUERIES,
            priority: task.config.priority,
            retryAttempts: task.config.retryAttempts,
            dependencies: [task.config.id],
            requiredCapabilities: ['fetch']
          };

          const nextTaskMetadata: TaskMetadata = {
            status: 'PENDING',
            createdAt: new Date(),
            attempts: 0,
            progress: 0
          };

          const nextTask: Task = {
            config: nextTaskConfig,
            metadata: nextTaskMetadata,
            result: {
              success: true,
              data: searchQueries
            }
          };

          await this.sendMessage({
            type: MessageType.SEARCH_QUERIES,
            source: this.getId(),
            target: 'FetchAgent',
            data: nextTask
          });
          break;
        default:
          this.logger.warn('Received unsupported message type', {
            messageType: message.type,
            source: message.source,
          });
      }

      await this.afterOperation('handleMessage', startTime, undefined, {
        messageType: message.type,
        source: message.source,
      });
    } catch (error) {
      await this.handleError('handleMessage', error as Error, {
        messageType: message.type,
        source: message.source,
      });
    }
  }

  private async generateQueries(query: string): Promise<string[]> {
    try {
      const startTime = await this.beforeOperation('generateQueries', { query });

      const prompt = `Given the topic "${query}", generate 3-5 specific search queries that would help gather comprehensive information for writing a Wikipedia-style article. Each query should focus on different aspects of the topic.

Requirements:
1. Make queries specific and focused
2. Include factual and historical queries
3. Cover different aspects of the topic
4. Aim for authoritative sources
5. Keep queries concise

Format: Return only the queries, one per line.`;

      const response = await this.openai.complete(prompt);
      const queries = response
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      return await this.afterOperation('generateQueries', startTime, queries, {
        query,
        queryCount: queries.length,
      });
    } catch (error) {
      return await this.handleError('generateQueries', error as Error, { query });
    }
  }
}
