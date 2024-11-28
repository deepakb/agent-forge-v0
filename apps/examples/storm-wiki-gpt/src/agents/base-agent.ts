import { EventEmitter } from 'events';
import { AgentMessage, AgentConfig, TaskResult } from '../types';
import { LoggerService } from '../utils/logger';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected emitter: EventEmitter;
  protected logger: LoggerService;

  constructor(config: AgentConfig) {
    this.config = config;
    this.emitter = new EventEmitter();
    this.logger = LoggerService.getInstance();
  }

  public getId(): string {
    return this.config.id || '';
  }

  public abstract handleMessage(message: AgentMessage): Promise<TaskResult>;

  protected async publishMessage(message: AgentMessage): Promise<void> {
    this.emitter.emit('message', message);
  }

  public subscribeToMessages(callback: (message: AgentMessage) => void): void {
    this.emitter.on('message', callback);
  }
}
