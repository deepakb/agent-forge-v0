import { EventEmitter } from 'events';
import { IAgent, Message } from '../agents/base-agent';

export class CommunicationHub extends EventEmitter {
  private agents: Map<string, IAgent>;
  private agentTypeMap: Map<string, string>;

  constructor() {
    super();
    this.agents = new Map();
    this.agentTypeMap = new Map([
      ['chatbot', 'chatbot'],
      ['news', 'newsFetcher'],
      ['knowledge', 'knowledge'],
      ['summarization', 'summarization']
    ]);
  }

  public registerAgent(agent: IAgent): void {
    this.agents.set(agent.id, agent);

    // Listen for messages from the agent
    agent.on('message', (message: Message) => {
      this.routeMessage(message);
    });

    // Listen for errors from the agent
    agent.on('error', (error: Error) => {
      this.emit('error', error);
    });

    // Listen for state changes from the agent
    agent.on('state_change', (state: any) => {
      this.emit('agent_state_change', { agentId: agent.id, state });
    });
  }

  private async routeMessage(message: Message): Promise<void> {
    try {
      // Check if this is a response from summarization agent
      if (message.type === 'response' && message.metadata.source === 'summarization-agent') {
        const chatbotAgent = Array.from(this.agents.values()).find(
          agent => agent.type === 'chatbot'
        );

        if (!chatbotAgent) {
          throw new Error('Chatbot agent not found');
        }

        await chatbotAgent.processMessage(message);

        // Complete the workflow after chatbot processes the summary
        if (message.metadata.workflowId) {
          this.emit('workflow_complete', message.metadata.workflowId);
        }
        return;
      }

      // Check if this is a response that needs summarization
      if (message.metadata.requiresSummarization) {
        const summarizationAgent = Array.from(this.agents.values()).find(
          agent => agent.type === 'summarization'
        );

        if (!summarizationAgent) {
          throw new Error('Summarization agent not found');
        }

        console.log(`Routing message to summarization agent for processing`);
        await summarizationAgent.processMessage(message);
        return;
      }

      const targetType = this.agentTypeMap.get(message.metadata.target || '');
      if (!targetType) {
        throw new Error(`Unknown target type: ${message.metadata.target}`);
      }

      const targetAgent = Array.from(this.agents.values()).find(
        agent => agent.type === targetType
      );

      if (!targetAgent) {
        throw new Error(`Target agent ${message.metadata.target} (${targetType}) not found`);
      }

      console.log(`Routing message from ${message.metadata.source} to ${targetAgent.id}`);
      await targetAgent.processMessage(message);
    } catch (error) {
      console.error('Error routing message:', error);
      this.emit('error', error);
      // Emit workflow error if we have a workflow ID
      if (message.metadata.workflowId) {
        this.emit('workflow_error', { 
          workflowId: message.metadata.workflowId,
          error: error instanceof Error ? error : new Error(String(error))
        });
      }
    }
  }

  public shutdown(): void {
    // Clean up event listeners
    this.removeAllListeners();
    this.agents.clear();
  }
}
