import { Logger } from '@agent-forge/shared';
import { EventEmitter } from 'events';
import { AgentMessage, AgentType, MessageType } from '../types';

// Global message broker for inter-agent communication
const globalMessageBroker = new EventEmitter();

export abstract class BaseWikiAgent {
  protected id: string;
  protected type: AgentType;
  protected messageBroker: EventEmitter;

  constructor(type: AgentType) {
    this.id = `${type.toLowerCase()}-${globalMessageBroker.listenerCount('message') + 1}`;
    this.type = type;
    this.messageBroker = globalMessageBroker;
  }

  public abstract handleMessage(message: AgentMessage): Promise<void>;

  protected async sendMessage(message: AgentMessage): Promise<void> {
    try {
      Logger.info('Sending message', {
        source: message.source,
        target: message.target,
        type: message.type,
      });

      this.messageBroker.emit('message', message);
    } catch (error) {
      Logger.error('Error sending message', {
        source: message.source,
        target: message.target,
        type: message.type,
        error,
      });
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      Logger.info('Starting agent', {
        agentId: this.id,
        agentType: this.type,
      });

      // Set up message handler
      this.messageBroker.on('message', async (message: AgentMessage) => {
        if (message.target === this.type) {
          try {
            await this.handleMessage(message);
          } catch (error) {
            Logger.error('Error handling message', {
              agentId: this.id,
              messageType: message.type,
              error,
            });
          }
        }
      });
    } catch (error) {
      Logger.error('Error starting agent', {
        agentId: this.id,
        agentType: this.type,
        error,
      });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      Logger.info('Stopping agent', {
        agentId: this.id,
        agentType: this.type,
      });

      // Remove message handler
      this.messageBroker.removeAllListeners('message');
    } catch (error) {
      Logger.error('Error stopping agent', {
        agentId: this.id,
        agentType: this.type,
        error,
      });
      throw error;
    }
  }
}
