import { Logger } from '@agent-forge/shared';
import OpenAI from 'openai';
import { SearchResult } from '../types';

export class OpenAIHelper {
  private static openai: OpenAI;

  private static getClient(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is not set');
      }
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 5000; // 5 seconds

  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (error?.message?.includes('rate limit')) {
          Logger.warn(`Rate limit hit, attempt ${attempt}/${this.MAX_RETRIES}. Waiting before retry...`);
          await this.delay(this.RETRY_DELAY * attempt); // Exponential backoff
          continue;
        }
        
        throw error; // For non-rate-limit errors, throw immediately
      }
    }
    
    throw lastError || new Error('Operation failed after max retries');
  }

  public static async generateSummary(query: string, results: SearchResult[]): Promise<string> {
    try {
      Logger.info('Generating summary with OpenAI', { query });

      const prompt = this.buildPrompt(query, results);

      const response = await this.withRetry(async () => {
        return await this.getClient().chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that synthesizes information from multiple sources into clear, concise summaries.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });
      });

      const summary = response.choices[0]?.message?.content || 'Unable to generate summary';

      Logger.info('Summary generated successfully', {
        query,
        summaryLength: summary.length,
      });

      return summary;
    } catch (error) {
      Logger.error('Error generating summary', {
        query,
        error,
      });
      throw error;
    }
  }

  private static buildPrompt(query: string, results: SearchResult[]): string {
    const sourceTexts = results
      .map((result, index) => `Source ${index + 1} (${result.url}):\n${result.content}\n`)
      .join('\n');

    return `Please provide a comprehensive answer to the following query by synthesizing information from the provided sources:

Query: ${query}

Sources:
${sourceTexts}

Please provide a clear, well-organized summary that:
1. Directly answers the query
2. Synthesizes information from all relevant sources
3. Highlights any important nuances or contradictions
4. Maintains factual accuracy`;
  }
}
