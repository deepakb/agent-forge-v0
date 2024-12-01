import { MessageRouter, DefaultMessageRouter } from './message-router';
import { MessageSerializer, DefaultMessageSerializer } from './message-serializer';

export {
  MessageRouter,
  DefaultMessageRouter,
  MessageSerializer,
  DefaultMessageSerializer,
};

/**
 * Communication Module in Agent Forge
 * 
 * This module provides interfaces for message handling and communication between components.
 * The core package only includes the interfaces - specific implementations should be provided separately.
 * 
 * Example usage:
 * ```typescript
 * import { MessageRouter, DefaultMessageRouter } from '@agent-forge/core';
 * 
 * const router = new DefaultMessageRouter();
 * 
 * // Register a message handler
 * router.register(async (message) => {
 *   console.log('Received message:', message);
 * });
 * 
 * // Route a message
 * await router.route({ type: 'TEST', data: 'Hello World' });
 * ```
 */
