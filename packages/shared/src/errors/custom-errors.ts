export class AgentForgeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AgentNotFoundError extends AgentForgeError {
  constructor(agentId: string, context?: Record<string, unknown>) {
    super(`Agent not found: ${agentId}`, 'AGENT_NOT_FOUND', context);
  }
}

export class TaskTimeoutError extends AgentForgeError {
  constructor(taskId: string, timeout: number, context?: Record<string, unknown>) {
    super(
      `Task ${taskId} timed out after ${timeout}ms`,
      'TASK_TIMEOUT',
      context
    );
  }
}

export class CommunicationError extends AgentForgeError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'COMMUNICATION_ERROR', context);
  }
}

export class ValidationError extends AgentForgeError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', context);
  }
}

export class AuthenticationError extends AgentForgeError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', context);
  }
}

export class ProviderError extends AgentForgeError {
  constructor(provider: string, message: string, context?: Record<string, unknown>) {
    super(`${provider} provider error: ${message}`, 'PROVIDER_ERROR', context);
  }
}

export class ConfigurationError extends AgentForgeError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFIGURATION_ERROR', context);
  }
}
