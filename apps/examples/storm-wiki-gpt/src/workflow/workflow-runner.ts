import { QueryAgent } from '../agents/query-agent';
import { FetchAgent } from '../agents/fetch-agent';
import { SynthesisAgent } from '../agents/synthesis-agent';
import { EventEmitter } from 'events';
import { AgentConfig, AgentMessage, MessageType, Task, TaskConfig, TaskMetadata } from '../types';
import { Logger } from '@agent-forge/shared';

export class WorkflowRunner {
  private queryAgent: QueryAgent;
  private fetchAgent: FetchAgent;
  private synthesisAgent: SynthesisAgent;
  private workflowEmitter: EventEmitter;

  constructor(config: AgentConfig) {
    this.workflowEmitter = new EventEmitter();
    
    Logger.initialize({
      component: 'WorkflowRunner'
    });

    // Initialize agents with proper configuration
    this.queryAgent = new QueryAgent({
      id: 'query-agent',
      name: 'QueryAgent',
      type: 'WIKI',
      capabilities: ['query'],
      maxConcurrentTasks: 1,
      retryAttempts: 3,
      ...config,
    });

    this.fetchAgent = new FetchAgent({
      id: 'fetch-agent',
      name: 'FetchAgent',
      type: 'WIKI',
      capabilities: ['fetch'],
      maxConcurrentTasks: 1,
      retryAttempts: 3,
      ...config,
    });

    this.synthesisAgent = new SynthesisAgent({
      id: 'synthesis-agent',
      name: 'SynthesisAgent',
      type: 'WIKI',
      capabilities: ['synthesize'],
      maxConcurrentTasks: 1,
      retryAttempts: 3,
      ...config,
    });

    // Set up message handlers
    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    try {
      // Listen for messages from Query Agent
      this.queryAgent.subscribeToMessages((message: AgentMessage) => {
        if (message.type === MessageType.QUERY) {
          // Forward query to fetch agent
          this.fetchAgent.publishMessage({
            ...message,
            source: 'WorkflowRunner',
            target: this.fetchAgent.getId()
          });
        }
      });

      // Listen for messages from Fetch Agent
      this.fetchAgent.subscribeToMessages((message: AgentMessage) => {
        if (message.type === MessageType.SEARCH_RESULTS) {
          // Forward search results to synthesis agent
          this.synthesisAgent.publishMessage({
            ...message,
            source: 'WorkflowRunner',
            target: this.synthesisAgent.getId()
          });
        }
      });

      // Listen for messages from Synthesis Agent
      this.synthesisAgent.subscribeToMessages((message: AgentMessage) => {
        if (message.type === MessageType.ARTICLE) {
          this.workflowEmitter.emit('workflowComplete', message.data);
        }
      });

      Logger.info('Message handlers set up successfully');
    } catch (error) {
      Logger.error('Error setting up message handlers', { error: error as Error });
      throw error;
    }
  }

  public async start(topic: string): Promise<void> {
    try {
      Logger.info('Starting workflow', { topic });

      const taskConfig: TaskConfig = {
        id: `topic-${Date.now()}`,
        type: MessageType.TOPIC,
        priority: 'MEDIUM',
        retryAttempts: 3,
        dependencies: [],
        requiredCapabilities: ['query']
      };

      const taskMetadata: TaskMetadata = {
        status: 'PENDING',
        createdAt: new Date(),
        attempts: 0,
        progress: 0
      };

      const task: Task = {
        config: taskConfig,
        metadata: taskMetadata,
        result: {
          success: true,
          data: topic
        }
      };

      // Start with query generation by sending message to query agent
      await this.queryAgent.publishMessage({
        type: MessageType.TOPIC,
        source: 'WorkflowRunner',
        target: this.queryAgent.getId(),
        data: task
      });

    } catch (error) {
      Logger.error('Error in workflow execution', { error: error as Error });
      throw error;
    }
  }

  public onWorkflowComplete(callback: (result: any) => void): void {
    try {
      this.workflowEmitter.on('workflowComplete', callback);
      Logger.info('Workflow completion callback registered');
    } catch (error) {
      Logger.error('Error registering workflow completion callback', { error: error as Error });
      throw error;
    }
  }
}
