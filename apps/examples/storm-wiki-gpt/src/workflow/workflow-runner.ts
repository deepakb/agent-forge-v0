import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { QueryAgent } from '../agents/query-agent';
import { FetchAgent } from '../agents/fetch-agent';
import { SynthesisAgent } from '../agents/synthesis-agent';
import { LoggerService } from '../utils/logger';
import { LoggerAdapter } from '../utils/logger-adapter';
import { EncryptionAdapter } from '../utils/encryption-adapter';
import { SecurityAdapter } from '../utils/security-adapter';
import { SecurityManager } from '@agent-forge/shared';
import crypto from 'crypto';
import {
  MessageType,
  AgentMessage,
  QueryAgentConfig,
  FetchAgentConfig,
  SynthesisAgentConfig,
  Task,
  TaskResult,
} from '../types';

class WorkflowError extends Error {
  readonly context: { workflowId: string };

  constructor(message: string, context: { workflowId: string }) {
    super(message);
    this.name = 'WorkflowError';
    this.context = context;
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, WorkflowError.prototype);
  }
}

export class WorkflowRunner {
  private emitter: EventEmitter;
  private logger: LoggerService;
  private workflowId: string;
  private queryAgentId: string;
  private fetchAgentId: string;
  private synthesisAgentId: string;
  private queryAgent: QueryAgent;
  private fetchAgent: FetchAgent;
  private synthesisAgent: SynthesisAgent;
  private security: SecurityManager;

  constructor(
    openaiApiKey: string,
    tavilyApiKey: string,
    topic: string,
    logLevel: string = 'info'
  ) {
    this.workflowId = uuidv4();
    this.emitter = new EventEmitter();
    this.logger = LoggerService.getInstance();

    // Initialize security with adapters
    this.security = new SecurityManager(
      new LoggerAdapter(),
      new EncryptionAdapter(),
      new SecurityAdapter(),
      {
        encryption: {
          messages: true,
          state: true
        },
        audit: {
          enabled: true,
          level: 'detailed'
        }
      }
    );

    // Initialize agents with security config
    const baseConfig = {
      type: 'agent',
      id: uuidv4(),
      name: 'Agent',
      capabilities: ['process-message'],
      maxConcurrentTasks: 1,
      retryAttempts: 3,
      openaiApiKey,
      tavilyApiKey,
      logLevel,
      encryptionKey: crypto.randomBytes(32).toString('hex'),
      securityConfig: {
        encryption: {
          messages: true,
          state: true
        },
        audit: {
          enabled: true,
          level: 'detailed' as const
        }
      }
    };

    // Create agents with secure configuration
    this.synthesisAgent = new SynthesisAgent({
      ...baseConfig,
      id: uuidv4(),
      name: 'SynthesisAgent',
      type: 'synthesis',
      agentType: 'SynthesisAgent',
      capabilities: ['process-article']
    });

    this.fetchAgent = new FetchAgent({
      ...baseConfig,
      id: uuidv4(),
      name: 'FetchAgent',
      type: 'fetch',
      agentType: 'FetchAgent',
      capabilities: ['fetch-articles'],
      synthesisAgentId: this.synthesisAgent.getId()
    });

    this.queryAgent = new QueryAgent({
      ...baseConfig,
      id: uuidv4(),
      name: 'QueryAgent',
      type: 'query',
      agentType: 'QueryAgent',
      capabilities: ['generate-queries'],
      fetchAgentId: this.fetchAgent.getId()
    });

    this.queryAgentId = this.queryAgent.getId();
    this.fetchAgentId = this.fetchAgent.getId();
    this.synthesisAgentId = this.synthesisAgent.getId();

    this.logger.info('All agents initialized successfully', {
      workflowId: this.workflowId,
      queryAgentId: this.queryAgentId,
      fetchAgentId: this.fetchAgentId,
      synthesisAgentId: this.synthesisAgentId,
    });

    // Start the workflow with the topic
    this.startWorkflow(topic).catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const workflowError = new WorkflowError(errorMessage, {
        workflowId: this.workflowId
      });
      
      this.logger.error('Workflow failed', workflowError);
      throw workflowError;
    });
  }

  private async startWorkflow(topic: string): Promise<void> {
    try {
      this.logger.info('Starting workflow', {
        workflowId: this.workflowId,
        topic,
      });

      // Create initial task
      const task: Task = {
        config: {
          id: uuidv4(),
          type: 'PROCESS_TOPIC',
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
          data: {
            agentId: this.queryAgentId,
            message: {
              type: MessageType.TOPIC,
              source: this.workflowId,
              target: this.queryAgentId,
              data: topic
            }
          },
          error: undefined
        }
      };

      const result = await this.submitTask(task);
      await this.handleTaskResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const workflowError = new WorkflowError(errorMessage, {
        workflowId: this.workflowId
      });
      this.logger.error('Workflow failed', workflowError);
      throw workflowError;
    }
  }

  private async submitTask(task: Task): Promise<TaskResult> {
    try {
      const taskData = task.result?.data as { agentId: string; message: AgentMessage };
      const agent = this.getAgent(taskData.agentId);
      if (!agent) {
        throw new Error(`Unknown agent: ${taskData.agentId}`);
      }

      return await agent.handleMessage(taskData.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const workflowError = new WorkflowError(errorMessage, {
        workflowId: this.workflowId,
        // taskId: task.config.id
      });
      this.logger.error('Task submission failed', workflowError);
      throw workflowError;
    }
  }

  private getAgent(agentId: string): QueryAgent | FetchAgent | SynthesisAgent | undefined {
    if (agentId === this.queryAgentId) return this.queryAgent;
    if (agentId === this.fetchAgentId) return this.fetchAgent;
    if (agentId === this.synthesisAgentId) return this.synthesisAgent;
    return undefined;
  }

  private async handleTaskResult(result: TaskResult): Promise<void> {
    try {
      const message = result.data as AgentMessage;
      if (!message) {
        throw new Error('Task result missing message data');
      }
      
      const logDetails = {
        context: {
          workflowId: this.workflowId,
          messageType: message.type,
          source: message.source,
          target: message.target
        }
      };
      this.logger.info('Handling task result', logDetails);

      if (message.type === MessageType.ARTICLE) {
        // Workflow complete
        this.logger.info('Workflow completed successfully', {
          workflowId: this.workflowId,
          articleLength: (message.data as string).length,
        });
        this.emitter.emit('complete', message.data);
        this.logger.info('Workflow completed', {
          agentId: 'workflow-runner',
          operation: 'COMPLETE_WORKFLOW',
          timestamp: new Date(),
          metadata: { topic: message.data }
        });
        return;
      }

      // Forward message to target agent
      const targetAgent = this.getAgent(message.target);
      if (!targetAgent) {
        throw new Error(`Unknown target agent: ${message.target}`);
      }

      this.logger.info('Forwarding message to target agent', {
        workflowId: this.workflowId,
        messageType: message.type,
        source: message.source,
        target: message.target,
      });

      const targetResult = await targetAgent.handleMessage(message);
      
      this.logger.info('Target agent processed message', {
        workflowId: this.workflowId,
        messageType: message.type,
        success: targetResult.success,
        hasError: !!targetResult.error,
      });

      if (!targetResult.success) {
        throw new Error(`Target agent failed: ${targetResult.error}`);
      }

      await this.handleTaskResult(targetResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const workflowError = new WorkflowError(errorMessage, {
        workflowId: this.workflowId
      });
      this.logger.error('Error in task result handler', workflowError);
      throw workflowError;
    }
  }

  public onComplete(callback: (result: unknown) => void): void {
    this.emitter.on('complete', callback);
  }
}
