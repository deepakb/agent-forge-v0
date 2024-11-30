import { Message } from '../agents/base-agent';
import { SecurityManager } from './security-manager';
import { AuditLogger } from './audit-logger';

export interface SecurityMiddlewareConfig {
  enforceEncryption?: boolean;
  enforceValidation?: boolean;
  enforceRateLimiting?: boolean;
}

export class SecurityMiddleware {
  private securityManager: SecurityManager;
  private auditLogger: AuditLogger;
  private config: Required<SecurityMiddlewareConfig>;

  constructor(config: SecurityMiddlewareConfig = {}) {
    this.config = {
      enforceEncryption: true,
      enforceValidation: true,
      enforceRateLimiting: true,
      ...config
    };
    this.securityManager = SecurityManager.getInstance();
    this.auditLogger = AuditLogger.getInstance();
  }

  public async processIncomingMessage(message: Message, agentId: string): Promise<Message> {
    try {
      // Validate message
      if (this.config.enforceValidation) {
        const isValid = await this.securityManager.validateMessage(message);
        if (!isValid) {
          throw new Error('Message validation failed');
        }
      }

      // Check rate limit
      if (this.config.enforceRateLimiting) {
        const rateLimitInfo = this.securityManager.getRateLimitInfo(agentId);
        if (!rateLimitInfo.allowed) {
          throw new Error(`Rate limit exceeded for agent ${agentId}`);
        }
      }

      // Process message through security manager
      return await this.securityManager.processMessage(message, agentId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.auditLogger.logSecurityEvent(
        'SECURITY_MIDDLEWARE_ERROR',
        {
          error: errorMessage,
          agentId,
          messageType: message.type
        },
        'error'
      );
      throw new Error(errorMessage);
    }
  }

  public async processOutgoingMessage(message: Message, targetAgentId: string): Promise<Message> {
    try {
      // Validate message
      if (this.config.enforceValidation) {
        const isValid = await this.securityManager.validateMessage(message);
        if (!isValid) {
          throw new Error('Message validation failed');
        }
      }

      // Process message through security manager
      return await this.securityManager.processMessage(message, targetAgentId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.auditLogger.logSecurityEvent(
        'SECURITY_MIDDLEWARE_ERROR',
        {
          error: errorMessage,
          targetAgentId,
          messageType: message.type
        },
        'error'
      );
      throw new Error(errorMessage);
    }
  }

  public async handleSecurityError(error: Error, context: any): Promise<void> {
    await this.auditLogger.logSecurityEvent(
      'SECURITY_ERROR',
      {
        error: error.message,
        context
      },
      'error'
    );
  }

  public getSecurityStatus(agentId: string) {
    return {
      rateLimitInfo: this.securityManager.getRateLimitInfo(agentId),
      encryptionEnabled: this.config.enforceEncryption,
      validationEnabled: this.config.enforceValidation,
      rateLimitingEnabled: this.config.enforceRateLimiting
    };
  }
}
