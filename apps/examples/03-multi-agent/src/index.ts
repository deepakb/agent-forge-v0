import { RedisPubSubMessageBroker, Message } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { PreprocessorAgent } from './agents/preprocessor-agent';
import { AnalyzerAgent } from './agents/analyzer-agent';
import { ReporterAgent } from './agents/reporter-agent';
import Redis from 'ioredis';

async function main() {
  try {
    // Create Redis clients
    const redisClient = new Redis();
    const redisPub = new Redis();
    const redisSub = new Redis();

    // Create message broker
    const messageBroker = new RedisPubSubMessageBroker({
      publisher: redisPub,
      subscriber: redisSub
    });

    // Create agents
    const preprocessor = new PreprocessorAgent({
      id: 'preprocessor-agent',
      name: 'Text Preprocessor',
      type: 'preprocessor',
      capabilities: ['text-preprocessing']
    });

    const analyzer = new AnalyzerAgent({
      id: 'analyzer-agent',
      name: 'Text Analyzer',
      type: 'analyzer',
      capabilities: ['text-analysis']
    });

    const reporter = new ReporterAgent({
      id: 'reporter-agent',
      name: 'Report Generator',
      type: 'reporter',
      capabilities: ['report-generation']
    });

    // Initialize agents
    await preprocessor.initialize({ messageBroker });
    await analyzer.initialize({ messageBroker });
    await reporter.initialize({ messageBroker });

    // Start agents
    await Promise.all([
      preprocessor.start(),
      analyzer.start(),
      reporter.start()
    ]);

    // Subscribe to report completion events
    reporter.events.on('reportComplete', ({ taskId, report }) => {
      Logger.info('Report generated', { taskId, report });
    });

    // Submit a text for processing
    const sampleText = `Agent Forge is a powerful framework for building autonomous AI agents. 
                       It provides a robust foundation for creating, managing, and orchestrating 
                       agents that can handle complex tasks. The framework includes features like 
                       state management, task execution, and inter-agent communication.`;

    const message: Message = {
      id: 'task-1',
      type: 'TEXT_SUBMIT',
      sender: 'main',
      recipient: 'preprocessor-agent',
      timestamp: new Date(),
      payload: { text: sampleText }
    };

    await messageBroker.publish(message);

    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Stop agents
    await Promise.all([
      preprocessor.stop(),
      analyzer.stop(),
      reporter.stop()
    ]);

    // Close Redis connections
    await Promise.all([
      redisClient.quit(),
      redisPub.quit(),
      redisSub.quit()
    ]);

  } catch (error) {
    Logger.error('Error in main', { error });
    process.exit(1);
  }
}

main().catch(error => {
  Logger.error('Unhandled error', { error });
  process.exit(1);
});
