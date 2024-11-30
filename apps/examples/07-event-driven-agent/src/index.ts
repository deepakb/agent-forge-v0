import { RedisPubSubMessageBroker } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { SystemMonitorAgent } from './agents/system-monitor';
import { AlertAgent } from './agents/alert-agent';
import { NotificationAgent } from './agents/notification-agent';
import { ActionAgent } from './agents/action-agent';
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
    const monitor = new SystemMonitorAgent({
      id: 'system-monitor',
      name: 'System Monitor',
      intervalMs: 5000 // Monitor every 5 seconds
    });

    const alertAgent = new AlertAgent({
      id: 'alert-agent',
      name: 'Alert Agent',
      thresholds: {
        cpu: 0.7,    // 70% CPU usage
        memory: 0.8,  // 80% memory usage
        disk: 0.85,   // 85% disk usage
        network: 50   // 50ms network latency
      }
    });

    const notificationAgent = new NotificationAgent({
      id: 'notification-agent',
      name: 'Notification Agent'
    });

    const actionAgent = new ActionAgent({
      id: 'action-agent',
      name: 'Action Agent'
    });

    // Initialize agents with message broker
    await Promise.all([
      monitor.initialize({ messageBroker }),
      alertAgent.initialize({ messageBroker }),
      notificationAgent.initialize({ messageBroker }),
      actionAgent.initialize({ messageBroker })
    ]);

    // Subscribe to events for logging
    const agents = [monitor, alertAgent, notificationAgent, actionAgent];
    
    for (const agent of agents) {
      agent.events.on('*', (event) => {
        Logger.info(`${agent.config.name} event:`, { event });
      });
    }

    // Start agents
    await Promise.all(agents.map(agent => agent.start()));

    Logger.info('All agents started. Monitoring system...');

    // Run for a while to demonstrate event flow
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Stop agents
    await Promise.all(agents.map(agent => agent.stop()));

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
