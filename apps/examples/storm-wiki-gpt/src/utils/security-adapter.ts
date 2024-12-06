import { ISecurity } from '@agent-forge/shared';
import * as crypto from 'crypto';

export class SecurityAdapter implements ISecurity {
  async validateToken(token: string): Promise<boolean> {
    // Simple validation for example purposes
    return token.length > 0;
  }

  async generateToken(payload: Record<string, any>): Promise<string> {
    // Simple token generation for example purposes
    const data = JSON.stringify(payload);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async hashPassword(password: string): Promise<string> {
    // Simple password hashing for example purposes
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }
}
