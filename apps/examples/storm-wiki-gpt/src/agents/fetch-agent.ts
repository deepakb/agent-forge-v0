import { BaseWikiAgent } from './base-wiki-agent';
import { AgentMessage, MessageType, SearchResult, Task, TaskConfig, TaskMetadata, AgentConfig, Query } from '../types';
import { TavilyHelper } from '../utils/tavily-helper';

export class FetchAgent extends BaseWikiAgent {
  private tavily: TavilyHelper;

  constructor(config: AgentConfig) {
    super({
      ...config,
      agentType: 'FetchAgent',
    });
    this.tavily = new TavilyHelper(config);
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    try {
      const startTime = await this.beforeOperation('handleMessage', {
        messageType: message.type,
        source: message.source,
      });

      const task = message.data as Task;

      switch (message.type) {
        case MessageType.SEARCH_QUERIES:
          const searchQueries = task.result?.data as string[];
          const searchResults = await this.fetchContent(searchQueries);
          
          const nextTaskConfig: TaskConfig = {
            id: `synthesis-${Date.now()}`,
            type: MessageType.SEARCH_RESULTS,
            priority: task.config.priority,
            retryAttempts: task.config.retryAttempts,
            dependencies: [task.config.id],
            requiredCapabilities: ['synthesis']
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
              data: searchResults
            }
          };

          await this.sendMessage({
            type: MessageType.SEARCH_RESULTS,
            source: this.getId(),
            target: 'SynthesisAgent',
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

  private async fetchContent(queries: string[]): Promise<SearchResult[]> {
    try {
      const startTime = await this.beforeOperation('fetchContent', {
        queryCount: queries.length,
      });

      const searchPromises = queries.map(async (query) => {
        const queryStartTime = await this.beforeOperation('searchQuery', { query });
        const results = await this.tavily.search(query);
        await this.afterOperation('searchQuery', queryStartTime, results, {
          query,
          resultCount: results.length,
        });
        return results;
      });

      const allResults = await Promise.all(searchPromises);
      const flattenedResults = allResults.flat();

      // Deduplicate results by URL
      const uniqueResults = Array.from(
        new Map(flattenedResults.map(item => [item.url, item])).values()
      );

      return await this.afterOperation('fetchContent', startTime, uniqueResults, {
        queryCount: queries.length,
        resultCount: uniqueResults.length,
      });
    } catch (error) {
      return await this.handleError('fetchContent', error as Error, {
        queryCount: queries.length,
      });
    }
  }
}
