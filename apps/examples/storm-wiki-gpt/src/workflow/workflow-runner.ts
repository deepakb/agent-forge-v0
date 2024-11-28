import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { QueryAgent } from '../agents/query-agent';
import { FetchAgent } from '../agents/fetch-agent';
import { SynthesisAgent } from '../agents/synthesis-agent';
import { LoggerService } from '../utils/logger';
import {
  MessageType,
  AgentMessage,
  QueryAgentConfig,
  FetchAgentConfig,
  SynthesisAgentConfig,
  Task,
  TaskResult,
} from '../types';

interface WorkflowError extends Error {
  workflowId?: string;
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

  constructor(
    openaiApiKey: string,
    tavilyApiKey: string,
    topic: string,
  ) {
    this.workflowId = uuidv4();
    this.emitter = new EventEmitter();
    this.logger = LoggerService.getInstance();

    // Generate unique IDs for agents
    this.queryAgentId = `query-agent-${uuidv4()}`;
    this.fetchAgentId = `fetch-agent-${uuidv4()}`;
    this.synthesisAgentId = `synthesis-agent-${uuidv4()}`;

    // Initialize agents with proper configurations
    const queryAgentConfig: QueryAgentConfig = {
      agentType: 'query',
      openaiApiKey,
      tavilyApiKey,
      id: this.queryAgentId,
      fetchAgentId: this.fetchAgentId,
    };

    const fetchAgentConfig: FetchAgentConfig = {
      agentType: 'fetch',
      openaiApiKey,
      tavilyApiKey,
      id: this.fetchAgentId,
      synthesisAgentId: this.synthesisAgentId,
    };

    const synthesisAgentConfig: SynthesisAgentConfig = {
      agentType: 'synthesis',
      openaiApiKey,
      tavilyApiKey,
      id: this.synthesisAgentId,
    };

    try {
      // Initialize agents
      this.queryAgent = new QueryAgent(queryAgentConfig);
      this.fetchAgent = new FetchAgent(fetchAgentConfig);
      this.synthesisAgent = new SynthesisAgent(synthesisAgentConfig);

      this.logger.info('All agents initialized successfully', {
        workflowId: this.workflowId,
        queryAgentId: this.queryAgentId,
        fetchAgentId: this.fetchAgentId,
        synthesisAgentId: this.synthesisAgentId,
      });

      // Start the workflow with the topic
      this.startWorkflow(topic).catch((error) => {
        const workflowError = error as WorkflowError;
        workflowError.workflowId = this.workflowId;
        this.logger.error('Workflow failed', workflowError);
      });
    } catch (error) {
      const workflowError = error as WorkflowError;
      workflowError.workflowId = this.workflowId;
      this.logger.error('Failed to initialize workflow', workflowError);
      throw error;
    }
  }

  private async startWorkflow(topic: string): Promise<void> {
    try {
      const startTime = this.logger.startOperation('workflow_execution', {
        workflowId: this.workflowId,
        topic,
      });

      // Create initial message
      const initialMessage: AgentMessage = {
        type: MessageType.TOPIC,
        source: 'workflow',
        target: this.queryAgentId,
        data: topic,
      };

      // Create and submit initial task
      const task: Task = {
        id: uuidv4(),
        type: 'INITIAL',
        data: {
          agentId: this.queryAgentId,
          message: initialMessage
        }
      };

      const result = await this.submitTask(task);
      await this.handleTaskResult(result);

      this.logger.endOperation('workflow_execution', startTime, {
        workflowId: this.workflowId,
        topic,
        status: 'completed',
      });
    } catch (error) {
      const workflowError = error as WorkflowError;
      workflowError.workflowId = this.workflowId;
      this.logger.error('Error in workflow execution', workflowError);
      throw error;
    }
  }

  private async submitTask(task: Task): Promise<TaskResult> {
    const agentId = (task.data as { agentId: string }).agentId;
    const message = (task.data as { message: AgentMessage }).message;
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found for ID: ${agentId}`);
    }
    return agent.handleMessage(message);
  }

  private getAgent(agentId: string): QueryAgent | FetchAgent | SynthesisAgent | undefined {
    if (agentId === this.queryAgentId) return this.queryAgent;
    if (agentId === this.fetchAgentId) return this.fetchAgent;
    if (agentId === this.synthesisAgentId) return this.synthesisAgent;
    return undefined;
  }

  private async handleTaskResult(result: TaskResult): Promise<void> {
    try {
      if (!result.message) {
        throw new Error('Task result missing message');
      }

      const message = result.message;
      
      if (message.type === MessageType.ARTICLE) {
        // Workflow complete
        this.logger.info('Workflow completed successfully', {
          workflowId: this.workflowId,
          articleLength: (message.data as string).length,
        });
        this.emitter.emit('complete', message.data);
        return;
      }

      // Create and submit next task
      const task: Task = {
        id: uuidv4(),
        type: 'MESSAGE',
        data: {
          agentId: message.target,
          message
        }
      };

      const nextResult = await this.submitTask(task);
      await this.handleTaskResult(nextResult);
    } catch (error) {
      const workflowError = error as WorkflowError;
      workflowError.workflowId = this.workflowId;
      this.logger.error('Error in task result handler', workflowError);
      throw error;
    }
  }

  public onComplete(callback: (result: unknown) => void): void {
    this.emitter.on('complete', callback);
  }
}
