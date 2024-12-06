import { Container } from 'inversify';
import { EventEmitter } from 'eventemitter3';
import { Logger } from '@agent-forge/shared';
import { TYPES } from './types';
import { ITaskManager } from '../types/task-manager.interface';
import { IMessageManager } from '../types/message-manager.interface';
import { TaskManager } from '../state-management/task-manager';
import { MessageManager } from '../communication/message-manager';

const container = new Container();

// Core services
container.bind<Logger>(TYPES.Logger).to(Logger).inSingletonScope();
container.bind<EventEmitter>(TYPES.EventEmitter).toConstantValue(new EventEmitter());

// Managers
container.bind<ITaskManager>(TYPES.TaskManager).to(TaskManager).inSingletonScope();
container.bind<IMessageManager>(TYPES.MessageManager).to(MessageManager).inSingletonScope();

export { container };
