import { AgentConfig, SearchResult } from '../types';
import { LoggerService } from './logger';

export class TavilyHelper {
  private apiKey: string;
  private logger: LoggerService;
  private retryDelay = 1000; // Start with 1 second
  private maxRetries = 3;

  constructor(config: AgentConfig) {
    this.logger = LoggerService.getInstance();

    if (!config.tavilyApiKey) {
      const error = new Error('Tavily API key is required');
      this.logger.error('Failed to initialize TavilyHelper', error);
      throw error;
    }

    this.apiKey = config.tavilyApiKey;
    this.logger.info('TavilyHelper initialized successfully');
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async searchWithRetry(query: string, attempt = 1): Promise<SearchResult[]> {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          search_depth: 'advanced',
          include_answer: false,
          include_raw_content: false,
          include_domains: [],
          exclude_domains: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(`Tavily API error: ${response.status} - ${response.statusText}`);
        this.logger.error('API request failed', error, {
          statusCode: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw error;
      }

      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid response format from Tavily API');
      }

      return data.results.map((result: any) => ({
        url: result.url,
        title: result.title,
        content: result.content,
        score: result.relevance_score || 0,
      }));
    } catch (error) {
      if (error instanceof Error) {
        if (attempt <= this.maxRetries) {
          const nextDelay = this.retryDelay * Math.pow(2, attempt - 1);
          this.logger.info('Retrying Tavily API request...', {
            attempt,
            nextDelay,
            errorMessage: error.message,
          });
          await this.delay(nextDelay);
          return this.searchWithRetry(query, attempt + 1);
        }
      }
      throw error;
    }
  }

  public async search(query: string): Promise<SearchResult[]> {
    try {
      this.logger.info('Starting Tavily search', { query });
      const results = await this.searchWithRetry(query);
      this.logger.info('Tavily search completed', {
        query,
        resultCount: results.length,
      });
      return results;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error('Tavily search failed', errorObj, {
        query,
      });
      throw errorObj;
    }
  }
}
