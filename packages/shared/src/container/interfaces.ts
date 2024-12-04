import { Logger as WinstonLogger } from 'winston';

export interface ILogger {
  initialize(config?: any): void;
  setConfig(config: any): void;
  log(level: string, message: string, meta?: Record<string, any>): void;
  info(message: string, meta?: Record<string, any>): void;
  error(message: string, error?: Error | string, meta?: Record<string, any>): void;
  warn(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
  logWorkflowStart(workflowId: string, context?: Record<string, any>): Promise<void>;
  logWorkflowEnd(workflowId: string, success: boolean, context?: Record<string, any>): Promise<void>;
  logOperationStart(operationId: string, context?: Record<string, any>): Promise<void>;
  logOperationEnd(operationId: string, success: boolean, context?: Record<string, any>): Promise<void>;
  logAPIRequest(method: string, endpoint: string, statusCode: number, duration: number, context?: Record<string, any>): Promise<void>;
  logAgentAction(agentId: string, operation: string, context?: Record<string, any>): Promise<void>;
  logAgentError(agentId: string, error: Error | string, context?: Record<string, any>): Promise<void>;
}

export interface IEncryption {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
  hash(data: string): Promise<string>;
  compare(data: string, hash: string): Promise<boolean>;
}

export interface IConfigManager {
  get<T>(key: string): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface IErrorHandler {
  handleError(error: Error | string): void;
  wrap<T>(fn: () => Promise<T>, retryCount?: number): Promise<T>;
  isOperationalError(error: Error): boolean;
  isRetryableError(error: Error): boolean;
  getErrorCode(error: Error): string | undefined;
  getErrorContext(error: Error): Record<string, unknown> | undefined;
}

export interface ISecurity {
  validateToken(token: string): Promise<boolean>;
  generateToken(payload: Record<string, any>): Promise<string>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
