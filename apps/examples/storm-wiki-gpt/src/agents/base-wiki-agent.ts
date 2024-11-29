import { BaseAgent } from '@agent-forge/core';
import { LoggerService } from '../utils/logger';
import { AgentMessage, AgentConfig, MessageType, Task, TaskResult } from '../types';
import { EventEmitter } from 'events';
import { SecurityManager, SecurityConfig } from '@agent-forge/shared';

// Global message broker for inter-agent communication
const globalMessageBroker = new EventEmitter();

export abstract class BaseWikiAgent extends BaseAgent {
  protected logger: LoggerService;
  protected agentType: string;
  protected messageBroker: EventEmitter;
  protected security: SecurityManager;
  protected agentState: Record<string, unknown> = {};
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    super(config);
    this.logger = LoggerService.getInstance();
    this.agentType = config.agentType || 'WikiAgent';
    this.messageBroker = globalMessageBroker;
    this.config = config;

    // Initialize security
    const securityConfig: SecurityConfig = {
      encryption: {
        messages: config.securityConfig?.encryption?.messages ?? true,
        state: config.securityConfig?.encryption?.state ?? true
      },
      audit: {
        enabled: config.securityConfig?.audit?.enabled ?? true,
        level: config.securityConfig?.audit?.level ?? 'basic'
      }
    };
    this.security = SecurityManager.getInstance(securityConfig);
  }

  public getId(): string {
    return this.id;
  }

  protected async executeTask(task: any): Promise<TaskResult> {
    try {
      // Log task execution start
      await this.security.logAgentAction({
        agentId: this.getId(),
        operation: 'EXECUTE_TASK',
        timestamp: new Date(),
        metadata: {
          taskId: task.id,
          taskType: task.type
        }
      });

      // Execute task logic
      const result = await this.processTask(task);

      // Encrypt task result if it contains sensitive data
      if (task.secure) {
        result.data = await this.security.encryptState(
          result.data as Record<string, unknown>,
          this.config.encryptionKey || ''
        );
      }

      return result;
    } catch (error) {
      await this.security.logError(error as Error, {
        agentId: this.getId(),
        operation: 'EXECUTE_TASK',
        timestamp: new Date(),
        metadata: { taskId: task.id }
      });
      throw error;
    }
  }

  protected abstract processTask(task: Task): Promise<TaskResult>;

  protected async sendMessage(message: AgentMessage): Promise<void> {
    try {
      // Encrypt message before sending
      const secureMessage = await this.security.secureMessage(
        message as unknown as Record<string, unknown>,
        this.config.encryptionKey || ''
      );

      // Log the secure operation
      await this.security.logAgentAction({
        agentId: this.getId(),
        operation: 'SEND_MESSAGE',
        timestamp: new Date(),
        metadata: {
          messageType: message.type,
          target: message.target
        }
      });

      this.messageBroker.emit('message', secureMessage);
    } catch (error) {
      await this.security.logError(error as Error, {
        agentId: this.getId(),
        operation: 'SEND_MESSAGE',
        timestamp: new Date()
      });
      throw error;
    }
  }

  protected async handleMessage(message: AgentMessage): Promise<TaskResult> {
    try {
      // Log message receipt
      await this.security.logAgentAction({
        agentId: this.getId(),
        operation: 'RECEIVE_MESSAGE',
        timestamp: new Date(),
        metadata: {
          messageType: message.type,
          source: message.source
        }
      });

      // Process message based on type
      switch (message.type) {
        case MessageType.TOPIC:
          await this.handleTopicMessage(message);
          break;
        case MessageType.SEARCH_QUERIES:
          await this.handleSearchQueriesMessage(message);
          break;
        case MessageType.SEARCH_RESULTS:
          await this.handleSearchResultsMessage(message);
          break;
        case MessageType.ARTICLE:
          await this.handleArticleMessage(message);
          break;
        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }

      return {
        success: true,
        data: message.data
      };
    } catch (error) {
      await this.security.logError(error as Error, {
        agentId: this.getId(),
        operation: 'RECEIVE_MESSAGE',
        timestamp: new Date()
      });
      throw error;
    }
  }

  protected async saveState(state: Record<string, unknown>): Promise<void> {
    try {
      // Encrypt state before saving
      const encryptedState = await this.security.encryptState(
        state,
        this.config.encryptionKey || ''
      );

      await this.security.logAgentAction({
        agentId: this.getId(),
        operation: 'SAVE_STATE',
        timestamp: new Date()
      });

      // Store encrypted state
      this.agentState = encryptedState;
    } catch (error) {
      await this.security.logError(error as Error, {
        agentId: this.getId(),
        operation: 'SAVE_STATE',
        timestamp: new Date()
      });
      throw error;
    }
  }

  protected async publishMessage(message: AgentMessage): Promise<void> {
    this.logger.info('Publishing message', {
      messageType: message.type,
      source: message.source,
      target: message.target,
      agentId: this.getId(),
    });
    await this.sendMessage(message);
  }

  // Abstract methods that need to be implemented by derived classes
  protected abstract handleTopicMessage(message: AgentMessage): Promise<void>;
  protected abstract handleSearchQueriesMessage(message: AgentMessage): Promise<void>;
  protected abstract handleSearchResultsMessage(message: AgentMessage): Promise<void>;
  protected abstract handleArticleMessage(message: AgentMessage): Promise<void>;
}
