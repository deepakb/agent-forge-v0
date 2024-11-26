import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';

export interface HashingOptions {
  rounds?: number;
}

export class Hashing {
  private static readonly DEFAULT_ROUNDS = 10;

  public static async hashPassword(
    password: string,
    options: HashingOptions = {}
  ): Promise<string> {
    const rounds = options.rounds || this.DEFAULT_ROUNDS;
    const salt = await bcrypt.genSalt(rounds);
    return bcrypt.hash(password, salt);
  }

  public static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  public static hashData(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  public static generateHMAC(data: string, key: string): string {
    return createHash('sha256')
      .update(key)
      .update(data)
      .digest('hex');
  }

  public static verifyHMAC(data: string, key: string, hmac: string): boolean {
    const calculatedHmac = this.generateHMAC(data, key);
    return calculatedHmac === hmac;
  }
}
