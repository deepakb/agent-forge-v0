# Comprehensive Agent Forge Demo

This example demonstrates a complete AI-powered content management system that combines all the major features of Agent Forge. It showcases how different components can work together to create a sophisticated agent-based system.

## Features Demonstrated

1. **Multi-Agent Architecture**
   - Content Manager Agent
   - Analysis Agent
   - Generation Agent
   - Publishing Agent
   - Monitoring Agent

2. **LLM Integration**
   - Content generation with GPT-4
   - Content analysis with Claude
   - Fallback provider handling

3. **State Management**
   - Redis-based state persistence
   - Content version tracking
   - Publishing status management

4. **Event-Driven Communication**
   - Content update events
   - Analysis completion events
   - Publishing notifications
   - System monitoring alerts

5. **Workflow Orchestration**
   - Content lifecycle management
   - Parallel content processing
   - Conditional publishing rules
   - Error recovery workflows

6. **Advanced Features**
   - Content caching
   - Rate limiting
   - Automatic retries
   - Performance monitoring
   - Analytics tracking

## Prerequisites

- Node.js >= 16
- npm or yarn
- Redis
- OpenAI API key
- Anthropic API key

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start Redis:
```bash
docker-compose up -d
```

4. Run the demo:
```bash
npm start
```

## System Architecture

The system consists of several specialized agents:

1. **Content Manager Agent**
   - Coordinates content lifecycle
   - Manages content state
   - Routes content to appropriate agents

2. **Analysis Agent**
   - Performs content analysis
   - Generates metadata
   - Validates content quality

3. **Generation Agent**
   - Creates new content
   - Enhances existing content
   - Handles content variations

4. **Publishing Agent**
   - Manages content publishing
   - Handles distribution
   - Tracks publishing status

5. **Monitoring Agent**
   - Tracks system performance
   - Monitors agent health
   - Generates alerts

## Key Concepts

- Agent Lifecycle Management
- State Persistence
- Event-Driven Architecture
- Workflow Orchestration
- LLM Provider Integration
- Error Handling and Recovery
- Performance Monitoring
- Analytics and Reporting

## Example Workflows

1. **Content Creation**
   - Request new content
   - Generate draft
   - Analyze quality
   - Review and approve
   - Publish

2. **Content Enhancement**
   - Analyze existing content
   - Generate improvements
   - Review changes
   - Update content
   - Republish

3. **Content Monitoring**
   - Track performance
   - Generate reports
   - Identify issues
   - Trigger updates

## Code Organization

- `src/agents/`: Agent implementations
- `src/workflows/`: Workflow definitions
- `src/providers/`: LLM provider implementations
- `src/events/`: Event type definitions
- `src/utils/`: Helper utilities
- `src/types/`: TypeScript type definitions

## Learning Objectives

1. Building complex agent systems
2. Managing agent state and communication
3. Implementing event-driven architectures
4. Handling errors and recovery
5. Monitoring and optimization
6. System integration patterns

This example serves as a comprehensive demonstration of Agent Forge's capabilities and provides a template for building sophisticated agent-based systems.
