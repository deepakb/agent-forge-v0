import { BaseAgent, Task, TaskResult } from '@agent-forge/core';
import { Logger } from '@agent-forge/shared';
import { v4 as uuidv4 } from 'uuid';
import { SystemMetrics, AgentMetrics, Alert } from '../types/events';
import Redis from 'ioredis';
import os from 'os';

export class MonitoringAgent extends BaseAgent {
  private redis: Redis;
  private metricsInterval: NodeJS.Timeout | null = null;
  private alertThresholds: {
    cpu: number;
    memory: number;
    errorRate: number;
    responseTime: number;
  };
  private agentStatuses: Map<string, AgentMetrics>;
  private alertHistory: Alert[];
  private readonly MAX_ALERT_HISTORY = 1000;

  constructor(config: {
    id: string;
    name: string;
    redis: Redis;
    metricsIntervalMs?: number;
    alertThresholds?: Partial<MonitoringAgent['alertThresholds']>;
  }) {
    super({
      id: config.id,
      name: config.name,
      type: 'monitoring',
      capabilities: ['system-monitoring', 'performance-tracking', 'alerting']
    });

    this.redis = config.redis;
    this.alertThresholds = {
      cpu: 0.8, // 80% CPU usage
      memory: 0.85, // 85% memory usage
      errorRate: 0.1, // 10% error rate
      responseTime: 5000, // 5 seconds
      ...config.alertThresholds
    };

    this.agentStatuses = new Map();
    this.alertHistory = [];
  }

  protected async executeTask(task: Task): Promise<TaskResult> {
    try {
      switch (task.config.type) {
        case 'collect-metrics':
          return await this.collectMetrics();
        case 'analyze-performance':
          return await this.analyzePerformance(task.config.data);
        case 'generate-report':
          return await this.generateReport(task.config.data);
        default:
          throw new Error(`Unknown task type: ${task.config.type}`);
      }
    } catch (error) {
      Logger.error('Task execution failed', { error, taskId: task.config.id });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async collectMetrics(): Promise<TaskResult> {
    try {
      const metrics = await this.gatherSystemMetrics();
      
      // Store metrics in Redis with TTL
      await this.storeMetrics(metrics);

      // Check for anomalies and generate alerts
      await this.checkAnomalies(metrics);

      // Emit metrics event
      this.events.emit('system:metrics', metrics);

      return {
        success: true,
        data: { metrics }
      };
    } catch (error) {
      Logger.error('Metrics collection failed', { error });
      throw error;
    }
  }

  private async analyzePerformance(data: {
    startTime: Date;
    endTime: Date;
  }): Promise<TaskResult> {
    const { startTime, endTime } = data;

    try {
      // Retrieve metrics for the specified time range
      const metrics = await this.getMetricsRange(startTime, endTime);

      // Analyze performance trends
      const analysis = this.analyzeMetrics(metrics);

      return {
        success: true,
        data: { analysis }
      };
    } catch (error) {
      Logger.error('Performance analysis failed', { error });
      throw error;
    }
  }

  private async generateReport(data: {
    type: 'daily' | 'weekly' | 'monthly';
    format: 'json' | 'html' | 'markdown';
  }): Promise<TaskResult> {
    try {
      const metrics = await this.getMetricsForReport(data.type);
      const report = this.formatReport(metrics, data.format);

      return {
        success: true,
        data: { report }
      };
    } catch (error) {
      Logger.error('Report generation failed', { error });
      throw error;
    }
  }

  private async gatherSystemMetrics(): Promise<SystemMetrics> {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();

    // Calculate CPU usage
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
      const idle = cpu.times.idle;
      return acc + (1 - idle / total);
    }, 0) / cpus.length;

    // Get pending tasks count
    const pendingTasks = await this.getPendingTasksCount();

    return {
      agentMetrics: this.agentStatuses,
      systemLoad: {
        cpu: cpuUsage,
        memory: (totalMemory - freeMemory) / totalMemory,
        pendingTasks
      },
      timestamp: new Date()
    };
  }

  private async storeMetrics(metrics: SystemMetrics): Promise<void> {
    const key = `metrics:${metrics.timestamp.toISOString()}`;
    await this.redis.set(key, JSON.stringify(metrics));
    // Keep metrics for 30 days
    await this.redis.expire(key, 30 * 24 * 60 * 60);
  }

  private async checkAnomalies(metrics: SystemMetrics): Promise<void> {
    // Check system metrics
    if (metrics.systemLoad.cpu > this.alertThresholds.cpu) {
      await this.generateAlert({
        type: 'PERFORMANCE',
        severity: 'HIGH',
        message: 'High CPU usage detected',
        context: { cpu: metrics.systemLoad.cpu }
      });
    }

    if (metrics.systemLoad.memory > this.alertThresholds.memory) {
      await this.generateAlert({
        type: 'CAPACITY',
        severity: 'HIGH',
        message: 'High memory usage detected',
        context: { memory: metrics.systemLoad.memory }
      });
    }

    // Check agent metrics
    for (const [agentId, status] of metrics.agentMetrics) {
      if (status.errorCount > 0) {
        const errorRate = status.errorCount / status.taskCount;
        if (errorRate > this.alertThresholds.errorRate) {
          await this.generateAlert({
            type: 'ERROR',
            severity: 'HIGH',
            message: `High error rate for agent ${agentId}`,
            context: { agentId, errorRate }
          });
        }
      }

      if (status.averageResponseTime > this.alertThresholds.responseTime) {
        await this.generateAlert({
          type: 'PERFORMANCE',
          severity: 'MEDIUM',
          message: `Slow response time for agent ${agentId}`,
          context: { agentId, responseTime: status.averageResponseTime }
        });
      }
    }
  }

  private async generateAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<void> {
    const fullAlert: Alert = {
      id: uuidv4(),
      ...alert,
      timestamp: new Date()
    };

    // Store alert in history
    this.alertHistory.unshift(fullAlert);
    if (this.alertHistory.length > this.MAX_ALERT_HISTORY) {
      this.alertHistory.pop();
    }

    // Store alert in Redis
    await this.redis.set(
      `alert:${fullAlert.id}`,
      JSON.stringify(fullAlert)
    );

    // Emit alert event
    this.events.emit('system:alert', fullAlert);
  }

  private async getPendingTasksCount(): Promise<number> {
    // Get pending tasks from Redis
    const keys = await this.redis.keys('task:*:pending');
    return keys.length;
  }

  private async getMetricsRange(
    startTime: Date,
    endTime: Date
  ): Promise<SystemMetrics[]> {
    const keys = await this.redis.keys('metrics:*');
    const metrics: SystemMetrics[] = [];

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const metric = JSON.parse(data) as SystemMetrics;
        if (metric.timestamp >= startTime && metric.timestamp <= endTime) {
          metrics.push(metric);
        }
      }
    }

    return metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private analyzeMetrics(metrics: SystemMetrics[]): any {
    // Calculate various performance indicators
    const analysis = {
      period: {
        start: metrics[0]?.timestamp,
        end: metrics[metrics.length - 1]?.timestamp
      },
      averages: {
        cpu: 0,
        memory: 0,
        pendingTasks: 0
      },
      peaks: {
        cpu: 0,
        memory: 0,
        pendingTasks: 0
      },
      agentPerformance: new Map<string, {
        averageResponseTime: number;
        errorRate: number;
        uptime: number;
      }>()
    };

    // Calculate system metrics
    metrics.forEach(metric => {
      analysis.averages.cpu += metric.systemLoad.cpu;
      analysis.averages.memory += metric.systemLoad.memory;
      analysis.averages.pendingTasks += metric.systemLoad.pendingTasks;

      analysis.peaks.cpu = Math.max(analysis.peaks.cpu, metric.systemLoad.cpu);
      analysis.peaks.memory = Math.max(analysis.peaks.memory, metric.systemLoad.memory);
      analysis.peaks.pendingTasks = Math.max(analysis.peaks.pendingTasks, metric.systemLoad.pendingTasks);
    });

    // Average out the values
    const count = metrics.length;
    analysis.averages.cpu /= count;
    analysis.averages.memory /= count;
    analysis.averages.pendingTasks /= count;

    return analysis;
  }

  private async getMetricsForReport(type: 'daily' | 'weekly' | 'monthly'): Promise<SystemMetrics[]> {
    const now = new Date();
    let startTime: Date;

    switch (type) {
      case 'daily':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return await this.getMetricsRange(startTime, now);
  }

  private formatReport(metrics: SystemMetrics[], format: 'json' | 'html' | 'markdown'): string {
    const analysis = this.analyzeMetrics(metrics);

    switch (format) {
      case 'json':
        return JSON.stringify(analysis, null, 2);
      case 'html':
        return this.formatHtmlReport(analysis);
      case 'markdown':
        return this.formatMarkdownReport(analysis);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private formatHtmlReport(analysis: any): string {
    return `
      <html>
        <body>
          <h1>System Performance Report</h1>
          <h2>Period</h2>
          <p>From: ${analysis.period.start}</p>
          <p>To: ${analysis.period.end}</p>
          
          <h2>System Averages</h2>
          <ul>
            <li>CPU Usage: ${(analysis.averages.cpu * 100).toFixed(2)}%</li>
            <li>Memory Usage: ${(analysis.averages.memory * 100).toFixed(2)}%</li>
            <li>Pending Tasks: ${analysis.averages.pendingTasks.toFixed(2)}</li>
          </ul>
          
          <h2>Peak Values</h2>
          <ul>
            <li>CPU Usage: ${(analysis.peaks.cpu * 100).toFixed(2)}%</li>
            <li>Memory Usage: ${(analysis.peaks.memory * 100).toFixed(2)}%</li>
            <li>Pending Tasks: ${analysis.peaks.pendingTasks}</li>
          </ul>
        </body>
      </html>
    `;
  }

  private formatMarkdownReport(analysis: any): string {
    return `
# System Performance Report

## Period
- From: ${analysis.period.start}
- To: ${analysis.period.end}

## System Averages
- CPU Usage: ${(analysis.averages.cpu * 100).toFixed(2)}%
- Memory Usage: ${(analysis.averages.memory * 100).toFixed(2)}%
- Pending Tasks: ${analysis.averages.pendingTasks.toFixed(2)}

## Peak Values
- CPU Usage: ${(analysis.peaks.cpu * 100).toFixed(2)}%
- Memory Usage: ${(analysis.peaks.memory * 100).toFixed(2)}%
- Pending Tasks: ${analysis.peaks.pendingTasks}
    `.trim();
  }

  protected async setupMessageHandlers(): Promise<void> {
    // Handle agent status updates
    this.messageBroker.subscribe({
      type: 'agent:status',
      handler: async (message) => {
        const { agentId, status } = message.payload;
        this.agentStatuses.set(agentId, status);
      }
    });

    // Handle report requests
    this.messageBroker.subscribe({
      type: 'monitoring:report',
      handler: async (message) => {
        const task: Task = {
          config: {
            id: uuidv4(),
            type: 'generate-report',
            priority: 'LOW',
            data: message.payload
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
    Logger.info('Monitoring agent initialized', { agentId: this.id });
  }

  protected async onStart(): Promise<void> {
    Logger.info('Monitoring agent started', { agentId: this.id });
    
    // Start metrics collection interval
    this.metricsInterval = setInterval(async () => {
      const task: Task = {
        config: {
          id: uuidv4(),
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
    }, 60000); // Collect metrics every minute
  }

  protected async onStop(): Promise<void> {
    Logger.info('Monitoring agent stopped', { agentId: this.id });
    
    // Clear metrics collection interval
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }
}
