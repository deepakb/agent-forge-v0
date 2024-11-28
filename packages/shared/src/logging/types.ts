export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogStatus = 'success' | 'failure' | 'in_progress' | 'warning';

export interface LogContext {
  component?: string;
  operation?: string;
  status?: LogStatus;
  workflowId?: string;
  agentId?: string;
  agentType?: string;
  query?: string;
  resultCount?: number;
  durationMs?: number;
  startTime?: Date;
  error?: any;
  [key: string]: any;
}

export interface LogMetadata extends LogContext {
  level: LogLevel;
  timestamp: string;
  message: string;
}
