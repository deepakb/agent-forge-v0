export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'CPU' | 'MEMORY' | 'DISK' | 'NETWORK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  metrics: SystemMetrics;
  timestamp: Date;
}

export interface Notification {
  id: string;
  alertId: string;
  channel: 'EMAIL' | 'SLACK' | 'SMS';
  recipient: string;
  message: string;
  timestamp: Date;
}

export interface Action {
  id: string;
  alertId: string;
  type: 'RESTART_SERVICE' | 'SCALE_UP' | 'CLEANUP_DISK' | 'OPTIMIZE_NETWORK';
  parameters: Record<string, any>;
  timestamp: Date;
}

export interface EventTypes {
  'metrics:update': SystemMetrics;
  'alert:new': Alert;
  'alert:resolved': Alert;
  'notification:sent': Notification;
  'action:executed': Action;
  'action:failed': { action: Action; error: string };
}
