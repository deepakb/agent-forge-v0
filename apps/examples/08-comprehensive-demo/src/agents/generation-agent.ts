import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { LLMProvider } from '@agent-forge/llm-provider';
import { v4 as uuidv4 } from 'uuid';
import { Content, ContentRequest } from '../types/content';
import { EventTypes } from '../types/events';

export class GenerationAgent extends BaseAgent {
  private llmProvider: LLMProvider;
  private generationCache: Map<string, string>;

  constructor(config: {
    id: string;
    name: string;
    llmProvider: LLMProvider;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'generation',
      capabilities: ['content-generation', 'content-enhancement']
    });

    this.llmProvider = config.llmProvider;
    this.generationCache = new Map();
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      switch (task.config.type) {
        case 'generate-content':
          return await this.generateContent(task.config.data);
        case 'enhance-content':
          return await this.enhanceContent(task.config.data);
        case 'generate-variations':
          return await this.generateVariations(task.config.data);
        default:
          throw new Error(`Unknown task type: ${task.config.type}`);
      }
    } catch (error) {
      Logger.error('Task execution failed', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async generateContent(data: {
    request: ContentRequest;
  }): Promise<TaskResult> {
    const { request } = data;

    // Prepare generation prompt
    const prompt = this.createGenerationPrompt(request);

    try {
      // Generate content using LLM
      const response = await this.llmProvider.complete({
        prompt,
        maxTokens: this.calculateMaxTokens(request.length),
        temperature: 0.7
      });

      // Parse and format the generated content
      const content = this.formatGeneratedContent(response, request);

      // Cache the generated content
      this.generationCache.set(content.id, content.body);

      // Emit generation event
      this.events.emit('content:generated', { content });

      return {
        success: true,
        data: { content }
      };
    } catch (error) {
      if (this.llmProvider.hasFallback()) {
        Logger.warn('Primary generation failed, trying fallback', { error });
        return await this.generateContentWithFallback(request);
      }
      throw error;
    }
  }

  private async enhanceContent(data: {
    content: Content;
    improvements: string[];
  }): Promise<TaskResult> {
    const { content, improvements } = data;

    // Prepare enhancement prompt
    const prompt = this.createEnhancementPrompt(content, improvements);

    try {
      // Generate improvements using LLM
      const response = await this.llmProvider.complete({
        prompt,
        maxTokens: this.calculateMaxTokens('MEDIUM'),
        temperature: 0.5
      });

      // Parse and format the enhanced content
      const enhancedContent = this.formatEnhancedContent(response, content);

      // Emit enhancement event
      this.events.emit('content:enhanced', {
        content: enhancedContent,
        improvements
      });

      return {
        success: true,
        data: { content: enhancedContent }
      };
    } catch (error) {
      Logger.error('Content enhancement failed', { error });
      throw error;
    }
  }

  private async generateVariations(data: {
    content: Content;
    count: number;
  }): Promise<TaskResult> {
    const { content, count } = data;

    // Prepare variation prompt
    const prompt = this.createVariationPrompt(content, count);

    try {
      // Generate variations using LLM
      const response = await this.llmProvider.complete({
        prompt,
        maxTokens: this.calculateMaxTokens('MEDIUM') * count,
        temperature: 0.8
      });

      // Parse and format the variations
      const variations = this.formatVariations(response, content);

      return {
        success: true,
        data: { variations }
      };
    } catch (error) {
      Logger.error('Variation generation failed', { error });
      throw error;
    }
  }

  private async generateContentWithFallback(request: ContentRequest): Promise<TaskResult> {
    try {
      await this.llmProvider.useFallback();
      const result = await this.generateContent({ request });
      await this.llmProvider.resetToDefault();
      return result;
    } catch (error) {
      Logger.error('Fallback generation failed', { error });
      throw error;
    }
  }

  private createGenerationPrompt(request: ContentRequest): string {
    return `
Generate a ${request.type.toLowerCase()} with the following specifications:

Title: ${request.title || '[Generate appropriate title]'}
Topics: ${request.topics.join(', ')}
Target Audience: ${request.targetAudience}
Tone: ${request.tone}
Length: ${request.length}
Keywords: ${request.keywords?.join(', ') || 'Not specified'}

Requirements:
1. Maintain consistent tone and style
2. Include relevant examples and evidence
3. Optimize for readability and engagement
4. Incorporate specified keywords naturally
5. Follow SEO best practices

Please generate the content in markdown format.
    `.trim();
  }

  private createEnhancementPrompt(content: Content, improvements: string[]): string {
    return `
Enhance the following content based on these improvement suggestions:

Original Content:
${content.body}

Requested Improvements:
${improvements.map(imp => `- ${imp}`).join('\n')}

Please provide the enhanced version while maintaining the original tone and style.
    `.trim();
  }

  private createVariationPrompt(content: Content, count: number): string {
    return `
Generate ${count} variations of the following content while maintaining the core message:

Original Content:
${content.body}

Requirements:
1. Keep the same key points
2. Vary the tone and style
3. Use different examples or analogies
4. Maintain quality and accuracy

Please provide ${count} distinct variations in markdown format.
    `.trim();
  }

  private calculateMaxTokens(length: ContentRequest['length']): number {
    const tokenLimits = {
      SHORT: 500,
      MEDIUM: 1000,
      LONG: 2000
    };
    return tokenLimits[length] || tokenLimits.MEDIUM;
  }

  private formatGeneratedContent(response: string, request: ContentRequest): Content {
    return {
      id: uuidv4(),
      title: this.extractTitle(response) || request.title || '',
      body: this.cleanGeneratedText(response),
      type: request.type,
      status: 'DRAFT',
      metadata: {
        language: 'en',
        targetAudience: request.targetAudience,
        topics: request.topics,
        keywords: request.keywords || [],
        readingTime: this.estimateReadingTime(response),
        complexity: 'INTERMEDIATE'
      },
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private formatEnhancedContent(response: string, originalContent: Content): Content {
    return {
      ...originalContent,
      body: this.cleanGeneratedText(response),
      version: originalContent.version + 1,
      updatedAt: new Date()
    };
  }

  private formatVariations(response: string, originalContent: Content): Content[] {
    const variations = this.splitVariations(response);
    return variations.map(variation => ({
      ...originalContent,
      id: uuidv4(),
      body: this.cleanGeneratedText(variation),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private extractTitle(text: string): string | null {
    const titleMatch = text.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  private cleanGeneratedText(text: string): string {
    return text
      .trim()
      .replace(/^\s*#[^\n]+\n/, '') // Remove title
      .trim();
  }

  private splitVariations(text: string): string[] {
    return text
      .split(/(?=^Variation \d+:)/m)
      .filter(v => v.trim())
      .map(v => v.replace(/^Variation \d+:\s*/i, '').trim());
  }

  private estimateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  protected async setupMessageHandlers(): Promise<void> {
    // Handle generation requests
    this.messageBroker.subscribe({
      type: 'generation:request',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'generate-content',
            priority: 'HIGH',
            data: message.payload
          },
          metadata: {
            status: 'PENDING',
            createdAt: new Date()
          }
        };

        await this.handleTask(task);
      }
    });

    // Handle enhancement requests
    this.messageBroker.subscribe({
      type: 'enhancement:request',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'enhance-content',
            priority: 'MEDIUM',
            data: message.payload
          },
          metadata: {
            status: 'PENDING',
            createdAt: new Date()
          }
        };

        await this.handleTask(task);
      }
    });
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('Generation agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Generation agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Generation agent stopped', { agentId: this.id });
  }
}
