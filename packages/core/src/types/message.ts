import { z } from 'zod';

export const MessageTypeSchema = z.enum([
  'TASK_ASSIGNMENT',
  'TASK_STATUS_UPDATE',
  'TASK_RESULT',
  'AGENT_STATUS_UPDATE',
  'AGENT_HEARTBEAT',
  'WORKFLOW_STATUS_UPDATE',
  'WORKFLOW_STEP_UPDATE',
  'ERROR',
  'COMMAND',
]);

export type MessageType = z.infer<typeof MessageTypeSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  type: MessageTypeSchema,
  sender: z.string(),
  recipient: z.string().optional(), // undefined means broadcast
  timestamp: z.date(),
  payload: z.unknown(),
  correlationId: z.string().optional(),
  replyTo: z.string().optional(),
  priority: z.number().default(0),
  ttl: z.number().optional(), // time to live in milliseconds
  signature: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export const MessageHandlerSchema = z.object({
  type: MessageTypeSchema,
  handler: z.function().args(MessageSchema).returns(z.promise(z.void())),
  filter: z.function().args(MessageSchema).returns(z.boolean()).optional(),
});

export type MessageHandler = z.infer<typeof MessageHandlerSchema>;

export interface MessageBroker {
  publish(message: Message): Promise<void>;
  subscribe(handler: MessageHandler): Promise<void>;
  unsubscribe(type: MessageType): Promise<void>;
  acknowledge(messageId: string): Promise<void>;
  reject(messageId: string, reason?: string): Promise<void>;
}

export interface MessageRouter {
  route(message: Message): Promise<void>;
  registerHandler(handler: MessageHandler): void;
  removeHandler(type: MessageType): void;
}

export interface MessageSerializer {
  serialize(message: Message): Promise<string>;
  deserialize(data: string): Promise<Message>;
  validate(message: unknown): message is Message;
}

export interface MessageEncryption {
  encrypt(message: Message): Promise<string>;
  decrypt(encryptedMessage: string): Promise<Message>;
  sign(message: Message): Promise<string>;
  verify(message: Message, signature: string): Promise<boolean>;
}
