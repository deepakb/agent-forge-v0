import { injectable, inject } from 'inversify';
import * as bcrypt from 'bcryptjs';
import * as CryptoJS from 'crypto-js';
import { IEncryption } from '../container/interfaces';
import { SHARED_TYPES } from '../container/types';
import { IConfigManager } from '../container/interfaces';

@injectable()
export class EncryptionService implements IEncryption {
  private encryptionKey: string;

  constructor(
    @inject(SHARED_TYPES.ConfigManager) private configManager: IConfigManager
  ) {
    // Initialize with a default key, should be overridden in production
    this.encryptionKey = 'default-key';
  }

  public async initialize(): Promise<void> {
    try {
      this.encryptionKey = await this.configManager.get<string>('encryption.key');
    } catch (error) {
      // If no key is configured, keep using the default key
      // In production, this should be handled more securely
    }
  }

  public async encrypt(data: string): Promise<string> {
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  public async decrypt(encryptedData: string): Promise<string> {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  public async hash(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  public async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
