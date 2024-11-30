import { Task } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { SimpleAgent } from './simple-agent';

async function main() {
  // Create and initialize the agent
  const agent = new SimpleAgent({
    name: 'text-processor',
    capabilities: ['text-processing']
  });

  // Initialize the agent
  await agent.initialize({
    id: 'text-processor-1',
    name: 'Text Processor Agent',
    type: 'text',
    capabilities: ['uppercase', 'lowercase', 'reverse'],
    maxConcurrentTasks: 1
  });

  // Start the agent
  await agent.start();

  try {
    // Create some example tasks
    const tasks: Task[] = [
      {
        config: {
          id: '1',
          type: 'text-transform',
          priority: 'MEDIUM',
          data: {
            operation: 'uppercase',
            text: 'hello world'
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
          type: 'text-transform',
          priority: 'MEDIUM',
          data: {
            operation: 'reverse',
            text: 'Agent Forge'
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
