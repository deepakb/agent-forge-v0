# Agent Forge

Agent Forge is a powerful, enterprise-grade framework for building, managing, and orchestrating AI agents. It provides a robust foundation for creating autonomous agents that can handle complex tasks, communicate with each other, and maintain state across distributed systems.

## 🌟 Features

- **Modular Architecture**: Built with a modular design across three main packages:
  - `@agent-forge/core`: Core agent functionality and base implementations
  - `@agent-forge/llm-provider`: LLM integration for AI capabilities
  - `@agent-forge/shared`: Shared utilities and common functionality

- **Advanced Agent Management**:
  - Lifecycle management (initialize, start, pause, resume, stop)
  - Concurrent task handling
  - State management and persistence
  - Event-driven architecture
  - Heartbeat monitoring

- **Robust Task Handling**:
  - Task queuing and execution
  - Progress tracking
  - Error handling and retry mechanisms
  - Task status monitoring

- **State Management**:
  - Redis-based state persistence
  - State synchronization across distributed systems
  - Event-based state updates
  - Transaction support

- **Communication**:
  - Message broker system
  - Pub/Sub messaging patterns
  - Reliable message delivery
  - Event emission and handling

## 📦 Packages

### @agent-forge/core (v0.1.0)
Core functionality for Agent Forge:
- Base agent implementation
- Task execution framework
- Workflow management
- State management interfaces
- Communication protocols
- TypeScript support with dual CJS/ESM exports

### @agent-forge/llm-provider (v0.1.0)
Comprehensive LLM integration package supporting multiple providers:
- Multiple LLM Provider Support:
  - OpenAI (GPT-3.5, GPT-4)
  - Anthropic (Claude-2)
  - Fal.ai Integration
- Provider-specific optimizations
- Streaming support
- Rate limiting and token management
- Error handling and retries
- TypeScript-first with dual CJS/ESM support

### @agent-forge/shared (v0.1.0)
Shared utilities and common functionality:
- Common types and interfaces
- Utility functions
- Shared constants
- Cross-package helpers
- TypeScript-first design

## 🚀 Installation

```bash
# Install core package
npm install @agent-forge/core

# Install LLM provider
npm install @agent-forge/llm-provider

# Install shared utilities
npm install @agent-forge/shared
```

## 💻 Development

All packages in Agent Forge follow a consistent development workflow:

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Development with watch mode
npm run dev

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

Each package supports:
- TypeScript with proper type definitions
- Dual CJS/ESM module support
- Jest for testing
- ESLint for code quality
- Prettier for code formatting

## 🛠️ Getting Started

1. Create a basic agent:
```typescript
import { BaseAgent } from '@agent-forge/core';

class MyAgent extends BaseAgent {
  protected async executeTask(task: Task): Promise<TaskResult> {
    // Implement your task execution logic
  }
  
  // Implement other required abstract methods
}
```

## 📝 Requirements

- Node.js >= 16
- Redis (for state management)
- TypeScript 5.x

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🔗 Links

- [Documentation](docs/)
- [API Reference](docs/api/)
- [Examples](examples/)
- [Change Log](CHANGELOG.md)

## 💫 Credits

Created and maintained by the Agent Forge team.
