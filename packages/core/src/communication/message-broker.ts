import { Logger } from '@agent-forge/shared';

/**
 * Interface for message broker implementations.
 * Implementations can use any messaging system (Redis, RabbitMQ, Kafka, etc.)
 */
export interface MessageBroker {
  /**
   * Publish a message to a channel
   * @param channel The channel to publish to
   * @param message The message to publish
   */
  publish(channel: string, message: unknown): Promise<void>;

  /**
   * Subscribe to messages on a channel
   * @param channel The channel to subscribe to
   * @param handler The handler function for received messages
   */
  subscribe(channel: string, handler: (message: unknown) => Promise<void>): Promise<void>;

  /**
   * Unsubscribe from a channel
   * @param channel The channel to unsubscribe from
   * @param handler The handler function to remove
   */
  unsubscribe(channel: string, handler: (message: unknown) => Promise<void>): Promise<void>;

  /**
   * Close the message broker connection
   */
  close?(): Promise<void>;
}
