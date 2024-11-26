import { AgentForgeError } from './custom-errors';

export interface ErrorMetadata {
  timestamp: string;
  errorCode: string;
  errorName: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export const formatError = (error: Error | AgentForgeError): ErrorMetadata => {
  const metadata: ErrorMetadata = {
    timestamp: new Date().toISOString(),
    errorCode: error instanceof AgentForgeError ? error.code : 'UNKNOWN_ERROR',
    errorName: error.name,
    message: error.message,
    stack: error.stack,
  };

  if (error instanceof AgentForgeError && error.context) {
    metadata.context = error.context;
  }

  return metadata;
};

export const formatErrorForLogging = (error: Error | AgentForgeError): string => {
  const metadata = formatError(error);
  return JSON.stringify(metadata, null, 2);
};

export const formatErrorForClient = (
  error: Error | AgentForgeError
): Omit<ErrorMetadata, 'stack'> => {
  const metadata = formatError(error);
  const { stack, ...clientMetadata } = metadata;
  return clientMetadata;
};
