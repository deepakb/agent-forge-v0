import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { SystemMetrics } from '../events/types';
import os from 'os';

export class SystemMonitorAgent extends BaseAgent {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private intervalMs: number;

  constructor(config: {
    id: string;
    name: string;
    intervalMs?: number;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'monitor',
      capabilities: ['system-monitoring']
    });
    this.intervalMs = config.intervalMs || 5000;
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      const metrics = await this.collectMetrics();
      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      Logger.error('Failed to collect metrics', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async collectMetrics(): Promise<SystemMetrics> {
    const cpus = os.cpus();
    const totalCpuTime = cpus.reduce((acc, cpu) => {
      return acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
    }, 0);
    const cpuUsage = totalCpuTime / (cpus.length * 100);

    const metrics: SystemMetrics = {
      cpuUsage: cpuUsage,
      memoryUsage: (os.totalmem() - os.freemem()) / os.totalmem(),
      diskUsage: 0.7, // Simulated value
      networkLatency: Math.random() * 100, // Simulated value
      timestamp: new Date()
    };

    // Emit metrics update event
    this.events.emit('metrics:update', metrics);

    return metrics;
  }

  protected async setupMessageHandlers(): Promise<void> {
    // No message handlers needed for this example
  }

  protected async onInitialize(): Promise<void> {
    Logger.info('System monitor initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      const task: Task = {
        config: {
          id: `monitor-${Date.now()}`,
          type: 'collect-metrics',
          priority: 'HIGH',
          data: {}
        },
        metadata: {
          status: 'PENDING',
          createdAt: new Date()
        }
      };

      await this.handleTask(task);
    }, this.intervalMs);

    Logger.info('System monitor started', { agentId: this.id });
  }

  protected async onStop(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    Logger.info('System monitor stopped', { agentId: this.id });
  }

  protected async onPause(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    Logger.info('System monitor paused', { agentId: this.id });
  }

  protected async onResume(): Promise<void> {
    await this.onStart();
    Logger.info('System monitor resumed', { agentId: this.id });
  }

  protected async onTerminate(): Promise<void> {
    await this.onStop();
    Logger.info('System monitor terminated', { agentId: this.id });
  }
}
