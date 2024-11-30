import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { Alert, Action } from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export class ActionAgent extends BaseAgent {
  private actionRules: Map<Alert['type'], (alert: Alert) => Action>;

  constructor(config: {
    id: string;
    name: string;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'action',
      capabilities: ['automated-actions']
    });

    // Define action rules for different alert types
    this.actionRules = new Map([
      ['CPU', this.createCPUAction.bind(this)],
      ['MEMORY', this.createMemoryAction.bind(this)],
      ['DISK', this.createDiskAction.bind(this)],
      ['NETWORK', this.createNetworkAction.bind(this)]
    ]);
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const alert: Alert = task.config.data.alert;
      const action = await this.handleAlert(alert);
      
      return {
        success: true,
        data: { action }
      };
    } catch (error) {
      Logger.error('Action execution failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleAlert(alert: Alert): Promise<Action | null> {
    const actionCreator = this.actionRules.get(alert.type);
    if (!actionCreator) {
      Logger.warn('No action rule defined for alert type', { 
        alertType: alert.type 
      });
      return null;
    }

    const action = actionCreator(alert);
    
    try {
      await this.executeAction(action);
      this.events.emit('action:executed', action);
      return action;
    } catch (error) {
      this.events.emit('action:failed', {
        action,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async executeAction(action: Action): Promise<void> {
    Logger.info('Executing action', { actionId: action.id, type: action.type });
    
    // Simulate action execution
    await new Promise(resolve => setTimeout(resolve, 500));

    switch (action.type) {
      case 'RESTART_SERVICE':
        await this.simulateServiceRestart(action.parameters.serviceName);
        break;
      case 'SCALE_UP':
        await this.simulateScaling(action.parameters.resource, action.parameters.amount);
        break;
      case 'CLEANUP_DISK':
        await this.simulateCleanup(action.parameters.path);
        break;
      case 'OPTIMIZE_NETWORK':
        await this.simulateNetworkOptimization(action.parameters.interface);
        break;
    }
  }

  private createCPUAction(alert: Alert): Action {
    return {
      id: uuidv4(),
      alertId: alert.id,
      type: 'RESTART_SERVICE',
      parameters: {
        serviceName: 'high-cpu-service',
        force: alert.severity === 'CRITICAL'
      },
      timestamp: new Date()
    };
  }

  private createMemoryAction(alert: Alert): Action {
    return {
      id: uuidv4(),
      alertId: alert.id,
      type: 'SCALE_UP',
      parameters: {
        resource: 'memory',
        amount: alert.severity === 'CRITICAL' ? 2048 : 1024,
        unit: 'MB'
      },
      timestamp: new Date()
    };
  }

  private createDiskAction(alert: Alert): Action {
    return {
      id: uuidv4(),
      alertId: alert.id,
      type: 'CLEANUP_DISK',
      parameters: {
        path: '/var/log',
        minAge: '7d',
        dryRun: alert.severity !== 'CRITICAL'
      },
      timestamp: new Date()
    };
  }

  private createNetworkAction(alert: Alert): Action {
    return {
      id: uuidv4(),
      alertId: alert.id,
      type: 'OPTIMIZE_NETWORK',
      parameters: {
        interface: 'eth0',
        priority: alert.severity === 'CRITICAL' ? 'high' : 'normal'
      },
      timestamp: new Date()
    };
  }

  private async simulateServiceRestart(serviceName: string): Promise<void> {
    Logger.info('Restarting service', { serviceName });
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async simulateScaling(resource: string, amount: number): Promise<void> {
    Logger.info('Scaling resource', { resource, amount });
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private async simulateCleanup(path: string): Promise<void> {
    Logger.info('Cleaning up disk', { path });
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  private async simulateNetworkOptimization(networkInterface: string): Promise<void> {
    Logger.info('Optimizing network', { interface: networkInterface });
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  protected async setupMessageHandlers(): Promise<void> {
    // Subscribe to new alerts that require action
    this.messageBroker.subscribe({
      type: 'alert:new',
      handler: async (message) => {
        const alert: Alert = message.payload;
        
        // Only handle high severity alerts
        if (alert.severity === 'HIGH' || alert.severity === 'CRITICAL') {
          const task: Task = {
            config: {
              id: `action-${Date.now()}`,
              type: 'execute-action',
              priority: 'HIGH',
              data: { alert }
            },
            metadata: {
              status: 'PENDING',
              createdAt: new Date()
            }
          };

          await this.handleTask(task);
        }
      }
    });
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('Action agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Action agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Action agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Action agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Action agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Action agent terminated', { agentId: this.id });
  }
}
