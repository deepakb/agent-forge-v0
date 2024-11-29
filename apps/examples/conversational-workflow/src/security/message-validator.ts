import { z } from 'zod';
import { Message, MessageMetadata } from '../agents/base-agent';
import { AuditLogger } from './audit-logger';

const messageMetadataSchema = z.object({
  source: z.string(),
  target: z.string().optional(),
  timestamp: z.number(),
  workflowId: z.string().optional(),
  encrypted: z.boolean().optional(),
  requiresSummarization: z.boolean().optional()
});

const messageSchema = z.object({
  type: z.string(),
  content: z.unknown().refine((val): val is NonNullable<unknown> => val != null, {
    message: "Content is required"
  }),
  metadata: messageMetadataSchema
}) as z.ZodType<Message>;

export class MessageValidator {
  private static instance: MessageValidator;
  private auditLogger: AuditLogger;

  private constructor() {
    this.auditLogger = AuditLogger.getInstance();
  }

  public static getInstance(): MessageValidator {
    if (!MessageValidator.instance) {
      MessageValidator.instance = new MessageValidator();
    }
    return MessageValidator.instance;
  }

  public async validateMessage(message: Message): Promise<boolean> {
    try {
      const result = messageSchema.safeParse(message);

      if (!result.success) {
        await this.auditLogger.logSecurityEvent(
          'MESSAGE_VALIDATION_ERROR',
          {
            errors: result.error.errors,
            message
          },
          'error'
        );
        return false;
      }

      await this.auditLogger.logSecurityEvent(
        'MESSAGE_VALIDATION_SUCCESS',
        { message },
        'info'
      );

      return true;
    } catch (error) {
      await this.auditLogger.logSecurityEvent(
        'MESSAGE_VALIDATION_ERROR',
        {
          error: error instanceof Error ? error.message : String(error),
          message
        },
        'error'
      );
      return false;
    }
  }

  public getMessageSchema(): z.ZodType<Message> {
    return messageSchema;
  }
}
