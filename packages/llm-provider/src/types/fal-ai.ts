import { ProviderConfig } from './provider';

export interface FalAIConfig extends ProviderConfig {
    apiKey: string;
    modelId?: string;
}

export interface FalAIStreamOptions {
    input: Record<string, any>;
    logs?: boolean;
    onQueueUpdate?: (update: any) => void;
}

export interface FalAIResponse<T = any> {
    data: T;
    requestId: string;
}

export interface FalAIStorageResponse {
    url: string;
}

export interface FalAIQueueStatus {
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    logs?: Array<{ message: string }>;
}

export interface FalAIError {
    error: {
        message: string;
        type: string;
    };
}
