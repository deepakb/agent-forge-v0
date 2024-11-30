# Event-Driven Agent Example

This example demonstrates how to create event-driven agents in Agent Forge that react to system events, messages, and state changes. It shows how to implement reactive behaviors and event-based communication patterns.

## What You'll Learn
- Event-driven agent architecture
- Event handling and emission
- Message-based communication
- Reactive behaviors
- Event filtering and routing

## Features Demonstrated
1. Event subscription and handling
2. Message-based communication
3. Event filtering patterns
4. State change reactions
5. Event-driven workflows
6. Event correlation

## Prerequisites
- Node.js >= 16
- npm or yarn
- Redis (for message broker)

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

## Example Scenario
The example implements a monitoring system with:
1. System Monitor Agent: Monitors system metrics
2. Alert Agent: Processes and filters alerts
3. Notification Agent: Sends notifications
4. Action Agent: Takes automated actions

## Code Structure
- `agents/`: Event-driven agent implementations
- `events/`: Event type definitions
- `monitors/`: System monitoring implementations
- `handlers/`: Event handler implementations
- `index.ts`: Main example runner

## Key Concepts
- Event Handling
- Message Processing
- State Reactions
- Event Correlation
- Alert Processing
- Automated Actions
