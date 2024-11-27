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
    super({
      id: `${config.agentType?.toLowerCase() || 'wiki'}-${Date.now()}`,
      name: config.agentType || 'WikiAgent',
      type: 'WIKI',
      capabilities: ['search', 'fetch', 'synthesize'],
      maxConcurrentTasks: 1,
      retryAttempts: 3,
    });
    this.logger = LoggerService.getInstance();
    this.agentType = config.agentType || 'WikiAgent';
    this.messageBroker = globalMessageBroker;
  }

  public getId(): string {
    return this.id;
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
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
      return { success: false, error: errorMessage };
    }
  }

  protected async setupMessageHandlers(): Promise<void> {
    this.messageBroker.on('message', async (message: AgentMessage) => {
      if (message.target === this.id) {
        try {
          await this.handleMessage(message);
        } catch (error) {
          this.logger.error('Error handling message', error as Error, {
            agentId: this.getId(),
            messageType: message.type,
          });
        }
      }
    });
  }

  protected abstract handleMessage(message: AgentMessage): Promise<void>;

  protected async onInitialize(): Promise<void> {
    this.logger.logAgentAction(this.getId(), 'initialize', {
      component: this.agentType,
      agentType: this.agentType,
    });
  }

  protected async onStart(): Promise<void> {
    this.logger.logAgentAction(this.getId(), 'start', {
      component: this.agentType,
      agentType: this.agentType,
    });
    await this.setupMessageHandlers();
  }

  protected async onPause(): Promise<void> {
    this.logger.logAgentAction(this.getId(), 'pause', {
      component: this.agentType,
      agentType: this.agentType,
    });
  }

  protected async onResume(): Promise<void> {
    this.logger.logAgentAction(this.getId(), 'resume', {
      component: this.agentType,
      agentType: this.agentType,
    });
  }

  protected async onStop(): Promise<void> {
    this.logger.logAgentAction(this.getId(), 'stop', {
      component: this.agentType,
      agentType: this.agentType,
    });
    this.messageBroker.removeAllListeners('message');
  }

  protected async onTerminate(): Promise<void> {
    this.logger.logAgentAction(this.getId(), 'terminate', {
      component: this.agentType,
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

      this.messageBroker.emit('message', message);

      await this.afterOperation('sendMessage', startTime, undefined, {
        source: message.source,
        target: message.target,
        type: message.type,
      });
    } catch (error) {
      await this.handleError('sendMessage', error as Error, {
        source: message.source,
        target: message.target,
        type: message.type,
      });
    }
  }

  public subscribeToMessages(callback: (message: AgentMessage) => void): void {
    this.messageBroker.on('message', (message: AgentMessage) => {
      if (message.target === this.getId()) {
        callback(message);
      }
    });
  }

  public async publishMessage(message: AgentMessage): Promise<void> {
    await this.sendMessage(message);
  }
}
