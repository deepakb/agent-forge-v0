import OpenAI from 'openai';
import { SearchResult } from '../types';
import { LoggerService, LogContext } from './logger';

export class OpenAIHelper {
  private static readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  private static readonly logger = LoggerService.getInstance();

  public static async generateSummary(
    query: string,
    results: SearchResult[]
  ): Promise<string> {
    const startTime = Date.now();
    const context: LogContext = {
      component: 'OpenAIHelper',
      operation: 'generateSummary',
    };

    try {
      this.logger.info('Initiating summary generation', {
        ...context,
        query,
        sourceCount: results.length,
      });

      const prompt = `Generate a comprehensive Wikipedia-style article about "${query}" using the provided sources. 
      
Requirements:
1. Follow Wikipedia's neutral point of view (NPOV) and formal tone
2. Include proper sections with == Section == headers
3. Add citations using [n] format, linking to the provided sources
4. Include a "References" section at the end
5. Focus on accuracy and factual information
6. Use proper Wikipedia formatting for quotes, emphasis, and lists

Sources to cite:
${results.map((result, index) => `[${index + 1}] ${result.url}`).join('\n')}

Content from sources:
${results.map(result => result.content).join('\n\n')}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a Wikipedia editor who creates well-researched, properly formatted articles with accurate citations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const summary = response.choices[0]?.message?.content || '';
      const duration = Date.now() - startTime;
      
      this.logger.trace('generateSummary', {
        ...context,
        status: 'success',
        summaryLength: summary.length,
        duration,
      });

      return summary;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.logger.error('Summary generation failed', {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
        duration,
      });
      
      throw error;
    }
  }
}
