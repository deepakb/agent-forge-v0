import { RedisStateStore, Task } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { StatefulAgent } from './stateful-agent';
import Redis from 'ioredis';

async function main() {
  try {
    // Create Redis client
    const redisClient = new Redis();

    // Create state store
    const stateStore = new RedisStateStore({
      client: redisClient,
      namespace: 'agent-forge:example'
    });

    // Create agent
    const agent = new StatefulAgent({
      id: 'stateful-agent-1',
      name: 'Stateful Agent',
      type: 'stateful',
      capabilities: ['state-management']
    }, stateStore);

    // Subscribe to state events
    stateStore.on('*', (event) => {
      Logger.info('State event received', { event });
    });

    // Initialize agent
    await agent.initialize({
      id: 'stateful-agent-1',
      name: 'Stateful Agent',
      type: 'stateful',
      capabilities: ['state-management'],
      maxConcurrentTasks: 1
    });

    // Start agent
    await agent.start();

    // Create some example tasks
    const tasks: Task[] = Array.from({ length: 3 }).map((_, index) => ({
      config: {
        id: `task-${index + 1}`,
        type: 'stateful-task',
        priority: 'MEDIUM',
        data: {
          value: Math.random()
        }
      },
      metadata: {
        status: 'PENDING',
        createdAt: new Date()
      }
    }));

    // Process tasks
    for (const task of tasks) {
      Logger.info('Processing task', { taskId: task.config.id });
      
      // Store initial task state
      await stateStore.updateTaskState(task.config.id, task);
      
      // Process task
      const result = await agent.handleTask(task);
      
      Logger.info('Task completed', { taskId: task.config.id, result });
      
      // Verify task history
      const history = await agent.getTaskHistory(task.config.id);
      Logger.info('Task history', { taskId: task.config.id, history });
    }

    // Demonstrate state recovery
    Logger.info('Demonstrating state recovery...');
    
    // Stop agent
    await agent.stop();
    
    // Create new agent instance with same ID
    const recoveredAgent = new StatefulAgent({
      id: 'stateful-agent-1',
      name: 'Recovered Agent',
      type: 'stateful',
      capabilities: ['state-management']
    }, stateStore);

    // Initialize and start recovered agent
    await recoveredAgent.initialize({
      id: 'stateful-agent-1',
      name: 'Recovered Agent',
      type: 'stateful',
      capabilities: ['state-management'],
      maxConcurrentTasks: 1
    });

    await recoveredAgent.start();

    // Verify state recovery
    for (const task of tasks) {
      const history = await recoveredAgent.getTaskHistory(task.config.id);
      Logger.info('Recovered task history', { taskId: task.config.id, history });
    }

    // Clean up
    await recoveredAgent.stop();
    await redisClient.quit();

  } catch (error) {
    Logger.error('Error in main', { error });
    process.exit(1);
  }
}

main().catch(error => {
  Logger.error('Unhandled error', { error });
  process.exit(1);
});
