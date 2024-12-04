import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import {
  AgentConfig,
  AgentLifecycle,
  AgentMetadata,
  AgentState,
  AgentStatus,
  MessageHandler,
  Task,
  TaskResult,
} from '../types';
import { Logger } from '@agent-forge/shared';

export abstract class BaseAgent implements AgentLifecycle {
  protected readonly id: string;
  protected config: AgentConfig;
  protected metadata: AgentMetadata;
  protected events: EventEmitter;
  protected isRunning: boolean;
  protected currentTasks: Map<string, Task>;
  protected messageHandlers: Map<string, MessageHandler>;
  private readonly logger: Logger;

  constructor(config: Partial<AgentConfig> = {}) {
    this.id = config.id || uuidv4();
    this.events = new EventEmitter();
    this.isRunning = false;
    this.currentTasks = new Map();
    this.messageHandlers = new Map();
    this.logger = new Logger();

    this.config = {
      id: this.id,
      name: config.name || `agent-${this.id}`,
      type: config.type || 'base',
      capabilities: config.capabilities || [],
      maxConcurrentTasks: config.maxConcurrentTasks || 1,
      retryAttempts: config.retryAttempts || 3,
    };

    this.metadata = {
      startTime: new Date(),
      lastHeartbeat: new Date(),
      currentTasks: [],
      completedTasks: 0,
      failedTasks: 0,
      status: 'INITIALIZING',
    };
  }

  public async initialize(config: AgentConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.setupMessageHandlers();
    await this.onInitialize();
    this.metadata.status = 'IDLE';
    await this.emitStateChange();
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Agent is already running');
    }

    this.isRunning = true;
    this.metadata.status = 'IDLE';
    await this.startHeartbeat();
    await this.onStart();
    await this.emitStateChange();
  }

  public async pause(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Agent is not running');
    }

    this.metadata.status = 'PAUSED';
    await this.onPause();
    await this.emitStateChange();
  }

  public async resume(): Promise<void> {
    if (this.metadata.status !== 'PAUSED') {
      throw new Error('Agent is not paused');
    }

    this.metadata.status = this.currentTasks.size > 0 ? 'BUSY' : 'IDLE';
    await this.onResume();
    await this.emitStateChange();
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      throw new Error('Agent is not running');
    }

    this.isRunning = false;
    this.metadata.status = 'TERMINATED';
    await this.onStop();
    await this.emitStateChange();
  }

  public async terminate(): Promise<void> {
    await this.stop();
    this.events.removeAllListeners();
    await this.onTerminate();
  }

  public getState(): AgentState {
    return {
      config: this.config,
      metadata: this.metadata,
    };
  }

  public getStatus(): AgentStatus {
    return this.metadata.status;
  }

  protected async handleTask(task: Task): Promise<TaskResult> {
    try {
      this.currentTasks.set(task.config.id, task);
      this.metadata.currentTasks.push(task.config.id);
      this.metadata.status = 'BUSY';
      await this.emitStateChange();

      const result = await this.executeTask(task);

      this.currentTasks.delete(task.config.id);
      this.metadata.currentTasks = this.metadata.currentTasks.filter(id => id !== task.config.id);
      this.metadata.completedTasks++;
      this.metadata.status = this.currentTasks.size > 0 ? 'BUSY' : 'IDLE';
      await this.emitStateChange();

      return result;
    } catch (error) {
      this.metadata.failedTasks++;
      this.metadata.status = 'ERROR';
      await this.emitStateChange();

      throw error;
    }
  }

  protected abstract executeTask(task: Task): Promise<TaskResult>;
  protected abstract setupMessageHandlers(): Promise<void>;
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onPause(): Promise<void>;
  protected abstract onResume(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onTerminate(): Promise<void>;

  private async startHeartbeat(): Promise<void> {
    const interval = setInterval(() => {
      this.metadata.lastHeartbeat = new Date();
      this.emitStateChange().catch(error => {
        this.logger.error('Failed to emit heartbeat', error, { agentId: this.id });
      });
    }, 30000); // Every 30 seconds

    this.events.once('terminate', () => {
      clearInterval(interval);
    });
  }

  private async emitStateChange(): Promise<void> {
    this.events.emit('stateChanged', this.getState());
  }
}
