import { injectable, inject } from 'inversify';
import { ISecurity, IEncryption } from '../container/interfaces';
import { SHARED_TYPES } from '../container/types';

@injectable()
export class SecurityService implements ISecurity {
  constructor(
    @inject(SHARED_TYPES.Encryption) private encryption: IEncryption
  ) {}

  public async validateToken(token: string): Promise<boolean> {
    try {
      // Implement token validation logic here
      // This is a placeholder implementation
      return token.length > 0;
    } catch (error) {
      return false;
    }
  }

  public async generateToken(payload: Record<string, any>): Promise<string> {
    // Implement token generation logic here
    // This is a placeholder implementation
    return await this.encryption.encrypt(JSON.stringify(payload));
  }

  public async hashPassword(password: string): Promise<string> {
    return this.encryption.hash(password);
  }

  public async verifyPassword(password: string, hash: string): Promise<boolean> {
    return this.encryption.compare(password, hash);
  }
}
