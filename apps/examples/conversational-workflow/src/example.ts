import { config } from 'dotenv';
import { WorkflowManager } from './workflow/workflow-manager';
import { ChatbotAgent } from './agents/chatbot-agent';
import { KnowledgeAgent } from './agents/knowledge-agent';
import { NewsFetcherAgent } from './agents/news-fetcher-agent';
import * as readline from 'readline';

// Load environment variables
config();

interface AgentConfig {
  id: string;
  type: string;
  capabilities: string[];
  apiKeys: {
    openai?: string;
    tavily?: string;
  };
}

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function loadEnvVariables() {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }

  if (!tavilyApiKey) {
    throw new Error('TAVILY_API_KEY environment variable is required');
  }

  return {
    OPENAI_API_KEY: openaiApiKey,
    TAVILY_API_KEY: tavilyApiKey
  };
}

function createAgentConfig(type: string, id: string, envVars: { [key: string]: string }) {
  console.log(`Creating config for ${type} agent ${id}`);
  
  return {
    id,
    type,
    capabilities: ['query_processing', 'response_generation'],
    apiKeys: {
      openai: envVars.OPENAI_API_KEY,
      tavily: envVars.TAVILY_API_KEY
    }
  };
}

async function main() {
  try {
    const workflowManager = WorkflowManager.getInstance();
    const envVars = loadEnvVariables();

    // Initialize agents
    console.log('\nInitializing agents...');
    const chatbotAgent = new ChatbotAgent(createAgentConfig('chatbot', 'chatbot-agent', envVars));
    workflowManager.registerAgent(chatbotAgent);

    const knowledgeAgent = new KnowledgeAgent(createAgentConfig('knowledge', 'knowledge-agent', envVars));
    workflowManager.registerAgent(knowledgeAgent);

    const newsFetcherAgent = new NewsFetcherAgent(createAgentConfig('newsfetcher', 'news-fetcher-agent', envVars));
    workflowManager.registerAgent(newsFetcherAgent);

    console.log('\nWelcome to the Conversational Workflow System!');
    console.log('Ask any question and get responses combining knowledge and latest news.');
    console.log('Type "exit" to quit.\n');

    const rl = createReadlineInterface();

    // Process user input
    const processUserInput = async () => {
      rl.question('Your query: ', async (query) => {
        if (query.toLowerCase() === 'exit') {
          console.log('\nShutting down...');
          await workflowManager.shutdown();
          rl.close();
          process.exit(0);
        }

        try {
          // Start workflow and wait for completion
          await workflowManager.startWorkflow(query);
        } catch (error) {
          console.error('Error processing query:', error);
        }
      });
    };

    // Listen for workflow completion
    workflowManager.onWorkflowComplete(() => {
      // Ask for next query after workflow completes
      processUserInput();
    });

    // Start processing user input
    processUserInput();

    // Handle process termination
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT. Shutting down...');
      await workflowManager.shutdown();
      process.exit(0);
    });

  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  }
}

main();
