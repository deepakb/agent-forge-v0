export const TYPES = {
  Logger: Symbol.for('Logger'),
  EventEmitter: Symbol.for('EventEmitter'),
  AgentConfig: Symbol.for('AgentConfig'),
  TaskManager: Symbol.for('TaskManager'),
  MessageManager: Symbol.for('MessageManager'),
} as const;
