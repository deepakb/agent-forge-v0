import { BaseAgent, Message, AgentConfig } from './base-agent';
import OpenAI from 'openai';

export class KnowledgeAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(config: AgentConfig) {
    super(config);
    if (!config.apiKeys.openai) {
      throw new Error('OpenAI API key is required for KnowledgeAgent');
    }
    this.openai = new OpenAI({ apiKey: config.apiKeys.openai });
  }

  async processMessage(message: Message): Promise<void> {
    console.log(`KnowledgeAgent (${this.id}): Processing message:`, message.type);

    try {
      switch (message.type) {
        case 'query':
          await this.retrieveKnowledge(message.content, message.metadata.workflowId || '');
          break;
        default:
          console.log(`Unhandled message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  private async retrieveKnowledge(query: string, workflowId: string): Promise<void> {
    try {
      console.log('\nRetrieving knowledge for query:', query);
      
      // Use OpenAI to retrieve relevant knowledge
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a knowledgeable assistant that provides accurate information. Focus on providing factual, up-to-date information about the query. Be concise but comprehensive."
          },
          {
            role: "user",
            content: query
          }
        ]
      });

      const response = completion.choices[0].message.content;
      console.log('Knowledge retrieved successfully');
      
      // Send response back to the chatbot
      await this.sendMessage({
        type: 'knowledge_response',
        content: {
          response,
          query
        },
        metadata: {
          source: this.id,
          target: 'chatbot-agent',
          timestamp: Date.now(),
          workflowId
        }
      });
    } catch (error) {
      console.error('Error retrieving knowledge:', error);
      throw error;
    }
  }
}