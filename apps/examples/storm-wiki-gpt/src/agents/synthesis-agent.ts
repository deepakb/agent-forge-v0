import { AgentConfig } from '../types';
import { BaseWikiAgent } from './base-wiki-agent';
import { AgentMessage, MessageType, SearchResult } from '../types';
import { OpenAIHelper } from '../utils/openai-helper';
import { Logger } from '@agent-forge/shared';
import { EventEmitter } from 'events';

export class SynthesisAgent extends BaseWikiAgent {
  private openai: OpenAIHelper;
  private completionEmitter: EventEmitter;

  constructor(config: AgentConfig) {
    super({
      id: `synthesis-${Date.now()}`,
      name: 'SynthesisAgent',
      type: 'WIKI',
      capabilities: ['synthesize'],
      maxConcurrentTasks: 1,
      retryAttempts: 3,
      ...config,
    });
    this.openai = new OpenAIHelper(config);
    this.completionEmitter = new EventEmitter();
  }

  protected async handleMessage(message: AgentMessage): Promise<void> {
    try {
      const startTime = await this.beforeOperation('handleMessage', {
        messageType: message.type,
        source: message.source,
      });

      switch (message.type) {
        case MessageType.SEARCH_RESULTS:
          const article = await this.synthesizeArticle(message.data as SearchResult[]);
          await this.sendMessage({
            type: MessageType.ARTICLE,
            source: this.getId(),
            target: 'OutputAgent',
            data: article,
          });
          break;
        default:
          this.logger.warn('Received unsupported message type', {
            messageType: message.type,
            source: message.source,
          });
      }

      await this.afterOperation('handleMessage', startTime, undefined, {
        messageType: message.type,
        source: message.source,
      });
    } catch (error) {
      await this.handleError('handleMessage', error as Error, {
        messageType: message.type,
        source: message.source,
      });
    }
  }

  private async synthesizeArticle(searchResults: SearchResult[]): Promise<{ content: string; sources: string[] }> {
    try {
      const startTime = await this.beforeOperation('synthesizeArticle', {
        resultCount: searchResults.length,
      });

      const prompt = `Generate a comprehensive Wikipedia-style article using the following sources:

${searchResults.map((result, index) => `[${index + 1}] ${result.title}
URL: ${result.url}
Content: ${result.content}
`).join('\n\n')}

Requirements:
1. Follow Wikipedia's neutral point of view (NPOV)
2. Use proper section headers (== Section ==)
3. Include citations using [n] format
4. Add a References section at the end
5. Focus on accuracy and factual information
6. Maintain a professional and encyclopedic tone
7. Organize content logically with clear sections
8. Include relevant statistics and data when available

Format the article in MediaWiki markup format.`;

      const content = await this.openai.complete(prompt);
      const sources = searchResults.map(result => result.url);

      const result = { content, sources };

      // Emit completion event
      this.completionEmitter.emit('synthesisComplete', result);

      return await this.afterOperation('synthesizeArticle', startTime, result, {
        resultCount: searchResults.length,
        contentLength: content.length,
        sourceCount: sources.length,
      });
    } catch (error) {
      return await this.handleError('synthesizeArticle', error as Error, {
        resultCount: searchResults.length,
      });
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

  public async start(): Promise<void> {
    await super.start();
    Logger.info('SynthesisAgent started successfully', { agentId: this.id });
  }

  public async stop(): Promise<void> {
    await super.stop();
    this.completionEmitter.removeAllListeners();
    Logger.info('SynthesisAgent stopped successfully', { agentId: this.id });
  }
}
