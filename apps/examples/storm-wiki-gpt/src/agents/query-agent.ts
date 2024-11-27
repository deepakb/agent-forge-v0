import { Logger } from '@agent-forge/shared';
import { BaseWikiAgent } from './base-wiki-agent';
import { AgentMessage, AgentType, MessageType, Query } from '../types';

export class QueryAgent extends BaseWikiAgent {
  constructor() {
    super(AgentType.QUERY);
  }

  public async handleMessage(message: AgentMessage): Promise<void> {
    try {
      Logger.info('QueryAgent handling message', {
        messageType: message.type,
      });
    } catch (error) {
      Logger.error('Error handling message in QueryAgent', {
        messageType: message.type,
        error,
      });
      throw error;
    }
  }

  public async processQuery(query: Query): Promise<void> {
    try {
      Logger.info('QueryAgent processing query', { query });

      await this.sendMessage({
        type: MessageType.QUERY,
        data: query,
        source: AgentType.QUERY,
        target: AgentType.FETCH,
      });

      Logger.info('QueryAgent sent query to FetchAgent', { query });
    } catch (error) {
      Logger.error('Error processing query in QueryAgent', {
        query,
        error,
      });
      throw error;
    }
  }

  public async start(): Promise<void> {
    await super.start();
    Logger.info('QueryAgent started successfully', { agentId: this.id });
  }

  public async stop(): Promise<void> {
    await super.stop();
    Logger.info('QueryAgent stopped successfully', { agentId: this.id });
  }
}
