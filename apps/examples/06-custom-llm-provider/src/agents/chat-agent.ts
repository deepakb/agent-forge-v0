import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { LLMProvider, LLMRequest } from '@agent-forge/llm-provider';
import { Logger } from '@agent-forge/shared';

export class ChatAgent extends BaseAgent {
  private primaryProvider: LLMProvider;
  private fallbackProvider?: LLMProvider;
  private useStreaming: boolean;

  constructor(config: {
    id: string;
    name: string;
    primaryProvider: LLMProvider;
    fallbackProvider?: LLMProvider;
    useStreaming?: boolean;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'chat',
      capabilities: ['text-generation']
    });

    this.primaryProvider = config.primaryProvider;
    this.fallbackProvider = config.fallbackProvider;
    this.useStreaming = config.useStreaming || false;
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const request: LLMRequest = {
        systemPrompt: task.config.data.systemPrompt,
        prompt: task.config.data.prompt,
        temperature: task.config.data.temperature,
        maxTokens: task.config.data.maxTokens
      };

      if (this.useStreaming) {
        return await this.handleStreamingResponse(request);
      } else {
        return await this.handleSyncResponse(request);
      }
    } catch (error) {
      Logger.error('Chat task execution failed', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleSyncResponse(request: LLMRequest): Promise<TaskResult> {
    try {
      const response = await this.primaryProvider.complete(request);
      return {
        success: true,
        data: {
          text: response.text,
          usage: response.usage
        }
      };
    } catch (error) {
      if (this.fallbackProvider) {
        Logger.warn('Primary provider failed, trying fallback', { error });
        const response = await this.fallbackProvider.complete(request);
        return {
          success: true,
          data: {
            text: response.text,
            usage: response.usage,
            usedFallback: true
          }
        };
      }
      throw error;
    }
  }

  private async handleStreamingResponse(request: LLMRequest): Promise<TaskResult> {
    return new Promise(async (resolve, reject) => {
      try {
        let fullText = '';
        const callback = async (chunk: string) => {
          fullText += chunk;
          this.events.emit('response-chunk', {
            taskId: this.id,
            chunk
          });
        };

        try {
          await this.primaryProvider.completeStream(request, callback);
        } catch (error) {
          if (this.fallbackProvider) {
            Logger.warn('Primary provider streaming failed, trying fallback', { error });
            await this.fallbackProvider.completeStream(request, callback);
          } else {
            throw error;
          }
        }

        resolve({
          success: true,
          data: {
            text: fullText
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  protected async setupMessageHandlers(): Promise<void> {
    // No message handlers needed for this example
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('Chat agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Chat agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Chat agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Chat agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Chat agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Chat agent terminated', { agentId: this.id });
  }
}
