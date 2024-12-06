import { injectable } from 'inversify';
import { IConfigManager } from '../container/interfaces';

@injectable()
export class ConfigManager implements IConfigManager {
  private config: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T> {
    if (!this.config.has(key)) {
      throw new Error(`Configuration key not found: ${key}`);
    }
    return this.config.get(key) as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.config.set(key, value);
  }

  async has(key: string): Promise<boolean> {
    return this.config.has(key);
  }

  async delete(key: string): Promise<void> {
    this.config.delete(key);
  }

  async clear(): Promise<void> {
    this.config.clear();
  }
}
