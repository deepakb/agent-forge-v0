import { Logger } from '@agent-forge/shared';
import { WorkflowRunner } from './workflow/workflow-runner';
import { AgentConfig } from './types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['OPENAI_API_KEY', 'TAVILY_API_KEY'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    // Create agent configuration
    const config: AgentConfig = {
      agentType: 'WIKI',
      openaiApiKey: process.env.OPENAI_API_KEY!,
      tavilyApiKey: process.env.TAVILY_API_KEY!,
      logLevel: 'info',
      maxRetries: 3,
      timeout: 30000,
    };

    // Initialize workflow runner
    const workflowRunner = new WorkflowRunner(config);

    // Register completion callback
    workflowRunner.onWorkflowComplete((result: any) => {
      Logger.info('Workflow completed successfully', {
        contentLength: result.content?.length || 0,
        sourceCount: result.sources?.length || 0,
      });
      console.log('\nGenerated Article:');
      console.log(result.content);
      console.log('\nSources:');
      result.sources.forEach((source: string, index: number) => {
        console.log(`[${index + 1}] ${source}`);
      });
      process.exit(0);
    });

    // Start workflow with example topic
    const topic = process.argv[2] || 'Artificial Intelligence Ethics';
    await workflowRunner.start(topic);

  } catch (error) {
    Logger.error('Application failed', { error });
    process.exit(1);
  }
}

// Run the application
main();
