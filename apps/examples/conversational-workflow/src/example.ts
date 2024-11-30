import 'dotenv/config';
import { WorkflowManager } from './workflow/workflow-manager';
import { config } from './config/config';

// Debug logging for environment variables
console.log('Environment variables loaded:', {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  hasTavilyKey: !!process.env.TAVILY_API_KEY,
});

interface WorkflowMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'success' | 'error' | 'timeout';
  error?: Error;
}

class WorkflowRunner {
  private workflowManager: WorkflowManager;
  private activeWorkflows: Map<string, WorkflowMetrics>;
  private isShuttingDown: boolean;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly concurrentTasks: number;
  private retryCount: Map<string, number>;
  private lastQueryTime: number;

  constructor() {
    this.workflowManager = new WorkflowManager({
      maxRetries: 3,
      timeout: 30000,
      securityConfig: {
        encryption: {
          enabled: true,
          algorithm: 'aes-256-gcm'
        },
        audit: {
          enabled: true,
          level: 'detailed'
        },
        rateLimiting: {
          enabled: true,
          maxRequests: 100,
          timeWindow: 60000
        }
      },
      agents: {
        chatbot: {
          type: 'chatbot',
          config: config.agents.chatbot
        },
        knowledge: {
          type: 'knowledge',
          config: config.agents.knowledge
        },
        newsFetcher: {
          type: 'newsfetcher',
          config: config.agents.newsFetcher
        },
        summarization: {
          type: 'summarization',
          config: config.agents.summarization
        }
      }
    });
    this.activeWorkflows = new Map();
    this.isShuttingDown = false;
    this.timeoutMs = config.workflowDefaults.timeoutMs;
    this.maxRetries = config.workflowDefaults.maxRetries;
    this.concurrentTasks = config.workflowDefaults.concurrentTasks;
    this.retryCount = new Map();
    this.lastQueryTime = 0;

    // Set up workflow event handlers
    this.setupEventHandlers();

    // Set up process signal handlers
    this.setupSignalHandlers();
  }

  private setupEventHandlers(): void {
    this.workflowManager.on('error', (error: Error) => {
      console.error('Workflow error:', error.message);
    });

    this.workflowManager.on('agent_state_change', ({ agentId, state }) => {
      console.log(`Agent ${agentId} state changed:`, state);
    });

    this.workflowManager.on('workflow_complete', ({ workflowId }) => {
      if (this.activeWorkflows.has(workflowId)) {
        console.log(`Workflow ${workflowId} completed successfully`);
        this.completeWorkflow(workflowId, 'success');
      }
    });

    this.workflowManager.on('message_processed', ({ message }) => {
      const { workflowId } = message.metadata;
      if (workflowId && message.type === 'WORKFLOW_COMPLETE' && this.activeWorkflows.has(workflowId)) {
        console.log(`Workflow ${workflowId} completed successfully`);
        this.completeWorkflow(workflowId, 'success');
      }
    });
  }

  private setupSignalHandlers(): void {
    process.on('SIGINT', () => this.handleShutdown('SIGINT'));
    process.on('SIGTERM', () => this.handleShutdown('SIGTERM'));
    process.on('uncaughtException', (error: Error) => {
      console.error('Uncaught exception:', error);
      this.handleShutdown('uncaughtException', error);
    });
    process.on('unhandledRejection', (error: unknown) => {
      console.error('Unhandled rejection:', error);
      this.handleShutdown(
        'unhandledRejection',
        error instanceof Error ? error : new Error(String(error))
      );
    });
  }

  private async handleShutdown(signal: string, error?: Error): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(`\nReceived ${signal}. Initiating graceful shutdown...`);

    try {
      // Complete any active workflows with error status
      for (const [workflowId, metrics] of this.activeWorkflows.entries()) {
        this.completeWorkflow(workflowId, 'error', error || new Error(`Shutdown due to ${signal}`));
      }

      // Shutdown workflow manager
      await this.workflowManager.shutdown();
      console.log('Workflow manager shut down successfully');
    } catch (shutdownError) {
      console.error('Error during shutdown:', shutdownError);
    } finally {
      process.exit(error ? 1 : 0);
    }
  }

  private completeWorkflow(
    workflowId: string,
    status: 'success' | 'error' | 'timeout',
    error?: Error
  ): void {
    const metrics = this.activeWorkflows.get(workflowId);
    if (metrics) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.status = status;
      metrics.error = error;

      console.log(`Workflow ${workflowId} ${status}:`, {
        duration: `${metrics.duration}ms`,
        ...(error && { error: error.message }),
      });

      this.activeWorkflows.delete(workflowId);
    }
  }

  private setupWorkflowTimeout(workflowId: string): void {
    setTimeout(() => {
      if (this.activeWorkflows.has(workflowId)) {
        const error = new Error(`Workflow timeout after ${this.timeoutMs}ms`);
        this.completeWorkflow(workflowId, 'timeout', error);
      }
    }, this.timeoutMs);
  }

  private async handleRateLimit(workflowId: string): Promise<boolean> {
    const retries = this.retryCount.get(workflowId) || 0;
    if (retries >= this.maxRetries) {
      return false;
    }

    const backoffTime = Math.min(1000 * Math.pow(2, retries), 30000); // Max 30 second delay
    console.log(`Rate limit hit. Retrying in ${backoffTime}ms...`);
    await new Promise(resolve => setTimeout(resolve, backoffTime));

    this.retryCount.set(workflowId, retries + 1);
    return true;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastQuery = now - this.lastQueryTime;
    const minQueryInterval = 1000; // 1 second minimum between queries

    if (timeSinceLastQuery < minQueryInterval) {
      const waitTime = minQueryInterval - timeSinceLastQuery;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastQueryTime = Date.now();
  }

  public async processQuery(query: string): Promise<void> {
    const startTime = Date.now();
    const workflowId = startTime.toString();

    // Track workflow metrics
    this.activeWorkflows.set(workflowId, {
      startTime,
      status: 'success',
    });

    // Set up timeout
    this.setupWorkflowTimeout(workflowId);

    try {
      // Enforce rate limiting
      await this.enforceRateLimit();

      console.log(`\nProcessing query: "${query}"`);
      await this.workflowManager.processQuery(query);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Handle rate limits
      if (
        errorObj.message.toLowerCase().includes('rate limit') &&
        (await this.handleRateLimit(workflowId))
      ) {
        return this.processQuery(query); // Retry the query
      }

      console.error(`Error processing query "${query}":`, errorObj.message);
      this.completeWorkflow(workflowId, 'error', errorObj);
    }
  }

  public async run(): Promise<void> {
    const queries = [
      'What are the key developments in AI safety and regulation in 2024?',
      'What are the latest advancements in renewable energy storage technology?',
      'What are the major cybersecurity threats affecting cloud computing?',
    ];

    console.log('Starting workflow processing...\n');

    // Process queries sequentially with rate limiting
    for (const query of queries) {
      if (this.isShuttingDown) break;

      try {
        await this.processQuery(query);

        // Add delay between queries based on concurrent tasks setting
        if (queries.indexOf(query) < queries.length - 1) {
          const delayMs = Math.max(5000 / this.concurrentTasks, 1000); // Minimum 1 second delay
          console.log(`\nWaiting ${delayMs}ms before next query...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error) {
        console.error(`Failed to process query "${query}":`, error);
        // Continue with next query despite error
      }
    }

    // Wait for any remaining active workflows
    while (this.activeWorkflows.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Waiting for ${this.activeWorkflows.size} active workflows to complete...`);
    }

    // Clean shutdown after all workflows complete
    await this.handleShutdown('completion');
  }
}

// Start the workflow runner
const runner = new WorkflowRunner();
runner.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
