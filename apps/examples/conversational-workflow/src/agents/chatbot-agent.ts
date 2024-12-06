import { BaseAgent, Message, AgentConfig } from './base-agent';
import OpenAI from 'openai';

export class ChatbotAgent extends BaseAgent {
  private openai: OpenAI;

  constructor(config: AgentConfig) {
    super(config);
    if (!config.apiKeys.openai) {
      throw new Error('OpenAI API key is required for ChatbotAgent');
    }
    this.openai = new OpenAI({ apiKey: config.apiKeys.openai });
  }

  async processMessage(message: Message): Promise<void> {
    console.log(`ChatbotAgent (${this.id}): Processing message:`, message.type);

    try {
      switch (message.type) {
        case 'query':
          await this.handleQuery(message);
          break;
        case 'response':
          await this.handleResponse(message);
          break;
        default:
          console.log(`Unhandled message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  private async handleQuery(message: Message): Promise<void> {
    const query = message.content;
    console.log(`Processing query: ${query}`);

    // Forward to knowledge agent for information retrieval
    await this.sendMessage({
      type: 'query',
      content: query,
      metadata: {
        source: this.id,
        target: 'knowledge-agent',
        timestamp: Date.now(),
        workflowId: message.metadata.workflowId
      }
    });

    // Forward to news agent for latest news
    await this.sendMessage({
      type: 'query',
      content: query,
      metadata: {
        source: this.id,
        target: 'news-fetcher-agent',
        timestamp: Date.now(),
        workflowId: message.metadata.workflowId
      }
    });
  }

  private async handleResponse(message: Message): Promise<void> {
    const response = message.content;
    
    try {
      // Check if either response contains an error
      const knowledgeError = response.knowledge?.error;
      const newsError = response.news?.error;

      let systemPrompt = "You are a helpful assistant that combines knowledge and news to provide comprehensive responses. ";
      if (knowledgeError || newsError) {
        systemPrompt += "Note: Some information sources were unavailable. Please inform the user about any limitations.";
      }

      // Generate a response using the information from other agents
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Please provide a response based on this information:
            
Knowledge: ${knowledgeError ? `[Error: ${knowledgeError}]` : (response.knowledge?.response || 'No knowledge available')}

News: ${newsError ? `[Error: ${newsError}]` : (JSON.stringify(response.news?.results || 'No news available'))}

Please format the response in a clear way, with separate sections for general information and latest news. If any services were unavailable, explain this to the user.`
          }
        ]
      });

      const finalResponse = completion.choices[0].message.content;
      console.log('\nGenerating final response...');
      
      // Send final response
      await this.sendMessage({
        type: 'final_response',
        content: {
          response: finalResponse,
          originalQuery: message.metadata.workflowId
        },
        metadata: {
          source: this.id,
          timestamp: Date.now(),
          workflowId: message.metadata.workflowId
        }
      });
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Send error response
      await this.sendMessage({
        type: 'final_response',
        content: {
          response: 'I apologize, but I encountered an error while processing your request. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error',
          originalQuery: message.metadata.workflowId
        },
        metadata: {
          source: this.id,
          timestamp: Date.now(),
          workflowId: message.metadata.workflowId
        }
      });
    }
  }
}