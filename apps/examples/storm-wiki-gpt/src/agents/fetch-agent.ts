import { Logger } from '@agent-forge/shared';
import { BaseWikiAgent } from './base-wiki-agent';
import { TavilyHelper } from '../utils/tavily-helper';
import {
  AgentMessage,
  AgentType,
  MessageType,
  Query,
  QueryMessageData,
  SearchResult,
  SearchResultsMessageData,
  TavilySearchOptions,
} from '../types';

export class FetchAgent extends BaseWikiAgent {
  constructor() {
    super(AgentType.FETCH);
  }

  public async handleMessage(message: AgentMessage): Promise<void> {
    try {
      Logger.info('FetchAgent handling message', {
        messageType: message.type,
      });

      if (message.type === MessageType.QUERY) {
        const queryData = message.data as QueryMessageData;
        await this.handleQueryMessage(queryData);
      }
    } catch (error) {
      Logger.error('Error handling message in FetchAgent', {
        messageType: message.type,
        error,
      });
      throw error;
    }
  }

  private async handleQueryMessage(query: Query): Promise<void> {
    try {
      Logger.info('FetchAgent processing query', { query });

      // Prepare search options
      const searchOptions: TavilySearchOptions = {
        maxResults: query.maxResults,
        searchDepth: 'advanced',
      };

      // Perform search using TavilyHelper
      const searchResults = await TavilyHelper.search(query.query, searchOptions);

      // Format the results
      const formattedResults = this.formatSearchResults(searchResults);

      // Create search results message data
      const searchResultsData: SearchResultsMessageData = {
        query: query.query,
        results: formattedResults,
      };

      // Send results to synthesis agent
      await this.sendMessage({
        type: MessageType.SEARCH_RESULTS,
        data: searchResultsData,
        source: AgentType.FETCH,
        target: AgentType.SYNTHESIS,
      });

      Logger.info('FetchAgent sent search results', {
        query: query.query,
        resultCount: formattedResults.length,
      });
    } catch (error) {
      Logger.error('Error processing query in FetchAgent', {
        query,
        error,
      });
      throw error;
    }
  }

  private formatSearchResults(results: any[]): SearchResult[] {
    try {
      return results.map((result) => ({
        title: result.title || '',
        url: result.url || '',
        content: result.content || '',
        score: result.score || 0,
      }));
    } catch (error) {
      Logger.error('Error formatting search results', { error });
      throw error;
    }
  }

  public async start(): Promise<void> {
    await super.start();
    Logger.info('FetchAgent started successfully', { agentId: this.id });
  }

  public async stop(): Promise<void> {
    await super.stop();
    Logger.info('FetchAgent stopped successfully', { agentId: this.id });
  }
}
