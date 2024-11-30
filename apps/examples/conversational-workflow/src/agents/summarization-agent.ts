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

  protected async handleMessage(message: Message): Promise<void> {
    try {
      console.log(`SummarizationAgent (${this.id}): Received message of type ${message.type}`);

      switch (message.type.toLowerCase()) {
        case 'summarize_request':
        case 'query':
          await this.handleSummarizeRequest(message);
          break;
        case 'workflow_start':
          // Ignore workflow_start messages
          console.log(`SummarizationAgent (${this.id}): Ignoring workflow_start message`);
          break;
        case 'system':
          if (message.content === 'shutdown') {
            await this.handleShutdown();
          }
          break;
        default:
          console.log(`SummarizationAgent (${this.id}): Ignoring message of type ${message.type}`);
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  private async handleSummarizeRequest(message: Message): Promise<void> {
    try {
      const content = typeof message.content === 'string' ? message.content : message.content.text;
      console.log(`SummarizationAgent (${this.id}): Processing summarize request`);
      
      this.updateState({ 
        status: 'processing',
        lastMessage: message 
      } as Partial<SummarizationAgentState>);

      // Process the content and get summary
      const summary = await this.summarize(content);

      // Send back the response
      await this.sendMessage({
        type: 'summarize_response',
        content: summary,
        metadata: {
          ...message.metadata,
          source: this.type,
          target: message.metadata.source,
          timestamp: Date.now()
        }
      });

      this.updateState({ status: 'idle' } as Partial<SummarizationAgentState>);
    } catch (error) {
      await this.handleError(error);
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

  private async summarize(content: string): Promise<string> {
    try {
      const prompt = `Please provide a clear and concise summary of the following information:\n\n${content}\n\nSummary:`;

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
