import { StorageAdapter } from './types';
import { MemoryStorageAdapter } from './adapters/memory';

export * from './types';
export * from './factory';
export * from './adapters/memory';

// Default adapter
export const createDefaultStorage = (): StorageAdapter => {
    return new MemoryStorageAdapter();
};
