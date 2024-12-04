// Encryption exports
export * from './encryption/encryption';
export * from './encryption/key-management';
export * from './encryption/hashing';

// Logging exports
export * from './logging/logger';
export * from './logging/types';

// Security exports
export * from './security/security-manager';
export * from './security/types';

// IoC exports
export { sharedContainer } from './container/container';
export { SHARED_TYPES } from './container/types';
export * from './container/interfaces';

// Service implementations
export { Logger } from './logging/logger';
export { ErrorHandler } from './errors/error-handler';
export { EncryptionService } from './encryption/encryption-service';
export { SecurityService } from './security/security-service';
export { ConfigManager } from './config/config-manager';

// Types and utilities
export * from './logging/types';
export * from './errors/custom-errors';
export { formatError } from './errors/error-formatter';

// Initialize container
import 'reflect-metadata';
import { sharedContainer } from './container/container';
