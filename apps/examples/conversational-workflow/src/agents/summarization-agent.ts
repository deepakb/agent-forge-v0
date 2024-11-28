import { BaseAgent, Message, BaseAgentState } from './base-agent';
import { AgentConfig } from '../config/config';
import OpenAI from 'openai';

interface SummarizationAgentState extends BaseAgentState {
  lastInput?: any;
  summary?: string;
  lastError?: {
    code: string;
    message: string;
    timestamp: number;
  };
}

export class SummarizationAgent extends BaseAgent<SummarizationAgentState> {
  private readonly openai: OpenAI;

  constructor(config: AgentConfig) {
    super({
      id: config.id,
      type: 'summarization',
    });

    if (!config.apiKeys.openai) {
      throw new Error('OpenAI API key is required for SummarizationAgent');
    }

    this.openai = new OpenAI({
      apiKey: config.apiKeys.openai,
    });

    console.log(`SummarizationAgent initialized with ID: ${this.id}`);
  }

  public async processMessage(message: Message): Promise<void> {
    try {
      this.updateState({
        status: 'processing',
        lastMessage: message,
      });

      switch (message.type) {
        case 'summarize':
        case 'response':
          if (message.metadata.requiresSummarization) {
            await this.handleSummarization(message);
          } else {
            throw new Error('Message does not require summarization');
          }
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

  private async handleSummarization(message: Message): Promise<void> {
    try {
      console.log(`SummarizationAgent (${this.id}): Processing summarization request`);

      this.updateState({
        status: 'processing',
        lastInput: message.content,
        summary: undefined,
        lastError: undefined,
      });

      const summary = await this.generateSummary(message.content);

      this.updateState({
        status: 'success',
        summary,
        lastError: undefined,
      });

      await this.sendMessage({
        type: 'response',
        content: summary,
        metadata: {
          ...message.metadata,
          source: this.id,
          target: 'chatbot',
          requiresSummarization: false, // Mark as not requiring further summarization
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error in summarization (${this.id}):`, errorMessage);
      this.updateState({
        status: 'error',
        lastError: {
          code: 'SUMMARIZATION_ERROR',
          message: errorMessage,
          timestamp: Date.now(),
        },
      });
      throw error;
    }
  }

  private async generateSummary(content: any): Promise<string> {
    try {
      let inputText: string;

      // Handle different content types
      if (typeof content === 'string') {
        inputText = content;
      } else if (content.results && Array.isArray(content.results)) {
        // Handle knowledge agent results
        inputText = content.results
          .map(
            (r: { source: string; content: string }) => `Source: ${r.source}\nContent: ${r.content}`
          )
          .join('\n\n');
      } else if (content.articles && Array.isArray(content.articles)) {
        // Handle news fetcher results
        inputText = content.articles
          .map(
            (a: { source: string; content: string }) => `Source: ${a.source}\nContent: ${a.content}`
          )
          .join('\n\n');
      } else {
        inputText = JSON.stringify(content, null, 2);
      }

      const prompt = `Please provide a clear and concise summary of the following information:\n\n${inputText}\n\nSummary:`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful AI assistant that creates clear, accurate, and concise summaries of information.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || 'No summary generated';
    } catch (error) {
      console.error(`Error generating summary (${this.id}):`, error);
      throw error;
    }
  }

  private async handleShutdown(): Promise<void> {
    try {
      console.log(`SummarizationAgent (${this.id}): Shutting down...`);
      this.updateState({ status: 'processing' });
      // Cleanup any resources if needed
      this.updateState({ status: 'idle' });
      console.log(`SummarizationAgent (${this.id}): Shutdown complete`);
    } catch (error) {
      await this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
