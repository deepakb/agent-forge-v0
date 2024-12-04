# @agent-forge/core

Core functionality for Agent Forge, providing a flexible and extensible framework for building agent-based systems.

## Features

### Agent Management
- Base agent implementation with extensible architecture
- Agent state management and lifecycle control
- Configurable agent behaviors and capabilities

### Workflow Orchestration
- Workflow definition and execution
- Task scheduling and management
- State transitions and error handling
- Event-driven workflow control

### State Management
- Flexible state store implementation
- Pluggable storage adapters
- Transaction support
- State persistence and recovery

### Communication System
- Message broker for inter-agent communication
- Message routing and handling
- Serialization and deserialization of messages
- Event-driven architecture

### Container Management
- Dependency injection container
- Service registration and resolution
- Modular architecture support

## Installation

```bash
npm install @agent-forge/core
# or
yarn add @agent-forge/core
# or
pnpm add @agent-forge/core
```

## Usage

### Creating an Agent

```typescript
import { BaseAgent, ConfigurableStateStore } from '@agent-forge/core';

class MyCustomAgent extends BaseAgent {
  async initialize() {
    // Custom initialization logic
  }

  async execute() {
    // Custom execution logic
  }
}

const agent = new MyCustomAgent('agent-1');
await agent.initialize();
```

### Managing State

```typescript
import { ConfigurableStateStore, createDefaultStorage } from '@agent-forge/core';

// Create a store with default memory storage
const store = new ConfigurableStateStore(createDefaultStorage());

// Update agent state
await store.updateAgentState('agent1', { status: 'running' });

// Retrieve agent state
const state = await store.getAgentState('agent1');
```

### Working with Workflows

```typescript
import { WorkflowOrchestrator } from '@agent-forge/core';

const workflow = new WorkflowOrchestrator();

// Define workflow steps
workflow.addStep({
  id: 'step1',
  execute: async (context) => {
    // Step execution logic
  }
});

// Execute workflow
await workflow.execute();
```

### Message Communication

```typescript
import { MessageBroker, MessageRouter } from '@agent-forge/core';

const broker = new MessageBroker();
const router = new MessageRouter();

// Subscribe to messages
broker.subscribe('topic', (message) => {
  // Handle message
});

// Send messages
broker.publish('topic', { data: 'Hello!' });
```

## API Reference

### BaseAgent
The foundation class for creating custom agents.

### ConfigurableStateStore
Manages state persistence and retrieval.

### WorkflowOrchestrator
Handles workflow definition and execution.

### MessageBroker
Facilitates message-based communication.

### StorageAdapter
Interface for implementing custom storage solutions.

## Contributing

Please read our [Contributing Guide](../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
