import { randomBytes } from 'crypto';

import { Hashing } from './hashing';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class KeyManagement {
  private static readonly KEY_SIZE = 32; // 256 bits

  public static generateSymmetricKey(): string {
    return randomBytes(this.KEY_SIZE).toString('hex');
  }

  public static generateKeyPair(): KeyPair {
    const privateKey = this.generateSymmetricKey();
    const publicKey = Hashing.hashData(privateKey);

    return {
      publicKey,
      privateKey,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static rotateKey(_newKey: string, _oldKey: string): void {
    // Method stub for future implementation
    // TODO: Implement key rotation logic
  }

  public static deriveKey(password: string, salt: string): string {
    // Simple key derivation using HMAC
    // In production, you might want to use a proper KDF like PBKDF2
    return Hashing.generateHMAC(password, salt);
  }

  public static generateNonce(): string {
    return randomBytes(16).toString('hex');
  }

  public static generateSalt(): string {
    return randomBytes(16).toString('hex');
  }
}
