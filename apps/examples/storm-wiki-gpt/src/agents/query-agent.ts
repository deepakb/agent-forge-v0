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

  private extractJSONArray(text: string): string[] {
    try {
      // First try direct JSON parse
      return JSON.parse(text);
    } catch (e) {
      // Try to find JSON array in text
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e) {
          // If JSON parsing fails, try to parse line by line
          const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.startsWith('"') || line.startsWith('['))
            .map(line => {
              // Extract the query from the line
              const match = line.match(/"([^"]+)"/);
              return match ? match[1] : null;
            })
            .filter((query): query is string => query !== null);
          
          if (lines.length > 0) {
            return lines;
          }
        }
      }
      throw new Error('No valid queries found in response');
    }
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

      const prompt = `Generate 3-5 specific search queries to gather comprehensive information about "${topic}" for writing a Wikipedia-style article. Each query should focus on different aspects of the topic.

Requirements:
1. Return ONLY a JSON array of strings
2. Each string should be a complete search query
3. Do not include any other text or explanation

Example response format:
["query 1", "query 2", "query 3"]`;

      const response = await this.openai.complete(prompt);
      let queries: string[];
      
      try {
        queries = this.extractJSONArray(response);
        if (!Array.isArray(queries)) {
          throw new Error('Response is not an array');
        }
        
        // Clean and validate queries
        queries = queries
          .filter(query => typeof query === 'string' && query.trim().length > 0)
          .map(query => query.trim());
          
        if (queries.length === 0) {
          throw new Error('No valid queries found in response');
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        this.logger.error('Failed to parse OpenAI response', errorObj, {
          response,
        });
        queries = [topic]; // Fallback to using the topic as a query
      }

      this.logger.info('Generated search queries', {
        agentId: this.getId(),
        queryCount: queries.length,
        queries, // Log queries for debugging
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
        data: nextMessage
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error('Query agent failed', errorObj);
      return {
        success: false,
        data: null,
        error: errorObj.message
      };
    }
  }
}
