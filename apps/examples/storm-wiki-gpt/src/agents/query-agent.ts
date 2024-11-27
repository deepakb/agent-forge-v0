import { BaseAgent } from './base-agent';
import { AgentMessage, MessageType, QueryAgentConfig, TaskResult } from '../types';
import { OpenAIHelper } from '../utils/openai-helper';

export class QueryAgent extends BaseAgent {
  private openai: OpenAIHelper;
  private fetchAgentId: string;

  constructor(config: QueryAgentConfig) {
    super(config);
    this.openai = new OpenAIHelper(config);
    this.fetchAgentId = config.fetchAgentId;
  }

  public async handleMessage(message: AgentMessage): Promise<TaskResult> {
    try {
      if (message.type !== MessageType.TOPIC) {
        throw new Error(`Invalid message type for QueryAgent: ${message.type}`);
      }

      const topic = message.data as string;
      this.logger.info('Generating search queries', {
        agentId: this.getId(),
        topic,
      });

      const prompt = `Generate 3-5 specific search queries to gather comprehensive information about "${topic}" for writing a Wikipedia-style article. Each query should focus on different aspects of the topic. Format the response as a JSON array of strings.`;

      const response = await this.openai.complete(prompt);
      let queries: string[];
      
      try {
        queries = JSON.parse(response);
        if (!Array.isArray(queries)) {
          throw new Error('Response is not an array');
        }
      } catch (error) {
        this.logger.error('Failed to parse OpenAI response', error instanceof Error ? error : new Error('Unknown error'));
        queries = [topic]; // Fallback to using the topic as a query
      }

      this.logger.info('Generated search queries', {
        agentId: this.getId(),
        queryCount: queries.length,
      });

      const nextMessage: AgentMessage = {
        type: MessageType.SEARCH_QUERIES,
        source: this.getId(),
        target: this.fetchAgentId,
        data: queries,
      };

      await this.publishMessage(nextMessage);

      return {
        success: true,
        message: nextMessage,
      };
    } catch (error) {
      this.logger.error('Query agent failed', error instanceof Error ? error : new Error('Unknown error'));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
