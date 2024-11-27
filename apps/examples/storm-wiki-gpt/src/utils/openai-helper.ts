import OpenAI from 'openai';
import { AgentConfig } from '../types';
import { LoggerService } from './logger';

export class OpenAIHelper {
  private openai: OpenAI;
  private logger: LoggerService;

  constructor(config: AgentConfig) {
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
    });
    this.logger = LoggerService.getInstance();
  }

  public async complete(prompt: string): Promise<string> {
    try {
      const startTime = this.logger.startOperation('openai_completion', {
        promptLength: prompt.length,
      });

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant focused on providing clear, concise, and accurate information.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const result = response.choices[0]?.message?.content?.trim() || '';

      this.logger.endOperation('openai_completion', startTime, {
        promptLength: prompt.length,
        responseLength: result.length,
      });

      return result;
    } catch (error) {
      this.logger.error('OpenAI completion failed', error as Error, {
        promptLength: prompt.length,
      });
      throw error;
    }
  }
}
