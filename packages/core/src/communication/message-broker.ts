import Redis from 'ioredis';
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@agent-forge/shared';
import { Message, MessageBroker, MessageHandler, MessageType, MessageSerializer } from '../types';
import { DefaultMessageSerializer } from './message-serializer';

export interface MessageBrokerConfig {
  redisUrl?: string;
  namespace?: string;
  messageSerializer?: MessageSerializer;
}

export class RedisPubSubMessageBroker implements MessageBroker {
  private publisher: Redis;
  private subscriber: Redis;
  private events: EventEmitter;
  private handlers: Map<MessageType, Set<MessageHandler>>;
  private readonly namespace: string;
  private readonly serializer: MessageSerializer;

  constructor(config: MessageBrokerConfig = {}) {
    this.namespace = config.namespace || 'agent-forge';
    this.serializer = config.messageSerializer || new DefaultMessageSerializer();
    this.events = new EventEmitter();
    this.handlers = new Map();

    const redisUrl = config.redisUrl || 'redis://localhost:6379';
    this.publisher = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    this.setupSubscriber();
  }

  public async publish(message: Message): Promise<void> {
    try {
      const serializedMessage = await this.serializer.serialize({
        ...message,
        id: message.id || uuidv4(),
        timestamp: message.timestamp || new Date(),
      });

      const channel = this.getChannel(message.type);
      await this.publisher.publish(channel, serializedMessage);
      this.events.emit('messagePublished', message);
    } catch (error) {
      Logger.error('Failed to publish message', {
        error,
        messageId: message.id,
        type: message.type,
      });
      throw error;
    }
  }

  public async subscribe(handler: MessageHandler): Promise<void> {
    let handlers = this.handlers.get(handler.type);
    if (!handlers) {
      handlers = new Set();
      this.handlers.set(handler.type, handlers);
      await this.subscriber.subscribe(this.getChannel(handler.type));
    }
    handlers.add(handler);
  }

  public async unsubscribe(type: MessageType): Promise<void> {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.clear();
      this.handlers.delete(type);
      await this.subscriber.unsubscribe(this.getChannel(type));
    }
  }

  public async acknowledge(messageId: string): Promise<void> {
    await this.publisher.publish(
      this.getChannel('ACKNOWLEDGEMENT'),
      JSON.stringify({ messageId, timestamp: new Date() })
    );
  }

  public async reject(messageId: string, reason?: string): Promise<void> {
    await this.publisher.publish(
      this.getChannel('REJECTION'),
      JSON.stringify({ messageId, reason, timestamp: new Date() })
    );
  }

  public async close(): Promise<void> {
    await this.publisher.quit();
    await this.subscriber.quit();
    this.events.removeAllListeners();
  }

  private setupSubscriber(): void {
    this.subscriber.on('message', async (channel: string, message: string) => {
      try {
        const messageType = this.getMessageTypeFromChannel(channel);
        const handlers = this.handlers.get(messageType);
        if (!handlers) return;

        const deserializedMessage = await this.serializer.deserialize(message);
        if (!this.serializer.validate(deserializedMessage)) {
          Logger.error('Invalid message format', { channel, message });
          return;
        }

        for (const handler of handlers) {
          if (!handler.filter || handler.filter(deserializedMessage)) {
            try {
              await handler.handler(deserializedMessage);
            } catch (error) {
              Logger.error('Error executing message handler', {
                error,
                messageId: deserializedMessage.id,
                type: deserializedMessage.type,
              });
            }
          }
        }
      } catch (error) {
        Logger.error('Error processing message', { error, channel, message });
      }
    });

    this.subscriber.on('error', error => {
      Logger.error('Redis subscriber error', { error });
    });
  }

  private getChannel(type: MessageType | string): string {
    return `${this.namespace}:${type}`;
  }

  private getMessageTypeFromChannel(channel: string): MessageType {
    return channel.split(':')[1] as MessageType;
  }
}
