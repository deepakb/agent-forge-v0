import { BaseAgent, Message, BaseAgentState } from './base-agent';
import { AgentConfig } from '../config/config';
import axios from 'axios';

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

interface KnowledgeAgentState extends BaseAgentState {
  lastQuery?: string;
  results?: Array<{
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

export class KnowledgeAgent extends BaseAgent<KnowledgeAgentState> {
  private readonly tavily: { apiKey: string };
  private readonly baseUrl = 'https://api.tavily.com/search';
  private readonly maxRetries = 3;

  constructor(config: AgentConfig) {
    super({
      id: config.id,
      type: 'knowledge',
    });

    console.log(`KnowledgeAgent: Initializing with config:`, {
      id: config.id,
      type: 'knowledge',
      hasTavilyKey: !!config.apiKeys.tavily,
      hasOpenAIKey: !!config.apiKeys.openai,
    });

    if (!config.apiKeys.tavily) {
      throw new Error('Tavily API key is required for KnowledgeAgent');
    }

    this.tavily = {
      apiKey: config.apiKeys.tavily,
    };

    console.log(`KnowledgeAgent initialized with ID: ${this.id}`);
  }

  protected async handleMessage(message: Message): Promise<void> {
    try {
      console.log(`KnowledgeAgent (${this.id}): Received message of type ${message.type}`);

      switch (message.type.toLowerCase()) {
        case 'knowledge_request':
        case 'query':
          await this.handleKnowledgeRequest(message);
          break;
        case 'workflow_start':
          // Ignore workflow_start messages
          console.log(`KnowledgeAgent (${this.id}): Ignoring workflow_start message`);
          break;
        case 'system':
          if (message.content === 'shutdown') {
            await this.handleShutdown();
          }
          break;
        default:
          console.log(`KnowledgeAgent (${this.id}): Ignoring message of type ${message.type}`);
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  private async handleKnowledgeRequest(message: Message): Promise<void> {
    try {
      const query = typeof message.content === 'string' ? message.content : message.content.query;
      console.log(`KnowledgeAgent (${this.id}): Processing knowledge request for query: "${query}"`);
      
      this.updateState({ 
        status: 'processing',
        lastMessage: message 
      } as Partial<KnowledgeAgentState>);

      // Process the query and get knowledge results
      const results = await this.searchKnowledge(query);

      // Send back the response
      await this.sendMessage({
        type: 'knowledge_response',
        content: results,
        metadata: {
          ...message.metadata,
          source: this.type,
          target: message.metadata.source,
          timestamp: Date.now()
        }
      });

      this.updateState({ status: 'idle' } as Partial<KnowledgeAgentState>);
    } catch (error) {
      await this.handleError(error);
    }
  }

  private async handleQuery(message: Message): Promise<void> {
    try {
      console.log(`KnowledgeAgent (${this.id}): Processing query: "${message.content}"`);

      this.updateState({
        status: 'fetching',
        lastQuery: message.content,
        results: undefined,
        lastError: undefined,
      });

      const response = await this.makeRequest(message.content);
      console.log(`KnowledgeAgent (${this.id}): Received response for query`);

      if (!response.data.results || !Array.isArray(response.data.results)) {
        throw new Error(`Invalid response from Tavily API: ${JSON.stringify(response.data)}`);
      }

      const results = response.data.results.map(result => ({
        content: result.content,
        source: result.source || result.url,
        relevance: result.relevance_score || 0,
      }));

      this.updateState({
        status: 'success',
        results,
        lastError: undefined,
      });

      console.log(`KnowledgeAgent (${this.id}): Found ${results.length} results`);

      await this.sendMessage({
        type: 'response',
        content: {
          results,
          query: message.content,
          total: results.length,
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

  private async handleQueryRequest(message: Message): Promise<void> {
    try {
      this.updateState({ status: 'fetching' });
      
      // Process the query and fetch relevant knowledge
      const query = message.content.query;
      const results = await this.fetchKnowledge(query);

      // Send response back
      await this.sendMessage({
        type: 'KNOWLEDGE_RESPONSE',
        content: {
          query,
          results
        },
        metadata: {
          ...message.metadata,
          source: this.id,
          target: message.metadata.source,
          timestamp: Date.now()
        }
      });

      this.updateState({ 
        status: 'success',
        lastQuery: query,
        lastResults: results
      });
    } catch (error) {
      this.updateState({ 
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  private async handleKnowledgeUpdate(message: Message): Promise<void> {
    try {
      this.updateState({ status: 'processing' });
      
      // Update knowledge base
      await this.updateKnowledgeBase(message.content);

      this.updateState({ 
        status: 'success',
        lastUpdate: Date.now()
      });
    } catch (error) {
      this.updateState({ 
        status: 'error',
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }

  private async fetchKnowledge(query: string): Promise<any> {
    try {
      const response = await this.makeRequest(query);
      return response.data;
    } catch (error) {
      console.error(`Error fetching knowledge (${this.id}):`, error);
      throw error;
    }
  }

  private async updateKnowledgeBase(content: any): Promise<void> {
    try {
      // Here you would implement the logic to update your knowledge base
      // This could involve updating a database, file, or external service
      console.log(`KnowledgeAgent (${this.id}): Updating knowledge base with:`, content);
      
      // For now, we'll just simulate an update
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`KnowledgeAgent (${this.id}): Knowledge base updated successfully`);
    } catch (error) {
      console.error(`Error updating knowledge base (${this.id}):`, error);
      throw error;
    }
  }

  private async searchKnowledge(query: string): Promise<TavilyResponse['results']> {
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.post(this.baseUrl, {
          query,
          api_key: this.tavily.apiKey,
          search_depth: 'advanced',
          include_domains: [
            'news.google.com',
            'reuters.com',
            'bloomberg.com',
            'techcrunch.com',
            'theverge.com'
          ]
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
          include_domains: ['*'],
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
      console.log(`KnowledgeAgent (${this.id}): Request completed in ${duration}ms`);
      return response;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 5000);
        console.log(
          `KnowledgeAgent (${this.id}): Retrying request (${retryCount + 1}/${this.maxRetries}) after ${backoffMs}ms`
        );
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        return this.makeRequest(query, retryCount + 1);
      }
      throw error;
    }
  }

  private handleApiError(error: unknown) {
    let errorMessage: string;
    let errorCode: string = 'UNKNOWN_ERROR';

    if (axios.isAxiosError(error)) {
      errorCode = `HTTP_${error.response?.status || 'ERROR'}`;
      errorMessage = `Tavily API error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`;
    } else {
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    this.updateState({
      status: 'error',
      lastError: {
        code: errorCode,
        message: errorMessage,
        timestamp: Date.now(),
      },
    });

    throw new Error(errorMessage);
  }

  private async handleShutdown(): Promise<void> {
    try {
      console.log(`KnowledgeAgent (${this.id}): Shutting down...`);
      this.updateState({ status: 'processing' });
      // Cleanup any resources if needed
      this.updateState({ status: 'idle' });
      console.log(`KnowledgeAgent (${this.id}): Shutdown complete`);
    } catch (error) {
      await this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
