import { Logger } from '../logging/logger';
import { Encryption } from '../encryption/encryption';
import { KeyManagement } from '../encryption/key-management';
import { Hashing } from '../encryption/hashing';
import type { SecurityConfig, SecurityContext, SecureMessage } from './types';

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;

  private constructor(config: SecurityConfig = {}) {
    this.config = {
      encryption: {
        messages: true,
        state: true,
        ...config.encryption,
      },
      audit: {
        enabled: true,
        level: 'basic',
        ...config.audit,
      },
    };

    // Initialize logger with audit configuration
    if (this.config.audit?.enabled) {
      Logger.initialize(this.config.audit.logConfig);
    }
  }

  public static getInstance(config?: SecurityConfig): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager(config);
    }
    return SecurityManager.instance;
  }

  // Secure Message Handling
  public async secureMessage(message: Record<string, unknown>, key: string): Promise<SecureMessage> {
    const id = KeyManagement.generateNonce();
    const timestamp = new Date();

    if (this.config.encryption?.messages) {
      const encrypted = Encryption.encrypt(JSON.stringify(message), key);
      const signature = Hashing.generateHMAC(JSON.stringify(encrypted), key);

      return {
        id,
        encrypted: true,
        content: {
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          salt: encrypted.salt,
          authTag: encrypted.authTag,
        },
        signature,
        timestamp: timestamp.toISOString(),
      };
    }

    return {
      id,
      encrypted: false,
      content: message,
      timestamp: timestamp.toISOString(),
    };
  }

  // Event Logging
  public async logAgentAction(context: SecurityContext): Promise<void> {
    if (this.config.audit?.enabled) {
      await Logger.logAgentAction(context.agentId || 'unknown', context.operation, {
        ...context.metadata,
        timestamp: new Date(context.timestamp).toISOString(),
      });
    }
  }

  public async logError(error: Error, context: SecurityContext): Promise<void> {
    if (this.config.audit?.enabled) {
      await Logger.logAgentError(context.agentId || 'unknown', error, {
        operation: context.operation,
        ...context.metadata,
        timestamp: new Date(context.timestamp).toISOString(),
      });
    }
  }

  // State Encryption
  public async encryptState(state: Record<string, unknown>, key: string): Promise<Record<string, unknown>> {
    if (this.config.encryption?.state) {
      const encrypted = Encryption.encrypt(JSON.stringify(state), key);
      return {
        encrypted: true,
        ...encrypted,
      };
    }
    return state;
  }

  public async decryptState(state: Record<string, unknown>, key: string): Promise<Record<string, unknown>> {
    if (state.encrypted && this.config.encryption?.state) {
      const decrypted = Encryption.decrypt(state as any, key);
      return JSON.parse(decrypted);
    }
    return state;
  }
}
