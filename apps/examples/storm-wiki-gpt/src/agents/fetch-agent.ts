import { BaseAgent } from './base-agent';
import { AgentMessage, FetchAgentConfig, MessageType, SearchResult, TaskResult } from '../types';
import { TavilyHelper } from '../utils/tavily-helper';

export class FetchAgent extends BaseAgent {
  private tavily: TavilyHelper;
  private synthesisAgentId: string;

  constructor(config: FetchAgentConfig) {
    super(config);
    this.tavily = new TavilyHelper(config);
    this.synthesisAgentId = config.synthesisAgentId;
  }

  public async handleMessage(message: AgentMessage): Promise<TaskResult> {
    try {
      if (message.type !== MessageType.SEARCH_QUERIES) {
        throw new Error(`Invalid message type for FetchAgent: ${message.type}`);
      }

      const queries = message.data as string[];
      this.logger.info('Processing search queries', {
        agentId: this.getId(),
        queryCount: queries.length,
      });

      const results: SearchResult[] = [];
      for (const query of queries) {
        try {
          const queryResults = await this.tavily.search(query);
          results.push(...queryResults);
        } catch (error) {
          this.logger.error('Failed to process query', error instanceof Error ? error : new Error('Unknown error'), {
            agentId: this.getId(),
            query,
          });
        }
      }

      // Sort results by score and remove duplicates
      const uniqueResults = Array.from(
        new Map(results.map(r => [r.url, r])).values()
      ).sort((a, b) => b.score - a.score);

      this.logger.info('Search completed', {
        agentId: this.getId(),
        resultCount: uniqueResults.length,
      });

      const nextMessage: AgentMessage = {
        type: MessageType.SEARCH_RESULTS,
        source: this.getId(),
        target: this.synthesisAgentId,
        data: uniqueResults,
      };

      await this.publishMessage(nextMessage);

      return {
        success: true,
        message: nextMessage,
      };
    } catch (error) {
      this.logger.error('Fetch agent failed', error instanceof Error ? error : new Error('Unknown error'));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
