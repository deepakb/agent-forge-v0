import { BaseAgent, Message, BaseAgentState } from './base-agent';
import { AgentConfig } from '../config/config';

interface ChatbotAgentState extends BaseAgentState {
  pendingResponses?: Set<string>;
  completedResponses?: Set<string>;
}

export class ChatbotAgent extends BaseAgent<ChatbotAgentState> {
  constructor(config: AgentConfig) {
    super({
      id: config.id,
      type: 'chatbot',
    });

    this.updateState({
      status: 'idle',
      pendingResponses: new Set(),
      completedResponses: new Set(),
    });

    console.log(`ChatbotAgent initialized with ID: ${this.id}`);
  }

  public async processMessage(message: Message): Promise<void> {
    try {
      this.updateState({
        status: 'processing',
        lastMessage: message,
      });

      switch (message.type) {
        case 'query':
          await this.handleQuery(message);
          break;
        case 'response':
          await this.handleResponse(message);
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

  private async handleQuery(message: Message): Promise<void> {
    console.log(`ChatbotAgent (${this.id}): Processing query: "${message.content}"`);

    const pendingResponses = new Set(['knowledge', 'news']);
    this.updateState({ pendingResponses });

    // Emit a knowledge search request
    await this.sendMessage({
      type: 'query',
      content: message.content,
      metadata: {
        ...message.metadata,
        source: this.id,
        target: 'knowledge',
        timestamp: Date.now(),
      },
    });

    // Emit a news search request
    await this.sendMessage({
      type: 'query',
      content: message.content,
      metadata: {
        ...message.metadata,
        source: this.id,
        target: 'news',
        timestamp: Date.now(),
      },
    });

    console.log(`ChatbotAgent (${this.id}): Sent query to knowledge and news agents`);
  }

  private async handleResponse(message: Message): Promise<void> {
    console.log(`ChatbotAgent (${this.id}): Received response from ${message.metadata.source}`);

    // Update response tracking
    const { pendingResponses = new Set(), completedResponses = new Set() } = this.state;
    const sourceAgent = message.metadata.source.split('-')[0]; // Extract base agent type

    pendingResponses.delete(sourceAgent);
    completedResponses.add(sourceAgent);

    this.updateState({ pendingResponses, completedResponses });

    // Forward to summarization if needed
    if (message.metadata.requiresSummarization) {
      await this.sendMessage({
        type: 'query',
        content: message.content,
        metadata: {
          ...message.metadata,
          source: this.id,
          target: 'summarization',
          timestamp: Date.now(),
        },
      });
    }

    // Check if this completes the workflow
    if (this.isWorkflowComplete()) {
      console.log(`ChatbotAgent (${this.id}): Workflow ${message.metadata.workflowId} complete`);
      this.emit(`workflow_complete_${message.metadata.workflowId}`);
    }
  }

  private async handleShutdown(): Promise<void> {
    try {
      console.log(`ChatbotAgent (${this.id}): Shutting down...`);
      this.updateState({ status: 'processing' });
      // Cleanup any resources
      this.removeAllListeners();
      this.updateState({ status: 'idle' });
      console.log(`ChatbotAgent (${this.id}): Shutdown complete`);
    } catch (error) {
      await this.handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private isWorkflowComplete(): boolean {
    const { pendingResponses = new Set() } = this.state;
    return pendingResponses.size === 0;
  }
}
