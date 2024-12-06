import { RedisPubSubMessageBroker } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { OpenAIProvider, AnthropicProvider } from '@agent-forge/llm-provider';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

import { ContentManagerAgent } from './agents/content-manager';
import { AnalysisAgent } from './agents/analysis-agent';
import { GenerationAgent } from './agents/generation-agent';
import { PublishingAgent } from './agents/publishing-agent';
import { MonitoringAgent } from './agents/monitoring-agent';

import { ContentRequest } from './types/content';

async function main() {
  try {
    // Initialize Redis clients
    const redis = new Redis();
    const redisPub = new Redis();
    const redisSub = new Redis();

    // Create message broker
    const messageBroker = new RedisPubSubMessageBroker({
      publisher: redisPub,
      subscriber: redisSub
    });

    // Initialize LLM providers
    const openaiProvider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4'
    });

    const anthropicProvider = new AnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: 'claude-2'
    });

    // Set up fallback configuration
    openaiProvider.setFallback(anthropicProvider);

    // Create agents
    const contentManager = new ContentManagerAgent({
      id: 'content-manager-1',
      name: 'Content Manager',
      redis
    });

    const analysisAgent = new AnalysisAgent({
      id: 'analysis-1',
      name: 'Content Analyzer',
      llmProvider: anthropicProvider
    });

    const generationAgent = new GenerationAgent({
      id: 'generation-1',
      name: 'Content Generator',
      llmProvider: openaiProvider
    });

    const publishingAgent = new PublishingAgent({
      id: 'publishing-1',
      name: 'Content Publisher',
      redis
    });

    const monitoringAgent = new MonitoringAgent({
      id: 'monitoring-1',
      name: 'System Monitor',
      redis,
      metricsIntervalMs: 60000, // 1 minute
      alertThresholds: {
        cpu: 0.8,
        memory: 0.85,
        errorRate: 0.1,
        responseTime: 5000
      }
    });

    // Initialize all agents with message broker
    const agents = [
      contentManager,
      analysisAgent,
      generationAgent,
      publishingAgent,
      monitoringAgent
    ];

    await Promise.all(
      agents.map(agent => agent.initialize({ messageBroker }))
    );

    // Set up global error handling
    process.on('unhandledRejection', (error) => {
      Logger.error('Unhandled rejection', { error });
    });

    process.on('uncaughtException', (error) => {
      Logger.error('Uncaught exception', { error });
    });

    // Start all agents
    await Promise.all(agents.map(agent => agent.start()));
    Logger.info('All agents started successfully');

    // Example: Create a content request
    const contentRequest: ContentRequest = {
      type: 'BLOG_POST',
      title: 'Understanding AI Agents',
      topics: ['AI', 'Agents', 'Software Architecture'],
      targetAudience: 'Software Developers',
      tone: 'TECHNICAL',
      length: 'MEDIUM',
      keywords: ['AI agents', 'distributed systems', 'event-driven architecture']
    };

    // Submit content request
    messageBroker.publish('content:requested', {
      request: contentRequest
    });

    // Keep the process running
    process.stdin.resume();

    // Handle shutdown
    const shutdown = async () => {
      Logger.info('Shutting down...');

      // Stop all agents
      await Promise.all(agents.map(agent => agent.stop()));

      // Close Redis connections
      await Promise.all([
        redis.quit(),
        redisPub.quit(),
        redisSub.quit()
      ]);

      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    Logger.error('Error in main', { error });
    process.exit(1);
  }
}

// Run the system
main().catch(error => {
  Logger.error('Fatal error', { error });
  process.exit(1);
});
