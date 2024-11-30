# State Management Example

This example demonstrates how to use Agent Forge's state management capabilities with Redis. It shows how to persist agent states, synchronize across instances, and handle state events.

## What You'll Learn
- Redis state store configuration
- State persistence and recovery
- State event handling
- State synchronization between agents
- Version control of states

## Example Scenario
The example implements a stateful task processor that:
1. Persists task states in Redis
2. Handles agent state recovery after restarts
3. Synchronizes states across multiple instances
4. Manages state versioning

## Prerequisites
- Node.js >= 16
- npm or yarn
- Redis server

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start Redis:
```bash
docker-compose up -d
```

3. Run the example:
```bash
npm start
```

## Code Explanation

The example demonstrates:
1. Redis state store setup
2. State persistence patterns
3. State recovery mechanisms
4. Event-driven state updates
5. State versioning and history

## Key Concepts

- State Store Configuration
- State Persistence
- State Recovery
- Event Handling
- Version Control
- State Synchronization
