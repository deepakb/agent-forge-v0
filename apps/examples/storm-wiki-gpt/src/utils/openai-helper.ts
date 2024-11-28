import OpenAI from 'openai';
import { AgentConfig } from '../types';
import { LoggerService } from './logger';

export class OpenAIHelper {
  private openai: OpenAI;
  private logger: LoggerService;
  private retryDelay = 1000; // Start with 1 second
  private maxRetries = 3;

  constructor(config: AgentConfig) {
    this.logger = LoggerService.getInstance();

    if (!config.openaiApiKey) {
      const error = new Error('OpenAI API key is required');
      this.logger.error('Failed to initialize OpenAIHelper', error);
      throw error;
    }
    
    try {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
      this.logger.info('OpenAIHelper initialized successfully');
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('Unknown error during OpenAI initialization');
      this.logger.error('Failed to initialize OpenAI client', wrappedError);
      throw wrappedError;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async completeWithRetry(prompt: string, attempt = 1): Promise<string> {
    try {
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

      const result = response.choices[0]?.message?.content?.trim();
      
      if (!result) {
        throw new Error('OpenAI returned empty response');
      }

      // Reset retry delay on success
      this.retryDelay = 1000;

      return result;
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('Unknown error during OpenAI completion');
      const errorMessage = wrappedError.message;
      
      // Check for rate limiting errors
      if (
        errorMessage.toLowerCase().includes('rate limit') ||
        (error instanceof OpenAI.APIError && error.status === 429)
      ) {
        if (attempt <= this.maxRetries) {
          this.logger.info('Rate limited by OpenAI API, retrying...', {
            attempt,
            retryDelay: this.retryDelay,
          });

          await this.delay(this.retryDelay);
          // Exponential backoff
          this.retryDelay *= 2;
          return this.completeWithRetry(prompt, attempt + 1);
        }
        const rateLimitError = new Error(`Rate limited by OpenAI API after ${attempt} attempts`);
        this.logger.error('Rate limit exceeded', rateLimitError);
        throw rateLimitError;
      }
      throw wrappedError;
    }
  }

  public async complete(prompt: string): Promise<string> {
    try {
      const startTime = this.logger.startOperation('openai_completion', {
        promptLength: prompt.length,
      });

      this.logger.info('Starting OpenAI completion', {
        promptLength: prompt.length,
      });

      const result = await this.completeWithRetry(prompt);

      this.logger.info('OpenAI completion successful', {
        promptLength: prompt.length,
        responseLength: result.length,
      });

      this.logger.endOperation('openai_completion', startTime, {
        promptLength: prompt.length,
        responseLength: result.length,
      });

      return result;
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('Unknown error during OpenAI completion');
      this.logger.error('OpenAI completion failed', wrappedError, {
        promptLength: prompt.length,
        errorMessage: wrappedError.message,
      });
      throw wrappedError;
    }
  }
}
