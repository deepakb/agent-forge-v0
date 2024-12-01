interface ErrorContext {
  originalError?: Error;
  [key: string]: any;
}

export class LLMProviderError extends Error {
  public readonly context?: ErrorContext;
  public readonly code: string;

  constructor(message: string, context?: ErrorContext, code: string = 'LLM_PROVIDER_ERROR') {
    super(message);
    this.name = 'LLMProviderError';
    this.code = code;
    this.context = context;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LLMAuthenticationError extends LLMProviderError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context, 'LLM_AUTHENTICATION_ERROR');
    this.name = 'LLMAuthenticationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LLMRateLimitError extends LLMProviderError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context, 'LLM_RATE_LIMIT_ERROR');
    this.name = 'LLMRateLimitError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LLMValidationError extends LLMProviderError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context, 'LLM_VALIDATION_ERROR');
    this.name = 'LLMValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LLMTimeoutError extends LLMProviderError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context, 'LLM_TIMEOUT_ERROR');
    this.name = 'LLMTimeoutError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LLMConfigurationError extends LLMProviderError {
  constructor(message: string, context?: ErrorContext) {
    super(message, context, 'LLM_CONFIGURATION_ERROR');
    this.name = 'LLMConfigurationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
