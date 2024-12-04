import { Task, TaskResult, TaskStatus } from './task';

export interface ITaskManager {
  addTask(task: Task): void;
  removeTask(taskId: string): void;
  getTask(taskId: string): Task | undefined;
  getAllTasks(): Map<string, Task>;
  getCurrentTasks(): Task[];
  updateTaskStatus(taskId: string, status: TaskStatus): void;
  setTaskResult(taskId: string, result: TaskResult): void;
}
