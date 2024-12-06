import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { v4 as uuidv4 } from 'uuid';
import { Content, PublishingTarget } from '../types/content';
import { EventTypes } from '../types/events';
import Redis from 'ioredis';

export class PublishingAgent extends BaseAgent {
  private redis: Redis;
  private publishingCache: Map<string, Set<string>>;
  private rateLimits: Map<PublishingTarget['platform'], number>;
  private lastPublished: Map<PublishingTarget['platform'], Date>;

  constructor(config: {
    id: string;
    name: string;
    redis: Redis;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'publishing',
      capabilities: ['content-publishing', 'distribution-management']
    });

    this.redis = config.redis;
    this.publishingCache = new Map();
    
    // Initialize rate limits (requests per minute)
    this.rateLimits = new Map([
      ['WEBSITE', 30],
      ['BLOG', 20],
      ['SOCIAL_MEDIA', 10],
      ['EMAIL', 5],
      ['DOCUMENTATION', 15]
    ]);

    this.lastPublished = new Map();
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      switch (task.config.type) {
        case 'publish-content':
          return await this.publishContent(task.config.data);
        case 'schedule-publishing':
          return await this.schedulePublishing(task.config.data);
        case 'update-published':
          return await this.updatePublished(task.config.data);
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

  private async publishContent(data: {
    content: Content;
    target: PublishingTarget;
  }): Promise<TaskResult> {
    const { content, target } = data;

    // Check if content is already published to this target
    if (this.isAlreadyPublished(content.id, target)) {
      throw new Error(`Content already published to ${target.platform}`);
    }

    // Check rate limits
    await this.enforceRateLimit(target.platform);

    try {
      // Format content for target platform
      const formattedContent = await this.formatForPlatform(content, target);

      // Publish to target platform
      const publishingResult = await this.publishToTarget(formattedContent, target);

      // Update publishing cache
      this.updatePublishingCache(content.id, target.platform);

      // Store publishing record in Redis
      await this.storePublishingRecord(content.id, target, publishingResult);

      // Emit publishing event
      this.events.emit('content:published', {
        content,
        target,
        result: publishingResult
      });

      return {
        success: true,
        data: { publishingResult }
      };
    } catch (error) {
      // Handle publishing failure
      this.events.emit('publishing:failed', {
        content,
        target,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async schedulePublishing(data: {
    content: Content;
    target: PublishingTarget;
    schedule: Date;
  }): Promise<TaskResult> {
    const { content, target, schedule } = data;

    // Validate schedule time
    if (schedule <= new Date()) {
      throw new Error('Schedule time must be in the future');
    }

    // Store scheduling information
    const schedulingKey = `scheduled:${content.id}:${target.platform}`;
    await this.redis.set(schedulingKey, JSON.stringify({
      content,
      target,
      schedule
    }));

    // Set expiration for scheduling key
    const ttl = schedule.getTime() - Date.now();
    await this.redis.pexpire(schedulingKey, ttl);

    return {
      success: true,
      data: { scheduled: schedule }
    };
  }

  private async updatePublished(data: {
    content: Content;
    target: PublishingTarget;
  }): Promise<TaskResult> {
    const { content, target } = data;

    // Verify content was previously published
    if (!this.isAlreadyPublished(content.id, target)) {
      throw new Error(`Content not previously published to ${target.platform}`);
    }

    // Check rate limits
    await this.enforceRateLimit(target.platform);

    try {
      // Format updated content
      const formattedContent = await this.formatForPlatform(content, target);

      // Update on target platform
      const updateResult = await this.updateOnTarget(formattedContent, target);

      // Emit update event
      this.events.emit('content:updated:published', {
        content,
        target,
        result: updateResult
      });

      return {
        success: true,
        data: { updateResult }
      };
    } catch (error) {
      // Handle update failure
      this.events.emit('publishing:update:failed', {
        content,
        target,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private isAlreadyPublished(contentId: string, target: PublishingTarget): boolean {
    return this.publishingCache.get(contentId)?.has(target.platform) || false;
  }

  private async enforceRateLimit(platform: PublishingTarget['platform']): Promise<void> {
    const limit = this.rateLimits.get(platform);
    if (!limit) return;

    const lastPublish = this.lastPublished.get(platform);
    if (lastPublish) {
      const timeSinceLastPublish = Date.now() - lastPublish.getTime();
      const minInterval = (60 * 1000) / limit; // Convert to milliseconds

      if (timeSinceLastPublish < minInterval) {
        const delay = minInterval - timeSinceLastPublish;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    this.lastPublished.set(platform, new Date());
  }

  private async formatForPlatform(content: Content, target: PublishingTarget): Promise<string> {
    switch (target.platform) {
      case 'WEBSITE':
      case 'BLOG':
        return this.formatForWeb(content, target);
      case 'SOCIAL_MEDIA':
        return this.formatForSocial(content);
      case 'EMAIL':
        return this.formatForEmail(content, target);
      case 'DOCUMENTATION':
        return this.formatForDocs(content);
      default:
        throw new Error(`Unsupported platform: ${target.platform}`);
    }
  }

  private formatForWeb(content: Content, target: PublishingTarget): string {
    // Apply web-specific formatting
    let formatted = content.body;

    if (target.formatting?.template) {
      formatted = this.applyTemplate(formatted, target.formatting.template);
    }

    return formatted;
  }

  private formatForSocial(content: Content): string {
    // Truncate and format for social media
    const maxLength = 280; // Twitter-like limit
    let formatted = content.body;

    if (formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength - 3) + '...';
    }

    return formatted;
  }

  private formatForEmail(content: Content, target: PublishingTarget): string {
    // Format for email distribution
    let formatted = `
      <h1>${content.title}</h1>
      <div class="content">
        ${content.body}
      </div>
      <div class="footer">
        <!-- Add email footer -->
      </div>
    `;

    if (target.formatting?.template) {
      formatted = this.applyTemplate(formatted, target.formatting.template);
    }

    return formatted;
  }

  private formatForDocs(content: Content): string {
    // Format for documentation system
    return `
      # ${content.title}

      ${content.body}

      ---
      Last updated: ${new Date().toISOString()}
    `;
  }

  private applyTemplate(content: string, template: string): string {
    return template.replace('{{content}}', content);
  }

  private async publishToTarget(formattedContent: string, target: PublishingTarget): Promise<any> {
    // Simulate publishing to different platforms
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      url: target.url || `https://example.com/${uuidv4()}`,
      timestamp: new Date()
    };
  }

  private async updateOnTarget(formattedContent: string, target: PublishingTarget): Promise<any> {
    // Simulate updating content on target platform
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      url: target.url,
      timestamp: new Date()
    };
  }

  private updatePublishingCache(contentId: string, platform: string): void {
    if (!this.publishingCache.has(contentId)) {
      this.publishingCache.set(contentId, new Set());
    }
    this.publishingCache.get(contentId)!.add(platform);
  }

  private async storePublishingRecord(
    contentId: string,
    target: PublishingTarget,
    result: any
  ): Promise<void> {
    const record = {
      contentId,
      target,
      result,
      timestamp: new Date()
    };

    await this.redis.set(
      `publishing:${contentId}:${target.platform}`,
      JSON.stringify(record)
    );
  }

  protected async setupMessageHandlers(): Promise<void> {
    // Handle publishing requests
    this.messageBroker.subscribe({
      type: 'publishing:request',
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

    // Handle scheduling requests
    this.messageBroker.subscribe({
      type: 'publishing:schedule',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'schedule-publishing',
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
    Logger.info('Publishing agent initialized', { agentId: this.id });
    
    // Load publishing cache from Redis
    await this.loadPublishingCache();
  }

  private async loadPublishingCache(): Promise<void> {
    const keys = await this.redis.keys('publishing:*');
    for (const key of keys) {
      const record = JSON.parse(await this.redis.get(key) || '{}');
      if (record.contentId && record.target?.platform) {
        this.updatePublishingCache(record.contentId, record.target.platform);
      }
    }
  }

  protected async onStart(): Promise<void> {
    Logger.info('Publishing agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Publishing agent stopped', { agentId: this.id });
  }
}
