import { EventEmitter } from 'events';

export interface MessageMetadata {
  source: string;
  target?: string;
  timestamp: number;
  workflowId?: string;
}

export interface Message {
  type: string;
  content: any;
  metadata: MessageMetadata;
}

export interface IAgent {
  id: string;
  type: string;
  on(event: string, listener: (...args: any[]) => void): void;
  processMessage(message: Message): Promise<void>;
}

export interface AgentConfig {
  id: string;
  type: string;
  capabilities: string[];
  apiKeys: {
    openai?: string;
    tavily?: string;
  };
}

export abstract class BaseAgent extends EventEmitter implements IAgent {
  public readonly id: string;
  public readonly type: string;
  protected readonly apiKeys: {
    openai?: string;
    tavily?: string;
  };

  constructor(config: AgentConfig) {
    super();
    this.id = config.id;
    this.type = config.type;
    this.apiKeys = config.apiKeys;
    
    if (!this.apiKeys.openai && !this.apiKeys.tavily) {
      throw new Error(`At least one API key is required for agent ${this.id}`);
    }
  }

  abstract processMessage(message: Message): Promise<void>;

  protected async sendMessage(message: Partial<Message>): Promise<void> {
    const fullMessage: Message = {
      type: message.type || this.type,
      content: message.content,
      metadata: {
        source: this.id,
        target: message.metadata?.target,
        timestamp: Date.now(),
        workflowId: message.metadata?.workflowId
      }
    };
    this.emit('message', fullMessage);
  }

  protected handleError(error: Error): void {
    console.error(`Error in ${this.type} (${this.id}):`, error);
    this.emit('error', error);
  }
}