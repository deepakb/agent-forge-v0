import { format } from 'winston';
import { TransformableInfo } from 'logform';
import { LogContext, LogStatus } from './types';

const { combine, timestamp, json, printf } = format;

export interface StructuredLogEntry {
  level: string;
  component: string;
  operation: string;
  status: LogStatus;
  timestamp: string;
  message: string;
  workflowId?: string;
  query?: string;
  resultCount?: number;
  agentId?: string;
  agentType?: string;
  durationMs?: number;
  error?: any;
  [key: string]: any;
}

export const structuredFormat = combine(
  timestamp(),
  json(),
  printf((info: TransformableInfo) => {
    const {
      level,
      message,
      timestamp = new Date().toISOString(),
      component = 'Unknown',
      operation = 'Unknown',
      status = 'unknown',
      ...rest
    } = info;

    const logEntry: StructuredLogEntry = {
      level: level as string,
      component: component as string,
      operation: operation as string,
      status: (status as LogStatus) || 'success',
      timestamp: timestamp as string,
      message: message as string,
      ...rest,
    };

    // Remove undefined or null values
    Object.keys(logEntry).forEach(key => {
      if (logEntry[key] === undefined || logEntry[key] === null) {
        delete logEntry[key];
      }
    });

    return JSON.stringify(logEntry);
  })
);

export function formatLogEntry(
  level: string,
  message: string,
  context?: LogContext & Partial<StructuredLogEntry>
): StructuredLogEntry {
  const startTime = context?.startTime ? new Date(context.startTime).getTime() : undefined;
  const durationMs = startTime ? Date.now() - startTime : undefined;

  const logEntry: StructuredLogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    component: context?.component || 'Unknown',
    operation: context?.operation || 'Unknown',
    status: context?.status || 'success',
    ...(context || {}),
  };

  if (durationMs !== undefined) {
    logEntry.durationMs = durationMs;
  }

  // Remove undefined or null values
  Object.keys(logEntry).forEach(key => {
    if (logEntry[key] === undefined || logEntry[key] === null) {
      delete logEntry[key];
    }
  });

  return logEntry;
}
