import { z } from 'zod';
import { TaskConfigSchema, TaskResultSchema } from './task';

export const WorkflowStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;

export const WorkflowStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  task: TaskConfigSchema,
  dependencies: z.array(z.string()).default([]),
  retryStrategy: z
    .object({
      maxAttempts: z.number().default(3),
      backoffMultiplier: z.number().default(1.5),
      initialDelayMs: z.number().default(1000),
    })
    .optional(),
  timeout: z.number().optional(), // in milliseconds
  failureStrategy: z.enum(['FAIL_WORKFLOW', 'CONTINUE']).default('FAIL_WORKFLOW'),
});

export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;

export const WorkflowConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  steps: z.array(WorkflowStepSchema),
  concurrency: z.number().default(1),
  timeout: z.number().optional(), // in milliseconds
  retryStrategy: z
    .object({
      maxAttempts: z.number().default(3),
      backoffMultiplier: z.number().default(1.5),
      initialDelayMs: z.number().default(1000),
    })
    .optional(),
});

export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;

export const WorkflowStepResultSchema = z.object({
  stepId: z.string(),
  status: WorkflowStatusSchema,
  result: TaskResultSchema.optional(),
  error: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  attempts: z.number().default(0),
});

export type WorkflowStepResult = z.infer<typeof WorkflowStepResultSchema>;

export const WorkflowMetadataSchema = z.object({
  status: WorkflowStatusSchema,
  startTime: z.date(),
  endTime: z.date().optional(),
  currentStep: z.string().optional(),
  stepResults: z.record(z.string(), WorkflowStepResultSchema),
  error: z.string().optional(),
});

export type WorkflowMetadata = z.infer<typeof WorkflowMetadataSchema>;

export interface Workflow {
  config: WorkflowConfig;
  metadata: WorkflowMetadata;
}

export interface WorkflowExecutor {
  execute(workflow: Workflow): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  cancel(): Promise<void>;
  getStatus(): Promise<WorkflowStatus>;
  getCurrentStep(): Promise<string | undefined>;
  getStepResults(): Promise<Record<string, WorkflowStepResult>>;
}
