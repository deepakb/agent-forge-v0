import { injectable } from 'inversify';
import { MessageHandler } from '../types/agent.types';
import { IMessageManager } from '../types/message-manager.interface';

@injectable()
export class MessageManager implements IMessageManager {
  private handlers: Map<string, MessageHandler> = new Map();

  addHandler(type: string, handler: MessageHandler): void {
    this.handlers.set(type, handler);
  }

  removeHandler(type: string): void {
    this.handlers.delete(type);
  }

  getHandler(type: string): MessageHandler | undefined {
    return this.handlers.get(type);
  }

  getAllHandlers(): Map<string, MessageHandler> {
    return new Map(this.handlers);
  }
}
