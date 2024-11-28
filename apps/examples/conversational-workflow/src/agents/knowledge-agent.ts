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
      type: 'knowledge'
    });

    console.log(`KnowledgeAgent: Initializing with config:`, {
      id: config.id,
      type: 'knowledge',
      hasTavilyKey: !!config.apiKeys.tavily,
      hasOpenAIKey: !!config.apiKeys.openai
    });

    if (!config.apiKeys.tavily) {
      throw new Error('Tavily API key is required for KnowledgeAgent');
    }

    this.tavily = {
      apiKey: config.apiKeys.tavily
    };

    console.log(`KnowledgeAgent initialized with ID: ${this.id}`);
  }

  public async processMessage(message: Message): Promise<void> {
    try {
      this.updateState({ 
        status: 'processing',
        lastMessage: message
      });

      switch (message.type) {
        case 'query':
          await this.handleQuery(message);
          break;
        case 'system':
          if (message.content === 'shutdown') {
            await this.handleShutdown();
          }
          break;
        default:
          throw new Error(`Unsupported message type: ${message.type}`);
      }

      this.updateState({ status: 'idle' });
    } catch (error) {
      await this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async handleQuery(message: Message): Promise<void> {
    try {
      console.log(`KnowledgeAgent (${this.id}): Processing query: "${message.content}"`);
      
      this.updateState({ 
        status: 'fetching',
        lastQuery: message.content,
        results: undefined,
        lastError: undefined
      });

      const response = await this.makeRequest(message.content);
      console.log(`KnowledgeAgent (${this.id}): Received response for query`);

      if (!response.data.results || !Array.isArray(response.data.results)) {
        throw new Error(`Invalid response from Tavily API: ${JSON.stringify(response.data)}`);
      }

      const results = response.data.results.map(result => ({
        content: result.content,
        source: result.source || result.url,
        relevance: result.relevance_score || 0
      }));

      this.updateState({ 
        status: 'success',
        results,
        lastError: undefined
      });

      console.log(`KnowledgeAgent (${this.id}): Found ${results.length} results`);

      await this.sendMessage({
        type: 'response',
        content: {
          results,
          query: message.content,
          total: results.length
        },
        metadata: {
          ...message.metadata,
          source: this.id,
          target: 'chatbot',
          requiresSummarization: true,
          timestamp: Date.now()
        }
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
          search_depth: "advanced",
          include_answer: false,
          include_raw_content: false,
          include_domains: ['*']
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.tavily.apiKey}`
          },
          timeout: 15000 // 15 second timeout
        }
      );

      const duration = Date.now() - startTime;
      console.log(`KnowledgeAgent (${this.id}): Request completed in ${duration}ms`);
      return response;

    } catch (error) {
      if (retryCount < this.maxRetries) {
        const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 5000);
        console.log(`KnowledgeAgent (${this.id}): Retrying request (${retryCount + 1}/${this.maxRetries}) after ${backoffMs}ms`);
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
        timestamp: Date.now()
      }
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
