import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { structuredFormat } from './log-formatter';

export interface LogHandlerConfig {
  logDir?: string;
  maxSize?: string;
  maxFiles?: string;
  level?: string;
  enableConsole?: boolean;
  rotationFormat?: string;
}

export class LogHandler {
  private static instance: LogHandler;
  private logger: winston.Logger;

  private constructor(config: LogHandlerConfig = {}) {
    const {
      logDir = 'logs',
      maxSize = '10m',
      maxFiles = '7d',
      level = 'info',
      enableConsole = true,
      rotationFormat = 'YYYY-MM-DD',
    } = config;

    const transports: winston.transport[] = [
      new DailyRotateFile({
        dirname: logDir,
        filename: 'agent-forge-%DATE%.log',
        datePattern: rotationFormat,
        maxSize,
        maxFiles,
        format: structuredFormat,
      }),
    ];

    if (enableConsole) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }

    this.logger = winston.createLogger({
      level,
      format: structuredFormat,
      transports,
    });
  }

  public static getInstance(config?: LogHandlerConfig): LogHandler {
    if (!LogHandler.instance) {
      LogHandler.instance = new LogHandler(config);
    }
    return LogHandler.instance;
  }

  public async writeLog(
    level: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    this.logger.log(level, message, metadata);
  }

  public getLogger(): winston.Logger {
    return this.logger;
  }
}
