import { BaseAgentConfig, SearchResult } from '../types';
import { LoggerService } from './logger';

export class TavilyHelper {
  private apiKey: string;
  private logger: LoggerService;
  private retryDelay = 1000; // Start with 1 second
  private maxRetries = 3;

  constructor(config: BaseAgentConfig) {
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
          'api-key': this.apiKey,
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
        if (response.status === 429) {
          if (attempt <= this.maxRetries) {
            this.logger.info('Rate limited by Tavily API, retrying...', {
              attempt,
              retryDelay: this.retryDelay,
            });

            await this.delay(this.retryDelay);
            // Exponential backoff
            this.retryDelay *= 2;
            return this.searchWithRetry(query, attempt + 1);
          }
          const rateLimitError = new Error(`Rate limited by Tavily API after ${attempt} attempts`);
          this.logger.error('Rate limit exceeded', rateLimitError);
          throw rateLimitError;
        }
        const apiError = new Error(`Tavily API error: ${response.status} - ${errorData.message || response.statusText}`);
        this.logger.error('API request failed', apiError);
        throw apiError;
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        const formatError = new Error('Invalid response format from Tavily API');
        this.logger.error('Invalid API response', formatError);
        throw formatError;
      }

      // Reset retry delay on success
      this.retryDelay = 1000;

      return data.results.map((result: any) => ({
        url: result.url,
        title: result.title,
        content: result.content,
        score: result.relevance_score || 0,
      }));
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('Unknown error during Tavily search');
      
      // Re-throw rate limit errors to be handled by the retry mechanism
      if (wrappedError.message.toLowerCase().includes('rate limit')) {
        throw wrappedError;
      }

      this.logger.error('Failed to execute Tavily search', wrappedError);
      throw wrappedError;
    }
  }

  public async search(query: string): Promise<SearchResult[]> {
    try {
      const startTime = this.logger.startOperation('tavily_search', {
        query,
      });

      this.logger.info('Starting Tavily search', {
        query,
      });

      const results = await this.searchWithRetry(query);

      this.logger.info('Tavily search successful', {
        query,
        resultCount: results.length,
      });

      this.logger.endOperation('tavily_search', startTime, {
        query,
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('Unknown error during Tavily search');
      this.logger.error('Tavily search failed', wrappedError, {
        query,
        errorMessage: wrappedError.message,
      });
      throw wrappedError;
    }
  }
}
