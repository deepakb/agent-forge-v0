import { BaseAgent, TYPES, Task, TaskResult, TaskStatus } from '@agent-forge/core';
import { LoggerService } from '../utils/logger';
import { AgentMessage, AgentConfig, MessageType } from '../types';
import EventEmitter from 'eventemitter3';
import { Logger } from '@agent-forge/shared';
import { inject, injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

// Global message broker for inter-agent communication
const globalMessageBroker = new EventEmitter();

@injectable()
export abstract class BaseWikiAgent extends BaseAgent {
  protected agentType: string;
  protected messageBroker: EventEmitter;
  protected agentState: Record<string, unknown> = {};

  constructor(
    @inject(TYPES.Logger) logger: Logger,
    @inject(TYPES.EventEmitter) events: EventEmitter,
    @inject(TYPES.TaskManager) taskManager: any,
    @inject(TYPES.MessageManager) messageManager: any,
    config: AgentConfig
  ) {
    super(logger, events, taskManager, messageManager, config);
    this.agentType = config.agentType || 'WikiAgent';
    this.messageBroker = globalMessageBroker;
  }

  public getId(): string {
    return this.id;
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      // Log task execution start
      this.logger.info('Executing task', {
        taskId: task.config.id,
        taskType: task.config.type,
        agentId: this.getId()
      });

      // Execute task logic
      const result = await this.processTask(task);
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      const errorDetails = new Error('Error processing task');
      (errorDetails as any).task = {
        id: task.config.id,
        type: task.config.type
      };
      this.logger.error('Error processing task', errorDetails);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  protected abstract processTask(task: Task): Promise<TaskResult>;

  protected async sendMessage(message: AgentMessage): Promise<void> {
    this.logger.info('Sending message', {
      messageType: message.type,
      source: message.source,
      target: message.target,
      agentId: this.getId()
    });
    this.messageBroker.emit('message', message);
  }

  protected async handleMessage(message: AgentMessage): Promise<TaskResult> {
    try {
      // Log message receipt
      this.logger.info('Received message', {
        messageType: message.type,
        source: message.source,
        agentId: this.getId()
      });

      // Convert message to task
      const newTask: Task = {
        config: {
          id: uuidv4(),
          type: message.type,
          retryAttempts: 3,
          priority: 'MEDIUM',
          dependencies: [],
          requiredCapabilities: []
        },
        metadata: {
          status: 'PENDING',
          createdAt: new Date(),
          attempts: 0,
          progress: 0
        },
        result: {
          success: false,
          data: message.data,
          error: undefined
        }
      };

      // Process task
      return await this.processTask(newTask);
    } catch (error) {
      const errorDetails = new Error('Error handling message');
      (errorDetails as any).message = {
        type: message.type,
        source: message.source,
        target: message.target
      };
      this.logger.error('Error handling message', errorDetails);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  protected async saveState(state: Record<string, unknown>): Promise<void> {
    this.logger.info('Saving state', {
      agentId: this.getId(),
      operation: 'SAVE_STATE'
    });
    this.agentState = state;
  }

  protected async publishMessage(message: AgentMessage): Promise<void> {
    try {
      this.logger.info('Publishing message', {
        messageType: message.type,
        source: message.source,
        target: message.target,
        agentId: this.getId()
      });
      await this.sendMessage(message);
    } catch (error) {
      const errorDetails = new Error('Error publishing message');
      (errorDetails as any).message = {
        type: message.type,
        source: message.source,
        target: message.target
      };
      this.logger.error('Error publishing message', errorDetails);
    }
  }

  // Abstract methods that need to be implemented by derived classes
  protected abstract handleTopicMessage(message: AgentMessage): Promise<void>;
  protected abstract handleSearchQueriesMessage(message: AgentMessage): Promise<void>;
  protected abstract handleSearchResultsMessage(message: AgentMessage): Promise<void>;
  protected abstract handleArticleMessage(message: AgentMessage): Promise<void>;
}
