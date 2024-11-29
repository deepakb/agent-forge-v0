import { BaseAgent, Message, BaseAgentState } from './base-agent';
import { AgentConfig } from '../config/config';
import axios, { AxiosError } from 'axios';

interface TavilyResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
    source: string;
    relevance_score: number;
  }>;
  query: string;
  status: string;
}

interface NewsFetcherAgentState extends BaseAgentState {
  lastQuery?: string;
  articles?: Array<{
    content: string;
    source: string;
    relevance: number;
  }>;
  lastError?: {
    code: string;
    message: string;
    timestamp: number;
  };
}

export class NewsFetcherAgent extends BaseAgent<NewsFetcherAgentState> {
  private readonly tavily: { apiKey: string };
  private readonly baseUrl = 'https://api.tavily.com/search';
  private readonly maxRetries = 3;
  private readonly includeDomains = [
    'news.google.com',
    'reuters.com',
    'bloomberg.com',
    'apnews.com',
    'bbc.com',
    'techcrunch.com',
    'theverge.com',
    'cnn.com',
    'nytimes.com',
    'wsj.com',
  ];

  constructor(config: AgentConfig) {
    super({
      id: config.id,
      type: 'newsFetcher',
    });

    console.log(`NewsFetcherAgent: Initializing with config:`, {
      id: config.id,
      type: 'newsFetcher',
      hasTavilyKey: !!config.apiKeys.tavily,
    });

    if (!config.apiKeys.tavily) {
      throw new Error('Tavily API key is required for NewsFetcherAgent');
    }

    this.tavily = {
      apiKey: config.apiKeys.tavily,
    };

    console.log(`NewsFetcherAgent initialized with ID: ${this.id}`);
  }

  protected async handleMessage(message: Message): Promise<void> {
    try {
      console.log(`NewsFetcherAgent (${this.id}): Received message of type ${message.type}`);

      switch (message.type.toLowerCase()) {
        case 'news_request':
        case 'query':
          await this.handleNewsRequest(message);
          break;
        case 'workflow_start':
          // Ignore workflow_start messages
          console.log(`NewsFetcherAgent (${this.id}): Ignoring workflow_start message`);
          break;
        case 'system':
          if (message.content === 'shutdown') {
            await this.handleShutdown();
          }
          break;
        default:
          console.log(`NewsFetcherAgent (${this.id}): Ignoring message of type ${message.type}`);
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  private async handleNewsRequest(message: Message): Promise<void> {
    try {
      const query = typeof message.content === 'string' ? message.content : message.content.query;
      console.log(`NewsFetcherAgent (${this.id}): Processing news request for query: "${query}"`);
      
      this.updateState({ 
        status: 'processing',
        lastMessage: message 
      } as Partial<NewsFetcherAgentState>);

      // Process the query and get news results
      const results = await this.searchNews(query);

      // Send back the response
      await this.sendMessage({
        type: 'news_response',
        content: {
          query,
          results,
          type: 'news'
        },
        metadata: {
          ...message.metadata,
          source: this.type,
          target: message.metadata.source,
          timestamp: Date.now()
        }
      });

      this.updateState({ status: 'idle' } as Partial<NewsFetcherAgentState>);
    } catch (error) {
      await this.handleError(error);
    }
  }

  private async searchNews(query: string): Promise<TavilyResponse['results']> {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.post(this.baseUrl, {
          query,
          api_key: this.tavily.apiKey,
          search_depth: 'advanced',
          include_domains: this.includeDomains,
          search_type: 'news'
        });

        if (response.data.status === 'success') {
          return response.data.results;
        } else {
          throw new Error(`Tavily API error: ${response.data.status}`);
        }
      } catch (error) {
        retries++;
        if (retries === this.maxRetries) {
          throw error;
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async handleQuery(message: Message): Promise<void> {
    if (!this.tavily.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      console.log(`NewsFetcherAgent (${this.id}): Processing query: "${message.content}"`);

      this.updateState({
        status: 'fetching',
        lastQuery: message.content,
        articles: undefined,
        lastError: undefined,
      });

      const response = await this.makeRequest(message.content);
      console.log(`NewsFetcherAgent (${this.id}): Received response for query`);

      if (!response.data.results || !Array.isArray(response.data.results)) {
        throw new Error(`Invalid response from Tavily API: ${JSON.stringify(response.data)}`);
      }

      const articles = response.data.results.map(result => ({
        content: result.content,
        source: result.source || result.url,
        relevance: result.relevance_score || 0,
      }));

      this.updateState({
        status: 'success',
        articles,
        lastError: undefined,
      });

      console.log(`NewsFetcherAgent (${this.id}): Found ${articles.length} articles`);

      await this.sendMessage({
        type: 'response',
        content: {
          articles,
          query: message.content,
          total: articles.length,
        },
        metadata: {
          ...message.metadata,
          source: this.id,
          target: 'chatbot',
          requiresSummarization: true,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      this.handleApiError(error);
    }
  }

  private async makeRequest(query: string, retryCount = 0): Promise<{ data: TavilyResponse }> {
    try {
      const startTime = Date.now();
      const response = await axios.post<TavilyResponse>(
        this.baseUrl,
        {
          query,
          search_depth: 'advanced',
          include_answer: false,
          include_raw_content: false,
          include_domains: this.includeDomains,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.tavily.apiKey}`,
          },
          timeout: 15000, // 15 second timeout
        }
      );

      const duration = Date.now() - startTime;
      console.log(`NewsFetcherAgent (${this.id}): Request completed in ${duration}ms`);
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 5000);
        console.log(
          `NewsFetcherAgent (${this.id}): Retrying request (${retryCount + 1}/${this.maxRetries}) after ${backoffMs}ms`
        );
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return this.makeRequest(query, retryCount + 1);
      }
      throw error;
    }
  }

  private async fetchNews(query: string): Promise<any> {
    try {
      const response = await this.makeRequest(query);
      return response.data;
    } catch (error) {
      console.error(`Error fetching news (${this.id}):`, error);
      throw error;
    }
  }

  private async updateNewsConfig(config: any): Promise<void> {
    try {
      // Here you would implement the logic to update news sources or filters
      // This could involve updating API configurations, sources list, etc.
      console.log(`NewsFetcherAgent (${this.id}): Updating news configuration with:`, config);
      
      // For now, we'll just simulate an update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`NewsFetcherAgent (${this.id}): News configuration updated successfully`);
    } catch (error) {
      console.error(`Error updating news configuration (${this.id}):`, error);
      throw error;
    }
  }

  private handleApiError(error: unknown) {
    let errorMessage: string;
    let errorCode: string = 'UNKNOWN_ERROR';

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        errorCode = `HTTP_${axiosError.response.status}`;
        errorMessage = `Tavily API error: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`;
      } else if (axiosError.request) {
        errorCode = 'NETWORK_ERROR';
        errorMessage = `Network error: ${axiosError.message}`;
      } else {
        errorCode = 'REQUEST_SETUP_ERROR';
        errorMessage = `Request setup error: ${axiosError.message}`;
      }
    } else {
      errorMessage = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
    }

    this.updateState({
      status: 'error',
      lastError: {
        code: errorCode,
        message: errorMessage,
        timestamp: Date.now(),
      },
    });

    console.error(`NewsFetcherAgent (${this.id}): ${errorMessage}`);
    throw new Error(errorMessage);
  }

  private async handleShutdown(): Promise<void> {
    try {
      console.log(`NewsFetcherAgent (${this.id}): Shutting down...`);
      this.updateState({ status: 'processing' });
      // Cleanup any resources if needed
      this.updateState({ status: 'idle' });
      console.log(`NewsFetcherAgent (${this.id}): Shutdown complete`);
    } catch (error) {
      await this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
