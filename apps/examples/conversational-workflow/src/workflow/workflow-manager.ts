import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { SecurityManager, SecurityConfig } from '../security/security-manager';
import { CommunicationHub } from '../communication/communication-hub';
import { Message, IAgent } from '../agents/base-agent';
import { AuditLogger } from '../security/audit-logger';
import { ChatbotAgent } from '../agents/chatbot-agent';
import { KnowledgeAgent } from '../agents/knowledge-agent';
import { NewsFetcherAgent } from '../agents/news-fetcher-agent';
import { SummarizationAgent } from '../agents/summarization-agent';

export interface WorkflowConfig {
  maxRetries?: number;
  timeout?: number;
  securityConfig?: SecurityConfig;
  agents: {
    [key: string]: {
      type: string;
      config: any;
    };
  };
}

export class WorkflowManager extends EventEmitter {
  private config: WorkflowConfig;
  private securityManager: SecurityManager;
  private communicationHub: CommunicationHub;
  private auditLogger: AuditLogger;
  private activeWorkflows: Map<string, any>;
  private agents: Map<string, IAgent>;

  constructor(config: WorkflowConfig) {
    super();
    this.config = {
      maxRetries: 3,
      timeout: 60000,
      ...config
    };

    this.activeWorkflows = new Map();
    this.auditLogger = AuditLogger.getInstance();
    this.securityManager = SecurityManager.getInstance(this.config.securityConfig);
    this.communicationHub = CommunicationHub.getInstance();
    this.agents = new Map();

    this.initializeAgents();
    this.setupEventListeners();
  }

  private initializeAgents(): void {
    for (const [agentId, agentConfig] of Object.entries(this.config.agents)) {
      let agent: IAgent;

      switch (agentConfig.type.toLowerCase()) {
        case 'chatbot':
          agent = new ChatbotAgent({ id: agentId, ...agentConfig.config });
          break;
        case 'knowledge':
          agent = new KnowledgeAgent({ id: agentId, ...agentConfig.config });
          break;
        case 'newsfetcher':
          agent = new NewsFetcherAgent({ id: agentId, ...agentConfig.config });
          break;
        case 'summarization':
          agent = new SummarizationAgent({ id: agentId, ...agentConfig.config });
          break;
        default:
          throw new Error(`Unknown agent type: ${agentConfig.type}`);
      }

      this.agents.set(agentId, agent);
      this.communicationHub.registerAgent(agentId, agent);

      // Set up agent error handling
      agent.on('error', (error: Error) => {
        this.handleError(error, { agentId });
      });

      // Log agent initialization
      this.auditLogger.logSecurityEvent(
        'AGENT_INITIALIZED',
        { agentId, type: agentConfig.type },
        'info'
      );
    }
  }

  private setupEventListeners(): void {
    this.communicationHub.on('message', this.handleMessage.bind(this));
    this.communicationHub.on('error', this.handleError.bind(this));
  }

  public async processQuery(query: string): Promise<void> {
    const workflowId = uuidv4();
    
    try {
      this.activeWorkflows.set(workflowId, {
        status: 'active',
        startTime: Date.now(),
        query
      });

      const message: Message = {
        type: 'workflow_start',
        content: { query },
        metadata: {
          workflowId,
          source: 'workflow_manager',
          timestamp: Date.now()
        }
      };

      await this.securityManager.processMessage(message, 'workflow_manager');
      await this.communicationHub.broadcast(message);

      this.auditLogger.logSecurityEvent(
        'WORKFLOW_START',
        { workflowId, query },
        'info'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      await this.handleError(errorMessage, { workflowId });
      throw errorMessage;
    }
  }

  private async handleMessage(message: Message): Promise<void> {
    try {
      const { workflowId } = message.metadata;
      
      if (!workflowId || !this.activeWorkflows.has(workflowId)) {
        throw new Error(`Invalid workflow ID: ${workflowId}`);
      }

      const workflow = this.activeWorkflows.get(workflowId);
      
      if (message.type.toLowerCase() === 'workflow_complete') {
        await this.completeWorkflow(workflowId);
        this.emit('workflow_complete', { workflowId, workflow });
      } else if (message.type.toLowerCase() === 'workflow_error') {
        const error = new Error(message.content.error);
        await this.handleError(error, { workflowId });
      }

      this.emit('message_processed', { message, workflow });
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      await this.handleError(errorMessage);
    }
  }

  private async handleError(error: Error, context?: { workflowId?: string, agentId?: string }): Promise<void> {
    const errorMessage = error.message || 'Unknown error occurred';
    
    this.auditLogger.logSecurityEvent(
      'WORKFLOW_ERROR',
      { error: errorMessage, ...context },
      'error'
    );

    if (context?.workflowId) {
      this.activeWorkflows.set(context.workflowId, {
        ...this.activeWorkflows.get(context.workflowId),
        status: 'error',
        error: errorMessage
      });
    }

    this.emit('error', { error, context });
  }

  private async completeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    
    if (workflow) {
      workflow.status = 'completed';
      workflow.endTime = Date.now();
      
      await this.auditLogger.logSecurityEvent(
        'WORKFLOW_COMPLETE',
        { workflowId, duration: workflow.endTime - workflow.startTime },
        'info'
      );

      this.activeWorkflows.delete(workflowId);
    }
  }

  public async shutdown(): Promise<void> {
    try {
      // Complete all active workflows
      for (const [workflowId, workflow] of this.activeWorkflows.entries()) {
        if (workflow.status === 'active') {
          await this.completeWorkflow(workflowId);
        }
      }

      // Clear all active workflows
      this.activeWorkflows.clear();

      // Clean up agents
      for (const [agentId, agent] of this.agents.entries()) {
        agent.removeAllListeners();
        this.agents.delete(agentId);
      }

      // Remove all event listeners
      this.removeAllListeners();

      // Shutdown communication hub
      await this.communicationHub.shutdown();

      this.auditLogger.logSecurityEvent(
        'WORKFLOW_MANAGER_SHUTDOWN',
        { timestamp: Date.now() },
        'info'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      await this.handleError(errorMessage);
      throw errorMessage;
    }
  }
}
