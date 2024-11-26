import { z } from 'zod';

export const TaskStatusSchema = z.enum([
  'PENDING',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  priority: TaskPrioritySchema.default('MEDIUM'),
  retryAttempts: z.number().default(3),
  timeout: z.number().optional(), // in milliseconds
  dependencies: z.array(z.string()).default([]),
  requiredCapabilities: z.array(z.string()).default([]),
});

export type TaskConfig = z.infer<typeof TaskConfigSchema>;

export const TaskMetadataSchema = z.object({
  status: TaskStatusSchema,
  assignedAgent: z.string().optional(),
  createdAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  attempts: z.number().default(0),
  error: z.string().optional(),
  progress: z.number().default(0),
});

export type TaskMetadata = z.infer<typeof TaskMetadataSchema>;

export const TaskResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown(),
  error: z.string().optional(),
});

export type TaskResult = z.infer<typeof TaskResultSchema>;

export interface Task {
  config: TaskConfig;
  metadata: TaskMetadata;
  result?: TaskResult;
}

export interface TaskExecutor {
  execute(task: Task): Promise<TaskResult>;
  validateInput(input: unknown): Promise<boolean>;
  validateOutput(output: unknown): Promise<boolean>;
  cleanup(): Promise<void>;
}
