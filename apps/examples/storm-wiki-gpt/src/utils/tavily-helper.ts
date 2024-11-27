import axios from 'axios';
import { SearchResult, TavilySearchOptions } from '../types';
import { LoggerService, LogContext } from './logger';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.resolve(__dirname, '../../.env') });

export class TavilyHelper {
  private static readonly API_KEY = process.env.TAVILY_API_KEY;
  private static readonly API_URL = 'https://api.tavily.com/search';
  private static readonly logger = LoggerService.getInstance();

  public static async search(
    query: string,
    options: TavilySearchOptions = {}
  ): Promise<SearchResult[]> {
    const startTime = Date.now();
    const context: LogContext = {
      component: 'TavilyHelper',
      operation: 'search',
    };

    try {
      this.logger.info('Initiating search request', {
        ...context,
        query,
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
      const duration = Date.now() - startTime;

      this.logger.trace('search', {
        ...context,
        status: 'success',
        resultCount: results.length,
        duration,
      });

      return results.map((result: any) => ({
        title: result.title || '',
        url: result.url || '',
        content: result.content || '',
        score: result.score || 0,
      }));
    } catch (error) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        this.logger.error('Search request failed', {
          ...context,
          error: {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          },
          duration,
        });
      } else {
        this.logger.error('Search operation failed', {
          ...context,
          error,
          duration,
        });
      }
      throw error;
    }
  }
}
