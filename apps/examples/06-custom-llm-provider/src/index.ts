import { Logger } from '@agent-forge/shared';
import { OpenAIProvider } from './providers/openai-provider';
import { AnthropicProvider } from './providers/anthropic-provider';
import { ChatAgent } from './agents/chat-agent';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    // Create providers
    const openaiProvider = new OpenAIProvider({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-4',
      requestsPerMinute: 60
    });

    const anthropicProvider = new AnthropicProvider({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      model: 'claude-2',
      requestsPerMinute: 60
    });

    // Create chat agent with fallback
    const chatAgent = new ChatAgent({
      id: 'chat-agent-1',
      name: 'Chat Agent',
      primaryProvider: openaiProvider,
      fallbackProvider: anthropicProvider,
      useStreaming: true
    });

    // Initialize agent
    await chatAgent.initialize({});

    // Subscribe to streaming events
    chatAgent.events.on('response-chunk', ({ chunk }) => {
      process.stdout.write(chunk);
    });

    // Start agent
    await chatAgent.start();

    // Example tasks
    const tasks = [
      {
        config: {
          id: 'task-1',
          type: 'chat',
          priority: 'MEDIUM',
          data: {
            systemPrompt: 'You are a helpful AI assistant.',
            prompt: 'Explain the concept of autonomous agents in AI systems.',
            temperature: 0.7,
            maxTokens: 500
          }
        },
        metadata: {
          status: 'PENDING',
          createdAt: new Date()
        }
      },
      {
        config: {
          id: 'task-2',
          type: 'chat',
          priority: 'MEDIUM',
          data: {
            systemPrompt: 'You are a technical expert.',
            prompt: 'What are the key components needed to build a robust agent system?',
            temperature: 0.7,
            maxTokens: 500
          }
        },
        metadata: {
          status: 'PENDING',
          createdAt: new Date()
        }
      }
    ];

    // Process tasks
    for (const task of tasks) {
      console.log(`\n\nProcessing task: ${task.config.id}`);
      console.log('Prompt:', task.config.data.prompt);
      console.log('\nResponse:');
      
      const result = await chatAgent.handleTask(task);
      
      if (!result.success) {
        console.error('Task failed:', result.error);
      }
      
      console.log('\n---\n');
    }

    // Stop agent
    await chatAgent.stop();

  } catch (error) {
    Logger.error('Error in main', { error });
    process.exit(1);
  }
}

main().catch(error => {
  Logger.error('Unhandled error', { error });
  process.exit(1);
});
