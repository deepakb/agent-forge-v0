import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Content, ContentRequest, ContentStatus } from '../types/content';
import { EventTypes } from '../types/events';

export class ContentManagerAgent extends BaseAgent {
  private redis: Redis;
  private contentCache: Map<string, Content>;

  constructor(config: {
    id: string;
    name: string;
    redis: Redis;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'content-manager',
      capabilities: ['content-management', 'workflow-coordination']
    });

    this.redis = config.redis;
    this.contentCache = new Map();
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      switch (task.config.type) {
        case 'create-content':
          return await this.handleContentCreation(task.config.data);
        case 'update-content':
          return await this.handleContentUpdate(task.config.data);
        case 'process-analysis':
          return await this.handleAnalysisResults(task.config.data);
        case 'publish-content':
          return await this.handlePublishRequest(task.config.data);
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

  private async handleContentCreation(data: { request: ContentRequest }): Promise<TaskResult> {
    const content: Content = {
      id: uuidv4(),
      title: data.request.title || '',
      body: '',
      type: data.request.type,
      status: 'DRAFT',
      metadata: {
        language: 'en',
        targetAudience: data.request.targetAudience,
        topics: data.request.topics,
        keywords: data.request.keywords || [],
        readingTime: 0,
        complexity: 'INTERMEDIATE'
      },
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.saveContent(content);
    this.events.emit('content:created', { content });

    // Request content generation
    this.messageBroker.publish('generation:request', {
      contentId: content.id,
      request: data.request
    });

    return {
      success: true,
      data: { content }
    };
  }

  private async handleContentUpdate(data: { 
    contentId: string;
    updates: Partial<Content>;
  }): Promise<TaskResult> {
    const content = await this.getContent(data.contentId);
    if (!content) {
      throw new Error(`Content not found: ${data.contentId}`);
    }

    const updatedContent: Content = {
      ...content,
      ...data.updates,
      version: content.version + 1,
      updatedAt: new Date()
    };

    await this.saveContent(updatedContent);
    this.events.emit('content:updated', {
      content: updatedContent,
      changes: Object.keys(data.updates)
    });

    // Request new analysis if content body changed
    if (data.updates.body) {
      this.messageBroker.publish('analysis:request', {
        contentId: updatedContent.id
      });
    }

    return {
      success: true,
      data: { content: updatedContent }
    };
  }

  private async handleAnalysisResults(data: {
    contentId: string;
    analysis: any;
  }): Promise<TaskResult> {
    const content = await this.getContent(data.contentId);
    if (!content) {
      throw new Error(`Content not found: ${data.contentId}`);
    }

    const updatedContent: Content = {
      ...content,
      metadata: {
        ...content.metadata,
        qualityScore: data.analysis.scores.overall,
        seoScore: data.analysis.scores.seo
      },
      version: content.version + 1,
      updatedAt: new Date()
    };

    await this.saveContent(updatedContent);
    this.events.emit('content:analyzed', {
      content: updatedContent,
      analysis: data.analysis
    });

    // Auto-approve if scores are high enough
    if (data.analysis.scores.overall >= 0.8 && data.analysis.scores.seo >= 0.8) {
      await this.approveContent(updatedContent);
    }

    return {
      success: true,
      data: { content: updatedContent }
    };
  }

  private async handlePublishRequest(data: {
    contentId: string;
    target: any;
  }): Promise<TaskResult> {
    const content = await this.getContent(data.contentId);
    if (!content) {
      throw new Error(`Content not found: ${data.contentId}`);
    }

    if (content.status !== 'APPROVED') {
      throw new Error(`Content must be approved before publishing: ${data.contentId}`);
    }

    // Request publishing
    this.messageBroker.publish('publishing:request', {
      contentId: content.id,
      target: data.target
    });

    return {
      success: true,
      data: { content }
    };
  }

  private async approveContent(content: Content): Promise<void> {
    const approvedContent: Content = {
      ...content,
      status: 'APPROVED',
      version: content.version + 1,
      updatedAt: new Date()
    };

    await this.saveContent(approvedContent);
    this.events.emit('content:approved', {
      content: approvedContent,
      approver: 'system'
    });
  }

  private async saveContent(content: Content): Promise<void> {
    await this.redis.set(
      `content:${content.id}`,
      JSON.stringify(content)
    );
    this.contentCache.set(content.id, content);
  }

  private async getContent(id: string): Promise<Content | null> {
    // Check cache first
    if (this.contentCache.has(id)) {
      return this.contentCache.get(id)!;
    }

    // Fetch from Redis
    const data = await this.redis.get(`content:${id}`);
    if (!data) return null;

    const content = JSON.parse(data) as Content;
    this.contentCache.set(id, content);
    return content;
  }

  protected async setupMessageHandlers(): Promise<void> {
    // Handle content requests
    this.messageBroker.subscribe({
      type: 'content:requested',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'create-content',
            priority: 'HIGH',
            data: { request: message.payload.request }
          },
          metadata: {
            status: 'PENDING',
            createdAt: new Date()
          }
        };

        await this.handleTask(task);
      }
    });

    // Handle analysis completion
    this.messageBroker.subscribe({
      type: 'analysis:completed',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'process-analysis',
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

    // Handle publishing requests
    this.messageBroker.subscribe({
      type: 'publishing:requested',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'publish-content',
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
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('Content manager initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Content manager started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Content manager stopped', { agentId: this.id });
  }
}
