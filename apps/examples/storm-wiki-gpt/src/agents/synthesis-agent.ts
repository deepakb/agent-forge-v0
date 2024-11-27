import { Logger } from '@agent-forge/shared';
import { EventEmitter } from 'events';
import { BaseWikiAgent } from './base-wiki-agent';
import { OpenAIHelper } from '../utils/openai-helper';
import {
  AgentMessage,
  AgentType,
  MessageType,
  SearchResult,
  SearchResultsMessageData,
  SynthesisResult,
} from '../types';

export class SynthesisAgent extends BaseWikiAgent {
  private completionEmitter: EventEmitter;

  constructor() {
    super(AgentType.SYNTHESIS);
    this.completionEmitter = new EventEmitter();
  }

  public async handleMessage(message: AgentMessage): Promise<void> {
    try {
      Logger.info('SynthesisAgent handling message', {
        messageType: message.type,
      });

      if (message.type === MessageType.SEARCH_RESULTS) {
        const { query, results } = message.data as SearchResultsMessageData;
        await this.handleSearchResults(query, results);
      }
    } catch (error) {
      Logger.error('Error handling message in SynthesisAgent', {
        messageType: message.type,
        error,
      });
      throw error;
    }
  }

  private async handleSearchResults(query: string, results: SearchResult[]): Promise<void> {
    try {
      Logger.info('SynthesisAgent processing search results', {
        query,
        resultCount: results.length,
      });

      // Generate summary using OpenAI
      const summary = await OpenAIHelper.generateSummary(query, results);

      // Create synthesis result
      const synthesisResult: SynthesisResult = {
        query,
        summary,
        sources: results.map((result) => result.url),
      };

      // Emit completion event
      this.completionEmitter.emit('synthesisComplete', synthesisResult);

      Logger.info('SynthesisAgent completed synthesis', {
        query,
        summaryLength: summary.length,
      });
    } catch (error) {
      Logger.error('Error processing search results in SynthesisAgent', {
        query,
        error,
      });
      throw error;
    }
  }

  public onSynthesisComplete(callback: (result: SynthesisResult) => void): void {
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
