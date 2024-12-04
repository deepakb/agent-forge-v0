import { injectable } from 'inversify';
import { LogHandler } from './log-handler';
import { formatLogEntry, StructuredLogEntry } from './log-formatter';
import { formatError } from '../errors/error-formatter';
import { LoggerConfig } from './types';
import { ILogger } from '../container/interfaces';

@injectable()
export class Logger implements ILogger {
  private handler: LogHandler;
  private config: Partial<LoggerConfig>;

  constructor() {
    this.handler = LogHandler.getInstance();
    this.config = {};
  }

  public initialize(config?: Partial<LoggerConfig>): void {
    this.config = config || {};
  }

  public setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private createContext(context?: Partial<StructuredLogEntry>): Partial<StructuredLogEntry> {
    return {
      ...this.config,
      ...context,
    };
  }

  public log(level: string, message: string, meta?: any): void {
    const metadata = formatLogEntry(level, message, this.createContext(meta));
    this.handler.writeLog(level, metadata.message, metadata);
  }

  public info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  public error(message: string, error?: Error, meta?: any): void {
    const errorMeta = error ? { error: formatError(error) } : {};
    this.log('error', message, { ...meta, ...errorMeta });
  }

  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  public async logWorkflowStart(workflowId: string, context?: any): Promise<void> {
    this.info('Workflow started', {
      ...this.createContext(context),
      workflowId,
      operation: 'workflowInit',
      status: 'in_progress',
      startTime: new Date(),
    });
  }

  public async logWorkflowEnd(workflowId: string, success: boolean, context?: any): Promise<void> {
    this.info('Workflow completed', {
      ...this.createContext(context),
      workflowId,
      operation: 'workflowCompletion',
      status: success ? 'success' : 'failure',
      endTime: new Date(),
    });
  }

  public async logOperationStart(operationId: string, context?: any): Promise<void> {
    this.info('Operation started', {
      ...this.createContext(context),
      operationId,
      operation: 'operationInit',
      status: 'in_progress',
      startTime: new Date(),
    });
  }

  public async logOperationEnd(operationId: string, success: boolean, context?: any): Promise<void> {
    this.info('Operation completed', {
      ...this.createContext(context),
      operationId,
      operation: 'operationCompletion',
      status: success ? 'success' : 'failure',
      endTime: new Date(),
    });
  }

  public async logAPIRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    context?: any
  ): Promise<void> {
    this.info('API Request completed', {
      ...this.createContext(context),
      method,
      endpoint,
      statusCode,
      duration,
      operation: 'apiRequest',
    });
  }

  public async logAgentAction(agentId: string, operation: string, context?: any): Promise<void> {
    this.info('Agent action', {
      ...this.createContext(context),
      agentId,
      operation,
      timestamp: new Date(),
    });
  }

  public async logAgentError(agentId: string, error: Error, context?: any): Promise<void> {
    this.error('Agent error', error, {
      ...this.createContext(context),
      agentId,
      operation: context?.operation || 'unknown',
      timestamp: new Date(),
    });
  }
}
