import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { LLMProvider } from '@agent-forge/llm-provider';
import { v4 as uuidv4 } from 'uuid';
import { Content, ContentAnalysis, ContentSuggestion } from '../types/content';
import { EventTypes } from '../types/events';

export class AnalysisAgent extends BaseAgent {
  private llmProvider: LLMProvider;
  private analysisCache: Map<string, ContentAnalysis>;

  constructor(config: {
    id: string;
    name: string;
    llmProvider: LLMProvider;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'analysis',
      capabilities: ['content-analysis', 'quality-assessment']
    });

    this.llmProvider = config.llmProvider;
    this.analysisCache = new Map();
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      switch (task.config.type) {
        case 'analyze-content':
          return await this.analyzeContent(task.config.data);
        case 'validate-content':
          return await this.validateContent(task.config.data);
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

  private async analyzeContent(data: {
    content: Content;
  }): Promise<TaskResult> {
    const { content } = data;

    // Check cache first
    const cachedAnalysis = this.analysisCache.get(content.id);
    if (cachedAnalysis && cachedAnalysis.timestamp > content.updatedAt) {
      return {
        success: true,
        data: { analysis: cachedAnalysis }
      };
    }

    // Prepare analysis prompt
    const prompt = this.createAnalysisPrompt(content);

    try {
      // Get analysis from LLM
      const response = await this.llmProvider.complete({
        prompt,
        maxTokens: 1000,
        temperature: 0.3
      });

      // Parse LLM response
      const analysis = this.parseAnalysisResponse(response, content.id);
      
      // Cache analysis
      this.analysisCache.set(content.id, analysis);

      // Emit analysis event
      this.events.emit('content:analyzed', {
        content,
        analysis
      });

      return {
        success: true,
        data: { analysis }
      };
    } catch (error) {
      // Try fallback provider if available
      if (this.llmProvider.hasFallback()) {
        Logger.warn('Primary analysis failed, trying fallback', { error });
        return await this.analyzeContentWithFallback(content);
      }
      throw error;
    }
  }

  private async validateContent(data: {
    content: Content;
    requirements: any;
  }): Promise<TaskResult> {
    const { content, requirements } = data;

    // Prepare validation prompt
    const prompt = this.createValidationPrompt(content, requirements);

    try {
      // Get validation from LLM
      const response = await this.llmProvider.complete({
        prompt,
        maxTokens: 500,
        temperature: 0.1
      });

      // Parse validation response
      const validation = this.parseValidationResponse(response);

      return {
        success: true,
        data: { validation }
      };
    } catch (error) {
      Logger.error('Content validation failed', { error });
      throw error;
    }
  }

  private async analyzeContentWithFallback(content: Content): Promise<TaskResult> {
    try {
      await this.llmProvider.useFallback();
      const result = await this.analyzeContent({ content });
      await this.llmProvider.resetToDefault();
      return result;
    } catch (error) {
      Logger.error('Fallback analysis failed', { error });
      throw error;
    }
  }

  private createAnalysisPrompt(content: Content): string {
    return `
Analyze the following ${content.type.toLowerCase()} content and provide detailed feedback:

Title: ${content.title}
Content: ${content.body}

Evaluate the following aspects:
1. Grammar and clarity
2. Engagement and readability
3. SEO optimization
4. Content quality
5. Target audience alignment

Provide specific suggestions for improvement in JSON format.
    `.trim();
  }

  private createValidationPrompt(content: Content, requirements: any): string {
    return `
Validate if the following content meets the specified requirements:

Content:
${content.body}

Requirements:
${JSON.stringify(requirements, null, 2)}

Provide a detailed analysis of compliance and any violations in JSON format.
    `.trim();
  }

  private parseAnalysisResponse(response: string, contentId: string): ContentAnalysis {
    try {
      const parsed = JSON.parse(response);
      
      return {
        id: uuidv4(),
        contentId,
        scores: {
          grammar: this.normalizeScore(parsed.scores.grammar),
          clarity: this.normalizeScore(parsed.scores.clarity),
          engagement: this.normalizeScore(parsed.scores.engagement),
          seo: this.normalizeScore(parsed.scores.seo),
          overall: this.calculateOverallScore(parsed.scores)
        },
        suggestions: this.parseSuggestions(parsed.suggestions),
        timestamp: new Date()
      };
    } catch (error) {
      Logger.error('Failed to parse analysis response', { error, response });
      throw new Error('Invalid analysis response format');
    }
  }

  private parseValidationResponse(response: string): any {
    try {
      return JSON.parse(response);
    } catch (error) {
      Logger.error('Failed to parse validation response', { error, response });
      throw new Error('Invalid validation response format');
    }
  }

  private parseSuggestions(raw: any[]): ContentSuggestion[] {
    return raw.map(suggestion => ({
      type: suggestion.type,
      severity: suggestion.severity,
      message: suggestion.message,
      context: {
        selection: suggestion.context.selection,
        suggestion: suggestion.context.suggestion
      }
    }));
  }

  private normalizeScore(score: number): number {
    return Math.max(0, Math.min(1, score));
  }

  private calculateOverallScore(scores: Record<string, number>): number {
    const weights = {
      grammar: 0.25,
      clarity: 0.25,
      engagement: 0.25,
      seo: 0.25
    };

    return Object.entries(weights).reduce(
      (sum, [key, weight]) => sum + (scores[key] || 0) * weight,
      0
    );
  }

  protected async setupMessageHandlers(): Promise<void> {
    // Handle analysis requests
    this.messageBroker.subscribe({
      type: 'analysis:request',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'analyze-content',
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

    // Handle validation requests
    this.messageBroker.subscribe({
      type: 'validation:request',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'validate-content',
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
    Logger.info('Analysis agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Analysis agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Analysis agent stopped', { agentId: this.id });
  }
}
