import CryptoJS from 'crypto-js';
import { KeyManagement } from './key-management';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
  authTag?: string;
}

export class Encryption {
  private static readonly ALGORITHM = 'AES-GCM';

  public static encrypt(data: string, key: string): EncryptedData {
    const salt = KeyManagement.generateSalt();
    const iv = KeyManagement.generateNonce();
    const derivedKey = KeyManagement.deriveKey(key, salt);

    // Encrypt the data
    const encrypted = CryptoJS.AES.encrypt(data, derivedKey, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode as any,
      padding: CryptoJS.pad.Pkcs7,
    });

    const result: EncryptedData = {
      ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
      iv,
      salt,
    };

    // Add auth tag if available
    const tag = (encrypted as any).tag;
    if (tag) {
      result.authTag = tag.toString(CryptoJS.enc.Base64);
    }

    return result;
  }

  public static decrypt(encryptedData: EncryptedData, key: string): string {
    const { ciphertext, iv, salt, authTag } = encryptedData;
    const derivedKey = KeyManagement.deriveKey(key, salt);

    // Create cipher params
    const cipherParamsData: any = {
      ciphertext: CryptoJS.enc.Base64.parse(ciphertext),
      iv: CryptoJS.enc.Hex.parse(iv),
      salt: CryptoJS.enc.Hex.parse(salt),
    };

    if (authTag) {
      cipherParamsData.tag = CryptoJS.enc.Base64.parse(authTag);
    }

    const cipherParams = CryptoJS.lib.CipherParams.create(cipherParamsData);

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(cipherParams, derivedKey, {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode as any,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  public static generateKey(): string {
    return KeyManagement.generateSymmetricKey();
  }
}
