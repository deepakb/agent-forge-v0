import { OpenAI } from 'openai';
import { config } from '../config/config';

export interface SubTask {
  type: string;
  action: string;
  parameters: Record<string, any>;
}

export interface ParsedQuery {
  originalQuery: string;
  intent: string;
  subTasks: SubTask[];
}

export class QueryParser {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  public async parseQuery(query: string): Promise<ParsedQuery> {
    try {
      const prompt = `
        Analyze the following user query and break it down into subtasks:
        Query: "${query}"
        
        Provide a JSON response with:
        1. Main intent
        2. List of subtasks with type, action, and parameters
        
        Focus on these task types:
        - knowledge_retrieval
        - news_fetch
        - summarization
        - fact_check
      `;

      const response = await this.openai.chat.completions.create({
        model: config.api.openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      return {
        originalQuery: query,
        intent: parsed.intent,
        subTasks: parsed.subtasks
      };
    } catch (error) {
      console.error('Error parsing query:', error);
      // Fallback to basic parsing
      return this.fallbackParsing(query);
    }
  }

  private fallbackParsing(query: string): ParsedQuery {
    // Simple rule-based fallback
    const subtasks: SubTask[] = [];
    
    if (query.toLowerCase().includes('news')) {
      subtasks.push({
        type: 'news_fetch',
        action: 'fetch_recent',
        parameters: { topic: query }
      });
    }
    
    // Always add summarization as final step
    subtasks.push({
      type: 'summarization',
      action: 'summarize_results',
      parameters: { format: 'concise' }
    });

    return {
      originalQuery: query,
      intent: 'information_request',
      subTasks: subtasks
    };
  }
}
