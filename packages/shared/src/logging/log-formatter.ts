import { format } from 'winston';
import { Format } from 'logform';

const { combine, timestamp, json, printf } = format;

export interface LogContext {
  agentId?: string;
  taskId?: string;
  [key: string]: unknown;
}

export const structuredFormat: Format = combine(
  timestamp(),
  json(),
  printf((info) => {
    const { timestamp, level, message, ...rest } = info;
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...rest,
    });
  })
);

export function formatLogEntry(
  level: string,
  message: string,
  context?: LogContext
): Record<string, unknown> {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context || {}),
  };
}
