import { logger } from '../utils/ErrorLogger';

export class StorageService {
  static async save<T>(key: string, data: T): Promise<boolean> {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      logger.log('high', `Failed to save data for key: ${key}`, 'StorageService', error);
      return false;
    }
  }

  static async load<T>(key: string): Promise<T | null> {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.log('high', `Failed to load data for key: ${key}`, 'StorageService', error);
      return null;
    }
  }
}
