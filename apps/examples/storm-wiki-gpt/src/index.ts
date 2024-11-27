import { config } from 'dotenv';
import { WorkflowRunner } from './workflow/workflow-runner';
import { Query, SynthesisResult } from './types';
import path from 'path';
import { LoggerService, LogContext } from './utils/logger';

// Initialize logger
const logger = LoggerService.getInstance();
const context: LogContext = {
  component: 'Main',
};

// Load environment variables from .env file
config({ path: path.resolve(__dirname, '../.env') });

// Verify environment variables are loaded
const requiredEnvVars = ['OPENAI_API_KEY', 'TAVILY_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables', {
    ...context,
    missingVars: missingEnvVars,
  });
  process.exit(1);
}

logger.info('Environment initialized successfully', {
  ...context,
  nodeEnv: process.env.NODE_ENV,
});

async function main() {
  const startTime = Date.now();
  
  try {
    logger.info('Starting Storm Wiki-GPT', {
      ...context,
      operation: 'startup',
    });

    // Create and start the workflow
    const workflow = new WorkflowRunner();
    await workflow.start();

    logger.info('Workflow initialized successfully', {
      ...context,
      operation: 'workflow_init',
    });

    // Handle workflow completion
    workflow.onWorkflowComplete((result: SynthesisResult) => {
      const duration = Date.now() - startTime;
      
      logger.trace('articleGeneration', {
        ...context,
        status: 'success',
        query: result.query,
        articleLength: result.summary.length,
        sourceCount: result.sources.length,
        duration,
      });

      // Format the output in a Wikipedia-style layout
      console.log('\n===========================================');
      console.log('           Generated Wikipedia Article     ');
      console.log('===========================================\n');
      
      // Print the article
      console.log(result.summary);
      
      // Add a separator
      console.log('\n===========================================\n');
      
      // Exit after displaying results
      process.exit(0);
    });

    // Example query
    const query: Query = {
      query: 'What is quantum computing and how does it work?',
      maxResults: 5,
    };

    logger.info('Processing query', {
      ...context,
      operation: 'query_processing',
      query: query.query,
    });

    // Process the query
    await workflow.processQuery(query);

    // Keep the process running to receive results
    process.on('SIGINT', async () => {
      logger.info('Shutting down gracefully', {
        ...context,
        operation: 'shutdown',
      });
      await workflow.stop();
      process.exit(0);
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Critical error in main process', {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      duration,
    });
    process.exit(1);
  }
}

// Run the example
main().catch((error) => {
  logger.error('Unhandled error in main process', {
    ...context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
  });
  process.exit(1);
});
