import { Logger } from '@agent-forge/shared';
import axios from 'axios';
import { SearchResult, TavilySearchOptions } from '../types';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env') });

export class TavilyHelper {
  private static readonly API_KEY = process.env.TAVILY_API_KEY;
  private static readonly API_URL = 'https://api.tavily.com/search';

  public static async search(
    query: string,
    options: TavilySearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      Logger.info('Performing Tavily search', {
        query,
        apiKeySet: !!this.API_KEY,
        apiKeyValue: this.API_KEY,
      });

      if (!this.API_KEY) {
        throw new Error('TAVILY_API_KEY environment variable is not set');
      }

      const response = await axios.post(
        this.API_URL,
        {
          query,
          max_results: options.maxResults || 3,
          search_depth: options.searchDepth || 'advanced',
          include_urls: options.includeUrls,
          exclude_urls: options.excludeUrls,
          include_domains: options.includeDomainsOnly,
          exclude_domains: options.excludeDomainsOnly,
          api_key: this.API_KEY,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const results = response.data.results || [];

      Logger.info('Tavily search completed', {
        query,
        resultCount: results.length,
      });

      return results.map((result: any) => ({
        title: result.title || '',
        url: result.url || '',
        content: result.content || '',
        score: result.score || 0,
      }));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        Logger.error('Error performing Tavily search', {
          query,
          error: {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          },
        });
      } else {
        Logger.error('Error performing Tavily search', {
          query,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    }
  }
}
