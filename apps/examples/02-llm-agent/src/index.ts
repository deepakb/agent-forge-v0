import { Task } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { LLMAgent } from './llm-agent';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Create and initialize the agent
  const agent = new LLMAgent({
    name: 'nlp-processor',
    capabilities: ['summarize', 'translate', 'analyze']
  });

  // Initialize the agent
  await agent.initialize({
    id: 'nlp-processor-1',
    name: 'NLP Processing Agent',
    type: 'nlp',
    capabilities: ['summarize', 'translate', 'analyze'],
    maxConcurrentTasks: 1
  });

  // Subscribe to progress updates
  agent.events.on('progress', ({ taskId, progress }) => {
    Logger.info('Task progress', { taskId, progress });
  });

  // Start the agent
  await agent.start();

  try {
    // Create example tasks
    const tasks: Task[] = [
      {
        config: {
          id: '1',
          type: 'nlp',
          priority: 'MEDIUM',
          data: {
            operation: 'summarize',
            text: `Agent Forge is a powerful framework for building autonomous AI agents. 
                  It provides a robust foundation for creating, managing, and orchestrating 
                  agents that can handle complex tasks. The framework includes features like 
                  state management, task execution, and inter-agent communication.`
          }
        },
        metadata: {
          status: 'PENDING',
          createdAt: new Date()
        }
      },
      {
        config: {
          id: '2',
          type: 'nlp',
          priority: 'MEDIUM',
          data: {
            operation: 'translate',
            text: 'Hello, how are you today?',
            targetLanguage: 'Spanish'
          }
        },
        metadata: {
          status: 'PENDING',
          createdAt: new Date()
        }
      }
    ];

    // Process each task
    for (const task of tasks) {
      Logger.info('Processing task', { taskId: task.config.id });
      const result = await agent.handleTask(task);
      Logger.info('Task result', { taskId: task.config.id, result });
    }

    // Stop the agent
    await agent.stop();
  } catch (error) {
    Logger.error('Error in main', { error });
    process.exit(1);
  }
}

main().catch(error => {
  Logger.error('Unhandled error', { error });
  process.exit(1);
});
