import { EventEmitter } from 'eventemitter3';
import { StorageAdapter, QueryOptions, BatchOperations } from '../types';

export interface MemoryStorageConfig {
    maxSize?: number;          // Maximum items in memory
    ttl?: number;              // Time to live for states in ms
    cleanupInterval?: number;  // Cleanup interval in ms
}

export class MemoryStorageAdapter implements StorageAdapter, BatchOperations {
    private store: Map<string, any>;
    private expirations: Map<string, number>;
    private events: EventEmitter;
    private cleanupTimer?: NodeJS.Timeout;
    private transactionStore?: Map<string, any>;

    constructor(private config: MemoryStorageConfig = {}) {
        this.store = new Map();
        this.expirations = new Map();
        this.events = new EventEmitter();

        if (config.cleanupInterval) {
            this.startCleanup();
        }
    }

    async get(key: string): Promise<any> {
        this.checkExpiration(key);
        return this.store.get(key);
    }

    async set(key: string, value: any): Promise<void> {
        if (this.transactionStore) {
            this.transactionStore.set(key, value);
            return;
        }

        this.store.set(key, value);
        
        if (this.config.ttl) {
            this.expirations.set(key, Date.now() + this.config.ttl);
        }

        if (this.config.maxSize && this.store.size > this.config.maxSize) {
            this.evictOldest();
        }
    }

    async delete(key: string): Promise<void> {
        if (this.transactionStore) {
            this.transactionStore.delete(key);
            return;
        }

        this.store.delete(key);
        this.expirations.delete(key);
    }

    async list(pattern: string): Promise<string[]> {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return Array.from(this.store.keys()).filter(key => regex.test(key));
    }

    async query(options: QueryOptions = {}): Promise<any[]> {
        let results = Array.from(this.store.entries())
            .filter(([key, value]) => {
                if (!options.filter) return true;
                return Object.entries(options.filter).every(([k, v]) => value[k] === v);
            })
            .map(([key, value]) => ({ key, ...value }));

        if (options.sort) {
            for (const [field, order] of Object.entries(options.sort)) {
                results.sort((a, b) => {
                    return order === 'asc' 
                        ? a[field] > b[field] ? 1 : -1
                        : a[field] < b[field] ? 1 : -1;
                });
            }
        }

        if (options.offset) {
            results = results.slice(options.offset);
        }

        if (options.limit) {
            results = results.slice(0, options.limit);
        }

        return results;
    }

    async watch(key: string, callback: (value: any) => void): Promise<void> {
        this.events.on(`change:${key}`, callback);
    }

    async beginTransaction(): Promise<void> {
        if (this.transactionStore) {
            throw new Error('Transaction already in progress');
        }
        this.transactionStore = new Map(this.store);
    }

    async commitTransaction(): Promise<void> {
        if (!this.transactionStore) {
            throw new Error('No transaction in progress');
        }
        this.store = this.transactionStore;
        this.transactionStore = undefined;
    }

    async rollbackTransaction(): Promise<void> {
        if (!this.transactionStore) {
            throw new Error('No transaction in progress');
        }
        this.transactionStore = undefined;
    }

    async batchGet(keys: string[]): Promise<Map<string, any>> {
        const result = new Map();
        for (const key of keys) {
            const value = await this.get(key);
            if (value !== undefined) {
                result.set(key, value);
            }
        }
        return result;
    }

    async batchSet(entries: Map<string, any>): Promise<void> {
        for (const [key, value] of entries) {
            await this.set(key, value);
        }
    }

    async batchDelete(keys: string[]): Promise<void> {
        for (const key of keys) {
            await this.delete(key);
        }
    }

    private startCleanup(): void {
        this.cleanupTimer = setInterval(() => {
            for (const [key] of this.store) {
                this.checkExpiration(key);
            }
        }, this.config.cleanupInterval);
    }

    private checkExpiration(key: string): void {
        const expiration = this.expirations.get(key);
        if (expiration && Date.now() > expiration) {
            this.store.delete(key);
            this.expirations.delete(key);
        }
    }

    private evictOldest(): void {
        const oldest = Array.from(this.store.keys())[0];
        if (oldest) {
            this.store.delete(oldest);
            this.expirations.delete(oldest);
        }
    }

    async close(): Promise<void> {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        this.events.removeAllListeners();
    }
}
