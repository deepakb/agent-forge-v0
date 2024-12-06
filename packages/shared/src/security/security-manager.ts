import { injectable, inject } from 'inversify';
import { ILogger, IEncryption, ISecurity } from '../container/interfaces';
import { SHARED_TYPES } from '../container/types';
import { KeyManagement } from '../encryption/key-management';
import { Hashing } from '../encryption/hashing';
import type { SecurityConfig, SecurityContext, SecureMessage } from './types';

@injectable()
export class SecurityManager {
  private config: SecurityConfig;

  constructor(
    @inject(SHARED_TYPES.Logger) private logger: ILogger,
    @inject(SHARED_TYPES.Encryption) private encryption: IEncryption,
    @inject(SHARED_TYPES.Security) private security: ISecurity,
    config: SecurityConfig = {}
  ) {
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
      this.logger.initialize(this.config.audit.logConfig);
    }
  }

  // Secure Message Handling
  public async secureMessage(message: Record<string, unknown>, key: string): Promise<SecureMessage> {
    const id = KeyManagement.generateNonce();
    const timestamp = new Date();

    try {
      if (this.config.encryption?.messages) {
        const messageStr = JSON.stringify(message);
        const encryptedContent = await this.encryption.encrypt(messageStr);
        const signature = await Hashing.generateHMAC(messageStr, key);

        return {
          id,
          encrypted: true,
          content: {
            ciphertext: encryptedContent,
            signature,
            timestamp,
          },
        };
      }

      // If encryption is disabled, return plaintext message
      return {
        id,
        encrypted: false,
        content: {
          plaintext: message,
          timestamp,
        },
      };
    } catch (error) {
      await this.logger.error('Failed to secure message', error as Error, {
        messageId: id,
        operation: 'secureMessage',
      });
      throw error;
    }
  }

  public async validateMessage(message: SecureMessage, key: string): Promise<boolean> {
    try {
      if (!message.encrypted) {
        return true;
      }

      const { ciphertext, signature } = message.content;
      if (!ciphertext || !signature) {
        return false;
      }

      const validSignature = await Hashing.verifyHMAC(ciphertext, signature, key);

      if (!validSignature) {
        await this.logger.error('Message signature validation failed', new Error('Invalid signature'), {
          messageId: message.id,
          operation: 'validateMessage',
        });
        return false;
      }

      await this.logger.info('Message validated successfully', {
        messageId: message.id,
        operation: 'validateMessage',
      });

      return true;
    } catch (error) {
      await this.logger.error('Message validation failed', error as Error, {
        messageId: message.id,
        operation: 'validateMessage',
      });
      return false;
    }
  }

  public async decryptMessage(message: SecureMessage, key: string): Promise<Record<string, unknown>> {
    try {
      if (!message.encrypted) {
        return message.content.plaintext || {};
      }

      const { ciphertext } = message.content;
      if (!ciphertext) {
        throw new Error('No ciphertext found in encrypted message');
      }

      const decrypted = await this.encryption.decrypt(ciphertext);
      const content = JSON.parse(decrypted);

      await this.logger.info('Message decrypted successfully', {
        messageId: message.id,
        operation: 'decryptMessage',
      });

      return content;
    } catch (error) {
      await this.logger.error('Failed to decrypt message', error as Error, {
        messageId: message.id,
        operation: 'decryptMessage',
      });
      throw error;
    }
  }

  // Event Logging
  public async logAction(context: SecurityContext): Promise<void> {
    if (this.config.audit?.enabled) {
      await this.logger.logAgentAction(context.agentId || 'unknown', context.operation, {
        ...context.metadata,
        timestamp: new Date(context.timestamp).toISOString(),
      });
    }
  }

  public async logError(error: Error, context: SecurityContext): Promise<void> {
    if (this.config.audit?.enabled) {
      await this.logger.logAgentError(context.agentId || 'unknown', error, {
        operation: context.operation,
        ...context.metadata,
        timestamp: new Date(context.timestamp).toISOString(),
      });
    }
  }

  // State Encryption
  public async encryptState(state: Record<string, unknown>, key: string): Promise<Record<string, unknown>> {
    if (this.config.encryption?.state) {
      const encrypted = await this.encryption.encrypt(JSON.stringify(state));
      return {
        encrypted: true,
        content: encrypted,
      };
    }
    return state;
  }

  public async decryptState(state: Record<string, unknown>, key: string): Promise<Record<string, unknown>> {
    if (state && typeof state === 'object' && 'encrypted' in state && state.encrypted === true) {
      const content = (state as { content: string }).content;
      const decrypted = await this.encryption.decrypt(content);
      return JSON.parse(decrypted);
    }
    return state;
  }
}
