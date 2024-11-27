import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@agent-forge/shared';
import {
  MessageBroker,
  StateStore,
  Task,
  TaskResult,
  Workflow,
  WorkflowConfig,
  WorkflowExecutor,
  WorkflowMetadata,
  WorkflowStatus,
  WorkflowStep,
  WorkflowStepResult,
} from '../types';

export interface WorkflowOrchestratorConfig {
  messageBroker: MessageBroker;
  stateStore: StateStore;
  maxRetries?: number;
  retryDelayMs?: number;
}

export class WorkflowOrchestrator implements WorkflowExecutor {
  private readonly messageBroker: MessageBroker;
  private readonly stateStore: StateStore;
  private readonly maxRetries: number;
  private readonly activeWorkflows: Map<string, Workflow>;
  private readonly pendingSteps: Map<string, Set<string>>;

  constructor(config: WorkflowOrchestratorConfig) {
    this.messageBroker = config.messageBroker;
    this.stateStore = config.stateStore;
    this.maxRetries = config.maxRetries || 3;
    this.activeWorkflows = new Map();
    this.pendingSteps = new Map();

    this.setupMessageHandlers();
  }

  public async execute(workflow: Workflow): Promise<void> {
    const workflowId = workflow.config.id || uuidv4();
    workflow.config.id = workflowId;

    if (this.activeWorkflows.has(workflowId)) {
      throw new Error(`Workflow ${workflowId} is already running`);
    }

    workflow.metadata = this.initializeWorkflowMetadata(workflow.config);
    this.activeWorkflows.set(workflowId, workflow);
    await this.stateStore.updateWorkflowState(workflowId, workflow);

    await this.startWorkflow(workflow);
  }

  public async pause(): Promise<void> {
    // Implementation for pausing workflow
  }

  public async resume(): Promise<void> {
    // Implementation for resuming workflow
  }

  public async cancel(): Promise<void> {
    // Implementation for canceling workflow
  }

  public async getStatus(): Promise<WorkflowStatus> {
    // Implementation for getting workflow status
    return 'PENDING';
  }

  public async getCurrentStep(): Promise<string | undefined> {
    // Implementation for getting current step
    return undefined;
  }

  public async getStepResults(): Promise<Record<string, WorkflowStepResult>> {
    // Implementation for getting step results
    return {};
  }

  private async startWorkflow(workflow: Workflow): Promise<void> {
    try {
      const { config, metadata } = workflow;
      metadata.status = 'IN_PROGRESS';
      await this.stateStore.updateWorkflowState(config.id, workflow);

      const readySteps = this.getReadySteps(workflow);
      await this.executeSteps(workflow, readySteps);
    } catch (error) {
      Logger.error('Error starting workflow', {
        error,
        workflowId: workflow.config.id,
      });
      throw error;
    }
  }

  private async executeSteps(workflow: Workflow, steps: WorkflowStep[]): Promise<void> {
    const { config, metadata } = workflow;
    const pendingSteps = this.pendingSteps.get(config.id) || new Set();
    this.pendingSteps.set(config.id, pendingSteps);

    for (const step of steps) {
      if (pendingSteps.has(step.id)) continue;

      try {
        pendingSteps.add(step.id);
        metadata.currentStep = step.id;
        await this.stateStore.updateWorkflowState(config.id, workflow);

        const task: Task = {
          config: {
            id: `${config.id}:${step.id}`,
            type: step.task.type,
            priority: step.task.priority || 'MEDIUM',
            retryAttempts: step.retryStrategy?.maxAttempts || this.maxRetries,
            timeout: step.timeout,
            dependencies: step.dependencies,
            requiredCapabilities: step.task.requiredCapabilities || [],
          },
          metadata: {
            status: 'PENDING',
            createdAt: new Date(),
            attempts: 0,
            progress: 0,
          },
        };

        await this.messageBroker.publish({
          id: uuidv4(),
          type: 'TASK_ASSIGNMENT',
          sender: 'workflow-orchestrator',
          timestamp: new Date(),
          payload: task,
          priority: 0,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        Logger.error('Error executing workflow step', {
          error: errorMessage,
          workflowId: config.id,
          stepId: step.id,
        });

        if (step.failureStrategy === 'FAIL_WORKFLOW') {
          metadata.status = 'FAILED';
          metadata.error = errorMessage;
          await this.stateStore.updateWorkflowState(config.id, workflow);
          throw error;
        }
      }
    }
  }

  private getReadySteps(workflow: Workflow): WorkflowStep[] {
    const { config, metadata } = workflow;
    const completedSteps = new Set(
      Object.entries(metadata.stepResults)
        .filter(([, result]) => result.status === 'COMPLETED')
        .map(([stepId]) => stepId)
    );

    return config.steps.filter(step => {
      if (completedSteps.has(step.id)) return false;
      return step.dependencies.every(depId => completedSteps.has(depId));
    });
  }

  private async handleTaskResult(result: TaskResult, taskId: string): Promise<void> {
    const [workflowId, stepId] = taskId.split(':');
    const workflow = await this.stateStore.getWorkflowState(workflowId);
    if (!workflow) return;

    const pendingSteps = this.pendingSteps.get(workflowId);
    if (!pendingSteps) return;

    pendingSteps.delete(stepId);
    workflow.metadata.stepResults[stepId] = {
      stepId,
      status: result.success ? 'COMPLETED' : 'FAILED',
      result,
      startTime: new Date(), // This should come from the task execution
      endTime: new Date(),
      attempts: workflow.metadata.stepResults[stepId]?.attempts || 1,
    };

    if (result.success) {
      const nextSteps = this.getReadySteps(workflow);
      if (nextSteps.length > 0) {
        await this.executeSteps(workflow, nextSteps);
      } else if (pendingSteps.size === 0) {
        workflow.metadata.status = 'COMPLETED';
        workflow.metadata.endTime = new Date();
      }
    } else {
      const step = workflow.config.steps.find(s => s.id === stepId);
      if (step?.failureStrategy === 'FAIL_WORKFLOW') {
        workflow.metadata.status = 'FAILED';
        workflow.metadata.error = result.error;
        workflow.metadata.endTime = new Date();
      }
    }

    await this.stateStore.updateWorkflowState(workflowId, workflow);
  }

  private setupMessageHandlers(): void {
    this.messageBroker.subscribe({
      type: 'TASK_RESULT',
      handler: async message => {
        const { taskId, result } = message.payload as { taskId: string; result: TaskResult };
        await this.handleTaskResult(result, taskId);
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private initializeWorkflowMetadata(_config: WorkflowConfig): WorkflowMetadata {
    return {
      status: 'PENDING',
      startTime: new Date(),
      stepResults: {},
    };
  }
}
