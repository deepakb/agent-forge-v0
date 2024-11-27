import { config } from 'dotenv';
import { Logger } from '@agent-forge/shared';
import { WorkflowRunner } from './workflow/workflow-runner';
import { Query, SynthesisResult } from './types';
import path from 'path';

// Load environment variables from .env file
config({ path: path.resolve(__dirname, '../.env') });

// Verify environment variables are loaded
const requiredEnvVars = ['OPENAI_API_KEY', 'TAVILY_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

console.log('Environment variables loaded successfully');

// Initialize logger
Logger.initialize();

async function main() {
  try {
    Logger.info('Starting Storm Wiki-GPT example...');

    // Create and start the workflow
    const workflow = new WorkflowRunner();
    await workflow.start();

    Logger.info('Workflow started successfully');

    // Handle workflow completion
    workflow.onWorkflowComplete((result: SynthesisResult) => {
      console.log('\nQuery Results:');
      console.log('=============');
      console.log(`Query: ${result.query}`);
      console.log('\nSummary:');
      console.log(result.summary);
      console.log('\nSources:');
      result.sources.forEach((source: string) => console.log(`- ${source}`));
      
      // Exit after displaying results
      process.exit(0);
    });

    // Example query
    const query: Query = {
      query: 'What is quantum computing and how does it work?',
      maxResults: 3,
    };

    Logger.info('Processing query', { query: query.query });

    // Process the query
    await workflow.processQuery(query);

    Logger.info('Query processing initiated');

    // Keep the process running to receive results
    process.on('SIGINT', async () => {
      Logger.info('Shutting down...');
      await workflow.stop();
      process.exit(0);
    });
  } catch (error) {
    Logger.error('Error in main process', { error });
    process.exit(1);
  }
}

// Run the example
main().catch((error) => {
  Logger.error('Unhandled error in main process', { error });
  process.exit(1);
});
