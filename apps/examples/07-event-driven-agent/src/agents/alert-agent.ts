import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { SystemMetrics, Alert } from '../events/types';
import { v4 as uuidv4 } from 'uuid';

export class AlertAgent extends BaseAgent {
  private thresholds: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };

  private activeAlerts: Map<string, Alert> = new Map();

  constructor(config: {
    id: string;
    name: string;
    thresholds?: {
      cpu?: number;
      memory?: number;
      disk?: number;
      network?: number;
    };
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'alert',
      capabilities: ['alert-processing']
    });

    this.thresholds = {
      cpu: config.thresholds?.cpu || 0.8,
      memory: config.thresholds?.memory || 0.9,
      disk: config.thresholds?.disk || 0.85,
      network: config.thresholds?.network || 50
    };
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const metrics: SystemMetrics = task.config.data.metrics;
      const alerts = await this.processMetrics(metrics);
      
      return {
        success: true,
        data: { alerts }
      };
    } catch (error) {
      Logger.error('Alert processing failed', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async processMetrics(metrics: SystemMetrics): Promise<Alert[]> {
    const newAlerts: Alert[] = [];

    // Check CPU usage
    if (metrics.cpuUsage > this.thresholds.cpu) {
      const alert = this.createAlert('CPU', metrics);
      newAlerts.push(alert);
      this.activeAlerts.set(alert.id, alert);
    }

    // Check memory usage
    if (metrics.memoryUsage > this.thresholds.memory) {
      const alert = this.createAlert('MEMORY', metrics);
      newAlerts.push(alert);
      this.activeAlerts.set(alert.id, alert);
    }

    // Check disk usage
    if (metrics.diskUsage > this.thresholds.disk) {
      const alert = this.createAlert('DISK', metrics);
      newAlerts.push(alert);
      this.activeAlerts.set(alert.id, alert);
    }

    // Check network latency
    if (metrics.networkLatency > this.thresholds.network) {
      const alert = this.createAlert('NETWORK', metrics);
      newAlerts.push(alert);
      this.activeAlerts.set(alert.id, alert);
    }

    // Emit alerts
    for (const alert of newAlerts) {
      this.events.emit('alert:new', alert);
    }

    // Check for resolved alerts
    for (const [id, alert] of this.activeAlerts) {
      if (this.isAlertResolved(alert, metrics)) {
        this.activeAlerts.delete(id);
        this.events.emit('alert:resolved', alert);
      }
    }

    return newAlerts;
  }

  private createAlert(type: Alert['type'], metrics: SystemMetrics): Alert {
    const severity = this.calculateSeverity(type, metrics);
    
    return {
      id: uuidv4(),
      type,
      severity,
      message: this.createAlertMessage(type, severity, metrics),
      metrics,
      timestamp: new Date()
    };
  }

  private calculateSeverity(
    type: Alert['type'],
    metrics: SystemMetrics
  ): Alert['severity'] {
    let value: number;
    let threshold: number;

    switch (type) {
      case 'CPU':
        value = metrics.cpuUsage;
        threshold = this.thresholds.cpu;
        break;
      case 'MEMORY':
        value = metrics.memoryUsage;
        threshold = this.thresholds.memory;
        break;
      case 'DISK':
        value = metrics.diskUsage;
        threshold = this.thresholds.disk;
        break;
      case 'NETWORK':
        value = metrics.networkLatency;
        threshold = this.thresholds.network;
        break;
    }

    const ratio = value / threshold;
    if (ratio > 1.5) return 'CRITICAL';
    if (ratio > 1.2) return 'HIGH';
    if (ratio > 1.0) return 'MEDIUM';
    return 'LOW';
  }

  private createAlertMessage(
    type: Alert['type'],
    severity: Alert['severity'],
    metrics: SystemMetrics
  ): string {
    const value = (() => {
      switch (type) {
        case 'CPU':
          return `${(metrics.cpuUsage * 100).toFixed(1)}%`;
        case 'MEMORY':
          return `${(metrics.memoryUsage * 100).toFixed(1)}%`;
        case 'DISK':
          return `${(metrics.diskUsage * 100).toFixed(1)}%`;
        case 'NETWORK':
          return `${metrics.networkLatency.toFixed(1)}ms`;
      }
    })();

    return `${severity} ${type} alert: Current usage is ${value}`;
  }

  private isAlertResolved(alert: Alert, currentMetrics: SystemMetrics): boolean {
    switch (alert.type) {
      case 'CPU':
        return currentMetrics.cpuUsage <= this.thresholds.cpu;
      case 'MEMORY':
        return currentMetrics.memoryUsage <= this.thresholds.memory;
      case 'DISK':
        return currentMetrics.diskUsage <= this.thresholds.disk;
      case 'NETWORK':
        return currentMetrics.networkLatency <= this.thresholds.network;
    }
  }

  protected async setupMessageHandlers(): Promise<void> {
    // Subscribe to metrics updates
    this.messageBroker.subscribe({
      type: 'metrics:update',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: `alert-${Date.now()}`,
            type: 'process-metrics',
            priority: 'HIGH',
            data: { metrics: message.payload }
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
    Logger.info('Alert agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Alert agent started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    Logger.info('Alert agent stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    Logger.info('Alert agent paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    Logger.info('Alert agent resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    Logger.info('Alert agent terminated', { agentId: this.id });
  }
}
