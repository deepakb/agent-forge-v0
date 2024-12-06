import { StorageAdapter, StorageConfig } from './types';
import { MemoryStorageAdapter } from './adapters/memory';

export class StorageFactory {
    private static adapters = new Map<string, new (options?: any) => StorageAdapter>();

    static {
        // Register default adapters
        StorageFactory.register('memory', MemoryStorageAdapter);
    }

    static register(type: string, adapter: new (options?: any) => StorageAdapter): void {
        StorageFactory.adapters.set(type, adapter);
    }

    static async createStorage(config: StorageConfig): Promise<StorageAdapter> {
        if (config.type === 'custom' && config.options?.adapter) {
            if (!this.isStorageAdapter(config.options.adapter)) {
                throw new Error('Custom adapter must implement StorageAdapter interface');
            }
            return config.options.adapter;
        }

        const AdapterClass = StorageFactory.adapters.get(config.type);
        if (!AdapterClass) {
            throw new Error(`Unsupported storage type: ${config.type}`);
        }

        return new AdapterClass(config.options);
    }

    private static isStorageAdapter(obj: any): obj is StorageAdapter {
        return (
            typeof obj === 'object' &&
            obj !== null &&
            'get' in obj &&
            'set' in obj &&
            'delete' in obj &&
            'list' in obj &&
            typeof obj.get === 'function' &&
            typeof obj.set === 'function' &&
            typeof obj.delete === 'function' &&
            typeof obj.list === 'function'
        );
    }
}
