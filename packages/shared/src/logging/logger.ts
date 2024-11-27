import { LogHandler } from './log-handler';
import { formatLogEntry, StructuredLogEntry } from './log-formatter';
import { formatError } from '../errors/error-formatter';

export interface LoggerConfig {
  component?: string;
  workflowId?: string;
  agentId?: string;
  agentType?: string;
}

export class Logger {
  private static handler: LogHandler;
  private static defaultConfig: LoggerConfig = {};

  public static initialize(config?: LoggerConfig): void {
    this.defaultConfig = config || {};
    this.handler = LogHandler.getInstance();
  }

  public static setDefaultConfig(config: Partial<LoggerConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  private static createContext(
    context?: Partial<StructuredLogEntry>
  ): Partial<StructuredLogEntry> {
    return {
      ...this.defaultConfig,
      ...context,
    };
  }

  public static async logWorkflowStart(
    workflowId: string,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const metadata = formatLogEntry('info', 'Workflow started', {
      ...this.createContext(context),
      workflowId,
      operation: 'workflowInit',
      status: 'in_progress',
      startTime: new Date(),
    });
    await this.handler.writeLog('info', metadata.message, metadata);
  }

  public static async logWorkflowEnd(
    workflowId: string,
    success: boolean,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const metadata = formatLogEntry('info', 'Workflow completed', {
      ...this.createContext(context),
      workflowId,
      operation: 'workflowCompletion',
      status: success ? 'success' : 'failure',
    });
    await this.handler.writeLog('info', metadata.message, metadata);
  }

  public static async logAgentAction(
    agentId: string,
    action: string,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const metadata = formatLogEntry('info', `Agent ${agentId}: ${action}`, {
      ...this.createContext(context),
      agentId,
      operation: action,
      status: 'in_progress',
    });
    await this.handler.writeLog('info', metadata.message, metadata);
  }

  public static async logAgentError(
    agentId: string,
    error: Error,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const errorData = formatError(error);
    const metadata = formatLogEntry('error', `Agent ${agentId} error: ${error.message}`, {
      ...this.createContext(context),
      agentId,
      operation: 'error',
      status: 'failure',
      error: errorData,
    });
    await this.handler.writeLog('error', metadata.message, metadata);
  }

  public static async info(
    message: string,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const metadata = formatLogEntry('info', message, {
      ...this.createContext(context),
      status: context?.status || 'success',
    });
    await this.handler.writeLog('info', metadata.message, metadata);
  }

  public static async debug(
    message: string,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const metadata = formatLogEntry('debug', message, {
      ...this.createContext(context),
      status: context?.status || 'success',
    });
    await this.handler.writeLog('debug', metadata.message, metadata);
  }

  public static async warn(
    message: string,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const metadata = formatLogEntry('warn', message, {
      ...this.createContext(context),
      status: 'warning',
    });
    await this.handler.writeLog('warn', metadata.message, metadata);
  }

  public static async error(
    message: string,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const metadata = formatLogEntry('error', message, {
      ...this.createContext(context),
      status: 'failure',
    });
    await this.handler.writeLog('error', metadata.message, metadata);
  }

  public static async fatal(
    message: string,
    context?: Partial<StructuredLogEntry>
  ): Promise<void> {
    const metadata = formatLogEntry('fatal', message, {
      ...this.createContext(context),
      status: 'failure',
    });
    await this.handler.writeLog('fatal', metadata.message, metadata);
  }
}
