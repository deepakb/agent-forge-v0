import { Logger } from '@agent-forge/shared';
import { EventEmitter } from 'events';
import { FetchAgent } from '../agents/fetch-agent';
import { QueryAgent } from '../agents/query-agent';
import { SynthesisAgent } from '../agents/synthesis-agent';
import { Query, SynthesisResult } from '../types';

export class WorkflowRunner {
  private queryAgent: QueryAgent;
  private fetchAgent: FetchAgent;
  private synthesisAgent: SynthesisAgent;
  private eventEmitter: EventEmitter;
  private isRunning: boolean = false;

  constructor() {
    try {
      Logger.info('Initializing WorkflowRunner');
      this.eventEmitter = new EventEmitter();
      this.queryAgent = new QueryAgent();
      this.fetchAgent = new FetchAgent();
      this.synthesisAgent = new SynthesisAgent();
      Logger.info('WorkflowRunner initialized successfully');
    } catch (error) {
      Logger.error('Error initializing WorkflowRunner', { error });
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      if (this.isRunning) {
        Logger.warn('WorkflowRunner is already running');
        return;
      }

      Logger.info('Starting WorkflowRunner');
      await Promise.all([
        this.queryAgent.start(),
        this.fetchAgent.start(),
        this.synthesisAgent.start(),
      ]);

      this.setupEventHandlers();
      this.isRunning = true;
      Logger.info('WorkflowRunner started successfully');
    } catch (error) {
      Logger.error('Error starting WorkflowRunner', { error });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      if (!this.isRunning) {
        Logger.warn('WorkflowRunner is not running');
        return;
      }

      Logger.info('Stopping WorkflowRunner');
      await Promise.all([
        this.queryAgent.stop(),
        this.fetchAgent.stop(),
        this.synthesisAgent.stop(),
      ]);

      this.isRunning = false;
      Logger.info('WorkflowRunner stopped successfully');
    } catch (error) {
      Logger.error('Error stopping WorkflowRunner', { error });
      throw error;
    }
  }

  public async processQuery(query: Query): Promise<void> {
    try {
      if (!this.isRunning) {
        throw new Error('WorkflowRunner must be started before processing queries');
      }

      Logger.info('Processing query', { query });
      await this.queryAgent.processQuery(query);
    } catch (error) {
      Logger.error('Error processing query', { query, error });
      throw error;
    }
  }

  public onWorkflowComplete(callback: (result: SynthesisResult) => void): void {
    try {
      Logger.info('Registering workflow completion callback');
      this.eventEmitter.on('workflowComplete', callback);
    } catch (error) {
      Logger.error('Error registering workflow completion callback', { error });
      throw error;
    }
  }

  private setupEventHandlers(): void {
    try {
      Logger.info('Setting up event handlers');

      this.synthesisAgent.onSynthesisComplete((result: SynthesisResult) => {
        try {
          Logger.info('Synthesis complete, emitting workflowComplete event', {
            query: result.query,
          });
          this.eventEmitter.emit('workflowComplete', result);
        } catch (error) {
          Logger.error('Error handling synthesis completion', { error });
          throw error;
        }
      });

      Logger.info('Event handlers set up successfully');
    } catch (error) {
      Logger.error('Error setting up event handlers', { error });
      throw error;
    }
  }
}
