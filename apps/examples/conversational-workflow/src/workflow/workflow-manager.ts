import { EventEmitter } from 'events';
import { IAgent, Message } from '../agents/base-agent';

export class WorkflowManager extends EventEmitter {
  private static instance: WorkflowManager;
  private agents: Map<string, IAgent>;
  private workflowQueue: Message[];
  private responseCollector: Map<string, any[]>;

  private constructor() {
    super();
    this.agents = new Map();
    this.workflowQueue = [];
    this.responseCollector = new Map();
  }

  public static getInstance(): WorkflowManager {
    if (!WorkflowManager.instance) {
      WorkflowManager.instance = new WorkflowManager();
    }
    return WorkflowManager.instance;
  }

  public registerAgent(agent: IAgent): void {
    console.log(`Registering agent: ${agent.type}`);
    this.agents.set(agent.id, agent);
    agent.on('message', (message: Message) => this.handleAgentMessage(message));
    agent.on('error', (error: Error) => this.emit('error', error));
  }

  public async startWorkflow(query: string): Promise<void> {
    const workflowId = Date.now().toString();
    console.log('\nStarting new workflow:', workflowId);
    console.log('User Query:', query);

    const message: Message = {
      type: 'query',
      content: query,
      metadata: {
        source: 'user',
        timestamp: Date.now(),
        workflowId
      }
    };

    this.responseCollector.set(workflowId, []);
    await this.processMessage(message);
  }

  private async processMessage(message: Message): Promise<void> {
    this.workflowQueue.push(message);
    
    while (this.workflowQueue.length > 0) {
      const currentMessage = this.workflowQueue.shift();
      if (!currentMessage) continue;

      const targetAgent = this.determineTargetAgent(currentMessage);
      if (targetAgent) {
        try {
          await targetAgent.processMessage(currentMessage);
        } catch (error) {
          console.error('Error processing message:', error);
          this.emit('error', error);
        }
      }
    }
  }

  private determineTargetAgent(message: Message): IAgent | undefined {
    if (message.metadata.target) {
      return this.agents.get(message.metadata.target);
    }

    if (message.metadata.source === 'user') {
      return Array.from(this.agents.values()).find(agent => agent.type === 'chatbot');
    }

    return Array.from(this.agents.values()).find(agent => 
      agent.type === message.type || agent.id === message.metadata.source
    );
  }

  private async handleAgentMessage(message: Message): Promise<void> {
    const workflowId = message.metadata.workflowId;
    
    if (message.type === 'knowledge_response' || message.type === 'news_response') {
      if (workflowId) {
        const responses = this.responseCollector.get(workflowId) || [];
        responses.push({
          type: message.type,
          content: message.content
        });
        this.responseCollector.set(workflowId, responses);
        
        // If we have both knowledge and news responses, generate final response
        if (responses.length === 2) {
          const combinedResponse = {
            type: 'response',
            content: {
              knowledge: responses.find(r => r.type === 'knowledge_response')?.content,
              news: responses.find(r => r.type === 'news_response')?.content
            },
            metadata: {
              source: 'workflow-manager',
              target: 'chatbot-agent',
              timestamp: Date.now(),
              workflowId
            }
          };
          
          await this.processMessage(combinedResponse);
          this.responseCollector.delete(workflowId);
        }
      }
    } else if (message.type === 'final_response') {
      console.log('\nFinal Response:');
      console.log(message.content.response);
      console.log('\n-------------------\n');
      
      // Emit event to notify that workflow is complete
      this.emit('workflow_complete', workflowId);
    } else {
      await this.processMessage(message);
    }
  }

  public onWorkflowComplete(callback: (workflowId: string) => void): void {
    this.on('workflow_complete', callback);
  }

  public async shutdown(): Promise<void> {
    console.log('Shutting down workflow manager...');
    this.workflowQueue = [];
    this.responseCollector.clear();
    this.agents.clear();
  }
}
