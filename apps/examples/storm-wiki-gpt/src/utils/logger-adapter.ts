import { ILogger } from '@agent-forge/shared';
import { LoggerService } from './logger';

export class LoggerAdapter implements ILogger {
  private logger: LoggerService;

  constructor() {
    this.logger = LoggerService.getInstance();
  }

  initialize(config?: any): void {
    // No-op as our LoggerService doesn't need initialization
  }

  setConfig(config: any): void {
    // No-op as our LoggerService doesn't support config changes
  }

  log(level: string, message: string, meta?: Record<string, any>): void {
    switch (level) {
      case 'info':
        this.logger.info(message, meta);
        break;
      case 'error':
        this.logger.error(message, meta?.error as Error, meta);
        break;
      case 'warn':
        this.logger.warn(message, meta);
        break;
      case 'debug':
        this.logger.debug(message, meta);
        break;
      default:
        this.logger.info(message, meta);
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error | string, meta?: Record<string, any>): void {
    if (error instanceof Error) {
      this.logger.error(message, error, meta);
    } else if (typeof error === 'string') {
      this.logger.error(message, new Error(error), meta);
    } else {
      this.logger.error(message, new Error('Unknown error'), meta);
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  async logWorkflowStart(workflowId: string, context?: Record<string, any>): Promise<void> {
    this.logger.info('Workflow started', { workflowId, ...context });
  }

  async logWorkflowEnd(workflowId: string, success: boolean, context?: Record<string, any>): Promise<void> {
    this.logger.info('Workflow ended', { workflowId, success, ...context });
  }

  async logOperationStart(operationId: string, context?: Record<string, any>): Promise<void> {
    this.logger.info('Operation started', { operationId, ...context });
  }

  async logOperationEnd(operationId: string, success: boolean, context?: Record<string, any>): Promise<void> {
    this.logger.info('Operation ended', { operationId, success, ...context });
  }

  async logAPIRequest(method: string, endpoint: string, statusCode: number, duration: number, context?: Record<string, any>): Promise<void> {
    this.logger.info('API request', { method, endpoint, statusCode, duration, ...context });
  }

  async logAgentAction(agentId: string, operation: string, context?: Record<string, any>): Promise<void> {
    this.logger.info('Agent action', { agentId, operation, ...context });
  }

  async logAgentError(agentId: string, error: Error | string, context?: Record<string, any>): Promise<void> {
    if (error instanceof Error) {
      this.logger.error('Agent error', error, { agentId, ...context });
    } else {
      this.logger.error('Agent error', new Error(error), { agentId, ...context });
    }
  }
}
