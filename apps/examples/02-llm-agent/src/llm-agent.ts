import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { OpenAIProvider } from '@agent-forge/llm-provider';
import { Logger } from '@agent-forge/shared';

/**
 * An agent that uses OpenAI's GPT models for natural language processing
 */
export class LLMAgent extends BaseAgent {
  private llmProvider: OpenAIProvider;

  constructor(config: any) {
    super(config);
    this.llmProvider = new OpenAIProvider();
  }

  protected async onInitialize(): Promise<void> {
    // Initialize OpenAI provider with API key
    this.llmProvider.initialize({
      apiKey: process.env.OPENAI_API_KEY || '',
      modelName: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7
    });
    
    Logger.info('LLM agent initialized', { agentId: this.id });
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const { operation, text } = task.config.data;
      let prompt: string;

      // Construct prompt based on operation
      switch (operation) {
        case 'summarize':
          prompt = `Please summarize the following text:\n\n${text}`;
          break;
        case 'translate':
          const { targetLanguage } = task.config.data;
          prompt = `Please translate the following text to ${targetLanguage}:\n\n${text}`;
          break;
        case 'analyze':
          prompt = `Please analyze the sentiment and key points of the following text:\n\n${text}`;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      // Use streaming for real-time responses
      let fullResponse = '';
      for await (const chunk of this.llmProvider.stream(prompt)) {
        fullResponse += chunk;
        // Emit progress updates
        this.events.emit('progress', {
          taskId: task.config.id,
          progress: fullResponse
        });
      }

      return {
        success: true,
        data: { result: fullResponse }
      };
    } catch (error) {
      Logger.error('Failed to execute task', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  protected async onStart(): Promise<void> {
    Logger.info('LLM agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('LLM agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('LLM agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('LLM agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('LLM agent terminated', { agentId: this.id });
  }

  protected async setupMessageHandlers(): Promise<void> {
    // No message handlers needed for this example
  }
}
