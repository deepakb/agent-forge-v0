import { config } from 'dotenv';
import { WorkflowRunner } from './workflow/workflow-runner';
import { LoggerService } from './utils/logger';

// Load environment variables
config();

const logger = LoggerService.getInstance();

async function main() {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    const topic = process.argv[2];

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    if (!tavilyApiKey) {
      throw new Error('TAVILY_API_KEY environment variable is required');
    }

    if (!topic) {
      throw new Error('Topic argument is required');
    }

    logger.info('Starting Storm Wiki GPT', {
      topic,
    });

    // Initialize workflow
    const workflow = new WorkflowRunner(
      openaiApiKey,
      tavilyApiKey,
      topic,
    );

    // Handle workflow completion
    workflow.onComplete((result) => {
      console.log('\n=== Generated Article ===\n');
      console.log(result);
      console.log('\n=======================\n');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Application failed to start', error instanceof Error ? error : new Error('Unknown error'));
    process.exit(1);
  }
}

main();
