import { createCipheriv, createDecipheriv, randomBytes, CipherGCM, DecipherGCM } from 'crypto';
import { Message } from '../agents/base-agent';
import { AuditLogger } from './audit-logger';
import { MessageValidator } from './message-validator';
import { RateLimiter, RateLimitConfig } from './rate-limiter';

export interface SecurityConfig {
  encryption: {
    enabled: boolean;
    algorithm?: string;
    key?: string;
  };
  audit: {
    enabled: boolean;
    level: 'basic' | 'detailed';
  };
  rateLimiting: RateLimitConfig;
}

interface EncryptedContent {
  iv: string;
  content: string;
  authTag: string;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private encryptionKey: Buffer;
  private auditLogger: AuditLogger;
  private messageValidator: MessageValidator;
  private rateLimiter: RateLimiter;

  private constructor(config: SecurityConfig) {
    this.config = config;
    this.encryptionKey = Buffer.from(config.encryption.key || randomBytes(32).toString('hex'), 'hex');
    this.auditLogger = AuditLogger.getInstance();
    this.messageValidator = MessageValidator.getInstance();
    this.rateLimiter = RateLimiter.getInstance(config.rateLimiting);
  }

  public static getInstance(config?: SecurityConfig): SecurityManager {
    if (!SecurityManager.instance) {
      if (!config) {
        throw new Error('SecurityManager must be initialized with config');
      }
      SecurityManager.instance = new SecurityManager(config);
    }
    return SecurityManager.instance;
  }

  public async processMessage(message: Message, agentId: string): Promise<Message> {
    try {
      // Rate limiting check
      const rateLimitResult = this.rateLimiter.checkRateLimit(agentId);
      if (!rateLimitResult.allowed) {
        throw new Error(`Rate limit exceeded for agent ${agentId}`);
      }

      // Message validation
      const validationResult = await this.messageValidator.validateMessage(message);
      if (!validationResult) {
        throw new Error('Message validation failed');
      }

      // Message encryption if enabled
      let processedMessage = message;
      if (this.config.encryption.enabled) {
        processedMessage = await this.encryptMessage(message);
      }

      return processedMessage;
    } catch (error) {
      await this.auditLogger.logSecurityEvent(
        'MESSAGE_PROCESSING_ERROR',
        { error: error instanceof Error ? error.message : String(error), agentId },
        'error'
      );
      throw error;
    }
  }

  public async validateMessage(message: Message): Promise<boolean> {
    return this.messageValidator.validateMessage(message);
  }

  public async encryptMessage(message: Message): Promise<Message> {
    try {
      const iv = randomBytes(12);
      const cipher = createCipheriv(
        this.config.encryption.algorithm || 'aes-256-gcm',
        this.encryptionKey,
        iv
      ) as CipherGCM;

      const encrypted = Buffer.concat([
        cipher.update(JSON.stringify(message.content), 'utf8'),
        cipher.final()
      ]);

      const authTag = cipher.getAuthTag();

      const encryptedContent: EncryptedContent = {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex'),
        authTag: authTag.toString('hex')
      };

      return {
        ...message,
        content: encryptedContent,
        metadata: {
          ...message.metadata,
          encrypted: true
        }
      };
    } catch (error) {
      await this.auditLogger.logSecurityEvent(
        'ENCRYPTION_ERROR',
        { error: error instanceof Error ? error.message : String(error) },
        'error'
      );
      throw error;
    }
  }

  public async decryptMessage(message: Message): Promise<Message> {
    try {
      const encryptedContent = message.content as EncryptedContent;
      const decipher = createDecipheriv(
        this.config.encryption.algorithm || 'aes-256-gcm',
        this.encryptionKey,
        Buffer.from(encryptedContent.iv, 'hex')
      ) as DecipherGCM;

      decipher.setAuthTag(Buffer.from(encryptedContent.authTag, 'hex'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedContent.content, 'hex')),
        decipher.final()
      ]);

      return {
        ...message,
        content: JSON.parse(decrypted.toString('utf8')),
        metadata: {
          ...message.metadata,
          encrypted: false
        }
      };
    } catch (error) {
      await this.auditLogger.logSecurityEvent(
        'DECRYPTION_ERROR',
        { error: error instanceof Error ? error.message : String(error) },
        'error'
      );
      throw error;
    }
  }

  public getRateLimitInfo(agentId: string) {
    return this.rateLimiter.getRateLimitInfo(agentId);
  }

  public getAuditLog(filters?: Parameters<AuditLogger['getAuditLog']>[0]) {
    return this.auditLogger.getAuditLog(filters);
  }

  public getAuditLogger(): AuditLogger {
    return this.auditLogger;
  }
}
