import { BaseAgent, Message, BaseAgentState } from './base-agent';
import { AgentConfig } from '../config/config';

interface ChatbotAgentState extends BaseAgentState {
  pendingResponses?: Set<string>;
  completedResponses?: Set<string>;
  error?: Error;
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
    } as Partial<ChatbotAgentState>);

    console.log(`ChatbotAgent initialized with ID: ${this.id}`);
  }

  protected async handleMessage(message: Message): Promise<void> {
    try {
      console.log(`ChatbotAgent (${this.id}): Received message of type ${message.type}`);

      switch (message.type.toLowerCase()) {
        case 'workflow_start':
          await this.handleWorkflowStart(message);
          break;
        case 'knowledge_response':
          await this.handleKnowledgeResponse(message);
          break;
        case 'news_response':
          await this.handleNewsResponse(message);
          break;
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
          console.log(`ChatbotAgent (${this.id}): Ignoring message of type ${message.type}`);
      }
    } catch (error) {
      await this.handleError(error);
    }
  }

  private async handleQuery(message: Message): Promise<void> {
    console.log(`ChatbotAgent (${this.id}): Processing query: "${message.content}"`);

    const pendingResponses = new Set(['knowledge', 'newsfetcher']);
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
        target: 'newsfetcher',
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

  private async handleChatRequest(message: Message): Promise<void> {
    // TO DO: implement handleChatRequest
  }

  private async handleKnowledgeResponse(message: Message): Promise<void> {
    console.log(`ChatbotAgent (${this.id}): Received knowledge response for query: "${message.content.query}"`);

    const pendingResponses = this.state.pendingResponses as Set<string>;
    pendingResponses.delete('knowledge');

    // If we have responses from all agents and have a valid workflowId, complete the workflow
    if (pendingResponses.size === 0 && message.metadata.workflowId) {
      await this.completeWorkflow(message.metadata.workflowId);
    } else if (pendingResponses.size === 0) {
      console.error('Cannot complete workflow: missing workflowId');
    }

    this.updateState({ pendingResponses });
  }

  private async handleNewsResponse(message: Message): Promise<void> {
    console.log(`ChatbotAgent (${this.id}): Received news response for query: "${message.content.query}"`);

    const pendingResponses = this.state.pendingResponses as Set<string>;
    pendingResponses.delete('newsfetcher');

    // If we have responses from all agents and have a valid workflowId, complete the workflow
    if (pendingResponses.size === 0 && message.metadata.workflowId) {
      await this.completeWorkflow(message.metadata.workflowId);
    } else if (pendingResponses.size === 0) {
      console.error('Cannot complete workflow: missing workflowId');
    }

    this.updateState({ pendingResponses });
  }

  private async handleWorkflowStart(message: Message): Promise<void> {
    try {
      let messageContent = message.content;
      
      if (message.metadata.encrypted) {
        const decryptedMessage = await this.decryptMessageContent(message.content);
        messageContent = decryptedMessage.content;
      }

      // Extract query from the message content
      let query: string;
      if (typeof messageContent === 'object' && messageContent !== null && 'query' in messageContent) {
        query = messageContent.query;
      } else if (typeof messageContent === 'string') {
        query = messageContent;
      } else {
        throw new Error('Query is required but was not found in the message content');
      }

      console.log(`ChatbotAgent (${this.id}): Starting workflow with query: "${query}"`);

      const pendingResponses = new Set(['knowledge', 'newsfetcher']);
      this.updateState({ 
        pendingResponses,
        status: 'processing',
        lastMessage: message 
      } as Partial<ChatbotAgentState>);

      // Send knowledge request
      await this.sendMessage({
        type: 'knowledge_request',
        content: {
          query,
          type: 'knowledge'
        },
        metadata: {
          ...message.metadata,
          source: this.type,
          target: 'knowledge',
          timestamp: Date.now()
        }
      });

      // Send news request
      await this.sendMessage({
        type: 'news_request',
        content: {
          query,
          type: 'news'
        },
        metadata: {
          ...message.metadata,
          source: this.type,
          target: 'newsfetcher',
          timestamp: Date.now()
        }
      });

      console.log(`ChatbotAgent (${this.id}): Sent requests to knowledge and news agents`);
    } catch (error) {
      console.error(`ChatbotAgent (${this.id}): Error in handleWorkflowStart:`, error);
      await this.handleError(error);
    }
  }

  private async completeWorkflow(workflowId: string): Promise<void> {
    if (!workflowId) {
      throw new Error('Cannot complete workflow: workflowId is required');
    }

    console.log(`ChatbotAgent (${this.id}): Completing workflow ${workflowId}`);

    await this.sendMessage({
      type: 'workflow_complete',
      content: {
        status: 'success'
      },
      metadata: {
        workflowId,
        source: this.id,
        timestamp: Date.now()
      }
    });
  }

  private async decryptMessageContent(encryptedContent: any): Promise<Message> {
    try {
      // Use the security manager to decrypt the message
      const decryptedMessage = await this.securityManager.decryptMessage({
        type: 'encrypted',
        content: encryptedContent,
        metadata: {
          source: this.id,
          timestamp: Date.now(),
          encrypted: true,
          workflowId: this.state?.lastMessage?.metadata?.workflowId
        }
      });
      
      // Return the entire decrypted message
      return decryptedMessage;
    } catch (error) {
      console.error(`ChatbotAgent (${this.id}): Error decrypting message:`, error);
      throw error;
    }
  }
}
