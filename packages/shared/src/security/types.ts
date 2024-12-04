import type { LoggerConfig } from '../logging/types';

export type { LoggerConfig };

export interface SecurityContext {
  agentId?: string;
  operation: string;
  timestamp: string | number | Date;
  metadata?: Record<string, unknown>;
}

export interface SecurityConfig {
  encryption?: {
    messages?: boolean;  // Enable/disable message encryption
    state?: boolean;     // Enable/disable state encryption
  };
  audit?: {
    enabled?: boolean;   // Enable/disable audit logging
    level?: 'basic' | 'detailed';
    logConfig?: Partial<LoggerConfig>;
  };
}

export interface SecureMessage {
  id: string;
  encrypted: boolean;
  content: {
    ciphertext?: string;
    signature?: string;
    plaintext?: Record<string, unknown>;
    timestamp: Date;
  };
}
