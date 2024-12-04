import { EventEmitter } from 'eventemitter3';
import { Logger } from '@agent-forge/shared';
import { Message, MessageHandler, MessageType } from '../types';

/**
 * Interface for message routing functionality
 */
export interface MessageRouter {
  /**
   * Route a message to appropriate handlers
   * @param message The message to route
   */
  route(message: unknown): Promise<void>;

  /**
   * Register a handler for specific message types
   * @param handler The handler function
   */
  register(handler: (message: unknown) => Promise<void>): void;

  /**
   * Unregister a handler
   * @param handler The handler to remove
   */
  unregister(handler: (message: unknown) => Promise<void>): void;
}

export class DefaultMessageRouter implements MessageRouter {
  private readonly events: EventEmitter;
  private readonly logger: Logger;

  constructor() {
    this.events = new EventEmitter();
    this.logger = new Logger();
  }

  async route(message: unknown): Promise<void> {
    try {
      this.events.emit('message', message);
    } catch (error) {
      this.logger.error('Error routing message', error instanceof Error ? error : new Error('Unknown error'), {
        message: JSON.stringify(message)
      });
      throw error;
    }
  }

  register(handler: (message: unknown) => Promise<void>): void {
    this.events.on('message', handler);
  }

  unregister(handler: (message: unknown) => Promise<void>): void {
    this.events.off('message', handler);
  }
}
