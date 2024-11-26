import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { structuredFormat } from './log-formatter';

export interface LogHandlerConfig {
  logDir?: string;
  maxSize?: string;
  maxFiles?: string;
  level?: string;
}

export class LogHandler {
  private logger: winston.Logger;
  private static instance: LogHandler;

  private constructor(config: LogHandlerConfig = {}) {
    const { logDir = 'logs', maxSize = '10m', maxFiles = '7d', level = 'info' } = config;

    const transport = new DailyRotateFile({
      dirname: logDir,
      filename: 'agent-forge-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize,
      maxFiles,
      format: structuredFormat,
    });

    this.logger = winston.createLogger({
      level,
      format: structuredFormat,
      transports: [
        transport,
        new winston.transports.Console({
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
      ],
    });
  }

  public static getInstance(config?: LogHandlerConfig): LogHandler {
    if (!LogHandler.instance) {
      LogHandler.instance = new LogHandler(config);
    }
    return LogHandler.instance;
  }

  public getLogger(): winston.Logger {
    return this.logger;
  }

  public async writeLog(
    level: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    this.logger.log(level, message, metadata);
  }

  public async rotateLog(): Promise<void> {
    // Implement log rotation logic if needed beyond winston-daily-rotate-file
    // This could include custom rotation strategies or cleanup
  }
}
