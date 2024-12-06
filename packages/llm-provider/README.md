# @agent-forge/llm-provider

A flexible and extensible LLM (Large Language Model) provider package for Agent Forge, supporting multiple LLM providers like OpenAI and Anthropic.

## Features

### Multi-Provider Support
- OpenAI provider implementation
- Anthropic provider implementation
- Extensible base provider for custom implementations

### Provider Management
- Factory pattern for provider instantiation
- Configurable provider settings
- Easy provider switching

### Rate Limiting
- Built-in rate limiting support
- Configurable rate limits per provider
- Automatic request throttling

### Token Management
- Token counting utilities
- Token usage tracking
- Cost estimation helpers

### Error Handling
- Provider-specific error handling
- Retry mechanisms
- Detailed error reporting

## Installation

```bash
npm install @agent-forge/llm-provider
# or
yarn add @agent-forge/llm-provider
# or
pnpm add @agent-forge/llm-provider
```

## Usage

### Basic Usage

```typescript
import { ProviderFactory } from '@agent-forge/llm-provider';

// Create an OpenAI provider
const openaiProvider = await ProviderFactory.createProvider('openai', {
  apiKey: 'your-api-key'
});

// Use the provider
const response = await openaiProvider.complete({
  prompt: 'Hello, how are you?',
  maxTokens: 100
});
```

### Using Different Providers

```typescript
// Anthropic provider
const anthropicProvider = await ProviderFactory.createProvider('anthropic', {
  apiKey: 'your-anthropic-key'
});

// Custom provider
class MyCustomProvider extends BaseProvider {
  // Implementation
}

ProviderFactory.register('custom', MyCustomProvider);
const customProvider = await ProviderFactory.createProvider('custom', config);
```

### Rate Limiting

```typescript
import { RateLimiter } from '@agent-forge/llm-provider';

const limiter = new RateLimiter({
  maxRequests: 100,
  timeWindow: 60000 // 1 minute
});

const provider = await ProviderFactory.createProvider('openai', {
  apiKey: 'your-api-key',
  rateLimiter: limiter
});
```

### Token Counting

```typescript
import { TokenCounter } from '@agent-forge/llm-provider';

const tokenCount = TokenCounter.count('Your text here');
console.log(`This text contains ${tokenCount} tokens`);
```

## API Reference

### ProviderFactory
Creates and manages LLM providers.

### BaseProvider
Base class for implementing custom providers.

### OpenAIProvider
OpenAI-specific implementation.

### AnthropicProvider
Anthropic-specific implementation.

### RateLimiter
Handles request rate limiting.

### TokenCounter
Utilities for token counting and management.

## Configuration

Each provider can be configured with specific options:

```typescript
const config = {
  apiKey: 'your-api-key',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  // Provider-specific options
  rateLimits: {
    maxRequests: 100,
    timeWindow: 60000
  }
};
```

## Contributing

Please read our [Contributing Guide](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
