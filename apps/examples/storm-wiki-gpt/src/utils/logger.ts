import { v4 as uuidv4 } from 'uuid';

export interface LogContext {
  component?: string;
  operation?: string;
  status?: string;
  workflowId?: string;
  agentId?: string;
  agentType?: string;
  query?: string;
  resultCount?: number;
  durationMs?: number;
  error?: Error;
  [key: string]: any;
}

export class LoggerService {
  private static instance: LoggerService;
  private currentWorkflowId?: string;
  private operationStartTimes: Map<string, Date>;

  private constructor() {
    this.operationStartTimes = new Map();
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  public trace(message: string, context?: LogContext): void {
    this.log('trace', message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  public error(message: string, error: Error, context?: LogContext): void {
    this.log('error', message, { ...context, error });
  }

  public fatal(message: string, error: Error, context?: LogContext): void {
    this.log('fatal', message, { ...context, error });
  }

  public startWorkflow(context?: LogContext): string {
    const workflowId = uuidv4();
    this.currentWorkflowId = workflowId;
    this.info('Starting workflow', { ...context, workflowId });
    return workflowId;
  }

  public endWorkflow(context?: LogContext): void {
    if (this.currentWorkflowId) {
      this.info('Ending workflow', { ...context, workflowId: this.currentWorkflowId });
      this.currentWorkflowId = undefined;
    }
  }

  public startOperation(operation: string, context?: LogContext): Date {
    const startTime = new Date();
    const operationId = uuidv4();
    this.operationStartTimes.set(operationId, startTime);
    this.info(`Starting ${operation}`, {
      ...context,
      operation,
      workflowId: this.currentWorkflowId,
      operationId,
    });
    return startTime;
  }

  public endOperation(operation: string, startTime: Date, context?: LogContext): void {
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    this.info(`Completed ${operation}`, {
      ...context,
      operation,
      workflowId: this.currentWorkflowId,
      durationMs,
    });
  }

  public logAgentAction(agentId: string, action: string, context?: LogContext): void {
    this.info(`Agent ${action}`, {
      ...context,
      agentId,
      action,
      workflowId: this.currentWorkflowId,
    });
  }

  private log(level: string, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
      workflowId: context?.workflowId || this.currentWorkflowId,
    };

    // For now, just console.log the entry
    // In production, this would use a proper logging framework
    console.log(JSON.stringify(logEntry));
  }
}
