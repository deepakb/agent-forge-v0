# @agent-forge/shared

Shared utilities and common functionality for the Agent Forge framework, providing core infrastructure components used across other packages.

## Features

### Security
- Encryption services
- Key management
- Security policy enforcement
- Authentication utilities

### Logging
- Advanced logging system
- Log formatting and handling
- Log levels and filtering
- Custom log handlers

### Error Handling
- Centralized error management
- Custom error types
- Error formatting
- Error recovery strategies

### Configuration
- Configuration management
- Environment-based config
- Configuration validation
- Dynamic config updates

### Container Management
- Dependency injection container
- Service registration
- Interface bindings
- Scope management

## Installation

```bash
npm install @agent-forge/shared
# or
yarn add @agent-forge/shared
# or
pnpm add @agent-forge/shared
```

## Usage

### Encryption Services

```typescript
import { EncryptionService } from '@agent-forge/shared';

const encryptionService = new EncryptionService();

// Encrypt data
const encrypted = await encryptionService.encrypt('sensitive data');

// Decrypt data
const decrypted = await encryptionService.decrypt(encrypted);
```

### Logging

```typescript
import { Logger, LogLevel } from '@agent-forge/shared';

const logger = new Logger({
  level: LogLevel.INFO,
  format: 'json'
});

logger.info('Application started', { timestamp: new Date() });
logger.error('An error occurred', { error: new Error('Failed') });
```

### Error Handling

```typescript
import { ErrorHandler, CustomError } from '@agent-forge/shared';

const errorHandler = new ErrorHandler();

try {
  // Your code here
} catch (error) {
  const formattedError = errorHandler.handle(error);
  // Handle the formatted error
}
```

### Configuration Management

```typescript
import { ConfigManager } from '@agent-forge/shared';

const config = new ConfigManager({
  environment: 'production',
  configPath: './config'
});

const dbConfig = config.get('database');
```

### Dependency Injection

```typescript
import { Container } from '@agent-forge/shared';

const container = new Container();

// Register a service
container.register('logger', Logger);

// Resolve a service
const logger = container.resolve('logger');
```

## API Reference

### EncryptionService
Handles data encryption and decryption.

### Logger
Provides logging functionality.

### ErrorHandler
Manages error handling and formatting.

### ConfigManager
Handles configuration management.

### Container
Manages dependency injection.

## Security

The shared package implements several security best practices:

- Secure key management
- Encryption at rest
- Secure configuration handling
- Input validation
- Audit logging

## Contributing

Please read our [Contributing Guide](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
