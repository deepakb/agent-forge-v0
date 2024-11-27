import { BaseAgent } from '@agent-forge/core';
import { LoggerService } from '../utils/logger';
import { AgentMessage, AgentConfig, MessageType } from '../types';
import { EventEmitter } from 'events';
import { Task, TaskResult } from '@agent-forge/core';

// Global message broker for inter-agent communication
const globalMessageBroker = new EventEmitter();

export abstract class BaseWikiAgent extends BaseAgent {
  protected logger: LoggerService;
  protected agentType: string;
  protected messageBroker: EventEmitter;

  constructor(config: AgentConfig) {
    super(config);
    this.logger = LoggerService.getInstance();
    this.agentType = config.agentType || 'WikiAgent';
    this.messageBroker = globalMessageBroker;
  }

  public getId(): string {
    return this.id;
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      this.logger.info('Executing task', {
        taskId: task.config.id,
        taskType: task.config.type,
        agentId: this.getId(),
      });

      const message: AgentMessage = {
        type: task.config.type as MessageType,
        source: this.getId(),
        target: this.getId(),
        data: task
      };

      await this.handleMessage(message);
      return task.result || { success: true, data: undefined };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Task execution failed', error as Error, {
        taskId: task.config.id,
        taskType: task.config.type,
        agentId: this.getId(),
      });
      return { success: false, error: errorMessage };
    }
  }

  protected async setupMessageHandlers(): Promise<void> {
    this.logger.info('Setting up message handlers', {
      agentId: this.getId(),
      agentType: this.agentType,
    });

    this.messageBroker.on('message', async (message: AgentMessage) => {
      if (message.target === this.id) {
        this.logger.info('Received message', {
          messageType: message.type,
          source: message.source,
          target: message.target,
          agentId: this.getId(),
        });

        try {
          await this.handleMessage(message);
        } catch (error) {
          this.logger.error('Failed to handle message', error as Error, {
            messageType: message.type,
            source: message.source,
            target: message.target,
            agentId: this.getId(),
          });
        }
      }
    });
  }

  protected abstract handleMessage(message: AgentMessage): Promise<void>;

  protected async onInitialize(): Promise<void> {
    this.logger.info('Initializing agent', {
      agentId: this.getId(),
      agentType: this.agentType,
    });
  }

  protected async onStart(): Promise<void> {
    this.logger.info('Starting agent', {
      agentId: this.getId(),
      agentType: this.agentType,
    });
    await this.setupMessageHandlers();
  }

  protected async onPause(): Promise<void> {
    this.logger.info('Pausing agent', {
      agentId: this.getId(),
      agentType: this.agentType,
    });
  }

  protected async onResume(): Promise<void> {
    this.logger.info('Resuming agent', {
      agentId: this.getId(),
      agentType: this.agentType,
    });
  }

  protected async onStop(): Promise<void> {
    this.logger.info('Stopping agent', {
      agentId: this.getId(),
      agentType: this.agentType,
    });
    this.messageBroker.removeAllListeners('message');
  }

  protected async onTerminate(): Promise<void> {
    this.logger.info('Terminating agent', {
      agentId: this.getId(),
      agentType: this.agentType,
    });
    this.messageBroker.removeAllListeners('message');
  }

  protected async beforeOperation<T>(operation: string, params?: any): Promise<Date> {
    const startTime = this.logger.startOperation(operation, {
      component: this.agentType,
      agentId: this.getId(),
      agentType: this.agentType,
      ...params,
    });
    return startTime;
  }

  protected async afterOperation<T>(
    operation: string,
    startTime: Date,
    result: T,
    params?: any
  ): Promise<T> {
    this.logger.endOperation(operation, startTime, {
      component: this.agentType,
      agentId: this.getId(),
      agentType: this.agentType,
      ...params,
      resultCount: Array.isArray(result) ? result.length : undefined,
    });
    return result;
  }

  protected async handleError(operation: string, error: Error, params?: any): Promise<never> {
    this.logger.error(`Failed to ${operation}`, error, {
      component: this.agentType,
      agentId: this.getId(),
      agentType: this.agentType,
      operation,
      ...params,
    });
    throw error;
  }

  protected async sendMessage(message: AgentMessage): Promise<void> {
    try {
      const startTime = await this.beforeOperation('sendMessage', {
        source: message.source,
        target: message.target,
        type: message.type,
      });

      this.logger.info('Sending message', {
        messageType: message.type,
        source: message.source,
        target: message.target,
        agentId: this.getId(),
      });

      this.messageBroker.emit('message', message);

      await this.afterOperation('sendMessage', startTime, undefined, {
        source: message.source,
        target: message.target,
        type: message.type,
      });
    } catch (error) {
      this.logger.error('Failed to send message', error as Error, {
        messageType: message.type,
        source: message.source,
        target: message.target,
        agentId: this.getId(),
      });
      await this.handleError('sendMessage', error as Error, {
        source: message.source,
        target: message.target,
        type: message.type,
      });
    }
  }

  public subscribeToMessages(callback: (message: AgentMessage) => void): void {
    this.logger.info('Subscribing to messages', {
      agentId: this.getId(),
      agentType: this.agentType,
    });

    this.messageBroker.on('message', (message: AgentMessage) => {
      if (message.target === this.getId()) {
        this.logger.info('Message subscription triggered', {
          messageType: message.type,
          source: message.source,
          target: message.target,
          agentId: this.getId(),
        });
        callback(message);
      }
    });
  }

  public async publishMessage(message: AgentMessage): Promise<void> {
    this.logger.info('Publishing message', {
      messageType: message.type,
      source: message.source,
      target: message.target,
      agentId: this.getId(),
    });
    await this.sendMessage(message);
  }
}
