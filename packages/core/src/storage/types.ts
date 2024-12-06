import { z } from 'zod';

export const QueryOptionsSchema = z.object({
    filter: z.record(z.unknown()).optional(),
    sort: z.record(z.enum(['asc', 'desc'])).optional(),
    limit: z.number().min(0).optional(),
    offset: z.number().min(0).optional(),
});

export type QueryOptions = z.infer<typeof QueryOptionsSchema>;

export interface StorageAdapter {
    // Basic operations
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
    list(pattern: string): Promise<string[]>;

    // Optional operations
    query?(options: QueryOptions): Promise<QueryResult[]>;
    beginTransaction?(): Promise<void>;
    commitTransaction?(): Promise<void>;
    rollbackTransaction?(): Promise<void>;
    close?(): Promise<void>;
}

export interface BatchOperations {
    batchGet?(keys: string[]): Promise<Map<string, any>>;
    batchSet?(entries: Map<string, any>): Promise<void>;
    batchDelete?(keys: string[]): Promise<void>;
}

export interface QueryResult {
    key: string;
    value: any;
}

export interface StorageConfig {
    type: string;
    options?: Record<string, any>;
}

export interface StorageEvents {
    error: (error: Error) => void;
    beforeSet: (key: string, value: any) => void;
    afterSet: (key: string, value: any) => void;
    beforeDelete: (key: string) => void;
    afterDelete: (key: string) => void;
}

export interface ConnectionManager {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    onDisconnect(callback: () => void): void;
}

export interface MigrationCapable {
    migrate(fromVersion: number, toVersion: number): Promise<void>;
    getCurrentVersion(): Promise<number>;
}
