import { IEncryption } from '@agent-forge/shared';
import * as crypto from 'crypto';

export class EncryptionAdapter implements IEncryption {
  private algorithm = 'aes-256-cbc';
  private key: Buffer;
  private iv: Buffer;

  constructor() {
    // Generate a secure key and IV
    this.key = crypto.randomBytes(32);
    this.iv = crypto.randomBytes(16);
  }

  async encrypt(data: string): Promise<string> {
    try {
      const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return data; // Return original data if encryption fails
    }
  }

  async decrypt(data: string): Promise<string> {
    try {
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      let decrypted = decipher.update(data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return data; // Return original data if decryption fails
    }
  }

  async hash(data: string): Promise<string> {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async compare(data: string, hash: string): Promise<boolean> {
    const computedHash = await this.hash(data);
    return computedHash === hash;
  }
}
