# Conversational Workflow System

A modular, event-driven conversational AI system with multiple specialized agents working together to process and respond to user queries.

## Features

- **Modular Agent Architecture**: Multiple specialized agents working in harmony
  - Chatbot Agent: Main conversation handler with OpenAI integration
  - Knowledge Agent: Information retrieval and processing
  - News Fetcher Agent: Real-time news retrieval using Tavily API

- **Event-Driven Communication**: Efficient message passing between agents
- **Simplified State Management**: Reduced complexity in handling agent states
- **Rate Limiting & Error Handling**: Built-in protection against API rate limits
- **Security Features**: Encryption, audit logging, and rate limiting

## Prerequisites

- Node.js (v14 or higher)
- TypeScript
- OpenAI API Key
- Tavily API Key

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=your_openai_key_here
   TAVILY_API_KEY=your_tavily_key_here
   ```

## Usage

1. Build the project:
   ```bash
   npm run build
   ```

2. Run the example:
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

## Architecture

- **WorkflowManager**: Orchestrates communication between agents
- **BaseAgent**: Provides core agent functionality
- **Specialized Agents**:
  - ChatbotAgent: Handles main conversation flow
  - KnowledgeAgent: Processes knowledge-based queries
  - NewsFetcherAgent: Retrieves relevant news

## Development

- **Linting**: `npm run lint`
- **Format Code**: `npm run format`
- **Run Tests**: `npm run test`

## Error Handling

The system includes comprehensive error handling:
- API rate limiting protection
- Timeout management
- Retry mechanisms
- Graceful shutdown

## Future Improvements

- Enhanced agent collaboration
- Persistent knowledge storage
- More sophisticated query routing
- Advanced error recovery mechanisms
- Additional agent types

## License

MIT
