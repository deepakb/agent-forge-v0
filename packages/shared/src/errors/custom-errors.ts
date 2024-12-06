export class AgentForgeError extends Error {
  public readonly isOperational: boolean;
  public readonly isRetryable: boolean;
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'AGENT_FORGE_ERROR',
    isOperational: boolean = true,
    isRetryable: boolean = false,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentForgeError';
    this.code = code;
    this.isOperational = isOperational;
    this.isRetryable = isRetryable;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AgentNotFoundError extends AgentForgeError {
  constructor(agentId: string, context?: Record<string, unknown>) {
    super(`Agent not found: ${agentId}`, 'AGENT_NOT_FOUND', true, false, context);
  }
}

export class TaskTimeoutError extends AgentForgeError {
  constructor(taskId: string, timeout: number, context?: Record<string, unknown>) {
    super(`Task ${taskId} timed out after ${timeout}ms`, 'TASK_TIMEOUT', true, false, context);
  }
}

export class CommunicationError extends AgentForgeError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'COMMUNICATION_ERROR', true, false, context);
  }
}

export class ValidationError extends AgentForgeError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', true, false, context);
  }
}

export class AuthenticationError extends AgentForgeError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', true, false, context);
  }
}

export class ProviderError extends AgentForgeError {
  constructor(provider: string, message: string, context?: Record<string, unknown>) {
    super(`${provider} provider error: ${message}`, 'PROVIDER_ERROR', true, false, context);
  }
}

export class ConfigurationError extends AgentForgeError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', true, false, context);
  }
}
