# @agent-forge/core

Core functionality for Agent Forge, providing a flexible and extensible framework for building agent-based systems.

## Features

- Flexible state management
- Pluggable storage system
- Event-driven architecture
- Type-safe interfaces
- Transaction support

## Installation

```bash
pnpm add @agent-forge/core
```

## Usage

### Basic Usage with Default Memory Storage

```typescript
import { ConfigurableStateStore, createDefaultStorage } from '@agent-forge/core';

// Create a store with default memory storage
const store = new ConfigurableStateStore(createDefaultStorage());

// Use the store
await store.updateAgentState('agent1', { status: 'running' });
const state = await store.getAgentState('agent1');
```

### Using Custom Storage Adapters

You can implement your own storage adapter for any database or storage system:

```typescript
import { StorageAdapter, ConfigurableStateStore } from '@agent-forge/core';
import { MongoClient } from 'mongodb';

class MongoDBAdapter implements StorageAdapter {
    constructor(private client: MongoClient, private collection: string) {}

    async get(key: string): Promise<any> {
        const doc = await this.client
            .collection(this.collection)
            .findOne({ _id: key });
        return doc?.value;
    }

    async set(key: string, value: any): Promise<void> {
        await this.client
            .collection(this.collection)
            .updateOne(
                { _id: key },
                { $set: { value } },
                { upsert: true }
            );
    }

    // Implement other methods...
}

// Use MongoDB adapter
const mongoClient = new MongoClient('mongodb://localhost:27017');
const mongoAdapter = new MongoDBAdapter(mongoClient, 'states');
const store = new ConfigurableStateStore(mongoAdapter);
```

### Using the Storage Factory

The storage factory provides a convenient way to create storage adapters:

```typescript
import { StorageFactory, ConfigurableStateStore } from '@agent-forge/core';

// Register a custom adapter
class PostgresAdapter implements StorageAdapter {
    // Implementation...
}
StorageFactory.register('postgres', PostgresAdapter);

// Create storage using factory
const storage = await StorageFactory.createStorage({
    type: 'postgres',
    options: {
        connectionString: 'postgresql://localhost:5432/mydb'
    }
});

const store = new ConfigurableStateStore(storage);
```

### Transaction Support

The state store supports transactions when the underlying storage adapter implements them:

```typescript
const store = new ConfigurableStateStore(storage);

await store.beginTransaction();
try {
    await store.updateAgentState('agent1', { status: 'running' });
    await store.updateTaskState('task1', { progress: 50 });
    await store.commitTransaction();
} catch (error) {
    await store.rollbackTransaction();
    throw error;
}
```

### Event Handling

The state store emits events for state changes:

```typescript
store.on('AGENT_STATE_CHANGED', async (event) => {
    console.log('Agent state changed:', {
        agentId: event.entityId,
        previousState: event.previousState,
        currentState: event.currentState
    });
});
```

## Advanced Features

### Query Support

If your storage adapter implements query support:

```typescript
const tasks = await store.listTasks({
    filter: { status: 'pending' }
});
```

### Batch Operations

For storage adapters that implement batch operations:

```typescript
if ('batchSet' in storage) {
    const entries = new Map([
        ['agent:1', { status: 'running' }],
        ['agent:2', { status: 'idle' }]
    ]);
    await storage.batchSet(entries);
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
