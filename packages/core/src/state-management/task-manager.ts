import { injectable } from 'inversify';
import { Task, TaskResult, TaskStatus } from '../types/task';
import { ITaskManager } from '../types/task-manager.interface';

@injectable()
export class TaskManager implements ITaskManager {
  private tasks: Map<string, Task> = new Map();

  addTask(task: Task): void {
    this.tasks.set(task.config.id, task);
  }

  removeTask(taskId: string): void {
    this.tasks.delete(taskId);
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): Map<string, Task> {
    return new Map(this.tasks);
  }

  getCurrentTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  updateTaskStatus(taskId: string, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (task && task.metadata) {
      task.metadata.status = status;
    }
  }

  setTaskResult(taskId: string, result: TaskResult): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.result = result;
    }
  }
}
