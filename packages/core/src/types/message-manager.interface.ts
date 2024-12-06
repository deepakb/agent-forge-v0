import { MessageHandler } from './agent.types';

export interface IMessageManager {
  addHandler(type: string, handler: MessageHandler): void;
  removeHandler(type: string): void;
  getHandler(type: string): MessageHandler | undefined;
  getAllHandlers(): Map<string, MessageHandler>;
}
