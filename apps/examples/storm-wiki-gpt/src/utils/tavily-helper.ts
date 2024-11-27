import { AgentConfig } from '../types';
import { LoggerService } from './logger';
import { SearchResult } from '../types';

export class TavilyHelper {
  private apiKey: string;
  private logger: LoggerService;

  constructor(config: AgentConfig) {
    if (!config.tavilyApiKey) {
      throw new Error('Tavily API key is required');
    }
    this.apiKey = config.tavilyApiKey;
    this.logger = LoggerService.getInstance();
  }

  public async search(query: string): Promise<SearchResult[]> {
    try {
      const startTime = this.logger.startOperation('tavily_search', {
        query,
      });

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
          include_domains: ['wikipedia.org', 'britannica.com', 'sciencedirect.com'],
          exclude_domains: ['pinterest.com', 'facebook.com', 'twitter.com'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.statusText}`);
      }

      const data = await response.json();
      const results: SearchResult[] = data.results.map((result: any) => ({
        url: result.url,
        title: result.title,
        content: result.content,
        score: result.relevance_score || 0,
      }));

      this.logger.endOperation('tavily_search', startTime, {
        query,
        resultCount: results.length,
      });

      return results;
    } catch (error) {
      this.logger.error('Tavily search failed', error as Error, {
        query,
      });
      throw error;
    }
  }
}
