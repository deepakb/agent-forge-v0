import { Message, MessageSchema, MessageSerializer } from '../types';

export class DefaultMessageSerializer implements MessageSerializer {
  public async serialize(message: Message): Promise<string> {
    return JSON.stringify(message, this.replacer);
  }

  public async deserialize(data: string): Promise<Message> {
    return JSON.parse(data, this.reviver);
  }

  public validate(message: unknown): message is Message {
    try {
      MessageSchema.parse(message);
      return true;
    } catch {
      return false;
    }
  }

  private replacer(_key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }

  private reviver(_key: string, value: any): any {
    if (value && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  }
}
