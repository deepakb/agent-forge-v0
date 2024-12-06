import 'reflect-metadata';
import { container } from './container/container';

// Export types
export * from './types';
export { TYPES } from './container/types';

// Export state management
export * from './state-management';

// Export storage system
export * from './storage';

// Export agent base classes
export * from './agent';

// Export communication interfaces and implementations
export {
  MessageRouter,
  DefaultMessageRouter,
  MessageSerializer,
  DefaultMessageSerializer,
} from './communication';

export { container };
