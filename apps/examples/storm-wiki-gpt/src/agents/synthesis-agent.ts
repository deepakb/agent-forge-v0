import { BaseAgent } from './base-agent';
import { AgentMessage, MessageType, SearchResult, SynthesisAgentConfig, TaskResult } from '../types';
import { OpenAIHelper } from '../utils/openai-helper';
import { Logger } from '@agent-forge/shared';
import { EventEmitter } from 'events';

export class SynthesisAgent extends BaseAgent {
  private openai: OpenAIHelper;
  private completionEmitter: EventEmitter;

  constructor(config: SynthesisAgentConfig) {
    super(config);
    this.openai = new OpenAIHelper(config);
    this.completionEmitter = new EventEmitter();
  }

  public async handleMessage(message: AgentMessage): Promise<TaskResult> {
    try {
      if (message.type !== MessageType.SEARCH_RESULTS) {
        throw new Error(`Invalid message type for SynthesisAgent: ${message.type}`);
      }

      const searchResults = message.data as SearchResult[];
      this.logger.info('Synthesizing article from search results', {
        agentId: this.getId(),
        resultCount: searchResults.length,
      });

      // Prepare content for synthesis
      const contentForSynthesis = searchResults
        .map(result => `Title: ${result.title}\nContent: ${result.content}`)
        .join('\n\n');

      const prompt = `Using the following search results, write a comprehensive Wikipedia-style article. The article should be well-organized, factual, and objective. Include relevant sections with appropriate headings.

Search Results:
${contentForSynthesis}

Requirements:
1. Write in an encyclopedic style
2. Use clear section headings
3. Present information objectively
4. Maintain a formal tone
5. Focus on factual accuracy
6. Include relevant technical details
7. Organize content logically

Write the article now:`;

      const article = await this.openai.complete(prompt);

      this.logger.info('Article synthesis completed', {
        agentId: this.getId(),
        articleLength: article.length,
      });

      const nextMessage: AgentMessage = {
        type: MessageType.ARTICLE,
        source: this.getId(),
        target: 'workflow',
        data: article,
      };

      await this.publishMessage(nextMessage);

      // Emit completion event
      this.completionEmitter.emit('synthesisComplete', { content: article, sources: searchResults.map(result => result.url) });

      return {
        success: true,
        message: nextMessage,
      };
    } catch (error) {
      this.logger.error('Synthesis agent failed', error instanceof Error ? error : new Error('Unknown error'));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  public onSynthesisComplete(callback: (result: { content: string; sources: string[] }) => void): void {
    try {
      this.completionEmitter.on('synthesisComplete', callback);
      Logger.info('SynthesisAgent registered completion callback');
    } catch (error) {
      Logger.error('Error registering synthesis completion callback', { error });
      throw error;
    }
  }

  public initialize(): void {
    Logger.info('SynthesisAgent initialized successfully', { agentId: this.getId() });
  }

  public cleanup(): void {
    this.completionEmitter.removeAllListeners();
    Logger.info('SynthesisAgent cleaned up successfully', { agentId: this.getId() });
  }
}
