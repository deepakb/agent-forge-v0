import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { Alert, Notification } from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export class NotificationAgent extends BaseAgent {
  private channels: Map<Alert['severity'], Array<Notification['channel']>>;
  private recipients: Map<Notification['channel'], string[]>;

  constructor(config: {
    id: string;
    name: string;
    channels?: Map<Alert['severity'], Array<Notification['channel']>>;
    recipients?: Map<Notification['channel'], string[]>;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'notification',
      capabilities: ['notification-sending']
    });

    // Default channel configuration
    this.channels = config.channels || new Map([
      ['CRITICAL', ['EMAIL', 'SMS', 'SLACK']],
      ['HIGH', ['EMAIL', 'SLACK']],
      ['MEDIUM', ['SLACK']],
      ['LOW', ['SLACK']]
    ]);

    // Default recipient configuration
    this.recipients = config.recipients || new Map([
      ['EMAIL', ['admin@example.com', 'ops@example.com']],
      ['SMS', ['+1234567890']],
      ['SLACK', ['#monitoring', '#alerts']]
    ]);
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const alert: Alert = task.config.data.alert;
      const notifications = await this.sendNotifications(alert);
      
      return {
        success: true,
        data: { notifications }
      };
    } catch (error) {
      Logger.error('Notification sending failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async sendNotifications(alert: Alert): Promise<Notification[]> {
    const notifications: Notification[] = [];
    const channels = this.channels.get(alert.severity) || [];

    for (const channel of channels) {
      const recipients = this.recipients.get(channel) || [];
      
      for (const recipient of recipients) {
        const notification = await this.sendNotification(alert, channel, recipient);
        notifications.push(notification);
        
        // Emit notification sent event
        this.events.emit('notification:sent', notification);
      }
    }

    return notifications;
  }

  private async sendNotification(
    alert: Alert,
    channel: Notification['channel'],
    recipient: string
  ): Promise<Notification> {
    // Simulate sending notification
    await new Promise(resolve => setTimeout(resolve, 100));

    const notification: Notification = {
      id: uuidv4(),
      alertId: alert.id,
      channel,
      recipient,
      message: this.formatMessage(alert, channel),
      timestamp: new Date()
    };

    Logger.info('Notification sent', {
      channel,
      recipient,
      alertId: alert.id
    });

    return notification;
  }

  private formatMessage(alert: Alert, channel: Notification['channel']): string {
    const baseMessage = `${alert.severity} Alert: ${alert.message}`;
    
    switch (channel) {
      case 'EMAIL':
        return `
Subject: System Alert - ${alert.type} Issue Detected
Body: ${baseMessage}

Details:
- Type: ${alert.type}
- Severity: ${alert.severity}
- Time: ${alert.timestamp}
- Metrics: ${JSON.stringify(alert.metrics, null, 2)}
        `.trim();

      case 'SMS':
        return `${alert.severity} ${alert.type} Alert: ${alert.message}`;

      case 'SLACK':
        return `
:warning: *System Alert*
*Type:* ${alert.type}
*Severity:* ${alert.severity}
*Message:* ${alert.message}
*Time:* ${alert.timestamp}
        `.trim();

      default:
        return baseMessage;
    }
  }

  protected async setupMessageHandlers(): Promise<void> {
    // Subscribe to new alerts
    this.messageBroker.subscribe({
      type: 'alert:new',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: `notify-${Date.now()}`,
            type: 'send-notifications',
            priority: 'HIGH',
            data: { alert: message.payload }
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
    Logger.info('Notification agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Notification agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Notification agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Notification agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Notification agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Notification agent terminated', { agentId: this.id });
  }
}
