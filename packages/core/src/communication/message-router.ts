import { EventEmitter } from 'eventemitter3';
import { Logger } from '@agent-forge/shared';
import { Message, MessageHandler, MessageRouter, MessageType } from '../types';

export class DefaultMessageRouter implements MessageRouter {
  private handlers: Map<MessageType, Set<MessageHandler>>;
  private events: EventEmitter;

  constructor() {
    this.handlers = new Map();
    this.events = new EventEmitter();
  }

  public async route(message: Message): Promise<void> {
    const handlers = this.handlers.get(message.type);
    if (!handlers || handlers.size === 0) {
      Logger.warn(`No handlers registered for message type: ${message.type}`, {
        messageId: message.id,
        type: message.type,
      });
      return;
    }

    const promises: Promise<void>[] = [];
    for (const handler of handlers) {
      if (!handler.filter || handler.filter(message)) {
        try {
          promises.push(handler.handler(message));
        } catch (error) {
          Logger.error('Error executing message handler', {
            error,
            messageId: message.id,
            type: message.type,
          });
        }
      }
    }

    await Promise.all(promises);
    this.events.emit('messageRouted', message);
  }

  public registerHandler(handler: MessageHandler): void {
    let handlers = this.handlers.get(handler.type);
    if (!handlers) {
      handlers = new Set();
      this.handlers.set(handler.type, handlers);
    }
    handlers.add(handler);
  }

  public removeHandler(type: MessageType): void {
    this.handlers.delete(type);
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.events.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.events.off(event, listener);
  }
}
