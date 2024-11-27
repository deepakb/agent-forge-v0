# Storm Wiki-GPT Example

This example demonstrates a multi-agent system that collaboratively retrieves and synthesizes information from the web using Tavily Search API and OpenAI's GPT model. It showcases the Agent Forge framework's capabilities for building distributed, event-driven AI applications.

## Architecture

The system consists of three specialized agents:

1. **QueryAgent**: Processes user queries and initiates the information retrieval workflow
2. **FetchAgent**: Retrieves relevant search results using Tavily's advanced search API
3. **SynthesisAgent**: Uses OpenAI's GPT to synthesize information from multiple sources into a coherent response

## Prerequisites

- Node.js 18+
- OpenAI API key
- Tavily API key
- Internet connection

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a `.env` file in the project root with your API keys:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   TAVILY_API_KEY=your-tavily-api-key-here
   ```

## Usage

1. Start the example:
   ```bash
   pnpm start
   ```

2. The example will process a sample query about quantum computing. You can modify the query in `src/index.ts`.

3. Press Ctrl+C to stop the application.

## Features

- **Event-Driven Architecture**: Agents communicate asynchronously through a message broker
- **Type Safety**: Comprehensive TypeScript types and Zod schemas for runtime validation
- **Error Handling**: Robust error handling and logging throughout the system
- **Scalability**: Easy to add new agents or modify existing ones
- **API Integration**: Demonstrates integration with Tavily Search and OpenAI APIs

## Example Output

```
Query Results:
=============
Query: What is quantum computing and how does it work?

Summary:
[Generated summary from OpenAI will appear here]

Sources:
- [Source URLs will be listed here]
```

## Customization

You can customize the example by:

1. Modifying the query in `src/index.ts`
2. Adjusting the number of search results retrieved (`maxResults` in the query)
3. Changing the OpenAI model or prompt in `src/utils/openai-helper.ts`
4. Modifying Tavily search parameters in `src/utils/tavily-helper.ts`
5. Adding new agent types for additional functionality

## Error Handling

The example includes comprehensive error handling:

- API failures (Tavily/OpenAI)
- Invalid message types
- Runtime type validation
- Network issues

## Logging

Extensive logging is implemented using the `@agent-forge/shared` Logger:

- Agent lifecycle events
- Message processing
- API interactions
- Error conditions

## Contributing

Feel free to submit issues and enhancement requests!
