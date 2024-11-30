# Multi-Agent Communication Example

This example demonstrates how multiple agents can communicate and coordinate using Agent Forge's messaging system. It implements a simple pipeline where agents collaborate to process and analyze text.

## What You'll Learn
- Setting up multiple agents
- Implementing message handlers
- Agent-to-agent communication
- Message routing and handling
- Coordinating tasks across agents

## Example Scenario
The example implements a text processing pipeline with three agents:
1. **Preprocessor Agent**: Cleans and normalizes text
2. **Analyzer Agent**: Performs analysis on the text
3. **Reporter Agent**: Generates final reports

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

## Code Explanation

The example demonstrates:
1. Message broker setup
2. Agent communication patterns
3. Task coordination
4. Error handling across agents
5. State synchronization

## Key Concepts

- Message Broker Configuration
- Inter-agent Communication
- Task Distribution
- Pipeline Processing
- Error Recovery
