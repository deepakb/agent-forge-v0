# LLM-Powered Agent Example

This example demonstrates how to create an agent that uses OpenAI's GPT models for natural language processing tasks. It shows how to integrate the LLM provider with Agent Forge's agent system.

## What You'll Learn
- Integrating OpenAI with Agent Forge
- Creating an LLM-powered agent
- Handling streaming responses
- Managing API configurations

## Prerequisites
- Node.js >= 16
- npm or yarn
- OpenAI API key

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure OpenAI:
```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

3. Run the example:
```bash
npm start
```

## Code Explanation

The example consists of these main components:

1. **LLMAgent Implementation**: An agent that processes natural language tasks using OpenAI
2. **OpenAI Provider Configuration**: Setup and configuration of the OpenAI provider
3. **Task Types**: Example NLP tasks (summarization, translation, etc.)

## Key Concepts

- LLM Integration
- Streaming Responses
- API Key Management
- Error Handling
- Rate Limiting
