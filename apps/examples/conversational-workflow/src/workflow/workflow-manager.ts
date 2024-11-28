import { EventEmitter } from 'events';
import { CommunicationHub } from '../communication/communication-hub';
import { ChatbotAgent } from '../agents/chatbot-agent';
import { NewsFetcherAgent } from '../agents/news-fetcher-agent';
import { KnowledgeAgent } from '../agents/knowledge-agent';
import { SummarizationAgent } from '../agents/summarization-agent';
import { IAgent, Message } from '../agents/base-agent';
import { AgentConfig, config } from '../config/config';

interface WorkflowContext {
  id: string;
  startTime: number;
  query: string;
  status: 'active' | 'completed' | 'error';
  error?: Error;
  agentStates: Map<string, any>;
}

export class WorkflowManager extends EventEmitter {
  private communicationHub: CommunicationHub;
  private agents: Map<string, IAgent>;
  private activeWorkflows: Map<string, WorkflowContext>;
  private readonly workflowTimeoutMs: number;
  private readonly maxRetries: number;

  constructor(agentConfigs: Record<string, AgentConfig>) {
    super();
    this.communicationHub = new CommunicationHub();
    this.agents = new Map();
    this.activeWorkflows = new Map();
    this.workflowTimeoutMs = config.workflowDefaults.timeoutMs;
    this.maxRetries = config.workflowDefaults.maxRetries;

    console.log('Initializing WorkflowManager with config:', {
      timeoutMs: this.workflowTimeoutMs,
      maxRetries: this.maxRetries,
      concurrentTasks: config.workflowDefaults.concurrentTasks,
    });

    // Initialize agents with their configurations
    Object.entries(agentConfigs).forEach(([type, config]) => {
      const agent = this.createAgent(type, config);
      if (agent) {
        this.agents.set(config.id, agent);
        this.communicationHub.registerAgent(agent);

        // Forward agent state changes
        agent.on('state_change', state => {
          this.handleAgentStateChange(agent.id, state);
        });

        // Forward agent errors
        agent.on('error', error => {
          this.handleAgentError(agent.id, error);
        });
      }
    });

    // Set up communication hub error handling
    this.communicationHub.on('error', (error: Error) => {
      console.error('Communication hub error:', error);
      this.emit('error', error);
    });

    // Listen for workflow completion events
    this.communicationHub.on('workflow_complete', (workflowId: string) => {
      this.completeWorkflow(workflowId);
    });

    // Listen for workflow errors
    this.communicationHub.on('workflow_error', (data: { workflowId: string; error: Error }) => {
      this.handleWorkflowError(data.workflowId, data.error);
    });
  }

  private handleAgentStateChange(agentId: string, state: any) {
    // Update workflow context with agent state
    for (const [workflowId, context] of this.activeWorkflows.entries()) {
      if (context.agentStates.has(agentId)) {
        context.agentStates.set(agentId, state);
        this.emit('agent_state_change', { workflowId, agentId, state });
      }
    }
  }

  private handleAgentError(agentId: string, error: Error) {
    console.error(`Agent error (${agentId}):`, error);
    this.emit('error', error);

    // Check if error affects any active workflows
    for (const [workflowId, context] of this.activeWorkflows.entries()) {
      if (context.agentStates.has(agentId)) {
        this.handleWorkflowError(workflowId, error);
      }
    }
  }

  private completeWorkflow(workflowId: string) {
    const context = this.activeWorkflows.get(workflowId);
    if (context) {
      context.status = 'completed';
      const duration = Date.now() - context.startTime;
      console.log(`Workflow ${workflowId} completed in ${duration}ms`);
      this.activeWorkflows.delete(workflowId);
      this.emit('workflow_complete', { workflowId, duration });
    }
  }

  private handleWorkflowError(workflowId: string, error: Error) {
    const context = this.activeWorkflows.get(workflowId);
    if (context) {
      context.status = 'error';
      context.error = error;
      const duration = Date.now() - context.startTime;
      console.error(`Workflow ${workflowId} failed after ${duration}ms:`, error);
      this.activeWorkflows.delete(workflowId);
      this.emit('workflow_error', { workflowId, error, duration });
    }
  }

  private createAgent(type: string, config: AgentConfig): IAgent | null {
    try {
      console.log(`Creating agent: ${type} (${config.id})`);
      switch (type) {
        case 'chatbot':
          return new ChatbotAgent(config);
        case 'newsFetcher':
          return new NewsFetcherAgent(config);
        case 'knowledge':
          return new KnowledgeAgent(config);
        case 'summarization':
          return new SummarizationAgent(config);
        default:
          throw new Error(`Unknown agent type: ${type}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to create agent ${type}:`, errorMessage);
      this.emit('error', new Error(`Failed to create agent ${type}: ${errorMessage}`));
      return null;
    }
  }

  public async processQuery(query: string): Promise<void> {
    try {
      // Get the chatbot agent as the primary coordinator
      const chatbotAgent = Array.from(this.agents.values()).find(
        agent => agent instanceof ChatbotAgent
      );

      if (!chatbotAgent) {
        throw new Error('Chatbot agent not found in workflow');
      }

      // Create a workflow context
      const workflowId = Date.now().toString();
      const context: WorkflowContext = {
        id: workflowId,
        startTime: Date.now(),
        query,
        status: 'active',
        agentStates: new Map(Array.from(this.agents.values()).map(agent => [agent.id, null])),
      };

      this.activeWorkflows.set(workflowId, context);
      console.log(`Starting workflow ${workflowId} for query: "${query}"`);

      // Set up workflow completion listener with configurable timeout
      const workflowComplete = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          const error = new Error(`Workflow timeout after ${this.workflowTimeoutMs}ms`);
          this.handleWorkflowError(workflowId, error);
          reject(error);
        }, this.workflowTimeoutMs);

        this.once(`workflow_complete_${workflowId}`, () => {
          clearTimeout(timeout);
          this.completeWorkflow(workflowId);
          resolve();
        });

        this.once(`workflow_error_${workflowId}`, error => {
          clearTimeout(timeout);
          this.handleWorkflowError(workflowId, error);
          reject(error);
        });
      });

      // Initialize the workflow with the chatbot agent
      await chatbotAgent.processMessage({
        type: 'query',
        content: query,
        metadata: {
          workflowId,
          timestamp: Date.now(),
          source: 'user',
          target: 'chatbot',
        },
      });

      // Wait for workflow completion or timeout
      await workflowComplete;
    } catch (error) {
      console.error('Error processing query:', error);
      this.emit('error', error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      const activeWorkflowCount = this.activeWorkflows.size;
      if (activeWorkflowCount > 0) {
        console.log(`Waiting for ${activeWorkflowCount} active workflows to complete...`);

        // Give workflows a chance to complete gracefully
        await Promise.race([
          Promise.all(
            Array.from(this.activeWorkflows.keys()).map(
              workflowId =>
                new Promise<void>(resolve => {
                  this.once(`workflow_complete_${workflowId}`, resolve);
                  this.once(`workflow_error_${workflowId}`, resolve);
                })
            )
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Shutdown timeout waiting for workflows')), 10000)
          ),
        ]);
      }

      console.log('Shutting down agents...');

      // Notify all agents to perform cleanup
      const shutdownPromises = Array.from(this.agents.values()).map(agent =>
        agent
          .processMessage({
            type: 'system',
            content: 'shutdown',
            metadata: {
              timestamp: Date.now(),
              source: 'system',
              target: agent.type,
            },
          })
          .catch(error => {
            console.error(`Error shutting down agent ${agent.id}:`, error);
          })
      );

      // Wait for all agents to cleanup with a timeout
      await Promise.race([
        Promise.all(shutdownPromises),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Shutdown timeout waiting for agents')), 5000)
        ),
      ]);

      // Clean up resources
      console.log('Cleaning up resources...');
      this.communicationHub.shutdown();
      this.removeAllListeners();
      this.agents.clear();
      this.activeWorkflows.clear();
      console.log('Workflow manager shutdown complete');
    } catch (error) {
      console.error('Error during shutdown:', error);
      this.emit('error', error);
      throw error;
    }
  }
}
