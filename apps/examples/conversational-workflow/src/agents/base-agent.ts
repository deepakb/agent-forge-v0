import { EventEmitter } from 'events';
import { SecurityManager } from '../security/security-manager';
import { CommunicationHub } from '../communication/communication-hub';

export interface MessageMetadata {
  source: string;
  target?: string;
  timestamp: number;
  workflowId?: string;
  encrypted?: boolean;
  requiresSummarization?: boolean;
}

export interface Message {
  type: string;
  content: any;
  metadata: MessageMetadata;
}

export interface BaseAgentState {
  status: 'idle' | 'processing' | 'error' | 'fetching' | 'success';
  error?: Error;
  lastMessage?: Message;
  [key: string]: any;
}

export interface IAgent extends EventEmitter {
  id: string;
  type: string;
  processMessage(message: Message): Promise<void>;
}

export abstract class BaseAgent<T extends BaseAgentState = BaseAgentState> extends EventEmitter implements IAgent {
  public readonly id: string;
  public readonly type: string;
  protected state: T;
  protected securityManager: SecurityManager;
  protected communicationHub: CommunicationHub;

  constructor(config: { id: string; type: string }) {
    super();
    this.id = config.id;
    this.type = config.type.toLowerCase(); // Ensure type is lowercase
    this.state = { status: 'idle' } as T;
    this.securityManager = SecurityManager.getInstance();
    this.communicationHub = CommunicationHub.getInstance();

    // Register this agent with the communication hub
    this.communicationHub.registerAgent(this.type, this);

    // Set up message listener
    this.on('message', this.processMessage.bind(this));
  }

  public async processMessage(message: Message): Promise<void> {
    try {
      // Process message through security manager
      const processedMessage = await this.securityManager.processMessage(message, this.id);

      // Update state to processing
      this.updateState({ 
        status: 'processing',
        lastMessage: processedMessage 
      } as Partial<T>);

      // Handle the processed message
      await this.handleMessage(processedMessage);

      // Update state to idle
      this.updateState({ status: 'idle' } as Partial<T>);

      // Emit success event
      this.emit('message_processed', {
        messageId: message.metadata.workflowId,
        agentId: this.id,
        timestamp: Date.now()
      });
    } catch (error) {
      await this.handleError(error);
    }
  }

  protected abstract handleMessage(message: Message): Promise<void>;

  protected async sendMessage(message: Message): Promise<void> {
    try {
      // Add metadata
      const enrichedMessage: Message = {
        ...message,
        metadata: {
          ...message.metadata,
          source: this.type.toLowerCase(), // Use lowercase agent type as source
          timestamp: Date.now()
        }
      };

      // Process through security manager and broadcast
      await this.communicationHub.broadcast(enrichedMessage);
    } catch (error) {
      await this.handleError(error);
    }
  }

  protected updateState(update: Partial<T>) {
    this.state = { ...this.state, ...update };
    this.emit('state_change', this.state);
  }

  protected async handleError(error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in ${this.type} (${this.id}):`, errorMessage);
    
    this.updateState({ 
      status: 'error',
      error: error instanceof Error ? error : new Error(errorMessage)
    } as Partial<T>);
    
    this.emit('error', error);
  }

  public async shutdown(): Promise<void> {
    try {
      console.log(`${this.type} (${this.id}): Shutting down...`);
      this.updateState({ status: 'processing' } as Partial<T>);
      
      // Cleanup
      this.removeAllListeners();
      this.updateState({ status: 'idle' } as Partial<T>);
      
      console.log(`${this.type} (${this.id}): Shutdown complete`);
    } catch (error) {
      await this.handleError(error);
    }
  }
}
