# Custom LLM Provider Example

This example demonstrates how to create and use custom Language Model (LLM) providers in Agent Forge. It shows how to implement custom providers for different LLM services and use them in agents.

## What You'll Learn
- Creating custom LLM providers
- Implementing provider interfaces
- Handling streaming responses
- Managing API rate limits
- Error handling and retries

## Features Demonstrated
1. Custom OpenAI provider implementation
2. Anthropic Claude provider implementation
3. Streaming response handling
4. Rate limiting and throttling
5. Error recovery and retries
6. Provider switching and fallbacks

## Prerequisites
- Node.js >= 16
- npm or yarn
- OpenAI API key (for OpenAI provider)
- Anthropic API key (for Claude provider)

## Setup
1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Run the example:
```bash
npm start
```

## Example Scenario
The example implements:
1. Custom providers for OpenAI and Anthropic
2. A chat agent that can use either provider
3. Streaming response handling
4. Automatic fallback between providers
5. Rate limit handling

## Code Structure
- `providers/`: Custom LLM provider implementations
- `agents/`: Agents using the custom providers
- `utils/`: Helper utilities for rate limiting and retries
- `index.ts`: Main example runner

## Key Concepts
- Provider Interface Implementation
- Streaming Response Handling
- Rate Limiting
- Error Recovery
- Provider Fallbacks
