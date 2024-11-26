import { LogContext, formatLogEntry } from './log-formatter';
import { LogHandler, LogHandlerConfig } from './log-handler';

export class Logger {
  private static handler: LogHandler;

  public static initialize(config?: LogHandlerConfig): void {
    this.handler = LogHandler.getInstance(config);
  }

  public static async info(message: string, context?: LogContext): Promise<void> {
    const metadata = formatLogEntry('info', message, context);
    await this.handler.writeLog('info', message, metadata as Record<string, unknown>);
  }

  public static async debug(message: string, context?: LogContext): Promise<void> {
    const metadata = formatLogEntry('debug', message, context);
    await this.handler.writeLog('debug', message, metadata as Record<string, unknown>);
  }

  public static async warn(message: string, context?: LogContext): Promise<void> {
    const metadata = formatLogEntry('warn', message, context);
    await this.handler.writeLog('warn', message, metadata as Record<string, unknown>);
  }

  public static async error(message: string, context?: LogContext): Promise<void> {
    const metadata = formatLogEntry('error', message, context);
    await this.handler.writeLog('error', message, metadata as Record<string, unknown>);
  }

  public static async fatal(message: string, context?: LogContext): Promise<void> {
    const metadata = formatLogEntry('fatal', message, context);
    await this.handler.writeLog('fatal', message, metadata as Record<string, unknown>);
  }

  public static async logAgentAction(
    agentId: string,
    action: string,
    context?: LogContext
  ): Promise<void> {
    const agentContext = { ...context, agentId };
    await this.info(`Agent ${agentId}: ${action}`, agentContext);
  }

  public static async logTaskProgress(
    taskId: string,
    status: string,
    context?: LogContext
  ): Promise<void> {
    const taskContext = { ...context, taskId };
    await this.info(`Task ${taskId}: ${status}`, taskContext);
  }

  public static async logAgentError(
    agentId: string,
    error: Error,
    context?: LogContext
  ): Promise<void> {
    const errorContext = { ...context, agentId, error: error.stack };
    await this.error(`Agent ${agentId} error: ${error.message}`, errorContext);
  }
}
