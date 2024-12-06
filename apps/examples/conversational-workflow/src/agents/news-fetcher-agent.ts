import { BaseAgent, Message, AgentConfig } from './base-agent';
import axios from 'axios';

export class NewsFetcherAgent extends BaseAgent {
  private tavilyApiKey: string;

  constructor(config: AgentConfig) {
    super(config);
    if (!config.apiKeys.tavily) {
      throw new Error('Tavily API key is required for NewsFetcherAgent');
    }
    this.tavilyApiKey = config.apiKeys.tavily;
  }

  async processMessage(message: Message): Promise<void> {
    console.log(`NewsFetcherAgent (${this.id}): Processing message:`, message.type);

    try {
      switch (message.type) {
        case 'query':
          await this.fetchNews(message.content, message.metadata.workflowId || '');
          break;
        default:
          console.log(`Unhandled message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  private async fetchNews(query: string, workflowId: string): Promise<void> {
    try {
      console.log('\nFetching news for query:', query);
      
      // Verify API key is present
      if (!this.tavilyApiKey) {
        throw new Error('Tavily API key is missing');
      }

      // Make API request
      try {
        const response = await axios.post(
          'https://api.tavily.com/search',
          {
            query,
            search_depth: 'advanced',
            include_domains: ['news.google.com', 'reuters.com', 'bloomberg.com', 'cnbc.com'],
            max_results: 5
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.tavilyApiKey}`  // Using Bearer token format
            }
          }
        );

        // Check if we have results
        if (!response.data || !response.data.results) {
          throw new Error('Invalid response from Tavily API');
        }

        const newsResults = response.data.results.map((result: any) => ({
          title: result.title,
          content: result.content,
          url: result.url,
          published_date: result.published_date
        }));

        console.log(`Found ${newsResults.length} news articles`);
        
        // Send news results back to the chatbot
        await this.sendMessage({
          type: 'news_response',
          content: {
            results: newsResults,
            query
          },
          metadata: {
            source: this.id,
            target: 'chatbot-agent',
            timestamp: Date.now(),
            workflowId
          }
        });
      } catch (apiError: any) {
        console.error('Tavily API Error:', apiError.response?.data || apiError.message);
        
        // Send error response
        await this.sendMessage({
          type: 'news_response',
          content: {
            error: 'Failed to fetch news',
            details: apiError.response?.data?.detail || apiError.message,
            query
          },
          metadata: {
            source: this.id,
            target: 'chatbot-agent',
            timestamp: Date.now(),
            workflowId
          }
        });
      }
    } catch (error) {
      console.error('Error in news fetcher:', error);
      
      // Send error response
      await this.sendMessage({
        type: 'news_response',
        content: {
          error: 'Failed to fetch news',
          details: error instanceof Error ? error.message : 'Unknown error',
          query
        },
        metadata: {
          source: this.id,
          target: 'chatbot-agent',
          timestamp: Date.now(),
          workflowId
        }
      });
    }
  }
}