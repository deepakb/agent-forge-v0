import { EventEmitter } from 'events';

export interface MessageMetadata {
  workflowId?: string;
  timestamp: number;
  source: string;
  target: string;
  [key: string]: any;
}

export interface Message {
  type: 'query' | 'response' | 'system' | 'summarize';
  content: any;
  metadata: MessageMetadata;
}

export interface BaseAgentState {
  status: 'idle' | 'processing' | 'fetching' | 'success' | 'error';
  lastMessage?: Message;
}

export interface IAgent extends EventEmitter {
  readonly id: string;
  readonly type: string;
  processMessage(message: Message): Promise<void>;
}

export abstract class BaseAgent<T extends BaseAgentState> extends EventEmitter implements IAgent {
  protected state: T;
  readonly id: string;
  readonly type: string;

  constructor(config: { id: string; type: string }) {
    super();
    this.id = config.id;
    this.type = config.type;
    this.state = { status: 'idle' } as T;
  }

  abstract processMessage(message: Message): Promise<void>;

  protected updateState(update: Partial<T>) {
    this.state = { ...this.state, ...update };
    this.emit('state_change', this.state);
  }

  protected async sendMessage(message: Message) {
    try {
      this.emit('message', message);
    } catch (error) {
      await this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  protected async handleError(error: Error) {
    console.error(`Error in ${this.type} (${this.id}):`, error);
    this.updateState({ status: 'error' } as Partial<T>);
    this.emit('error', error);
  }
}
